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

const GRADE_RANK: Record<string, number> = { A: 4, B: 3, C: 2, D: 1 };

export default function FundingDesk() {
  const navigate = useNavigate();
  const [ideas, setIdeas] = useState<CarryIdea[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<1 | -1>(1);

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
    return sortDir === 1 ? " ↑" : " ↓";
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
            <button type="button" className="is-on">
              Overview
            </button>
          </div>
        </div>
        <div className="bd-desk-stats">
          <div>
            <span>Markets</span>
            <b>{loading ? "…" : ideas.length}</b>
          </div>
          <div>
            <span>Passing screen</span>
            <b>{loading ? "…" : harvestCount}</b>
          </div>
          <div>
            <span>Median |ann.|</span>
            <b>{loading ? "…" : formatPct(medianAnn)}</b>
          </div>
        </div>
      </header>

      {error ? <div className="bd-desk-error">{error}</div> : null}

      <div className="bd-desk-grid">
        <section className="bd-desk-panel">
          <div className="bd-desk-toolbar">
            <p className="bd-desk-hint">
              Overview — every active Orderly perp on the live book ({loading ? "…" : ideas.length}).
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
              <p>{briefIdea(active)}</p>
              <ul>
                {active.reasons.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            </article>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
