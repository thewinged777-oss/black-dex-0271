export type HomePost = {
  id: string;
  text: string;
  url: string;
  time: string;
};

const NEWS: HomePost[] = [
  {
    id: "buy-usdc-moonpay",
    text: "Buy USDC with MoonPay on Portfolio. Card checkout via Privy. Base USDC lands in the connected Black DEX wallet.",
    url: "https://main.black-dex.online/news.html#buy-usdc-moonpay",
    time: "4 Sep 2026",
  },
  {
    id: "morpho-earn-vaults",
    text: "Morpho Earn vaults are live: Steakhouse Prime USDC on Base and Sentora pathUSD on Tempo. Yield is variable.",
    url: "https://main.black-dex.online/news.html#morpho-earn-vaults",
    time: "4 Sep 2026",
  },
];

export async function loadBlackDexPosts(): Promise<HomePost[]> {
  return NEWS;
}
