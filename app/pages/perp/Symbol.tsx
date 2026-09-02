import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { API } from "@orderly.network/types";
import { TradingPage } from "@orderly.network/trading";
import { updateSymbol } from "@/utils/storage";
import { formatSymbol, generatePageTitle } from "@/utils/utils";
import { useOrderlyConfig } from "@/utils/config";
import { getPageMeta } from "@/utils/seo";
import { renderSEOTags } from "@/utils/seo-tags";
import {
  BD_THEME_EVENT,
  getBdThemeSlug,
  type BdThemeSlug,
} from "@/components/orderlyProvider/ThemeSync";
import { createTradingViewConfigForSlug } from "@/utils/trading-view-config";

function paintTradeGold() {
  const root = document.querySelector(".bd-perp-page");
  if (!root) return;
  root.querySelectorAll("button").forEach((node) => {
    const label = (node.textContent || "").replace(/\s+/g, " ").trim();
    if (
      /^Buy(\s*\/?\s*Long)?$/i.test(label) ||
      /^Sell(\s*\/?\s*Short)?$/i.test(label) ||
      /^Buy\s*\/?\s*Long$/i.test(label) ||
      /^Sell\s*\/?\s*Short$/i.test(label)
    ) {
      node.classList.add("bd-gold-side");
    }
    if (/^(chart|trades|data)$/i.test(label)) {
      const on =
        node.getAttribute("aria-selected") === "true" ||
        node.getAttribute("data-state") === "active" ||
        /active|selected/.test(node.className);
      node.classList.toggle("bd-trade-chip", true);
      node.classList.toggle("is-on", on);
    }
  });
}

export default function PerpSymbol() {
  const params = useParams();
  const [symbol, setSymbol] = useState(params.symbol!);
  const config = useOrderlyConfig();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [themeSlug, setThemeSlug] = useState<BdThemeSlug>("original");

  useEffect(() => {
    setThemeSlug(getBdThemeSlug());
    const onTheme = (event: Event) => {
      const next = (event as CustomEvent<BdThemeSlug>).detail;
      setThemeSlug(next || getBdThemeSlug());
    };
    window.addEventListener(BD_THEME_EVENT, onTheme);
    return () => window.removeEventListener(BD_THEME_EVENT, onTheme);
  }, []);

  useEffect(() => {
    updateSymbol(symbol);
  }, [symbol]);

  useEffect(() => {
    paintTradeGold();
    const first = window.setTimeout(paintTradeGold, 200);
    const second = window.setTimeout(paintTradeGold, 900);
    const observer = new MutationObserver(paintTradeGold);
    const root = document.querySelector(".bd-perp-page");
    if (root) observer.observe(root, { childList: true, subtree: true });
    return () => {
      window.clearTimeout(first);
      window.clearTimeout(second);
      observer.disconnect();
    };
  }, [symbol, themeSlug]);

  const onSymbolChange = useCallback(
    (data: API.Symbol) => {
      const symbol = data.symbol;
      setSymbol(symbol);
      const searchParamsString = searchParams.toString();
      const queryString = searchParamsString ? `?${searchParamsString}` : "";
      navigate(`/perp/${symbol}${queryString}`);
    },
    [navigate, searchParams],
  );

  const tradingViewConfig = useMemo(
    () => ({
      ...config.tradingPage.tradingViewConfig,
      ...createTradingViewConfigForSlug(themeSlug),
    }),
    [config.tradingPage.tradingViewConfig, themeSlug],
  );

  const pageMeta = getPageMeta();
  const pageTitle = generatePageTitle(formatSymbol(params.symbol!));

  return (
    <div className="h-full bd-perp-page" data-bd-theme={themeSlug}>
      {renderSEOTags(pageMeta, pageTitle)}
      <TradingPage
        key={`${symbol}-${themeSlug}`}
        symbol={symbol}
        onSymbolChange={onSymbolChange}
        tradingViewConfig={tradingViewConfig}
        sharePnLConfig={config.tradingPage.sharePnLConfig}
      />
    </div>
  );
}
