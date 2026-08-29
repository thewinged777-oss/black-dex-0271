export type FuturesRow = {
  symbol: string;
  display_symbol_name?: string;
  broker_id?: string | null;
  status?: string;
  index_price?: number;
  mark_price?: number;
  est_funding_rate?: number;
  last_funding_rate?: number;
  next_funding_time?: number;
  last_funding_rate_timestamp?: number;
  open_interest?: number;
  is_pretge?: boolean;
  "24h_amount"?: number;
  "24h_volume"?: number;
};

export type TokenomicsProfile = {
  sleeve: string;
  thesis: string;
  mmNote: string;
  risk: string;
};

export type CarryIdea = {
  symbol: string;
  ticker: string;
  est: number;
  last: number;
  intervalHours: number;
  annualized: number;
  basisBps: number;
  oiUsd: number;
  volumeUsd: number;
  score: number;
  grade: "A" | "B" | "C" | "D";
  side: "SHORT_PERP" | "LONG_PERP" | "PASS";
  persist: boolean;
  pretge: boolean;
  isolated: boolean;
  profile: TokenomicsProfile;
  reasons: string[];
};

const HOURS_MS = 60 * 60 * 1000;

export const TOKENOMICS: Record<string, TokenomicsProfile> = {
  BTC: { sleeve: "reserve collateral", thesis: "Deep books, tight basis. Carry after fees is usually thin.", mmNote: "MMs warehouse spot and hedge on the perp. Funding sits near the interest-rate floor.", risk: "Edge is size and fee tier, not headline rate." },
  ETH: { sleeve: "reserve collateral", thesis: "Second-most liquid crypto basis. Staking yield competes with perp carry.", mmNote: "Crowded longs can pin funding positive into events.", risk: "ETF / upgrade flow flips premium faster because this book is a hedge rail." },
  SOL: { sleeve: "L1 beta", thesis: "High-beta L1. Unlocks and outages move the premium.", mmNote: "Keep quotes tight only when OI is two-sided.", risk: "Air-pocket liquidity versus BTC." },
  ORDER: { sleeve: "venue token", thesis: "Orderly fee + staking token. The perp is a sentiment gauge for the builder stack.", mmNote: "Correlated with ORDER staking and builder campaigns. Do not warehouse into emissions.", risk: "Campaign-driven longs. Fat funding can be float hitting the book." },
  HYPE: { sleeve: "venue / points meta", thesis: "Perp-DEX equity-like beta. Crowded with points farmers.", mmNote: "Skew inventory short when funding already pays shorts and OI is elevated.", risk: "A venue drawdown liquidates the same side that was paying you." },
  FARTCOIN: { sleeve: "meme / no cashflow", thesis: "Funding is a crowding tax, not a yield product.", mmNote: "Do not warehouse. Flatten into the next print.", risk: "Thin books and influencer flow. High APR is usually a trap." },
  GOAT: { sleeve: "meme / no cashflow", thesis: "Rate spikes track attention, not inventory demand.", mmNote: "Size by 24h notional, not headline APR.", risk: "Slippage often exceeds two funding intervals." },
  PEPE: { sleeve: "meme / no cashflow", thesis: "Liquid-enough meme. Still attention-driven.", mmNote: "Positive funding is default when retail is long.", risk: "Gap risk around listings." },
  WIF: { sleeve: "meme / no cashflow", thesis: "Solana meme beta.", mmNote: "Harvest only with a spot hedge and a hard time stop.", risk: "Influencer inventory dominates the book." },
  BONK: { sleeve: "meme / no cashflow", thesis: "High-float Solana meme. 4h markets compound faster and flip faster.", mmNote: "Recheck OI every print.", risk: "Emissions + meme rotation." },
  ENA: { sleeve: "stablecoin / points", thesis: "Ethena. Funding is circular with the product itself.", mmNote: "Crowded with basis traders. The token is levered to well-behaved funding.", risk: "If crypto funding collapses, token and perp move together." },
  ETHFI: { sleeve: "restaking / points", thesis: "Unlock and points seasons drive one-sided books.", mmNote: "Do not treat unlock week as carry week.", risk: "Unlock overhang + ETH beta." },
  WLD: { sleeve: "narrative / unlocks", thesis: "High FDV, emission-heavy.", mmNote: "Map the unlock calendar before warehousing.", risk: "Supply events dominate persistence." },
  MON: { sleeve: "L1 / launch beta", thesis: "Newer L1 tape. Books are still forming.", mmNote: "Wider spreads, faster mean-reversion.", risk: "OI can be a handful of accounts." },
  XMR: { sleeve: "privacy / venue-scarce", thesis: "Listing-scarce. Basis stays wide because hedges are incomplete.", mmNote: "Clean cash-and-carry is hard if spot rails are constrained.", risk: "Venue and rail risk. Size down." },
  EURUSD: { sleeve: "FX / RWA", thesis: "Funding embeds rate differential plus crypto-book imbalance.", mmNote: "Compare to FX forwards. Only the crypto premium is harvestable.", risk: "Do not reuse 50x crypto limits on FX." },
  PAXG: { sleeve: "RWA / commodity", thesis: "Tokenized gold. Carry should sit near gold lease + USDC rate.", mmNote: "Rich funding is usually crypto leverage, not a gold thesis.", risk: "Thin versus COMEX." },
  XAUT: { sleeve: "RWA / commodity", thesis: "Tokenized gold. Same desk as PAXG.", mmNote: "Prefer the name with deeper 24h notional.", risk: "Basis can gap versus LBMA on de-lever." },
  DOGE: { sleeve: "meme / liquid", thesis: "Most liquid meme. Retail-long biased.", mmNote: "Usable if OI and 24h notional both clear the floor.", risk: "Headline tape." },
  AVAX: { sleeve: "L1 beta", thesis: "Incentive seasons pull leveraged longs.", mmNote: "Programs pin funding positive.", risk: "Incentive sunset flips the book." },
  ARB: { sleeve: "L2 / emissions", thesis: "Long unlock tail.", mmNote: "Emissions create structural spot supply.", risk: "Unlock calendar." },
  OP: { sleeve: "L2 / emissions", thesis: "Same sleeve as ARB.", mmNote: "Governance narrative is not inventory tightness.", risk: "Unlock + sequencer-revenue disappointment." },
  SUI: { sleeve: "L1 beta", thesis: "Foundation + VC float overhang.", mmNote: "Points waves crowd the long side.", risk: "Unlock + high-beta tape." },
  APT: { sleeve: "L1 beta", thesis: "Similar unlock + incentive profile.", mmNote: "Foundation programs manufacture perp demand.", risk: "High FDV versus realized fees." },
  LINK: { sleeve: "oracle / cashflow-adjacent", thesis: "Closer to cash-flow than a meme.", mmNote: "Books are two-sided. Funding is rarely the product.", risk: "Macro beta." },
  AAVE: { sleeve: "DeFi cashflow", thesis: "Fee-bearing protocol token.", mmNote: "Funding spikes around governance or bad-debt scares.", risk: "Smart-contract headlines." },
  CRV: { sleeve: "DeFi emissions", thesis: "Vote-escrow + emissions. Structural sellers exist.", mmNote: "Negative funding can persist when gauge wars go quiet.", risk: "ve-unlock mechanics." },
  BNB: { sleeve: "venue token", thesis: "CEX equity-like token. Tighter than alts.", mmNote: "Liquidity benchmark for venue tokens.", risk: "Venue headlines." },
  TAO: { sleeve: "AI narrative", thesis: "Crowding shows up in funding first.", mmNote: "Time-stop every idea.", risk: "Attention drawdown." },
  RENDER: { sleeve: "AI narrative", thesis: "Same crowding pattern as TAO, usually milder.", mmNote: "Check 24h notional before quoting size.", risk: "Narrative + token migration history." },
  W: { sleeve: "bridge / venue-adjacent", thesis: "Bridge-flow beta, not cash-flow.", mmNote: "Event risk around chain outages.", risk: "Bridge headlines gap the book." },
};

