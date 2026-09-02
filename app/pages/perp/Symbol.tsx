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

let selectedChip = "chart";
let selectedSide: "buy" | "sell" | "" = "";

function labelOf(node: Element) {
  return (node.textContent || "").replace(/\s+/g, " ").trim();
}

function sdkOn(node: HTMLElement) {
  return (
    node.getAttribute("aria-selected") === "true" ||
    node.getAttribute("aria-pressed") === "true" ||
    node.getAttribute("data-state") === "active" ||
    node.getAttribute("data-state") === "on" ||
    /contained|primary/.test(node.className)
  );
}

function paintTrade() {
  const root = document.querySelector(".bd-perp-page");
  if (!root) return;
  const chips: HTMLElement[] = [];
  const sides: HTMLElement[] = [];

  root.querySelectorAll("button").forEach((node) => {
    const label = labelOf(node);
    const el = node as HTMLElement;
    if (/^(chart|trades|data)$/i.test(label)) {
      el.classList.remove("bd-gold-side");
      el.classList.add("bd-trade-chip");
      chips.push(el);
    }
    if (/^Buy(\s*\/?\s*Long)?$/i.test(label) || /^Sell(\s*\/?\s*Short)?$/i.test(label)) {
      el.classList.remove("bd-gold-side");
      el.classList.add("bd-trade-side");
      el.classList.toggle("is-buy", /^Buy/i.test(label));
      el.classList.toggle("is-sell", /^Sell/i.test(label));
      sides.push(el);
    }
  });

  const sdkChip = chips.find(sdkOn);
  if (sdkChip) selectedChip = labelOf(sdkChip).toLowerCase();
  chips.forEach((chip) => chip.classList.toggle("is-on", labelOf(chip).toLowerCase() === selectedChip));

  const sdkSide = sides.find(sdkOn);
  if (sdkSide) selectedSide = /^Sell/i.test(labelOf(sdkSide)) ? "sell" : "buy";
  sides.forEach((side) => {
    const sell = /^Sell/i.test(labelOf(side));
    side.classList.toggle("is-on", selectedSide !== "" && sell === (selectedSide === "sell"));
  });
}

function onTradeClick(event: Event) {
  const button = (event.target as HTMLElement | null)?.closest("button") as HTMLElement | null;
  if (!button) return;
  const label = labelOf(button);
  if (/^(chart|trades|data)$/i.test(label)) selectedChip = label.toLowerCase();
  if (/^Buy(\s*\/?\s*Long)?$/i.test(label)) selectedSide = "buy";
  if (/^Sell(\s*\/?\s*Short)?$/i.test(label)) selectedSide = "sell";
  paintTrade();
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
    paintTrade();
    const id = window.setInterval(paintTrade, 500);
    document.addEventListener("pointerdown", onTradeClick, true);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("pointerdown", onTradeClick, true);
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
