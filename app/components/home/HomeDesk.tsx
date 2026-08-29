import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useCollateral } from "@orderly.network/hooks";
import { loadHomeMarkets, type HomeMarket } from "@/utils/home-markets";
import { loadBlackDexPosts, type HomePost } from "@/utils/home-posts";
import {
  LeaderboardIcon,
  RewardsIcon,
  VaultsIcon,
  PointsIcon,
  DeskIcon,
} from "@/components/icons/desk";

function money(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return "\u2014";
  if (Math.abs(value) >= 1000) return `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  return `$${value.toFixed(2)}`;
}

function pct(value: number) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

const SHORTCUTS = [
  { href: "/leaderboard", label: "Leaderboard", icon: <LeaderboardIcon size={16} /> },
  { href: "/rewards", label: "Rewards", icon: <RewardsIcon size={16} /> },
  { href: "/vaults", label: "Vaults", icon: <VaultsIcon size={16} /> },
  { href: "/points", label: "Points", icon: <PointsIcon size={16} /> },
  { href: "/desk", label: "Desk", icon: <DeskIcon size={16} /> },
];

function MarketCard({ row }: { row: HomeMarket }) {
  const up = row.change24h >= 0;
  return (
    <Link to={`/perp/${row.symbol}`} className="bd-home-card">
      <header>
        <span className="bd-home-dot" data-up={up ? "1" : "0"}>
          {row.base.slice(0, 3)}
        </span>
        <strong>{row.base}</strong>
      </header>
      <b>{money(row.price)}</b>
      <small className={up ? "is-up" : "is-dn"}>{pct(row.change24h)}</small>
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

  useEffect(() => {
    loadHomeMarkets().then(setMarkets).catch(() => setMarkets([]));
    loadBlackDexPosts().then(setPosts).catch(() => setPosts([]));
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
      <section className="bd-home-value">
        <span>Portfolio value</span>
        <strong>{money(total)}</strong>
        <Link to="/portfolio">Open portfolio</Link>
        <nav className="bd-home-shortcuts">
          {SHORTCUTS.map((item) => (
            <Link key={item.href} to={item.href} className="bd-home-chip">
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
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
