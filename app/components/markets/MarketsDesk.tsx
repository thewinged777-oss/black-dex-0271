import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import TokenMark from "@/components/TokenMark";

type Tab =
  | "fav"
  | "all"
  | "crypto"
  | "tradfi"
  | "community"
  | "new"
  | "prelaunch";

type SortKey = "symbol" | "vol" | "oi" | "change";

type MarketRow = {
  symbol: string;
  base: string;
  price: number;
  change24h: number;
  volume: number;
  oi: number;
  leverage: number;
  created: number;
  pretge: boolean;
  sleeve: "crypto" | "tradfi" | "community";
};

const FAV_KEY = "bd-markets-favs";
const NEW_MS = 21 * 24 * 60 * 60 * 1000;

const TRADFI = new Set([
  "AAPL",
  "AAOI",
  "AMD",
  "AMZN",
  "BABA",
  "COIN",
  "CRCL",
  "DELL",
  "GOOGL",
  "META",
  "MSFT",
  "MSTR",
  "NVDA",
  "TSLA",
  "HOOD",
  "NFLX",
  "INTC",
  "PLTR",
  "COPPER",
  "GOLD",
  "SILVER",
  "SPY",
  "QQQ",
  "NDX100",
]);

function compact(value: number) {
  if (!value) return "0";
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`;
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`.replace(/\.00M$/, "M");
  if (abs >= 1_000) return `${(value / 1_000).toFixed(2)}K`.replace(/\.00K$/, "K");
  return value.toFixed(abs >= 100 ? 0 : 2);
}

function lastPx(value: number) {
  if (!value) return "—";
  if (value >= 1000) return value.toLocaleString(undefined, { maximumFractionDigits: 1 });
  if (value >= 1) return value.toLocaleString(undefined, { maximumFractionDigits: 3 });
  if (value >= 0.01) return value.toFixed(4);
  return value.toPrecision(4);
}

function pct(value: number) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

