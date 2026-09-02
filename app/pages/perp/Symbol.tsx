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

function isChipOn(node: HTMLElement) {
  return (
    node.getAttribute("aria-selected") === "true" ||
    node.getAttribute("data-state") === "active" ||
    node.getAttribute("data-state") === "on"
  );
}

function paintTradeGold() {
  const root = document.querySelector(".bd-perp-page");
  if (!root) return;
  const chips: HTMLElement[] = [];
  root.querySelectorAll("button").forEach((node) => {
    const label = (node.textContent || "").replace(/\s+/g, " ").trim();
    if (/^Buy(\s*\/?\s*Long)?$/i.test(label) || /^Sell(\s*\/?\s*Short)?$/i.test(label)) {
      node.classList.add("bd-gold-side");
    }
    if (/^(chart|trades|data)$/i.test(label)) {
      node.classList.add("bd-trade-chip");
      chips.push(node as HTMLElement);
    }
  });
  const selected = chips.find(isChipOn);
  chips.forEach((chip) => {
    chip.classList.toggle("is-on", selected ? chip === selected : false);
  });
}

function onChipClick(event: Event) {
  const button = (event.target as HTMLElement | null)?.closest("button") as HTMLElement | null;
  if (!button || !/^(chart|trades|data)$/i.test((button.textContent || "").trim())) return;
  document.querySelectorAll(".bd-perp-page .bd-trade-chip").forEach((node) => {
    node.classList.toggle("is-on", node === button);
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
    document.addEventListener("click", onChipClick, true);
    return () => {
      window.clearTimeout(first);
      window.clearTimeout(second);
      observer.disconnect();
      document.removeEventListener("click", onChipClick, true);
    };
  }, [symbol, themeSlug]);

  const onSymbolChange = useCallback(
    (data: API.Symbol) => {
      const next = data.symbol;
      setSymbol(next);
      const searchParamsString = searchParams.toString();
      const queryString = searchParamsString ? `?${searchParamsString}` : "";
      navigate(`/perp/${next}${queryString}`);
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
