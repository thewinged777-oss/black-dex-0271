import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  answerDeskQuery,
  briefIdea,
  CarryIdea,
  formatPct,
  formatRate,
  formatUsd,
  loadOrderlyFutures,
  scoreMarket,
  sideLabel,
} from "@/utils/funding-desk";

type ChatTurn = { role: "user" | "desk"; text: string };

const STARTERS = [
  "Which names clear the carry screen?",
  "Explain funding like a market maker",
  "How do unlocks change funding?",
  "What is wrong with farming meme funding?",
  "ORDER tokenomics vs funding",
];

export default function FundingDesk() {
  const navigate = useNavigate();
  const [ideas, setIdeas] = useState<CarryIdea[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"harvest" | "all" | "long" | "short">("harvest");
  const [selected, setSelected] = useState<string | null>(null);
  const [chat, setChat] = useState<ChatTurn[]>([
    {
      role: "desk",
      text: "Funding Desk online. I read live Orderly mark, index, OI, 24h notional and estimated funding, then score carry the way a market-maker would — persistence, book depth, basis, sleeve tokenomics. I will not help lean on a book or force a print. Ask a ticker or ask for the screen.",
    },
  ]);

  useEffect(() => {
    let live = true;
    const pull = async () => {
      try {
        const rows = await loadOrderlyFutures();
        if (!live) return;
        const next = rows
          .map(scoreMarket)
          .filter((row): row is CarryIdea => Boolean(row))
          .sort((a, b) => b.score - a.score);
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

  const visible = useMemo(() => {
    if (filter === "all") return ideas;
    if (filter === "long") return ideas.filter((i) => i.side === "LONG_PERP");
    if (filter === "short") return ideas.filter((i) => i.side === "SHORT_PERP");
    return ideas.filter((i) => i.side !== "PASS");
  }, [filter, ideas]);

  const active = ideas.find((i) => i.symbol === selected) || visible[0] || ideas[0];
  const harvestCount = ideas.filter((i) => i.side !== "PASS").length;
  const medianAnn = useMemo(() => {
    const vals = ideas.map((i) => Math.abs(i.annualized)).sort((a, b) => a - b);
    if (!vals.length) return 0;
    return vals[Math.floor(vals.length / 2)] || 0;
  }, [ideas]);

  const ask = (text: string) => {
    const clean = text.trim();
    if (!clean) return;
    setChat((prev) => [
      ...prev,
      { role: "user", text: clean },
      { role: "desk", text: answerDeskQuery(clean, ideas) },
    ]);
    setQuery("");
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    ask(query);
  };

  return (
    <div className="bd-desk">
      <header className="bd-desk-hero">
        <div>
          <p className="bd-desk-kicker">Orderly · live public book</p>
          <h1>Funding Desk</h1>
          <p className="bd-desk-lead">
            Professional carry screen for Black DEX perps. Rates are a crowding tax,
            not a free yield. The advisor speaks market-making and tokenomics — it
            does not execute and it does not help anyone force a book.
          </p>
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
            <div className="bd-desk-tabs">
              {(
                [
                  ["harvest", "Screen"],
                  ["short", "Receive short"],
                  ["long", "Receive long"],
                  ["all", "All names"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  className={filter === id ? "is-on" : ""}
                  onClick={() => setFilter(id)}
                  type="button"
                >
                  {label}
                </button>
              ))}
            </div>
            <span className="bd-desk-hint">Refreshes from api.orderly.org every 45s</span>
          </div>

          <div className="bd-desk-table-wrap">
            <table className="bd-desk-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Est / last</th>
                  <th>Ann.</th>
                  <th>Basis</th>
                  <th>24h / OI</th>
                  <th>Grade</th>
                </tr>
              </thead>
              <tbody>
                {loading && !ideas.length ? (
                  <tr>
                    <td colSpan={6}>Loading Orderly futures…</td>
                  </tr>
                ) : null}
                {visible.slice(0, 40).map((idea) => (
                  <tr
                    key={idea.symbol}
                    className={active?.symbol === idea.symbol ? "is-on" : ""}
                    onClick={() => {
                      setSelected(idea.symbol);
                      ask(idea.ticker);
                    }}
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

          <article className="bd-desk-chat">
            <h3>Advisor</h3>
            <div className="bd-desk-log">
              {chat.map((turn, index) => (
                <p key={`${turn.role}-${index}`} className={turn.role}>
                  <span>{turn.role === "desk" ? "Desk" : "You"}</span>
                  {turn.text}
                </p>
              ))}
            </div>
            <div className="bd-desk-starters">
              {STARTERS.map((item) => (
                <button key={item} type="button" onClick={() => ask(item)}>
                  {item}
                </button>
              ))}
            </div>
            <form onSubmit={onSubmit}>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Ask ORDER, funding, inventory, unlocks…"
                aria-label="Ask the funding desk"
              />
              <button type="submit">Ask</button>
            </form>
          </article>
        </aside>
      </div>
    </div>
  );
}
