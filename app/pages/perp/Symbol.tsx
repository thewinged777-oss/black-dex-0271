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
/* Black DEX premium terminal: composition only. Keep Orderly functionality and palette intact. */
.black-dex-terminal{background:#050505;color:#e5e5e5;min-height:100%;letter-spacing:-.01em}
.black-dex-terminal [class*="oui-trading-page"]{max-width:none!important;width:100%!important}
.black-dex-terminal [class*="oui-trading-page"]>div{min-width:0}

/* Establish a quieter professional workspace: thin separators, consistent surfaces and less card noise. */
.black-dex-terminal [class*="orderbook"],
.black-dex-terminal [class*="order-entry"],
.black-dex-terminal [class*="order-form"],
.black-dex-terminal [class*="oui-orderbook"],
.black-dex-terminal [class*="oui-order-entry"]{border-radius:6px!important;box-shadow:none!important}

/* Market/chart area should visually dominate the terminal. */
.black-dex-terminal [class*="chart"],
.black-dex-terminal [class*="Chart"]{min-width:0}
.black-dex-terminal [class*="oui-trading-view"],
.black-dex-terminal [class*="trading-view"]{background:#050505!important}

/* Execution panel: compact, aligned controls rather than oversized cards. */
.black-dex-terminal [class*="oui-order-entry"]{border-left:1px solid #242428!important;background:#0a0a0b}
.black-dex-terminal [class*="oui-order-entry"] button{min-height:40px;font-weight:700;border-radius:5px}
.black-dex-terminal [class*="oui-order-entry"] [role="tab"]{font-size:11px;font-weight:700;letter-spacing:.02em}
.black-dex-terminal [class*="oui-order-entry"] input{font-variant-numeric:tabular-nums}

/* Order book: tighter rows and clear market-data alignment. */
.black-dex-terminal [class*="oui-orderbook"]{border-left:1px solid #18181b;background:#0a0a0b;font-variant-numeric:tabular-nums}
.black-dex-terminal [class*="oui-orderbook"] table{font-variant-numeric:tabular-nums}
.black-dex-terminal [class*="oui-orderbook"] [class*="ask"]{background:linear-gradient(90deg,transparent,rgba(239,68,68,.045))!important}
.black-dex-terminal [class*="oui-orderbook"] [class*="bid"]{background:linear-gradient(90deg,transparent,rgba(34,197,94,.045))!important}
.black-dex-terminal [class*="oui-orderbook"] [class*="row"]{min-height:22px}

/* Positions/orders area: full-width, table-first presentation. */
.black-dex-terminal [class*="oui-position"],
.black-dex-terminal [class*="position"],
.black-dex-terminal [class*="orders"],
.black-dex-terminal table{font-variant-numeric:tabular-nums}
.black-dex-terminal [class*="oui-position"]{border-top:1px solid #18181b}

/* Remove decorative motion and make interaction feel like a professional terminal. */
.black-dex-terminal [class*="oui-button"]{transition:background .15s,border-color .15s,color .15s!important}
.black-dex-terminal [class*="oui-button"]:hover{transform:none!important}
.black-dex-terminal button{font-weight:650}
.black-dex-terminal input,.black-dex-terminal select{border-radius:5px!important}

/* Preserve a clean footer on mobile without adding product UI. */
.black-dex-terminal .black-dex-terminal-footer-note{border-top:1px solid #18181b;color:#737373;font-size:10px;padding:8px 12px}
.black-dex-terminal .black-dex-terminal-footer-note a{color:#a3a3a3}

/* Mobile: let existing Orderly sections breathe instead of shrinking everything equally. */
@media(max-width:767px){
  .black-dex-terminal{padding-bottom:0}
  .black-dex-terminal [class*="oui-trading-page"]{width:100%!important}
  .black-dex-terminal [class*="oui-order-entry"]{border-left:0!important;border-top:1px solid #18181b;background:#0a0a0b}
  .black-dex-terminal [class*="oui-order-entry"] button{min-height:44px}
  .black-dex-terminal [class*="oui-orderbook"]{border-left:0;border-top:1px solid #18181b;max-height:none;overflow:auto}
  .black-dex-terminal [class*="oui-position"]{border-top:1px solid #18181b}
  .black-dex-terminal [class*="oui-trading-view"],.black-dex-terminal [class*="trading-view"]{min-height:300px}
}

@media(min-width:768px){
  .black-dex-terminal [class*="oui-order-entry"]{min-width:300px}
  .black-dex-terminal [class*="oui-orderbook"]{min-width:260px}
}
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
