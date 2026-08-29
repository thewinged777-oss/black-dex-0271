import { useState } from "react";

function tickerKey(symbol: string) {
  const raw = symbol.replace(/^PERP_/, "").split("_")[0] || symbol;
  return raw.replace(/^1000/, "").toLowerCase();
}

function iconUrl(key: string) {
  return `https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/32/color/${key}.png`;
}

export default function TokenMark({
  symbol,
  label,
  size = 18,
}: {
  symbol: string;
  label?: string;
  size?: number;
}) {
  const key = tickerKey(symbol);
  const [failed, setFailed] = useState(false);
  const text = (label || key).slice(0, 3).toUpperCase();

  if (failed) {
    return (
      <span className="bd-token-mark is-fallback" style={{ width: size, height: size, fontSize: Math.max(8, size * 0.38) }}>
        {text}
      </span>
    );
  }

  return (
    <img
      className="bd-token-mark"
      src={iconUrl(key)}
      alt=""
      width={size}
      height={size}
      onError={() => setFailed(true)}
    />
  );
}
