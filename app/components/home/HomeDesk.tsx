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
import {
  LeaderboardIcon,
  RewardsIcon,
  VaultsIcon,
  PointsIcon,
  DeskIcon,
  SwapIcon,
  TradeIcon,
} from "@/components/icons/desk";

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
  { href: "/leaderboard", label: "Leaderboard", icon: <LeaderboardIcon size={18} /> },
  { href: "/rewards", label: "Rewards", icon: <RewardsIcon size={18} /> },
  { href: "/vaults", label: "Vaults", icon: <VaultsIcon size={18} /> },
  { href: "/points", label: "Points", icon: <PointsIcon size={18} /> },
  { href: "/desk", label: "Desk", icon: <DeskIcon size={18} /> },
];

function MarketCard({ row }: { row: HomeMarket }) {
  const up = row.change24h >= 0;
  return (
    <Link to={`/perp/${row.symbol}`} className="bd-home-card">
      <header>
        <TokenMark symbol={row.symbol} label={row.base} size={20} />
        <strong>{row.base}</strong>
        <small className={up ? "is-up" : "is-dn"}>{pct(row.change24h)}</small>
      </header>
      <b>{money(row.price)}</b>
      <dl>
        <div>
          <dt>Funding</dt>
          <dd className={row.funding >= 0 ? "is-up" : "is-dn"}>{funding(row.funding)}</dd>
        </div>
        <div>
          <dt>Volume</dt>
          <dd>{volume(row.volume)}</dd>
        </div>
      </dl>
    </Link>
  );
}

function PassCard({ idea }: { idea: CarryIdea }) {
  return (
    <Link to={`/perp/${idea.symbol}`} className="bd-home-pass">
      <header>
        <TokenMark symbol={idea.symbol} label={idea.ticker} size={20} />
        <strong>{idea.ticker}</strong>
        <em>{sideLabel(idea.side)}</em>
        <span className={`bd-grade g-${idea.grade}`}>{idea.grade} {idea.score}</span>
      </header>
      <dl>
        <div>
          <dt>Est</dt>
          <dd className={idea.est >= 0 ? "is-up" : "is-dn"}>{formatRate(idea.est)}</dd>
        </div>
        <div>
          <dt>Ann.</dt>
          <dd className={idea.annualized >= 0 ? "is-up" : "is-dn"}>{formatPct(idea.annualized)}</dd>
        </div>
        <div>
          <dt>Basis</dt>
          <dd>{idea.basisBps.toFixed(1)} bp</dd>
        </div>
        <div>
          <dt>24h</dt>
          <dd>{formatUsd(idea.volumeUsd)}</dd>
        </div>
        <div>
          <dt>OI</dt>
          <dd>{formatUsd(idea.oiUsd)}</dd>
        </div>
        <div>
          <dt>Int / persist</dt>
          <dd>{idea.intervalHours}h · {idea.persist ? "Y" : "N"}</dd>
        </div>
      </dl>
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
      gainers: sorted.filter((row) => row.change24h > 0).slice(0, 4),
      losers: [...sorted].reverse().filter((row) => row.change24h < 0).slice(0, 4),
    };
  }, [markets]);

  return (
    <div className="bd-home">
      <section className="bd-home-hero">
        <div className="bd-home-balance">
          <span>Total assets</span>
          <strong>
            {money(total)} <small>USDC</small>
          </strong>
          <Link to="/portfolio" className="bd-home-pnl">
            Open portfolio
          </Link>
        </div>
        <Link to="/portfolio" className="bd-home-deposit">
          Deposit
        </Link>
      </section>

      <nav className="bd-home-shortcuts">
        {SHORTCUTS.map((item) => (
          <Link key={item.href} to={item.href} className="bd-home-chip">
            <i>{item.icon}</i>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <section className="bd-home-promos">
        <Link to="/" className="bd-home-promo">
          <em>Perps</em>
          <b>Trade the book</b>
          <span>
            <TradeIcon size={14} /> Open desk
          </span>
        </Link>
        <Link to="/swap" className="bd-home-promo">
          <em>Swap</em>
          <b>Move spot size</b>
          <span>
            <SwapIcon size={14} /> Swap now
          </span>
        </Link>
      </section>

      <section className="bd-home-movers">
        <div>
          <h2>Top gainers</h2>
          <div className="bd-home-grid">
            {gainers.length ? gainers.map((row) => <MarketCard key={row.symbol} row={row} />) : <p>No green books.</p>}
          </div>
        </div>
        <div>
          <h2>Top losers</h2>
          <div className="bd-home-grid">
            {losers.length ? losers.map((row) => <MarketCard key={row.symbol} row={row} />) : <p>No red books.</p>}
          </div>
        </div>
      </section>

      <section className="bd-home-pass-list">
        <h2>Passing screen</h2>
        <div className="bd-home-pass-grid">
          {passing.length
            ? passing.map((idea) => <PassCard key={idea.symbol} idea={idea} />)
            : <p>No pair currently clears the screen.</p>}
        </div>
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
