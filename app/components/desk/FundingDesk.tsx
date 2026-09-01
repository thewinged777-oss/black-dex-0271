import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  briefIdea,
  CarryIdea,
  formatPct,
  formatRate,
  formatUsd,
  loadOrderlyFutures,
  scoreMarket,
  sideLabel,
} from "@/utils/funding-desk";

type SortKey = "name" | "est" | "ann" | "basis" | "volume" | "grade";
type DeskTab = "overview" | "help";

const GRADE_RANK: Record<string, number> = { A: 4, B: 3, C: 2, D: 1 };

function mmStrategy(idea: CarryIdea) {
  const harvest =
    idea.side === "PASS"
      ? "Do not warehouse this book. Quote only if the spread covers one inventory turn plus fees."
      : idea.side === "SHORT_PERP"
        ? "Skew quotes short and collect positive funding. Hedge residual delta with spot or a correlated perp."
        : "Skew quotes long and collect negative funding. Hedge residual delta with spot or a correlated perp.";
  return [
    harvest,
    "Cap inventory at a slice of 24h notional — never more than the tape can absorb in about ten minutes.",
    idea.persist
      ? "Persist is Yes: estimated and last print share a sign, so the crowding has lasted at least one interval."
      : "Persist is No: the last print flipped. Flatten into the next funding rather than adding.",
    idea.profile.mmNote,
    `Risk: ${idea.profile.risk}`,
  ].join(" ");
}

