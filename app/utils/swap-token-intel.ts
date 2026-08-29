export type SwapChainId =
  | "ethereum"
  | "arbitrum"
  | "optimism"
  | "base"
  | "polygon"
  | "bsc"
  | "avalanche";

export type SwapTokenRef = {
  chainLabel: string;
  chain: SwapChainId;
  symbol: string;
};

export type SwapTokenIntel = {
  symbol: string;
  name: string;
  chain: SwapChainId;
  chainLabel: string;
  address: string;
  native: boolean;
  priceUsd: number | null;
  change24h: number | null;
  liquidityUsd: number | null;
  volume24h: number | null;
  fdv: number | null;
  marketCap: number | null;
  dex: string | null;
  pairUrl: string | null;
  explorerUrl: string | null;
};

type KnownToken = {
  address: string;
  name: string;
  native?: boolean;
};

const CHAIN_ALIASES: Record<string, SwapChainId> = {
  eth: "ethereum",
  ethereum: "ethereum",
  ethereummainnet: "ethereum",
  arb: "arbitrum",
  arbitrum: "arbitrum",
  arbitrumone: "arbitrum",
  op: "optimism",
  optimism: "optimism",
  base: "base",
  polygon: "polygon",
  matic: "polygon",
  bsc: "bsc",
  bnb: "bsc",
  bnbchain: "bsc",
  binance: "bsc",
  avalanche: "avalanche",
  avax: "avalanche",
};

const EXPLORERS: Record<SwapChainId, string> = {
  ethereum: "https://etherscan.io/token/",
  arbitrum: "https://arbiscan.io/token/",
  optimism: "https://optimistic.etherscan.io/token/",
  base: "https://basescan.org/token/",
  polygon: "https://polygonscan.com/token/",
  bsc: "https://bscscan.com/token/",
  avalanche: "https://snowtrace.io/token/",
};

