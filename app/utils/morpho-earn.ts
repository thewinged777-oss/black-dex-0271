/**
 * Black DEX Earn — Privy fee-wrapper vaults on Morpho.
 * Deposits go to the wrapper address so Black DEX receives the configured yield cut.
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
  privyVaultId?: string;
  feePercent?: number;
  underlyingAddress?: string;
};

export type MorphoVaultLive = MorphoVaultMeta & {
  netApy: number | null;
  totalAssetsUsd: number | null;
  liquidityUsd: number | null;
};

/** Privy Earn wrappers only — public Morpho vaults have no Black DEX fee. */
export const MORPHO_VAULTS: MorphoVaultMeta[] = [
  {
    id: "privy-steakhouse-prime-usdc-base",
    address: "0xa709c3469c5477749af47b455cfc522a0aa90c1b",
    chain: "base",
    chainId: 8453,
    name: "Steakhouse Prime USDC",
    asset: "USDC",
    curator: "Steakhouse Financial",
    slug: "steakhouse-prime-usdc",
    description:
      "Privy-wrapped Steakhouse USDC on Base. Yield from Morpho; Black DEX keeps a 10% performance fee. APY is variable, not guaranteed.",
    privyVaultId: "yq61ylarv3q585itz2rkuzeu",
    feePercent: 10,
    underlyingAddress: "0xbeeF010f9cb27031ad51e3333f9aF9C6B1228183",
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

export function morphoVaultUrl(vault: MorphoVaultMeta): string {
  const target = vault.underlyingAddress || vault.address;
  return `https://app.morpho.org/${chainPath(vault.chain)}/vault/${target}/${vault.slug}`;
}

export function formatApy(netApy: number | null | undefined): string {
  if (netApy == null || Number.isNaN(netApy)) return "\u2014";
  const pct = netApy > 1 ? netApy : netApy * 100;
  return `${pct.toFixed(2)}%`;
}

export function formatUsdCompact(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "\u2014";
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

export async function loadMorphoVaults(
  catalog: MorphoVaultMeta[] = MORPHO_VAULTS,
): Promise<MorphoVaultLive[]> {
  const addresses = Array.from(
    new Set(
      catalog.flatMap((v) =>
        [v.address, v.underlyingAddress].filter(Boolean).map((addr) => addr!.toLowerCase()),
      ),
    ),
  );

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
      live.set(item.address.toLowerCase(), {
        netApy: item.state?.netApy ?? null,
        totalAssetsUsd: item.state?.totalAssetsUsd ?? null,
      });
    }

    return catalog.map((meta) => {
      const wrapper = live.get(meta.address.toLowerCase());
      const underlying = meta.underlyingAddress
        ? live.get(meta.underlyingAddress.toLowerCase())
        : undefined;
      const rawApy = wrapper?.netApy ?? underlying?.netApy ?? null;
      const fee = (meta.feePercent ?? 0) / 100;
      const userApy =
        rawApy == null ? null : wrapper?.netApy != null ? wrapper.netApy : rawApy * (1 - fee);
      return {
        ...meta,
        netApy: userApy,
        totalAssetsUsd: wrapper?.totalAssetsUsd ?? underlying?.totalAssetsUsd ?? null,
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