export default function FundingDesk() {
  const navigate = useNavigate();
  const [ideas, setIdeas] = useState<CarryIdea[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<1 | -1>(1);
  const [tab, setTab] = useState<DeskTab>("overview");

  useEffect(() => {
    let live = true;
    const pull = async () => {
      try {
        const rows = await loadOrderlyFutures();
        if (!live) return;
        const next = rows
          .map(scoreMarket)
          .filter((row): row is CarryIdea => Boolean(row));
        setIdeas(next);
        setError(null);
      } catch (err) {
        if (!live) return;
        setError(err instanceof Error ? err.message : "Orderly public API unavailable");
      } finally {
        if (live) setLoading(false);
      }
    };
    void pull();
    const id = window.setInterval(pull, 45_000);
    return () => {
      live = false;
      window.clearInterval(id);
    };
  }, []);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((dir) => (dir === 1 ? -1 : 1));
      return;
    }
    setSortKey(key);
    setSortDir(key === "name" ? 1 : -1);
  };

  const sortMark = (key: SortKey) => {
    if (sortKey !== key) return "";
    return sortDir === 1 ? " \u2191" : " \u2193";
  };

  const sorted = useMemo(() => {
    const copy = [...ideas];
    copy.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") cmp = a.ticker.localeCompare(b.ticker);
      if (sortKey === "est") cmp = a.est - b.est;
      if (sortKey === "ann") cmp = a.annualized - b.annualized;
      if (sortKey === "basis") cmp = a.basisBps - b.basisBps;
      if (sortKey === "volume") cmp = a.volumeUsd - b.volumeUsd;
      if (sortKey === "grade") {
        cmp =
          (GRADE_RANK[a.grade] || 0) - (GRADE_RANK[b.grade] || 0) ||
          a.score - b.score;
      }
      return cmp * sortDir;
    });
    return copy;
  }, [ideas, sortDir, sortKey]);

  const active = ideas.find((i) => i.symbol === selected) || sorted[0];
  const harvestCount = ideas.filter((i) => i.side !== "PASS").length;
  const medianAnn = useMemo(() => {
    const vals = ideas.map((i) => Math.abs(i.annualized)).sort((a, b) => a - b);
    if (!vals.length) return 0;
    return vals[Math.floor(vals.length / 2)] || 0;
  }, [ideas]);

  return (
    <div className="bd-desk">
      <header className="bd-desk-hero">
        <div>
          <p className="bd-desk-kicker">Orderly · live public book</p>
          <h1>Funding Desk</h1>
          <p className="bd-desk-lead">
            Professional carry screen for Black DEX perps. Rates are a crowding tax,
            not a free yield. No execution from this page — Trade opens the existing ticket.
          </p>
          <div className="bd-desk-page-tabs">
            <button type="button" className={tab === "overview" ? "is-on" : ""} onClick={() => setTab("overview")}>
              Overview
            </button>
            <button type="button" className={tab === "help" ? "is-on" : ""} onClick={() => setTab("help")}>
              Help
            </button>
          </div>
        </div>
        <div className="bd-desk-stats">
          <div>
            <span>Markets</span>
            <b>{loading ? "\u2026" : ideas.length}</b>
          </div>
          <div>
            <span>Passing screen</span>
            <b>{loading ? "\u2026" : harvestCount}</b>
          </div>
          <div>
            <span>Median |ann.|</span>
            <b>{loading ? "\u2026" : formatPct(medianAnn)}</b>
          </div>
        </div>
      </header>

      {error ? <div className="bd-desk-error">{error}</div> : null}

      {tab === "help" ? (
        <section className="bd-desk-help">
          <article>
            <h2>How the screen works</h2>
            <p>
              Funding is the periodic transfer between longs and shorts so mark stays near index.
              Positive estimated rate: longs pay shorts. Negative: shorts pay longs. The desk only
              flags a side when liquidity, persistence, and basis all clear — fat APR on an empty book is not carry.
            </p>
          </article>
          <dl>
            <div>
              <dt>Est / last</dt>
              <dd>Estimated next funding print versus the last settled print, in percent per interval.</dd>
            </div>
            <div>
              <dt>Ann.</dt>
              <dd>Annualized as rate × (24 / interval hours) × 365. Subtract fees and basis slip before treating it as edge.</dd>
            </div>
            <div>
              <dt>Basis</dt>
              <dd>Mark versus index in basis points (bps). 1 bp = 0.01%. Wide basis means squeeze or dislocation risk.</dd>
            </div>
            <div>
              <dt>24h / OI</dt>
              <dd>24h traded notional versus open interest in USDC. High OI with thin 24h tape is a crowded, illiquid book.</dd>
            </div>
            <div>
              <dt>Persist</dt>
              <dd>Yes when estimated and last funding share a sign. The crowded side has lasted at least one interval. No means the book just flipped — mean-reversion risk.</dd>
            </div>
            <div>
              <dt>Score / grade</dt>
              <dd>
                0–100 blend of |annualized|, persist, 24h notional, open interest, basis width, pre-TGE / isolated flags, and sleeve.
                A ≥ 78, B ≥ 62, C ≥ 45, else D. PASS if score &lt; 45 or |ann.| &lt; 8%.
              </dd>
            </div>
            <div>
              <dt>Receive as long / short</dt>
              <dd>The side that collects the print if you are delta-neutral. Short-perp receive when funding is positive.</dd>
            </div>
            <div>
              <dt>Sleeve</dt>
              <dd>Desk tag for the name: L1, meme, venue token, RWA, emissions, and so on. It changes how hard we fade a fat rate.</dd>
            </div>
          </dl>
          <article>
            <h2>Market-making rule</h2>
            <p>
              Earn spread. Funding is a residual. Skew inventory to the side that collects the print, cap size to tape,
              and flatten into the next interval if persist is No or the name is a meme. This desk does not execute and is not advice.
            </p>
          </article>
        </section>
      ) : (
        <div className="bd-desk-grid">
          <section className="bd-desk-panel">
            {active ? (
              <div className="bd-desk-brief">
                <header>
                  <strong>{active.ticker}</strong>
                  <span className={`bd-grade g-${active.grade}`}>{active.grade}{active.score}</span>
                </header>
                <p>{briefIdea(active)}</p>
                <p className="bd-desk-strategy">{mmStrategy(active)}</p>
              </div>
            ) : null}
            <div className="bd-desk-toolbar">
              <p className="bd-desk-hint">
                Overview — every active Orderly perp on the live book ({loading ? "\u2026" : ideas.length}).
              </p>
              <span className="bd-desk-hint">Refreshes from api.orderly.org every 45s</span>
            </div>
            <div className="bd-desk-table-wrap">
              <table className="bd-desk-table">
                <thead>
                  <tr>
                    <th>
                      <button type="button" onClick={() => toggleSort("name")}>
                        Name{sortMark("name")}
                      </button>
                    </th>
                    <th>
                      <button type="button" onClick={() => toggleSort("est")}>
                        Est / last{sortMark("est")}
                      </button>
                    </th>
                    <th>
                      <button type="button" onClick={() => toggleSort("ann")}>
                        Ann.{sortMark("ann")}
                      </button>
                    </th>
                    <th>
                      <button type="button" onClick={() => toggleSort("basis")}>
                        Basis{sortMark("basis")}
                      </button>
                    </th>
                    <th>
                      <button type="button" onClick={() => toggleSort("volume")}>
                        24h / OI{sortMark("volume")}
                      </button>
                    </th>
                    <th>
                      <button type="button" onClick={() => toggleSort("grade")}>
                        Grade{sortMark("grade")}
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading && !ideas.length ? (
                    <tr>
                      <td colSpan={6}>Loading Orderly futures…</td>
                    </tr>
                  ) : null}
                  {sorted.map((idea) => (
                    <tr
                      key={idea.symbol}
                      className={active?.symbol === idea.symbol ? "is-on" : ""}
                      onClick={() => setSelected(idea.symbol)}
                    >
                      <td>
                        <strong>{idea.ticker}</strong>
                        <em>{idea.profile.sleeve}</em>
                      </td>
                      <td className={idea.est >= 0 ? "up" : "dn"}>
                        {formatRate(idea.est)}
                        <em>{formatRate(idea.last)}</em>
                      </td>
                      <td className={idea.annualized >= 0 ? "up" : "dn"}>
                        {formatPct(idea.annualized)}
                      </td>
                      <td>{idea.basisBps.toFixed(1)} bp</td>
                      <td>
                        {formatUsd(idea.volumeUsd)}
                        <em>{formatUsd(idea.oiUsd)}</em>
                      </td>
                      <td>
                        <span className={`bd-grade g-${idea.grade}`}>{idea.grade}</span>
                        <em>{sideLabel(idea.side)}</em>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <aside className="bd-desk-side">
            {active ? (
              <article className="bd-desk-card">
                <div className="bd-desk-card-top">
                  <div>
                    <h2>{active.ticker}</h2>
                    <p>{active.symbol}</p>
                  </div>
                  <button
                    type="button"
                    className="bd-desk-trade"
                    onClick={() => navigate(`/perp/${active.symbol}`)}
                  >
                    Trade
                  </button>
                </div>
                <dl>
                  <div>
                    <dt>Receive</dt>
                    <dd>{sideLabel(active.side)}</dd>
                  </div>
                  <div>
                    <dt>Annualized</dt>
                    <dd className={active.annualized >= 0 ? "up" : "dn"}>
                      {formatPct(active.annualized)}
                    </dd>
                  </div>
                  <div>
                    <dt>Interval</dt>
                    <dd>{active.intervalHours}h</dd>
                  </div>
                  <div>
                    <dt>Persist</dt>
                    <dd>{active.persist ? "Yes" : "No"}</dd>
                  </div>
                </dl>
                <ul>
                  {active.reasons.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              </article>
            ) : null}
          </aside>
        </div>
      )}
    </div>
  );
}
