import { formatApy, formatUsdCompact } from "@/utils/morpho-earn";

export type OrderlyEarnVault = {
  id: string;
  name: string;
  description: string;
  status: string;
  asset: string;
  tvl: number | null;
  apy: number | null;
  depositors: number | null;
  minDeposit: number | null;
};

const ALLOWED = new Set(["orderly omnivault", "smaug"]);

function plainText(raw: string) {
  return raw
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

export { formatApy, formatUsdCompact };

export async function loadOrderlyEarnVaults(): Promise<OrderlyEarnVault[]> {
  try {
    const res = await fetch(
      "https://api-sv.orderly.org/v1/public/strategy_vault/vault/info",
    );
    if (!res.ok) throw new Error(`Orderly vaults ${res.status}`);
    const json = (await res.json()) as {
      data?: {
        rows?: Array<{
          vault_id: string;
          vault_name: string;
          description?: string;
          status?: string;
          asset?: string;
          tvl?: number;
          lifetime_apy?: number;
          "30d_apy"?: number;
          lp_counts?: number;
          min_deposit_amount?: number;
        }>;
      };
    };
    return (json.data?.rows ?? [])
      .filter((row) => ALLOWED.has((row.vault_name || "").toLowerCase()))
      .map((row) => ({
        id: row.vault_id,
        name: row.vault_name,
        description: plainText(row.description || ""),
        status: row.status || "live",
        asset: row.asset || "USDC",
        tvl: row.tvl ?? null,
        apy: row.lifetime_apy ?? row["30d_apy"] ?? null,
        depositors: row.lp_counts ?? null,
        minDeposit: row.min_deposit_amount ?? null,
      }));
  } catch (err) {
    console.warn("[orderly-earn] load failed", err);
    return [];
  }
}