const FALLBACK: TokenomicsProfile = {
  sleeve: "generic alt",
  thesis: "No special cash-flow claim on file. Treat funding as a crowding tax that mean-reverts.",
  mmNote: "Quote only when 24h notional covers one inventory turn plus fees. Flatten into the print if OI is one-sided.",
  risk: "Thin books and unmapped unlocks.",
};

export function tickerFromSymbol(symbol: string): string {
  const parts = symbol.split("_");
  return (parts[1] || symbol).replace(/^1000/, "");
}

export function fundingIntervalHours(row: FuturesRow): number {
  const next = Number(row.next_funding_time || 0);
  const last = Number(row.last_funding_rate_timestamp || 0);
  if (next > last && last > 0) {
    const hours = (next - last) / HOURS_MS;
    if (hours >= 3 && hours <= 9) return Math.round(hours);
  }
  return 8;
}

export function annualize(rate: number, intervalHours: number): number {
  if (!Number.isFinite(rate) || intervalHours <= 0) return 0;
  return rate * (24 / intervalHours) * 365;
}

export function profileFor(ticker: string): TokenomicsProfile {
  return TOKENOMICS[ticker] || TOKENOMICS[ticker.replace(/^1000/, "")] || FALLBACK;
}

function gradeFromScore(score: number): CarryIdea["grade"] {
  if (score >= 78) return "A";
  if (score >= 62) return "B";
  if (score >= 45) return "C";
  return "D";
}

