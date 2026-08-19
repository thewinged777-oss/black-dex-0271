import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { API } from "@orderly.network/types";
import { TradingPage } from "@orderly.network/trading";
import { updateSymbol } from "@/utils/storage";
import { formatSymbol, generatePageTitle } from "@/utils/utils";
import { useOrderlyConfig } from "@/utils/config";
import { getPageMeta } from "@/utils/seo";
import { renderSEOTags } from "@/utils/seo-tags";

export default function PerpSymbol() {
  const params = useParams();
  const [symbol, setSymbol] = useState(params.symbol!);
  const config = useOrderlyConfig();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    updateSymbol(symbol);
  }, [symbol]);

  const onSymbolChange = useCallback(
    (data: API.Symbol) => {
      const nextSymbol = data.symbol;
      setSymbol(nextSymbol);

      const searchParamsString = searchParams.toString();
      const queryString = searchParamsString ? `?${searchParamsString}` : "";

      navigate(`/perp/${nextSymbol}${queryString}`);
    },
    [navigate, searchParams],
  );

  const pageMeta = getPageMeta();
  const pageTitle = generatePageTitle(formatSymbol(params.symbol!));

  return (
    <div className="black-dex-pro-terminal h-full">
      {renderSEOTags(pageMeta, pageTitle)}
      <div className="black-dex-terminal-topline" aria-hidden="true">
        <span className="black-dex-terminal-live-dot" />
        <span>BLACK DEX PRO</span>
        <span className="black-dex-terminal-divider" />
        <span>REAL-TIME MARKET DATA</span>
        <span className="black-dex-terminal-spacer" />
        <span className="black-dex-terminal-mode">PRO MODE</span>
      </div>
      <TradingPage
        symbol={symbol}
        onSymbolChange={onSymbolChange}
        tradingViewConfig={config.tradingPage.tradingViewConfig}
        sharePnLConfig={config.tradingPage.sharePnLConfig}
      />
      <div className="black-dex-terminal-footer-note md:hidden">
        Charts powered by{" "}
        <a href="https://tradingview.com" target="_blank" rel="noopener noreferrer">
          TradingView
        </a>
      </div>
    </div>
  );
}