const REGISTRY: Record<SwapChainId, Record<string, KnownToken>> = {
  ethereum: {
    ETH: { address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", name: "Ether", native: true },
    WETH: { address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", name: "Wrapped Ether" },
    USDC: { address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", name: "USD Coin" },
    USDT: { address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", name: "Tether USD" },
    WBTC: { address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", name: "Wrapped Bitcoin" },
    WOO: { address: "0x4691937a7508860F876c9c0a2a617E7d9E945D4B", name: "WOO" },
  },
  arbitrum: {
    ETH: { address: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", name: "Ether", native: true },
    WETH: { address: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", name: "Wrapped Ether" },
    USDC: { address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", name: "USD Coin" },
    "USDC.E": { address: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8", name: "Bridged USDC" },
    USDT: { address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", name: "Tether USD" },
    ARB: { address: "0x912CE59144191C1204E64559FE8253a0e49E6548", name: "Arbitrum" },
    WBTC: { address: "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f", name: "Wrapped Bitcoin" },
    WOO: { address: "0xcAFcD85D8ca7Ad1e1C6F82F3484a445af66dcdF9", name: "WOO" },
    ORDER: { address: "0x4E200fE2f3eFb905d4f785C1C89D663876E93f6", name: "Orderly Network" },
  },
  optimism: {
    ETH: { address: "0x4200000000000000000000000000000000000006", name: "Ether", native: true },
    USDC: { address: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85", name: "USD Coin" },
    USDT: { address: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58", name: "Tether USD" },
    OP: { address: "0x4200000000000000000000000000000000000042", name: "Optimism" },
  },
  base: {
    ETH: { address: "0x4200000000000000000000000000000000000006", name: "Ether", native: true },
    USDC: { address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", name: "USD Coin" },
    USDT: { address: "0xfde4C96c8593536E31F229EA8d028A32A4b6237E", name: "Tether USD" },
  },
  polygon: {
    POL: { address: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270", name: "POL", native: true },
    MATIC: { address: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270", name: "POL", native: true },
    USDC: { address: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", name: "USD Coin" },
    "USDC.E": { address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", name: "Bridged USDC" },
    USDT: { address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", name: "Tether USD" },
    WETH: { address: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619", name: "Wrapped Ether" },
  },
  bsc: {
    BNB: { address: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", name: "BNB", native: true },
    USDC: { address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", name: "USD Coin" },
    USDT: { address: "0x55d398326f99059fF775485246999027B3197955", name: "Tether USD" },
    ETH: { address: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8", name: "Ethereum Token" },
  },
  avalanche: {
    AVAX: { address: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7", name: "Avalanche", native: true },
    USDC: { address: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E", name: "USD Coin" },
    USDT: { address: "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7", name: "Tether USD" },
  },
};

export function normalizeChain(label: string | null | undefined): SwapChainId {
  const key = (label || "arbitrum")
    .toLowerCase()
    .replace(/[^a-z]/g, "");
  return CHAIN_ALIASES[key] || "arbitrum";
}

export function defaultSwapPair(): { from: SwapTokenRef; to: SwapTokenRef } {
  return {
    from: { chainLabel: "Arbitrum", chain: "arbitrum", symbol: "ETH" },
    to: { chainLabel: "Arbitrum", chain: "arbitrum", symbol: "USDC" },
  };
}

export function readSwapPairFromDom(): { from: SwapTokenRef; to: SwapTokenRef } | null {
  const views = Array.from(document.querySelectorAll(".dex .swap-input-view"));
  if (views.length < 2) return null;

  const parse = (view: Element, fallbackSymbol: string): SwapTokenRef => {
    const network =
      view.querySelector(".network-row")?.textContent?.replace(/\s+/g, " ").trim() || "";
    const chainLabel =
      network.replace(/^(From|To)\s+/i, "").replace(/\s*[\u25be\u25bc▲▸].*$/, "").trim() ||
      "Arbitrum";
    const symbol =
      view.querySelector(".symbol")?.textContent?.trim() || fallbackSymbol;
    return {
      chainLabel,
      chain: normalizeChain(chainLabel),
      symbol: symbol.toUpperCase(),
    };
  };

  return {
    from: parse(views[0], "ETH"),
    to: parse(views[1], "USDC"),
  };
}

type DexPair = {
  chainId?: string;
  dexId?: string;
  url?: string;
  priceUsd?: string;
  fdv?: number;
  marketCap?: number;
  liquidity?: { usd?: number };
  volume?: { h24?: number };
  priceChange?: { h24?: number };
  baseToken?: { address?: string; name?: string; symbol?: string };
  quoteToken?: { address?: string; name?: string; symbol?: string };
};

function pickPair(pairs: DexPair[], chain: SwapChainId, symbol: string): DexPair | null {
  const wanted = symbol.toUpperCase();
  const onChain = pairs.filter((pair) => (pair.chainId || "").toLowerCase() === chain);
  const pool = onChain.length ? onChain : pairs;
  const matched = pool.filter((pair) => {
    const base = (pair.baseToken?.symbol || "").toUpperCase();
    const quote = (pair.quoteToken?.symbol || "").toUpperCase();
    return base === wanted || quote === wanted;
  });
  const ranked = (matched.length ? matched : pool).sort(
    (a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0),
  );
  return ranked[0] || null;
}

function tokenFromPair(pair: DexPair, symbol: string, known?: KnownToken) {
  const wanted = symbol.toUpperCase();
  const base = pair.baseToken;
  const quote = pair.quoteToken;
  const useQuote = (quote?.symbol || "").toUpperCase() === wanted && (base?.symbol || "").toUpperCase() !== wanted;
  const token = useQuote ? quote : base;
  return {
    address: known?.address || token?.address || "",
    name: known?.name || token?.name || symbol,
    symbol: token?.symbol || symbol,
  };
}

async function fetchJson(url: string): Promise<unknown> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Token feed ${res.status}`);
  return res.json();
}

export async function loadTokenIntel(ref: SwapTokenRef): Promise<SwapTokenIntel> {
  const symbol = ref.symbol.toUpperCase();
  const known = REGISTRY[ref.chain]?.[symbol];
  let pairs: DexPair[] = [];

  if (known?.address) {
    const data = await fetchJson(
      `https://api.dexscreener.com/tokens/v1/${ref.chain}/${known.address}`,
    );
    pairs = Array.isArray(data) ? (data as DexPair[]) : [];
  }

  if (!pairs.length) {
    const data = (await fetchJson(
      `https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(symbol)}`,
    )) as { pairs?: DexPair[] };
    pairs = data.pairs || [];
  }

  const pair = pickPair(pairs, ref.chain, symbol);
  const token = pair ? tokenFromPair(pair, symbol, known) : {
    address: known?.address || "",
    name: known?.name || symbol,
    symbol,
  };

  const address = token.address;
  const native = Boolean(known?.native);

  return {
    symbol,
    name: token.name,
    chain: ref.chain,
    chainLabel: ref.chainLabel,
    address,
    native,
    priceUsd: pair?.priceUsd ? Number(pair.priceUsd) : null,
    change24h: pair?.priceChange?.h24 ?? null,
    liquidityUsd: pair?.liquidity?.usd ?? null,
    volume24h: pair?.volume?.h24 ?? null,
    fdv: pair?.fdv ?? null,
    marketCap: pair?.marketCap ?? null,
    dex: pair?.dexId || null,
    pairUrl: pair?.url || null,
    explorerUrl: address ? `${EXPLORERS[ref.chain]}${address}` : null,
  };
}

export function formatUsd(value: number | null): string {
  if (value == null || Number.isNaN(value)) return "—";
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (abs >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `$${(value / 1_000).toFixed(2)}K`;
  if (abs >= 1) return `$${value.toFixed(2)}`;
  if (abs >= 0.0001) return `$${value.toFixed(4)}`;
  return `$${value.toExponential(2)}`;
}

export function formatPct(value: number | null): string {
  if (value == null || Number.isNaN(value)) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export function shortAddress(address: string): string {
  if (!address) return "Native";
  return `${address.slice(0, 6)}\u2026${address.slice(-4)}`;
}
