import type { TradingPageProps } from "@orderly.network/trading";
import { withBasePath } from "./base-path";
import {
  getTradingViewColorConfigForSlug,
  getTradingViewColorConfigForSource,
  resolveDexThemeConfig,
  type BdThemeSlug,
  type DexThemeConfigResolution,
} from "./theme-config";

export const createTradingViewConfig = (
  source: DexThemeConfigResolution["source"],
): TradingPageProps["tradingViewConfig"] => ({
  scriptSRC: withBasePath("/tradingview/charting_library/charting_library.js"),
  library_path: withBasePath("/tradingview/charting_library/"),
  customCssUrl: withBasePath("/tradingview/chart.css"),
  colorConfig: getTradingViewColorConfigForSource(source),
});

export const createTradingViewConfigForSlug = (
  slug: BdThemeSlug,
): TradingPageProps["tradingViewConfig"] => {
  const source = resolveDexThemeConfig().source;
  const themed = getTradingViewColorConfigForSlug(slug);
  return {
    ...createTradingViewConfig(source),
    colorConfig: themed ?? getTradingViewColorConfigForSource(source),
  };
};
