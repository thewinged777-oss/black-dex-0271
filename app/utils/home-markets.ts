export type HomeMarket = {
  symbol: string;
  base: string;
  price: number;
  change24h: number;
};

type FuturesRow = {
  symbol?: string;
  mark_price?: number;
  index_price?: number;
  "24h_close"?: number;
  "24h_open"?: number;
};

export async function loadHomeMarkets(): Promise<HomeMarket[]> {
  const res = await fetch("https://api.orderly.org/v1/public/futures");
  if (!res.ok) throw new Error("markets");
  const json = (await res.json()) as { data?: { rows?: FuturesRow[] } };
  const rows = json.data?.rows || [];
  return rows
    .map((row) => {
      const symbol = row.symbol || "";
      const base = symbol.replace(/^PERP_/, "").replace(/_USDC$/, "");
      const close = Number(row["24h_close"] ?? row.mark_price ?? 0);
      const open = Number(row["24h_open"] ?? 0);
      const change24h = open > 0 ? ((close - open) / open) * 100 : 0;
      return {
        symbol,
        base,
        price: Number(row.mark_price ?? close),
        change24h,
      };
    })
    .filter((row) => row.symbol.startsWith("PERP_"));
}
