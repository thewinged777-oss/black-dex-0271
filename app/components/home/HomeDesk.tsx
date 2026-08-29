import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useCollateral } from "@orderly.network/hooks";
import { loadHomeMarkets, type HomeMarket } from "@/utils/home-markets";
import { loadBlackDexPosts, type HomePost } from "@/utils/home-posts";
import {
  CarryIdea,
  formatPct,
  formatRate,
  formatUsd,
  loadOrderlyFutures,
  scoreMarket,
  sideLabel,
} from "@/utils/funding-desk";
import TokenMark from "@/components/TokenMark";

function money(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return "\u2014";
  if (Math.abs(value) >= 1000) return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
  if (Math.abs(value) >= 1) return value.toFixed(2);
  return value.toFixed(4);
}

function volume(value: number) {
  if (!value) return "\u2014";
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

function funding(value: number) {
  const rate = value * 100;
  const sign = rate > 0 ? "+" : "";
  return `${sign}${rate.toFixed(4)}%`;
}

function pct(value: number) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

const SHORTCUTS = [
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/rewards", label: "Rewards" },
  { href: "/vaults", label: "Vaults" },
  { href: "/points", label: "Points" },
  { href: "/desk", label: "Desk" },
];

function MarketRow({ row }: { row: HomeMarket }) {
  const up = row.change24h >= 0;
  return (
    <Link to={`/perp/${row.symbol}`} className="bd-home-row">
      <span className="bd-home-pair">
        <TokenMark symbol={row.symbol} label={row.base} size={18} />
        <strong>{row.base}-USDC</strong>
      </span>
      <span>{money(row.price)}</span>
      <span className={up ? "is-up" : "is-dn"}>{pct(row.change24h)}</span>
      <span>{volume(row.volume)}</span>
    </Link>
  );
}

function PassRow({ idea }: { idea: CarryIdea }) {
  return (
    <Link to={`/perp/${idea.symbol}`} className="bd-home-row bd-home-pass">
      <span className="bd-home-pair">
        <TokenMark symbol={idea.symbol} label={idea.ticker} size={18} />
        <strong>{idea.ticker}</strong>
      </span>
      <span className={`bd-grade g-${idea.grade}`}>{idea.grade} {idea.score}</span>
      <span>{sideLabel(idea.side)}</span>
      <span className={idea.est >= 0 ? "is-up" : "is-dn"}>{formatRate(idea.est)}</span>
      <span className={idea.annualized >= 0 ? "is-up" : "is-dn"}>{formatPct(idea.annualized)}</span>
      <span>{formatUsd(idea.volumeUsd)}</span>
    </Link>
  );
}

export default function HomeDesk() {
  const collateral = useCollateral();
  const total =
    Number((collateral as { totalValue?: number; totalCollateral?: number })?.totalValue ??
      (collateral as { totalCollateral?: number })?.totalCollateral ??
      0) || 0;

  const [markets, setMarkets] = useState<HomeMarket[]>([]);
  const [posts, setPosts] = useState<HomePost[]>([]);
  const [passing, setPassing] = useState<CarryIdea[]>([]);

  useEffect(() => {
    loadHomeMarkets().then(setMarkets).catch(() => setMarkets([]));
    loadBlackDexPosts().then(setPosts).catch(() => setPosts([]));
    loadOrderlyFutures()
      .then((rows) => {
        const ideas = rows
          .map(scoreMarket)
          .filter((row): row is CarryIdea => Boolean(row) && row.side !== "PASS")
          .sort((a, b) => b.score - a.score);
        setPassing(ideas);
      })
      .catch(() => setPassing([]));
  }, []);

  const { gainers, losers } = useMemo(() => {
    const live = markets.filter((row) => Number.isFinite(row.change24h) && row.price > 0);
    const sorted = [...live].sort((a, b) => b.change24h - a.change24h);
    return {
      gainers: sorted.filter((row) => row.change24h > 0).slice(0, 5),
      losers: [...sorted].reverse().filter((row) => row.change24h < 0).slice(0, 5),
    };
  }, [markets]);

  return (
    <div className="bd-home">
      <section className="bd-home-hero">
        <p className="bd-home-kicker">Perpetual futures exchange</p>
        <div className="bd-home-hero-row">
          <div>
            <span className="bd-home-label">Total assets</span>
            <h1>
              {money(total)} <small>USDC</small>
            </h1>
          </div>
          <div className="bd-home-cta">
            <Link to="/portfolio" className="bd-btn-gold">Deposit</Link>
            <Link to="/portfolio" className="bd-btn-ghost">Open portfolio</Link>
          </div>
        </div>
      </section>

      <nav className="bd-home-seg">
        {SHORTCUTS.map((item) => (
          <Link key={item.href} to={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>

      <section className="bd-home-promos">
        <Link to="/" className="bd-home-promo">
          <em>Perps</em>
          <b>Trade the book</b>
          <span>Open desk</span>
        </Link>
        <Link to="/swap" className="bd-home-promo">
          <em>Swap</em>
          <b>Move spot size</b>
          <span>Swap now</span>
        </Link>
      </section>

      <section className="bd-home-board">
        <article>
          <header>
            <h2>Top gainers</h2>
            <span>Market · Last · 24h · Vol</span>
          </header>
          <div className="bd-home-table">
            {gainers.length ? gainers.map((row) => <MarketRow key={row.symbol} row={row} />) : <p>No green books.</p>}
          </div>
        </article>
        <article>
          <header>
            <h2>Top losers</h2>
            <span>Market · Last · 24h · Vol</span>
          </header>
          <div className="bd-home-table">
            {losers.length ? losers.map((row) => <MarketRow key={row.symbol} row={row} />) : <p>No red books.</p>}
          </div>
        </article>
      </section>

      <section className="bd-home-board is-wide">
        <article>
          <header>
            <h2>Passing screen</h2>
            <span>Pair · Grade · Side · Est · Ann. · 24h</span>
          </header>
          <div className="bd-home-table">
            {passing.length ? passing.map((idea) => <PassRow key={idea.symbol} idea={idea} />) : <p>No pair currently clears the screen.</p>}
          </div>
        </article>
      </section>

      <section className="bd-home-feed">
        <h2>@BlackDexOnline</h2>
        <div className="bd-home-posts">
          {posts.length ? (
            posts.map((post) => (
              <a key={post.id} className="bd-home-post" href={post.url} target="_blank" rel="noreferrer">
                <header>Black DEX</header>
                <p>{post.text}</p>
                <time>{post.time}</time>
              </a>
            ))
          ) : (
            <a className="bd-home-post" href="https://x.com/BlackDexOnline" target="_blank" rel="noreferrer">
              <header>Black DEX</header>
              <p>Open the desk feed on X.</p>
            </a>
          )}
        </div>
      </section>
    </div>
  );
}
