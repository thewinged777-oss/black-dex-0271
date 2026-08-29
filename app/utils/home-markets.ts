export type HomeMarket = {
  symbol: string;
  base: string;
  price: number;
  change24h: number;
  funding: number;
  volume: number;
};

type FuturesRow = {
  symbol?: string;
  mark_price?: number;
  index_price?: number;
  est_funding_rate?: number;
  last_funding_rate?: number;
  "24h_close"?: number;
  "24h_open"?: number;
  "24h_volume"?: number;
  "24h_amount"?: number;
};

function displayBase(symbol: string) {
  const match = symbol.match(/^PERP_(.+?)_USDC/);
  return (match?.[1] || symbol.replace(/^PERP_/, "")).replace(/_/g, "");
}

export async function loadHomeMarkets(): Promise<HomeMarket[]> {
  const res = await fetch("https://api.orderly.org/v1/public/futures");
  if (!res.ok) throw new Error("markets");
  const json = (await res.json()) as { data?: { rows?: FuturesRow[] } };
  const rows = json.data?.rows || [];
  return rows
    .map((row) => {
      const symbol = row.symbol || "";
      const close = Number(row["24h_close"] ?? row.mark_price ?? 0);
      const open = Number(row["24h_open"] ?? 0);
      const change24h = open > 0 ? ((close - open) / open) * 100 : 0;
      return {
        symbol,
        base: displayBase(symbol),
        price: Number(row.mark_price ?? close),
        change24h,
        funding: Number(row.est_funding_rate ?? row.last_funding_rate ?? 0),
        volume: Number(row["24h_volume"] ?? row["24h_amount"] ?? 0),
      };
    })
    .filter((row) => row.symbol.startsWith("PERP_") && row.price > 0);
}
