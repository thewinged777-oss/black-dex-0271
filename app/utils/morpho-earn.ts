/**
 * Morpho Earn — curated vault catalog + live APY from Morpho GraphQL.
 * Phase 1: browse + deep-link deposit/withdraw on app.morpho.org.
 * Attribution required: "Powered by Morpho · curated by X"
 */

export type MorphoChain = "base" | "ethereum";

export type MorphoVaultMeta = {
  id: string;
  address: string;
  chain: MorphoChain;
  chainId: number;
  name: string;
  asset: "USDC" | "WETH" | "ETH";
  curator: string;
  slug: string;
  description: string;
};

export type MorphoVaultLive = MorphoVaultMeta & {
  netApy: number | null;
  totalAssetsUsd: number | null;
  liquidityUsd: number | null; // optional; API may omit
};

/** Curated shortlist — Steakhouse + Gauntlet USDC (Base + Ethereum). */
export const MORPHO_VAULTS: MorphoVaultMeta[] = [
  {
    id: "steakhouse-usdc-base",
    address: "0xbeeF010f9cb27031ad51e3333f9aF9C6B1228183",
    chain: "base",
    chainId: 8453,
    name: "Steakhouse USDC",
    asset: "USDC",
    curator: "Steakhouse Financial",
    slug: "steakhouse-usdc",
    description:
      "Blue-chip + RWA dual-engine USDC vault on Base. Conservative allocation to high-liquidity Morpho markets.",
  },
  {
    id: "gauntlet-usdc-prime-base",
    address: "0xeE8F4eC5672F09119b96Ab6fB59C27E1b7e44b61",
    chain: "base",
    chainId: 8453,
    name: "Gauntlet USDC Prime",
    asset: "USDC",
    curator: "Gauntlet",
    slug: "gauntlet-usdc-prime",
    description:
      "Gauntlet-curated Prime USDC on Base. Blue-chip collateral only (cbBTC, WETH, cbETH, wstETH).",
  },
  {
    id: "steakhouse-usdc-eth",
    address: "0xBEEF01735c132Ada46AA9aA4c54623cAA92A64CB",
    chain: "ethereum",
    chainId: 1,
    name: "Steakhouse USDC",
    asset: "USDC",
    curator: "Steakhouse Financial",
    slug: "steakhouse-usdc",
    description:
      "Steakhouse USDC on Ethereum mainnet. Same dual-engine mandate as the Base vault.",
  },
];

const MORPHO_GQL = "https://blue-api.morpho.org/graphql";

const VAULT_QUERY = `
  query VaultsByAddress($addresses: [String!]!) {
    vaults(where: { address_in: $addresses }) {
      items {
        address
        name
        asset {
          symbol
        }
        state {
          netApy
          totalAssetsUsd
        }
      }
    }
  }
`;

function chainPath(chain: MorphoChain): string {
  return chain === "base" ? "base" : "ethereum";
}

/** Deep-link into Morpho app for deposit / withdraw UI. */
export function morphoVaultUrl(vault: MorphoVaultMeta): string {
  return `https://app.morpho.org/${chainPath(vault.chain)}/vault/${vault.address}/${vault.slug}`;
}

export function formatApy(netApy: number | null | undefined): string {
  if (netApy == null || Number.isNaN(netApy)) return "—";
  // Morpho GraphQL returns decimal (e.g. 0.0342 = 3.42%)
  const pct = netApy > 1 ? netApy : netApy * 100;
  return `${pct.toFixed(2)}%`;
}

export function formatUsdCompact(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

export async function loadMorphoVaults(
  catalog: MorphoVaultMeta[] = MORPHO_VAULTS,
): Promise<MorphoVaultLive[]> {
  const addresses = catalog.map((v) => v.address.toLowerCase());

  try {
    const res = await fetch(MORPHO_GQL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: VAULT_QUERY,
        variables: { addresses },
      }),
    });

    if (!res.ok) {
      throw new Error(`Morpho API ${res.status}`);
    }

    const json = (await res.json()) as {
      data?: {
        vaults?: {
          items?: Array<{
            address: string;
            state?: {
              netApy?: number | null;
              totalAssetsUsd?: number | null;
            };
          }>;
        };
      };
    };

    const items = json.data?.vaults?.items ?? [];
    const live = new Map<
      string,
      {
        netApy: number | null;
        totalAssetsUsd: number | null;
      }
    >();

    for (const item of items) {
      const key = item.address.toLowerCase();
      live.set(key, {
        netApy: item.state?.netApy ?? null,
        totalAssetsUsd: item.state?.totalAssetsUsd ?? null,
      });
    }

    return catalog.map((meta) => {
      const stats = live.get(meta.address.toLowerCase());
      return {
        ...meta,
        netApy: stats?.netApy ?? null,
        totalAssetsUsd: stats?.totalAssetsUsd ?? null,
        liquidityUsd: null,
      };
    });
  } catch (err) {
    console.warn("[morpho-earn] live APY fetch failed", err);
    return catalog.map((meta) => ({
      ...meta,
      netApy: null,
      totalAssetsUsd: null,
      liquidityUsd: null,
    }));
  }
}
