/** Morpho Earn Phase 1 — curated vaults for Black DEX /earn */

export type MorphoVault = {
  id: string;
  name: string;
  asset: "USDC" | "WETH";
  chainId: number;
  chainLabel: string;
  chainSlug: string;
  address: `0x${string}`;
  curator: string;
  slug: string;
  /** Performance fee charged by curator (not Black DEX) */
  performanceFeePct: number;
};

/** Curated list — Base first (gas), then Ethereum. */
export const MORPHO_VAULTS: MorphoVault[] = [
  {
    id: "steakhouse-usdc-base",
    name: "Steakhouse USDC",
    asset: "USDC",
    chainId: 8453,
    chainLabel: "Base",
    chainSlug: "base",
    address: "0xbeeF010f9cb27031ad51e3333f9aF9C6B1228183",
    curator: "Steakhouse Financial",
    slug: "steakhouse-usdc",
    performanceFeePct: 25,
  },
  {
    id: "gauntlet-usdc-base",
    name: "Gauntlet USDC",
    asset: "USDC",
    chainId: 8453,
    chainLabel: "Base",
    chainSlug: "base",
    address: "0xeE8F4eC5672F09119b96Ab6fB59C27E1b7e44b61",
    curator: "Gauntlet",
    slug: "gauntlet-usdc",
    performanceFeePct: 10,
  },
  {
    id: "steakhouse-usdc-eth",
    name: "Steakhouse USDC",
    asset: "USDC",
    chainId: 1,
    chainLabel: "Ethereum",
    chainSlug: "ethereum",
    address: "0xBEEF01735c132Ada46AA9aA4c54623cAA92A64CB",
    curator: "Steakhouse Financial",
    slug: "steakhouse-usdc",
    performanceFeePct: 5,
  },
];

export type MorphoVaultLive = MorphoVault & {
  netApy: number | null;
  totalAssetsUsd: number | null;
  fee: number | null;
};

const MORPHO_API = "https://api.morpho.org/graphql";

function morphoAppUrl(vault: MorphoVault) {
  return `https://app.morpho.org/${vault.chainSlug}/vault/${vault.address}/${vault.slug}`;
}

export function vaultDepositUrl(vault: MorphoVault) {
  return morphoAppUrl(vault);
}

export function vaultWithdrawUrl(vault: MorphoVault) {
  return morphoAppUrl(vault);
}

function shortAddr(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export { shortAddr, morphoAppUrl };

async function fetchVaultState(
  address: string,
  chainId: number,
): Promise<{ netApy: number | null; totalAssetsUsd: number | null; fee: number | null }> {
  const query = `
    query VaultState($address: String!, $chainId: Int!) {
      vaultByAddress(address: $address, chainId: $chainId) {
        address
        state {
          apy
          netApy
          totalAssetsUsd
          fee
        }
      }
    }
  `;

  try {
    const res = await fetch(MORPHO_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query,
        variables: { address: address.toLowerCase(), chainId },
      }),
    });
    if (!res.ok) return { netApy: null, totalAssetsUsd: null, fee: null };
    const json = (await res.json()) as {
      data?: {
        vaultByAddress?: {
          state?: {
            netApy?: number;
            apy?: number;
            totalAssetsUsd?: number;
            fee?: number;
          };
        };
      };
    };
    const state = json.data?.vaultByAddress?.state;
    if (!state) return { netApy: null, totalAssetsUsd: null, fee: null };
    return {
      netApy: typeof state.netApy === "number" ? state.netApy : null,
      totalAssetsUsd:
        typeof state.totalAssetsUsd === "number" ? state.totalAssetsUsd : null,
      fee: typeof state.fee === "number" ? state.fee : null,
    };
  } catch {
    return { netApy: null, totalAssetsUsd: null, fee: null };
  }
}

export async function loadMorphoEarnVaults(): Promise<MorphoVaultLive[]> {
  const rows = await Promise.all(
    MORPHO_VAULTS.map(async (vault) => {
      const live = await fetchVaultState(vault.address, vault.chainId);
      return { ...vault, ...live };
    }),
  );
  return rows;
}

export function formatApy(netApy: number | null) {
  if (netApy == null || Number.isNaN(netApy)) return "—";
  return `${(netApy * 100).toFixed(2)}%`;
}

export function formatTvl(usd: number | null) {
  if (usd == null || Number.isNaN(usd)) return "—";
  if (usd >= 1_000_000_000) return `$${(usd / 1_000_000_000).toFixed(2)}B`;
  if (usd >= 1_000_000) return `$${(usd / 1_000_000).toFixed(2)}M`;
  if (usd >= 1_000) return `$${(usd / 1_000).toFixed(1)}K`;
  return `$${usd.toFixed(0)}`;
}
