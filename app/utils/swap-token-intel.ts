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
    ORDER: { address: "0xABD4C63d2616A5201454168269031355f4764337", name: "Orderly Network" },
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
    ORDER: { address: "0x4E200fE2f3eFb977d5fd9c430A41531FB04d97B8", name: "Orderly Network" },
  },
  optimism: {
    ETH: { address: "0x4200000000000000000000000000000000000006", name: "Ether", native: true },
    USDC: { address: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85", name: "USD Coin" },
    USDT: { address: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58", name: "Tether USD" },
    OP: { address: "0x4200000000000000000000000000000000000042", name: "Optimism" },
    ORDER: { address: "0x4E200fE2f3eFb977d5fd9c430A41531FB04d97B8", name: "Orderly Network" },
  },
  base: {
    ETH: { address: "0x4200000000000000000000000000000000000006", name: "Ether", native: true },
    USDC: { address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", name: "USD Coin" },
    USDT: { address: "0xfde4C96c8593536E31F229EA8d028A32A4b6237E", name: "Tether USD" },
    ORDER: { address: "0x4E200fE2f3eFb977d5fd9c430A41531FB04d97B8", name: "Orderly Network" },
  },
  polygon: {
    POL: { address: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270", name: "POL", native: true },
    MATIC: { address: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270", name: "POL", native: true },
    USDC: { address: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", name: "USD Coin" },
    "USDC.E": { address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", name: "Bridged USDC" },
    USDT: { address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", name: "Tether USD" },
    WETH: { address: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619", name: "Wrapped Ether" },
    ORDER: { address: "0x4E200fE2f3eFb977d5fd9c430A41531FB04d97B8", name: "Orderly Network" },
  },
  bsc: {
    BNB: { address: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", name: "BNB", native: true },
    USDC: { address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", name: "USD Coin" },
    USDT: { address: "0x55d398326f99059fF775485246999027B3197955", name: "Tether USD" },
    ETH: { address: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8", name: "Ethereum Token" },
    ORDER: { address: "0x4E200fE2f3eFb977d5fd9c430A41531FB04d97B8", name: "Orderly Network" },
  },
  avalanche: {
    AVAX: { address: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7", name: "Avalanche", native: true },
    USDC: { address: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E", name: "USD Coin" },
    USDT: { address: "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7", name: "Tether USD" },
    ORDER: { address: "0x4E200fE2f3eFb977d5fd9c430A41531FB04d97B8", name: "Orderly Network" },
  },
};

const STABLES = new Set(["USDC", "USDT", "USDC.E", "DAI"]);

export function normalizeChain(label: string | null | undefined): SwapChainId {
  const key = (label || "arbitrum").toLowerCase().replace(/[^a-z]/g, "");
  return CHAIN_ALIASES[key] || "arbitrum";
}

export function defaultSwapPair(): { from: SwapTokenRef; to: SwapTokenRef } {
  return {
    from: { chainLabel: "Arbitrum", chain: "arbitrum", symbol: "ETH" },
    to: { chainLabel: "Arbitrum", chain: "arbitrum", symbol: "USDC" },
  };
}

function text(el: Element | null | undefined): string {
  return (el?.textContent || "").replace(/\s+/g, " ").trim();
}

function symbolFromView(view: Element, fallback: string): string {
  const node =
    view.querySelector(".symbol") ||
    view.querySelector(".token-symbol") ||
    view.querySelector("[class*='symbol']");
  const raw = text(node).replace(/[\u25be\u25bc\u25b2\u25b8▶]/g, "").trim();
  const token = raw.split(" ")[0];
  return (token || fallback).toUpperCase();
}

export function readSwapPairFromDom(): { from: SwapTokenRef; to: SwapTokenRef } | null {
  const views = Array.from(document.querySelectorAll(".dex .swap-input-view"));
  if (views.length < 2) return null;

  const parsed = views.map((view, index) => {
    const network = text(view.querySelector(".network-row"));
    const side = /^to\b/i.test(network) ? "to" : /^from\b/i.test(network) ? "from" : index === 0 ? "from" : "to";
    const chainLabel =
      network.replace(/^(From|To)\s+/i, "").replace(/\s*[\u25be\u25bc\u25b2\u25b8].*$/, "").trim() ||
      "Arbitrum";
    return {
      side,
      ref: {
        chainLabel,
        chain: normalizeChain(chainLabel),
        symbol: symbolFromView(view, index === 0 ? "ETH" : "USDC"),
      } as SwapTokenRef,
    };
  });

  const from = parsed.find((item) => item.side === "from")?.ref || parsed[0].ref;
  const to = parsed.find((item) => item.side === "to")?.ref || parsed[1].ref;
  if (!from.symbol || !to.symbol) return null;
  return { from, to };
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

function onChain(pair: DexPair, chain: SwapChainId) {
  return (pair.chainId || "").toLowerCase() === chain;
}

function pairSymbols(pair: DexPair) {
  return {
    base: (pair.baseToken?.symbol || "").toUpperCase(),
    quote: (pair.quoteToken?.symbol || "").toUpperCase(),
  };
}

function aliases(symbol: string) {
  const upper = symbol.toUpperCase();
  if (upper === "ETH") return ["ETH", "WETH"];
  if (upper === "WETH") return ["WETH", "ETH"];
  if (upper === "USDC") return ["USDC", "USDC.E"];
  if (upper === "USDC.E") return ["USDC.E", "USDC"];
  return [upper];
}

function pickOnChainPair(pairs: DexPair[], chain: SwapChainId, symbol: string): DexPair | null {
  const wanted = aliases(symbol);
  const pool = pairs.filter((pair) => onChain(pair, chain));
  const matched = pool.filter((pair) => {
    const { base, quote } = pairSymbols(pair);
    return wanted.includes(base) || wanted.includes(quote);
  });
  return matched.sort((a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0))[0] || null;
}

function pickTicketPair(pairs: DexPair[], from: SwapTokenRef, to: SwapTokenRef): DexPair | null {
  const chain = from.chain;
  const left = aliases(from.symbol);
  const right = aliases(to.symbol);
  const pool = pairs.filter((pair) => onChain(pair, chain));
  const matched = pool.filter((pair) => {
    const { base, quote } = pairSymbols(pair);
    return (left.includes(base) && right.includes(quote)) || (left.includes(quote) && right.includes(base));
  });
  return matched.sort((a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0))[0] || null;
}

function tokenFromPair(pair: DexPair, symbol: string, known?: KnownToken) {
  const wanted = aliases(symbol);
  const base = pair.baseToken;
  const quote = pair.quoteToken;
  const useQuote = wanted.includes((quote?.symbol || "").toUpperCase()) && !wanted.includes((base?.symbol || "").toUpperCase());
  const token = useQuote ? quote : base;
  return {
    address: known?.address || token?.address || "",
    name: known?.name || token?.name || symbol,
    symbol: symbol.toUpperCase(),
  };
}

async function fetchJson(url: string): Promise<unknown> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Token feed ${res.status}`);
  return res.json();
}

async function pairsForToken(chain: SwapChainId, address?: string, symbol?: string): Promise<DexPair[]> {
  if (address) {
    try {
      const data = await fetchJson(`https://api.dexscreener.com/tokens/v1/${chain}/${address}`);
      if (Array.isArray(data)) return data as DexPair[];
    } catch {
      /* search fallback */
    }
  }
  if (!symbol) return [];
  const data = (await fetchJson(
    `https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(`${symbol}`)}`,
  )) as { pairs?: DexPair[] };
  return data.pairs || [];
}

function toIntel(ref: SwapTokenRef, pair: DexPair | null, known?: KnownToken): SwapTokenIntel {
  const token = pair ? tokenFromPair(pair, ref.symbol, known) : {
    address: known?.address || "",
    name: known?.name || ref.symbol,
    symbol: ref.symbol,
  };
  return {
    symbol: ref.symbol.toUpperCase(),
    name: token.name,
    chain: ref.chain,
    chainLabel: ref.chainLabel,
    address: token.address,
    native: Boolean(known?.native),
    priceUsd: pair?.priceUsd ? Number(pair.priceUsd) : null,
    change24h: pair?.priceChange?.h24 ?? null,
    liquidityUsd: pair?.liquidity?.usd ?? null,
    volume24h: pair?.volume?.h24 ?? null,
    fdv: pair?.fdv ?? null,
    marketCap: pair?.marketCap ?? null,
    dex: pair?.dexId || null,
    pairUrl: pair?.url || null,
    explorerUrl: token.address ? `${EXPLORERS[ref.chain]}${token.address}` : null,
  };
}

export async function loadTokenIntel(ref: SwapTokenRef): Promise<SwapTokenIntel> {
  const known = REGISTRY[ref.chain]?.[ref.symbol.toUpperCase()];
  const pairs = await pairsForToken(ref.chain, known?.address, ref.symbol);
  const pair = pickOnChainPair(pairs, ref.chain, ref.symbol);
  return toIntel(ref, pair, known);
}

export async function loadTicketBook(from: SwapTokenRef, to: SwapTokenRef): Promise<{
  from: SwapTokenIntel;
  to: SwapTokenIntel;
  chartUrl: string | null;
  label: string;
}> {
  const fromKnown = REGISTRY[from.chain]?.[from.symbol.toUpperCase()];
  const toKnown = REGISTRY[to.chain]?.[to.symbol.toUpperCase()];
  const pairs = await pairsForToken(from.chain, fromKnown?.address || toKnown?.address, from.symbol);
  const ticket = pickTicketPair(pairs, from, to);
  const fromPair = ticket || pickOnChainPair(pairs, from.chain, from.symbol);
  const toPairs = await pairsForToken(to.chain, toKnown?.address, to.symbol);
  const toPair = ticket || pickOnChainPair(toPairs, to.chain, to.symbol);

  return {
    from: toIntel(from, fromPair, fromKnown),
    to: toIntel(to, toPair, toKnown),
    chartUrl: ticket?.url || (STABLES.has(from.symbol.toUpperCase()) ? toPair?.url : fromPair?.url) || null,
    label: `${from.symbol} / ${to.symbol} · ${from.chainLabel}`,
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
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}
