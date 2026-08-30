export type HomeMarket = {
  symbol: string;
  base: string;
  price: number;
  change24h: number;
  funding: number;
  volume: number;
  created: number;
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

type InfoRow = {
  symbol?: string;
  created_time?: number;
  status?: string;
};

function displayBase(symbol: string) {
  const match = symbol.match(/^PERP_(.+?)_USDC/);
  return (match?.[1] || symbol.replace(/^PERP_/, "")).replace(/_/g, "");
}

export async function loadHomeMarkets(): Promise<HomeMarket[]> {
  const [futRes, infoRes] = await Promise.all([
    fetch("https://api.orderly.org/v1/public/futures"),
    fetch("https://api.orderly.org/v1/public/info"),
  ]);
  if (!futRes.ok) throw new Error("markets");
  const futJson = (await futRes.json()) as { data?: { rows?: FuturesRow[] } };
  const infoJson = infoRes.ok
    ? ((await infoRes.json()) as { data?: { rows?: InfoRow[] } | InfoRow[] })
    : { data: { rows: [] } };
  const infoRows = Array.isArray(infoJson.data)
    ? infoJson.data
    : infoJson.data?.rows || [];
  const createdBy = new Map(
    infoRows
      .filter((row) => row.symbol && (!row.status || row.status === "ACTIVE"))
      .map((row) => [row.symbol as string, Number(row.created_time || 0)]),
  );
  const rows = futJson.data?.rows || [];
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
        created: createdBy.get(symbol) || 0,
      };
    })
    .filter((row) => row.symbol.startsWith("PERP_") && row.price > 0);
}
