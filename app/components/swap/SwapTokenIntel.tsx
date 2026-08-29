import { useEffect, useMemo, useState } from "react";
import {
  defaultSwapPair,
  formatPct,
  formatUsd,
  loadTokenIntel,
  readSwapPairFromDom,
  shortAddress,
  type SwapTokenIntel as TokenIntel,
  type SwapTokenRef,
} from "@/utils/swap-token-intel";

type PairState = {
  from: SwapTokenRef;
  to: SwapTokenRef;
};

function sameRef(a: SwapTokenRef, b: SwapTokenRef) {
  return a.chain === b.chain && a.symbol === b.symbol;
}

function TokenCard({
  side,
  token,
  loading,
}: {
  side: "From" | "To";
  token: TokenIntel | null;
  loading: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (!token?.address) return;
    try {
      await navigator.clipboard.writeText(token.address);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  };

  const changeClass =
    token?.change24h == null ? "" : token.change24h >= 0 ? "is-up" : "is-dn";

  return (
    <article className="bd-swap-intel-card">
      <header>
        <span>{side}</span>
        <strong>
          {token?.symbol || "—"}
          <em>{token?.chainLabel || "—"}</em>
        </strong>
      </header>
      <p className="bd-swap-intel-name">{loading ? "Reading book\u2026" : token?.name || "Token"}</p>
      <dl>
        <div>
          <dt>Price</dt>
          <dd>{formatUsd(token?.priceUsd ?? null)}</dd>
        </div>
        <div>
          <dt>24h</dt>
          <dd className={changeClass}>{formatPct(token?.change24h ?? null)}</dd>
        </div>
        <div>
          <dt>Liquidity</dt>
          <dd>{formatUsd(token?.liquidityUsd ?? null)}</dd>
        </div>
        <div>
          <dt>24h vol</dt>
          <dd>{formatUsd(token?.volume24h ?? null)}</dd>
        </div>
        <div>
          <dt>FDV</dt>
          <dd>{formatUsd(token?.fdv ?? token?.marketCap ?? null)}</dd>
        </div>
        <div>
          <dt>Venue</dt>
          <dd>{token?.dex ? token.dex.toUpperCase() : "—"}</dd>
        </div>
      </dl>
      <div className="bd-swap-intel-contract">
        <span>{token?.native ? "Wrapped / native" : "Contract"}</span>
        <button type="button" onClick={copy} disabled={!token?.address}>
          {copied ? "Copied" : shortAddress(token?.address || "")}
        </button>
        {token?.explorerUrl ? (
          <a href={token.explorerUrl} target="_blank" rel="noreferrer">
            Explorer
          </a>
        ) : null}
      </div>
    </article>
  );
}

export default function SwapTokenIntel({
  onChartPair,
}: {
  onChartPair?: (pairUrl: string | null, label: string) => void;
}) {
  const seed = useMemo(() => defaultSwapPair(), []);
  const [pair, setPair] = useState<PairState>(seed);
  const [fromIntel, setFromIntel] = useState<TokenIntel | null>(null);
  const [toIntel, setToIntel] = useState<TokenIntel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const pull = () => {
      const next = readSwapPairFromDom();
      if (!next) return;
      setPair((prev) => {
        if (sameRef(prev.from, next.from) && sameRef(prev.to, next.to) && prev.from.chainLabel === next.from.chainLabel) {
          return prev;
        }
        return next;
      });
    };
    pull();
    const tick = window.setInterval(pull, 900);
    const root = document.querySelector(".dex") || document.body;
    const observer = new MutationObserver(pull);
    observer.observe(root, { subtree: true, childList: true, characterData: true });
    return () => {
      window.clearInterval(tick);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    let live = true;
    setLoading(true);
    Promise.all([loadTokenIntel(pair.from), loadTokenIntel(pair.to)])
      .then(([from, to]) => {
        if (!live) return;
        setFromIntel(from);
        setToIntel(to);
        const chartToken =
          from.symbol === "USDC" || from.symbol === "USDT" || from.symbol === "USDC.E" ? to : from;
        onChartPair?.(
          chartToken.pairUrl,
          `${pair.from.symbol} / ${pair.to.symbol} · ${pair.from.chainLabel}`,
        );
      })
      .catch(() => {
        if (!live) return;
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [pair.from.chain, pair.from.symbol, pair.to.chain, pair.to.symbol, pair.from.chainLabel, pair.to.chainLabel, onChartPair]);

  return (
    <section className="bd-swap-intel" aria-label="Token information">
      <div className="bd-swap-intel-kicker">
        <span>Token intel</span>
        <p>Live price, liquidity and contract for the pair on the ticket.</p>
      </div>
      <div className="bd-swap-intel-grid">
        <TokenCard side="From" token={fromIntel} loading={loading && !fromIntel} />
        <TokenCard side="To" token={toIntel} loading={loading && !toIntel} />
      </div>
    </section>
  );
}
