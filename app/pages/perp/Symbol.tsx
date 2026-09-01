import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { API } from "@orderly.network/types";
import { TradingPage } from "@orderly.network/trading";
import { updateSymbol } from "@/utils/storage";
import { formatSymbol, generatePageTitle } from "@/utils/utils";
import { useOrderlyConfig } from "@/utils/config";
import { getPageMeta } from "@/utils/seo";
import { renderSEOTags } from "@/utils/seo-tags";

function paintTradeGold() {
  const root = document.querySelector(".bd-perp-page");
  if (!root) return;
  root.querySelectorAll("button").forEach((node) => {
    const label = (node.textContent || "").replace(/\s+/g, " ").trim();
    if (
      /^Buy\s*\/?\s*Long$/i.test(label) ||
      /^Sell\s*\/?\s*Short$/i.test(label) ||
      label === "Buy / Long" ||
      label === "Sell / Short"
    ) {
      node.classList.add("bd-gold-side");
    }
  });
}

export default function PerpSymbol() {
  const params = useParams();
  const [symbol, setSymbol] = useState(params.symbol!);
  const config = useOrderlyConfig();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

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
  }, [symbol]);

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

  const pageMeta = getPageMeta();
  const pageTitle = generatePageTitle(formatSymbol(params.symbol!));

  return (
    <div className="h-full bd-perp-page">
      {renderSEOTags(pageMeta, pageTitle)}
      <TradingPage
        symbol={symbol}
        onSymbolChange={onSymbolChange}
        tradingViewConfig={config.tradingPage.tradingViewConfig}
        sharePnLConfig={config.tradingPage.sharePnLConfig}
      />
      <div className="md:hidden pb-2 pt-8 text-center">
        <span className="oui-text-2xs oui-text-base-contrast-54">
          Charts powered by{" "}
          <a
            href="https://tradingview.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            TradingView
          </a>
        </span>
      </div>
    </div>
  );
}
