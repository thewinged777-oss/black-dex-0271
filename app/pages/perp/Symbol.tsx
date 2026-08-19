import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { API } from "@orderly.network/types";
import { TradingPage } from "@orderly.network/trading";
import { updateSymbol } from "@/utils/storage";
import { formatSymbol, generatePageTitle } from "@/utils/utils";
import { useOrderlyConfig } from "@/utils/config";
import { getPageMeta } from "@/utils/seo";
import { renderSEOTags } from "@/utils/seo-tags";

const terminalStyles = `
.black-dex-terminal{background:#050505;color:#e5e5e5}
.black-dex-terminal [class*="oui-trading-page"],[class*="oui-trading-page"]{max-width:none!important}
.black-dex-terminal [class*="orderbook"],.black-dex-terminal [class*="order-entry"],.black-dex-terminal [class*="order-form"]{border-radius:6px!important}
.black-dex-terminal [class*="orderbook"]{font-variant-numeric:tabular-nums}
.black-dex-terminal table{font-variant-numeric:tabular-nums}
.black-dex-terminal button{font-weight:700}
.black-dex-terminal [class*="oui-order-entry"]{border-left:1px solid #242428!important}
.black-dex-terminal [class*="oui-order-entry"] button{min-height:40px}
.black-dex-terminal [class*="oui-order-entry"] [role="tab"]{font-size:11px}
.black-dex-terminal [class*="oui-orderbook"]{border-left:1px solid #18181b}
.black-dex-terminal [class*="oui-orderbook"] [class*="ask"]{background:linear-gradient(90deg,transparent,rgba(239,68,68,.045))!important}
.black-dex-terminal [class*="oui-orderbook"] [class*="bid"]{background:linear-gradient(90deg,transparent,rgba(34,197,94,.045))!important}
.black-dex-terminal [class*="oui-position"],[class*="position"]{font-variant-numeric:tabular-nums}
.black-dex-terminal [class*="oui-button"]{transition:background .15s,border-color .15s,color .15s!important}
.black-dex-terminal [class*="oui-button"]:hover{transform:none!important}
.black-dex-terminal .black-dex-terminal-footer-note{border-top:1px solid #18181b}
@media(max-width:640px){.black-dex-terminal [class*="oui-order-entry"] button{min-height:46px}.black-dex-terminal [class*="orderbook"]{max-height:42vh;overflow:auto}}
`;

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
    <div className="black-dex-terminal h-full">
      <style>{terminalStyles}</style>
      {renderSEOTags(pageMeta, pageTitle)}
      <TradingPage
        symbol={symbol}
        onSymbolChange={onSymbolChange}
        tradingViewConfig={config.tradingPage.tradingViewConfig}
        sharePnLConfig={config.tradingPage.sharePnLConfig}
      />
      <div className="black-dex-terminal-footer-note md:hidden">
        Charts powered by{" "}
        <a href="https://tradingview.com" target="_blank" rel="noopener noreferrer">TradingView</a>
      </div>
    </div>
  );
}
