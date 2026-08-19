import type { TradingPageProps } from "@orderly.network/trading";
import { withBasePath } from "./base-path";

// Black DEX TradingView palette. Keep the terminal background/branding,
// but restore the original Gang DEX green/red candle colors.
const BLACK_DEX_TRADING_VIEW_COLORS = {
  chartBG: "#080808",
  upColor: "#2DD4A7",
  downColor: "#FF647D",
  pnlUpColor: "#22C55E",
  pnlDownColor: "#EF4444",
  pnlZeroColor: "#A3A3A3",
  textColor: "#E5E5E5",
  qtyTextColor: "#A3A3A3",
  volumeUpColor: "#D4AF37",
  volumeDownColor: "#EF4444",
  closeIconColor: "rgba(212, 175, 55, 1)",
};

export const createTradingViewConfig = (
  _source: "theme-config" | "legacy",
): TradingPageProps["tradingViewConfig"] => ({
  scriptSRC: withBasePath("/tradingview/charting_library/charting_library.js"),
  library_path: withBasePath("/tradingview/charting_library/"),
  customCssUrl: withBasePath("/tradingview/chart.css"),
  colorConfig: BLACK_DEX_TRADING_VIEW_COLORS,
});
