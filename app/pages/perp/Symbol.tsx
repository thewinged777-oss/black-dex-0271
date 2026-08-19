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
.black-dex-terminal-market-strip{display:flex;align-items:center;gap:0;min-height:64px;border-bottom:1px solid #18181b;background:#090909;padding:0 16px;overflow:hidden}
.black-dex-terminal-market-title{min-width:190px;display:flex;flex-direction:column;gap:4px;border-right:1px solid #242428;padding-right:22px}.black-dex-terminal-market-title strong{font-size:20px;letter-spacing:-.02em;color:#f4f4f5}.black-dex-terminal-kicker{font-size:8px;font-weight:900;letter-spacing:.18em;color:#d4af37}
.black-dex-terminal-market-stat{min-width:125px;padding:0 18px;border-right:1px solid #18181b}.black-dex-terminal-market-stat span{display:block;font-size:8px;font-weight:800;letter-spacing:.13em;color:#5d5d65}.black-dex-terminal-market-stat strong{display:block;margin-top:6px;font-size:11px;letter-spacing:.04em;color:#d6d6da;font-variant-numeric:tabular-nums}.black-dex-terminal-market-risk{margin-left:auto;display:flex;align-items:center;gap:7px;color:#22c55e;font-size:8px;font-weight:900;letter-spacing:.12em;white-space:nowrap}
.black-dex-terminal-command{height:26px;display:flex;align-items:center;gap:7px;width:210px;border:1px solid #242428;border-radius:5px;background:#101011;padding:0 7px;color:#5d5d65}.black-dex-terminal-command span{font-size:9px;color:#d4af37;font-weight:900}.black-dex-terminal-command-input{width:100%;height:22px!important;border:0!important;background:transparent!important;box-shadow:none!important;border-radius:0!important;padding:0!important;font-size:9px!important;color:#d6d6da!important;outline:0!important}.black-dex-terminal-command-input::placeholder{color:#5d5d65}
.black-dex-terminal-control{height:26px;margin-left:6px;padding:0 8px;border:1px solid #242428;border-radius:5px;background:#101011;color:#8a8a93;font-size:8px;font-weight:900;letter-spacing:.08em;cursor:pointer}.black-dex-terminal-control:hover{border-color:rgba(212,175,55,.5);color:#f5d678;background:#151516}.black-dex-terminal-mode{white-space:nowrap}
.black-dex-pro-terminal.is-focus-mode .black-dex-terminal-topline{position:fixed;top:0;left:0;right:0;z-index:1000}.black-dex-pro-terminal.is-focus-mode .black-dex-terminal-market-strip{position:fixed;top:28px;left:0;right:0;z-index:999}.black-dex-pro-terminal.is-focus-mode{padding-top:92px}.black-dex-pro-terminal.is-focus-mode .oui-main-nav,.black-dex-pro-terminal.is-focus-mode header{display:none!important}
.black-dex-pro-terminal [class*="oui-trading-page"],[class*="oui-trading-page"]{max-width:none!important}.black-dex-pro-terminal [class*="orderbook"],.black-dex-pro-terminal [class*="order-entry"],.black-dex-pro-terminal [class*="order-form"]{border-radius:6px!important}.black-dex-pro-terminal [class*="orderbook"]{font-variant-numeric:tabular-nums}.black-dex-pro-terminal table{font-variant-numeric:tabular-nums}.black-dex-pro-terminal button{font-weight:700}.black-dex-pro-terminal [class*="oui-order-entry"]{border-left:1px solid #242428!important}.black-dex-pro-terminal [class*="oui-order-entry"] button{min-height:40px}.black-dex-pro-terminal [class*="oui-order-entry"] [role="tab"]{font-size:11px}.black-dex-pro-terminal [class*="oui-orderbook"]{border-left:1px solid #18181b}.black-dex-pro-terminal [class*="oui-orderbook"] [class*="ask"]{background:linear-gradient(90deg,transparent,rgba(239,68,68,.045))!important}.black-dex-pro-terminal [class*="oui-orderbook"] [class*="bid"]{background:linear-gradient(90deg,transparent,rgba(34,197,94,.045))!important}
.black-dex-pro-terminal [class*="oui-position"],[class*="position"]{font-variant-numeric:tabular-nums}.black-dex-pro-terminal [class*="oui-button"]{transition:background .15s,border-color .15s,color .15s,transform .15s!important}.black-dex-pro-terminal [class*="oui-button"]:hover{transform:none!important}.black-dex-pro-terminal .black-dex-terminal-footer-note{border-top:1px solid #18181b}
@media(max-width:900px){.black-dex-terminal-command{width:140px}.black-dex-terminal-market-stat{min-width:105px;padding:0 12px}.black-dex-terminal-market-title{min-width:150px}}
@media(max-width:640px){.black-dex-terminal-topline{gap:6px;padding:0 9px}.black-dex-terminal-topline>span:nth-child(4),.black-dex-terminal-divider,.black-dex-terminal-command,.black-dex-terminal-mode{display:none}.black-dex-terminal-control{margin-left:2px;font-size:7px;padding:0 6px}.black-dex-terminal-market-strip{min-height:54px;padding:0 10px}.black-dex-terminal-market-title{min-width:125px;padding-right:12px}.black-dex-terminal-market-title strong{font-size:17px}.black-dex-terminal-market-stat{display:none}.black-dex-terminal-market-risk{font-size:7px}.black-dex-pro-terminal [class*="oui-order-entry"] button{min-height:46px}.black-dex-pro-terminal [class*="orderbook"]{max-height:42vh;overflow:auto}}
`;

export default function PerpSymbol() {
  const params = useParams();
  const [symbol, setSymbol] = useState(params.symbol!);
  const [focusMode, setFocusMode] = useState(false);
  const config = useOrderlyConfig();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    updateSymbol(symbol);
  }, [symbol]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        document.querySelector<HTMLInputElement>(".black-dex-terminal-command-input")?.focus();
      }
      if (event.key === "Escape") setFocusMode(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

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

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch {
      // Fullscreen can be unavailable in embedded/mobile browsers.
    }
  };

  const pageMeta = getPageMeta();
  const pageTitle = generatePageTitle(formatSymbol(params.symbol!));

  return (
    <div className={`black-dex-pro-terminal h-full${focusMode ? " is-focus-mode" : ""}`}>
      <style>{terminalStyles}</style>
      {renderSEOTags(pageMeta, pageTitle)}
      <div className="black-dex-terminal-topline">
        <span className="black-dex-terminal-live-dot" />
        <span>BLACK DEX PRO</span>
        <span className="black-dex-terminal-divider" />
        <span>REAL-TIME MARKET DATA</span>
        <span className="black-dex-terminal-spacer" />
        <label className="black-dex-terminal-command" aria-label="Command search">
          <span>⌘K</span>
          <input className="black-dex-terminal-command-input" placeholder="Search markets & actions" />
        </label>
        <button className="black-dex-terminal-control" onClick={() => setFocusMode((value) => !value)}>
          {focusMode ? "EXIT FOCUS" : "FOCUS"}
        </button>
        <button className="black-dex-terminal-control" onClick={toggleFullscreen}>FULLSCREEN</button>
        <span className="black-dex-terminal-mode">PRO MODE</span>
      </div>
      <div className="black-dex-terminal-market-strip" aria-label="Trading terminal status">
        <div className="black-dex-terminal-market-title">
          <span className="black-dex-terminal-kicker">PERPETUALS</span>
          <strong>{formatSymbol(symbol)}</strong>
        </div>
        <div className="black-dex-terminal-market-stat"><span>EXECUTION</span><strong>ORDERLY</strong></div>
        <div className="black-dex-terminal-market-stat"><span>DATA</span><strong>REAL-TIME</strong></div>
        <div className="black-dex-terminal-market-stat"><span>ACCOUNT</span><strong>NON-CUSTODIAL</strong></div>
        <div className="black-dex-terminal-market-risk"><span className="black-dex-terminal-live-dot" /> SYSTEM OPERATIONAL</div>
      </div>
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