function sleeveOf(base: string, name: string): MarketRow["sleeve"] {
  const clean = base.replace(/^1000/, "").toUpperCase();
  if (TRADFI.has(clean) || /\(|crude|oil|nasdaq|s&p|equity/i.test(name)) return "tradfi";
  if (clean.length <= 5) return "crypto";
  return "community";
}

async function loadRows(): Promise<MarketRow[]> {
  const [futRes, infoRes] = await Promise.all([
    fetch("https://api.orderly.org/v1/public/futures"),
    fetch("https://api.orderly.org/v1/public/info"),
  ]);
  if (!futRes.ok) throw new Error("markets");
  const futJson = (await futRes.json()) as { data?: { rows?: Record<string, unknown>[] } };
  const infoJson = infoRes.ok ? await infoRes.json() : { data: { rows: [] } };
  const infoRows = Array.isArray(infoJson.data) ? infoJson.data : infoJson.data?.rows || [];
  const infoBy = new Map(
    infoRows.map((row: Record<string, unknown>) => [String(row.symbol || ""), row]),
  );
  return (futJson.data?.rows || [])
    .map((row) => {
      const symbol = String(row.symbol || "");
      const info = infoBy.get(symbol) || {};
      const close = Number(row["24h_close"] ?? row.mark_price ?? 0);
      const open = Number(row["24h_open"] ?? 0);
      const price = Number(row.mark_price ?? close);
      const imr = Number(info.base_imr || 0.05);
      const base =
        String(row.display_symbol_name || info.display_symbol_name || "") ||
        symbol.replace(/^PERP_/, "").replace(/_USDC.*$/, "");
      return {
        symbol,
        base,
        price,
        change24h: open > 0 ? ((close - open) / open) * 100 : 0,
        volume: Number(row["24h_amount"] ?? 0),
        oi: Number(row.open_interest ?? 0) * price,
        leverage: Math.max(1, Math.round(1 / Math.max(imr, 0.005))),
        created: Number(info.created_time || 0),
        pretge: Boolean(row.is_pretge || info.is_pretge),
        sleeve: sleeveOf(base, String(row.display_symbol_name || "")),
      };
    })
    .filter((row) => row.symbol.startsWith("PERP_") && row.price > 0);
}

function loadFavs(): string[] {
  try {
    return JSON.parse(localStorage.getItem(FAV_KEY) || "[]");
  } catch {
    return [];
  }
}

export default function MarketsDesk() {
  const [rows, setRows] = useState<MarketRow[]>([]);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<Tab>("all");
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({
    key: "vol",
    dir: "desc",
  });
  const [favs, setFavs] = useState<string[]>([]);

  useEffect(() => {
    setFavs(loadFavs());
    loadRows().then(setRows).catch(() => setRows([]));
  }, []);

  const toggleFav = (symbol: string) => {
    setFavs((prev) => {
      const next = prev.includes(symbol) ? prev.filter((item) => item !== symbol) : [...prev, symbol];
      localStorage.setItem(FAV_KEY, JSON.stringify(next));
      return next;
    });
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const now = Date.now();
    const list = rows.filter((row) => {
      if (q && !row.base.toLowerCase().includes(q) && !row.symbol.toLowerCase().includes(q)) {
        return false;
      }
      if (tab === "fav") return favs.includes(row.symbol);
      if (tab === "crypto") return row.sleeve === "crypto" && !row.pretge;
      if (tab === "tradfi") return row.sleeve === "tradfi";
      if (tab === "community") return row.sleeve === "community" && !row.pretge;
      if (tab === "new") return now - row.created < NEW_MS;
      if (tab === "prelaunch") return row.pretge;
      return true;
    });
    const dir = sort.dir === "asc" ? 1 : -1;
    return [...list].sort((a, b) => {
      if (sort.key === "symbol") return a.base.localeCompare(b.base) * dir;
      if (sort.key === "oi") return (a.oi - b.oi) * dir;
      if (sort.key === "change") return (a.change24h - b.change24h) * dir;
      return (a.volume - b.volume) * dir;
    });
  }, [rows, query, tab, sort, favs]);

  const setKey = (key: SortKey) => {
    setSort((prev) =>
      prev.key === key ? { key, dir: prev.dir === "desc" ? "asc" : "desc" } : { key, dir: key === "symbol" ? "asc" : "desc" },
    );
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "fav", label: "★" },
    { id: "all", label: "All" },
    { id: "crypto", label: "Crypto" },
    { id: "tradfi", label: "TradFi" },
    { id: "community", label: "Community" },
    { id: "new", label: "New listings" },
    { id: "prelaunch", label: "Pre-launch" },
  ];

  return (
    <div className="bd-markets-desk">
      <header className="bd-markets-head">
        <h1>Markets</h1>
      </header>

      <label className="bd-markets-search">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="11" cy="11" r="6.25" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <path d="M16 16.5L20 20.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          value={query}
          placeholder="Search market"
          onChange={(event) => setQuery(event.target.value)}
          autoComplete="off"
        />
      </label>

      <div className="bd-markets-tabs">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            className={tab === item.id ? "is-on" : ""}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="bd-markets-cols">
        <button type="button" onClick={() => setKey("symbol")}>
          Symbol
        </button>
        <button type="button" onClick={() => setKey("vol")}>
          24h Vol / OI
        </button>
        <button type="button" onClick={() => setKey("change")}>
          Last/24h %
        </button>
      </div>

      <div className="bd-markets-rows">
        {filtered.map((row) => {
          const up = row.change24h >= 0;
          const starred = favs.includes(row.symbol);
          return (
            <div key={row.symbol} className="bd-markets-row">
              <button
                type="button"
                className={`bd-markets-star ${starred ? "is-on" : ""}`}
                onClick={() => toggleFav(row.symbol)}
                aria-label={starred ? "Unfavorite" : "Favorite"}
              >
                {starred ? "★" : "☆"}
              </button>
              <Link to={`/perp/${row.symbol}`} className="bd-markets-link">
                <TokenMark symbol={row.symbol} label={row.base} size={28} />
                <span className="bd-markets-name">
                  <strong>{row.base}</strong>
                  <em>{row.leverage}x</em>
                </span>
                <span className="bd-markets-vol">
                  <b>{compact(row.volume)}</b>
                  <small>{compact(row.oi)}</small>
                </span>
                <span className="bd-markets-last">
                  <b>{lastPx(row.price)}</b>
                  <small className={up ? "is-up" : "is-dn"}>{pct(row.change24h)}</small>
                </span>
              </Link>
            </div>
          );
        })}
        {!filtered.length ? <p className="bd-markets-empty">No markets in this screen.</p> : null}
      </div>
    </div>
  );
}