export function scoreMarket(row: FuturesRow): CarryIdea | null {
  if (!row?.symbol || (row.status && row.status !== "ACTIVE")) return null;

  const ticker = row.display_symbol_name || tickerFromSymbol(row.symbol);
  const est = Number(row.est_funding_rate || 0);
  const last = Number(row.last_funding_rate || 0);
  const mark = Number(row.mark_price || 0);
  const index = Number(row.index_price || 0);
  const oi = Number(row.open_interest || 0);
  const volumeUsd = Number(row["24h_amount"] || 0);
  const intervalHours = fundingIntervalHours(row);
  const persist = est === 0 || last === 0 ? false : Math.sign(est) === Math.sign(last);
  const basisBps = index ? ((mark - index) / index) * 10_000 : 0;
  const oiUsd = oi * (mark || index || 0);
  const pretge = Boolean(row.is_pretge);
  const isolated = Boolean(row.broker_id);
  const ann = annualize(est, intervalHours);
  const absAnn = Math.abs(ann);

  let score = 0;
  const reasons: string[] = [];

  score += Math.min(36, absAnn * 180);
  if (absAnn >= 0.4) reasons.push(`Headline carry ${formatPct(ann)} annualized.`);
  else if (absAnn >= 0.15) reasons.push(`Modest carry ${formatPct(ann)} annualized.`);
  else reasons.push(`Thin carry ${formatPct(ann)} — fee drag matters.`);

  if (persist) {
    score += 14;
    reasons.push("Estimated and last print share a sign (persistence).");
  } else {
    score -= 10;
    reasons.push("Sign flip versus last print — mean reversion risk.");
  }

  if (volumeUsd >= 1_000_000) {
    score += 18;
    reasons.push("24h notional clears $1m.");
  } else if (volumeUsd >= 250_000) {
    score += 10;
    reasons.push("Usable but not deep 24h notional.");
  } else if (volumeUsd >= 50_000) {
    score += 4;
    reasons.push("Light tape. Size down.");
  } else {
    score -= 16;
    reasons.push("24h notional is too thin for clean entry/exit.");
  }

  if (oiUsd >= 2_000_000) score += 10;
  else if (oiUsd >= 500_000) score += 6;
  else if (oiUsd < 80_000) {
    score -= 12;
    reasons.push("Open interest is small — crowding can be a single account.");
  }

  const absBasis = Math.abs(basisBps);
  if (absBasis > 80) {
    score -= 14;
    reasons.push(`Basis ${basisBps.toFixed(1)} bps is wide. Squeeze / dislocation risk.`);
  } else if (absBasis > 25) {
    score -= 4;
    reasons.push(`Basis ${basisBps.toFixed(1)} bps is elevated.`);
  } else {
    score += 6;
  }

  if (pretge) {
    score -= 18;
    reasons.push("Pre-TGE listing. Inventory is discovery, not carry.");
  }
  if (isolated) {
    score -= 8;
    reasons.push("Isolated / broker book. Depth may not match the shared Orderly book.");
  }

  const profile = profileFor(ticker);
  if (profile.sleeve.includes("meme")) {
    score -= 6;
    reasons.push("Meme sleeve: rate is attention, not structural demand.");
  }
  if (profile.sleeve.includes("unlock") || profile.sleeve.includes("emissions")) {
    score -= 4;
    reasons.push("Emission / unlock sleeve. Map the calendar before warehousing.");
  }
  if (profile.sleeve.includes("RWA") || profile.sleeve.includes("FX")) {
    score += 3;
    reasons.push("Non-crypto vol sleeve — do not reuse alt-coin leverage.");
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  let side: CarryIdea["side"] = "PASS";
  if (score >= 45 && absAnn >= 0.08) {
    side = est > 0 ? "SHORT_PERP" : "LONG_PERP";
  }

  return {
    symbol: row.symbol,
    ticker,
    est,
    last,
    intervalHours,
    annualized: ann,
    basisBps,
    oiUsd,
    volumeUsd,
    score,
    grade: gradeFromScore(score),
    side,
    persist,
    pretge,
    isolated,
    profile,
    reasons,
  };
}

export function formatPct(value: number, digits = 1): string {
  if (!Number.isFinite(value)) return "—";
  return `${(value * 100).toFixed(digits)}%`;
}

export function formatRate(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return `${(value * 100).toFixed(4)}%`;
}

export function formatUsd(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "—";
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}m`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}k`;
  return `$${value.toFixed(0)}`;
}

export function sideLabel(side: CarryIdea["side"]): string {
  if (side === "SHORT_PERP") return "Receive as short";
  if (side === "LONG_PERP") return "Receive as long";
  return "Pass";
}

export function briefIdea(idea: CarryIdea): string {
  const pay = idea.est > 0 ? "longs pay shorts" : "shorts pay longs";
  const hedge =
    idea.side === "SHORT_PERP"
      ? "Delta-neutral construction is long spot / short perp."
      : idea.side === "LONG_PERP"
        ? "Delta-neutral construction is short spot / long perp."
        : "Do not warehouse this name.";
  return [
    `${idea.ticker} (${idea.symbol}) is ${idea.grade}-grade carry.`,
    `Est. ${formatRate(idea.est)} / ${idea.intervalHours}h ≈ ${formatPct(idea.annualized)} annualized, ${pay}.`,
    `Basis ${idea.basisBps.toFixed(1)} bps. 24h ${formatUsd(idea.volumeUsd)}. OI ${formatUsd(idea.oiUsd)}.`,
    `Sleeve: ${idea.profile.sleeve}. ${idea.profile.thesis}`,
    hedge,
    `MM note: ${idea.profile.mmNote}`,
    `Risk: ${idea.profile.risk}`,
  ].join(" ");
}

function tokenize(q: string): string[] {
  return q.toLowerCase().replace(/[^a-z0-9.\s%/_-]/g, " ").split(/\s+/).filter(Boolean);
}

export function answerDeskQuery(query: string, ideas: CarryIdea[]): string {
  const q = query.trim();
  if (!q) return "Ask a market, a sleeve, or a term — funding, basis, OI, inventory, unlocks, tokenomics.";

  const tokens = tokenize(q);
  const ranked = [...ideas].sort((a, b) => b.score - a.score);
  const harvest = ranked.filter((i) => i.side !== "PASS");

  const named = ideas.find((i) => {
    const t = i.ticker.toLowerCase();
    const s = i.symbol.toLowerCase();
    return q.toUpperCase().includes(i.ticker) || q.toUpperCase().includes(i.symbol) || tokens.some((tok) => tok === t || s.includes(tok));
  });

  if (named && (tokens.includes(named.ticker.toLowerCase()) || q.toUpperCase().includes(named.ticker) || q.toUpperCase().includes(named.symbol))) {
    return briefIdea(named);
  }

  if (tokens.some((t) => ["best", "top", "easy", "easiest", "harvest", "farm", "exploit", "rich", "fattest", "screen"].includes(t))) {
    const picks = harvest.slice(0, 5);
    if (!picks.length) return "No name currently clears the liquidity + persistence screen. Fat rates with empty books are not carry.";
    return [
      "Desk screen — names that clear liquidity, persistence, and basis filters. This is carry analysis, not a way to push a book around.",
      ...picks.map((i, n) => `${n + 1}. ${i.ticker} ${sideLabel(i.side)} · ${formatPct(i.annualized)} ann. · grade ${i.grade} · 24h ${formatUsd(i.volumeUsd)} · ${i.profile.sleeve}`),
      "Rule: collect funding only if you can enter, hedge, and exit inside the 24h notional.",
    ].join("\n");
  }

  if (tokens.some((t) => ["meme", "memes"].includes(t))) {
    const memes = ranked.filter((i) => i.profile.sleeve.includes("meme")).slice(0, 6);
    return ["Meme sleeve: funding is an attention tax. Persistence is low. Inventory should be flat into the print.", ...memes.map((i) => `${i.ticker}: ${formatPct(i.annualized)} ann., 24h ${formatUsd(i.volumeUsd)}, grade ${i.grade}, ${sideLabel(i.side)}.`)].join("\n");
  }

  if (tokens.some((t) => ["funding", "rate", "carry", "basis", "premium"].includes(t)) && tokens.length <= 6) {
    return [
      "Orderly perps exchange funding each interval so mark tracks index.",
      "Positive rate: longs pay shorts. Negative rate: shorts pay longs.",
      "Desk harvest is the opposite side of the crowded book, hedged in spot when a rail exists.",
      "Annualize as rate × (24 / interval hours) × 365. Subtract taker fees × 2 and expected basis slip.",
      "A 4h market compounds faster and flips faster than an 8h market.",
      harvest[0] ? `Live example: ${harvest[0].ticker} est ${formatRate(harvest[0].est)} ≈ ${formatPct(harvest[0].annualized)} ann., ${sideLabel(harvest[0].side)}.` : "No clean live example on the current screen.",
    ].join(" ");
  }

  if (tokens.some((t) => ["mm", "market", "making", "inventory", "spread", "quote"].includes(t))) {
    return [
      "Market-making on a perp is inventory + skew + funding.",
      "You earn spread. You pay or receive funding on residual delta.",
      "If the book is long-crowded, funding is positive: a short inventory bias collects the print.",
      "Cap inventory in OI units. Flatten into funding if the name is a meme. Never let residual delta exceed what 10 minutes of 24h volume can absorb.",
      "Emissions and unlocks create one-way flow that looks like edge and is actually a seller you are warehousing.",
    ].join(" ");
  }

  if (tokens.some((t) => ["tokenomics", "unlock", "fdv", "float", "emissions", "points", "airdrop"].includes(t))) {
    return [
      "Tokenomics that make funding look easy are usually the ones that blow out the hedge.",
      "High FDV / low float: squeeze, then cliff.",
      "Points seasons: leveraged longs pin funding positive until the snapshot ends.",
      "Unlock cliffs: structural spot supply. Short-perp carry can persist, then the hedge gaps.",
      "Venue and restaking tokens are reflexive — the token is levered to the same funding you harvest.",
      "Memes have no cash flow. Time-stop.",
    ].join(" ");
  }

  if (tokens.some((t) => ["oi", "open", "interest", "crowding"].includes(t))) {
    const fattest = [...ideas].sort((a, b) => b.oiUsd - a.oiUsd)[0];
    return [
      "Open interest is outstanding perp risk, not volume.",
      "High OI + low 24h notional = crowded and illiquid.",
      "High OI + high notional = a book you can work.",
      "Funding persistence with rising OI means the crowded side is adding, not covering.",
      fattest ? `Largest OI on screen: ${fattest.ticker} ${formatUsd(fattest.oiUsd)}.` : "",
    ].filter(Boolean).join(" ");
  }

  if (tokens.some((t) => ["risk", "warning", "disclaimer", "safe"].includes(t))) {
    return "This desk does not execute, does not promise APR, and does not help anyone lean on a book, spoof, or force liquidations. Funding mean-reverts. Thin names gap. Fees and basis eat headline yield. Not financial advice.";
  }

  if (named) return briefIdea(named);
  const fuzzy = ideas.find((i) => tokens.some((tok) => tok.length >= 3 && i.ticker.toLowerCase().startsWith(tok)));
  if (fuzzy) return briefIdea(fuzzy);

  return [
    "I screen Orderly perps for harvestable funding: persistence, 24h notional, open interest, basis, and tokenomics sleeve.",
    harvest[0] ? `Top live name: ${harvest[0].ticker} ${sideLabel(harvest[0].side)} at ${formatPct(harvest[0].annualized)} ann. (grade ${harvest[0].grade}).` : "Nothing currently clears the screen.",
    "Ask a ticker (ORDER, HYPE, BTC), or ask about funding, inventory, unlocks, memes, OI.",
  ].join(" ");
}

export async function loadOrderlyFutures(): Promise<FuturesRow[]> {
  const res = await fetch("https://api.orderly.org/v1/public/futures");
  if (!res.ok) throw new Error(`Orderly futures ${res.status}`);
  const json = await res.json();
  return (json?.data?.rows || []) as FuturesRow[];
}
