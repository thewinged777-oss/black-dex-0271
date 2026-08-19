import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { API } from "@orderly.network/types";
import { TradingPage } from "@orderly.network/trading";
import BlackProTraderTools from "@/components/blackPro/BlackProTraderTools";
import { updateSymbol } from "@/utils/storage";
import { formatSymbol, generatePageTitle } from "@/utils/utils";
import { useOrderlyConfig } from "@/utils/config";
import { getPageMeta } from "@/utils/seo";
import { renderSEOTags } from "@/utils/seo-tags";

const terminalStyles = `
.black-dex-terminal-market-strip{display:flex;align-items:center;gap:0;min-height:64px;border-bottom:1px solid #18181b;background:#090909;padding:0 16px;overflow:hidden}.black-dex-terminal-market-title{min-width:190px;display:flex;flex-direction:column;gap:4px;border-right:1px solid #242428;padding-right:22px}.black-dex-terminal-market-title strong{font-size:20px;letter-spacing:-.02em;color:#f4f4f5}.black-dex-terminal-kicker{font-size:8px;font-weight:900;letter-spacing:.18em;color:#d4af37}.black-dex-terminal-market-stat{min-width:125px;padding:0 18px;border-right:1px solid #18181b}.black-dex-terminal-market-stat span{display:block;font-size:8px;font-weight:800;letter-spacing:.13em;color:#5d5d65}.black-dex-terminal-market-stat strong{display:block;margin-top:6px;font-size:11px;letter-spacing:.04em;color:#d6d6da;font-variant-numeric:tabular-nums}.black-dex-terminal-market-risk{margin-left:auto;display:flex;align-items:center;gap:7px;color:#22c55e;font-size:8px;font-weight:900;letter-spacing:.12em;white-space:nowrap}.black-dex-terminal-live-dot{width:6px;height:6px;border-radius:50%;background:#22c55e;box-shadow:0 0 0 3px rgba(34,197,94,.08)}
.black-dex-pro-terminal [class*="oui-trading-page"],[class*="oui-trading-page"]{max-width:none!important}.black-dex-pro-terminal [class*="orderbook"],.black-dex-pro-terminal [class*="order-entry"],.black-dex-pro-terminal [class*="order-form"]{border-radius:6px!important}.black-dex-pro-terminal [class*="orderbook"],.black-dex-pro-terminal table,.black-dex-pro-terminal [class*="oui-position"]{font-variant-numeric:tabular-nums}.black-dex-pro-terminal button{font-weight:700}.black-dex-pro-terminal [class*="oui-order-entry"]{border-left:1px solid #242428!important}.black-dex-pro-terminal [class*="oui-order-entry"] button{min-height:40px}.black-dex-pro-terminal [class*="oui-order-entry"] [role="tab"]{font-size:11px}.black-dex-pro-terminal [class*="oui-orderbook"]{border-left:1px solid #18181b}.black-dex-pro-terminal [class*="oui-orderbook"] [class*="ask"]{background:linear-gradient(90deg,transparent,rgba(239,68,68,.045))!important}.black-dex-pro-terminal [class*="oui-orderbook"] [class*="bid"]{background:linear-gradient(90deg,transparent,rgba(34,197,94,.045))!important}.black-dex-pro-terminal [class*="oui-button"]{transition:background .15s,border-color .15s,color .15s!important}.black-dex-pro-terminal [class*="oui-button"]:hover{transform:none!important}
.black-pro-tool-dock{position:fixed;right:14px;bottom:14px;z-index:1100;display:flex;gap:5px;padding:5px;border:1px solid #28282d;border-radius:8px;background:rgba(10,10,11,.96);box-shadow:0 12px 40px rgba(0,0,0,.35);backdrop-filter:blur(12px)}.black-pro-tool-dock button{height:30px;display:flex;align-items:center;gap:6px;border:1px solid transparent;border-radius:5px;background:#141416;color:#8e8e97;padding:0 9px;font-size:8px;font-weight:900;letter-spacing:.08em;cursor:pointer}.black-pro-tool-dock button:hover,.black-pro-tool-dock button.active{border-color:rgba(212,175,55,.45);color:#e6c967;background:#191816}.black-pro-tool-dock kbd{font-size:7px;color:#5d5d65}.black-pro-ai-dot{width:7px;height:7px;border-radius:50%;background:#d4af37;box-shadow:0 0 10px rgba(212,175,55,.35)}
.black-quick-trade{position:fixed;right:14px;bottom:57px;z-index:1101;width:280px;padding:14px;border:1px solid #35302a;border-radius:9px;background:#0c0c0d;box-shadow:0 18px 60px rgba(0,0,0,.55)}.black-quick-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px}.black-quick-header span,.black-quick-header small{display:block;font-size:7px;font-weight:900;letter-spacing:.14em;color:#77777f}.black-quick-header strong{display:block;margin-top:4px;font-size:16px;color:#f1f1f3}.black-quick-actions{display:grid;grid-template-columns:1fr 1fr;gap:6px}.black-quick-actions button{height:42px;border-radius:6px;border:1px solid #2c2c30;background:#151517;font-size:10px;font-weight:900;letter-spacing:.1em;cursor:pointer}.black-quick-actions .long{color:#31d27a}.black-quick-actions .short{color:#f06470}.black-quick-presets{display:grid;grid-template-columns:repeat(4,1fr);gap:5px;margin-top:7px}.black-quick-presets button{height:27px;border:1px solid #29292e;border-radius:5px;background:#111113;color:#8e8e97;font-size:8px;font-weight:900}.black-quick-trade p{margin:10px 0 0;color:#5f5f68;font-size:8px;line-height:1.5}
.black-command-backdrop{position:fixed;inset:0;z-index:1200;display:flex;justify-content:center;align-items:flex-start;padding-top:13vh;background:rgba(0,0,0,.62);backdrop-filter:blur(4px)}.black-command{width:min(560px,calc(100vw - 24px));overflow:hidden;border:1px solid #34343a;border-radius:10px;background:#0d0d0f;box-shadow:0 30px 100px rgba(0,0,0,.65)}.black-command-input{height:54px;display:flex;align-items:center;gap:10px;padding:0 15px;border-bottom:1px solid #25252a;color:#d4af37}.black-command-input input{width:100%;border:0;outline:0;background:transparent;color:#eeeef0;font-size:13px}.black-command-input input::placeholder{color:#5f5f67}.black-command-list{padding:7px}.black-command-list button{width:100%;height:42px;display:flex;justify-content:space-between;align-items:center;padding:0 11px;border:0;border-radius:6px;background:transparent;color:#c4c4ca;font-size:11px;text-align:left;cursor:pointer}.black-command-list button:hover{background:#18181b;color:#e7ca6c}.black-command-list kbd{color:#66666e}.black-command-footer{padding:10px 14px;border-top:1px solid #25252a;color:#55555e;font-size:8px;letter-spacing:.06em}.black-panel-layout-note{position:fixed;right:14px;bottom:57px;z-index:1099;display:flex;align-items:center;gap:7px;padding:9px 11px;border:1px solid #2b2925;border-radius:7px;background:#0d0d0e;color:#8e8e96;font-size:8px}
.black-ai-panel{position:fixed;right:14px;bottom:57px;z-index:1150;width:min(380px,calc(100vw - 28px));height:min(650px,calc(100vh - 85px));display:flex;flex-direction:column;overflow:hidden;border:1px solid #3a3427;border-radius:10px;background:#0b0b0c;box-shadow:0 25px 90px rgba(0,0,0,.7)}.black-ai-header{display:flex;align-items:center;justify-content:space-between;padding:12px 13px;border-bottom:1px solid #242429}.black-ai-title{display:flex;align-items:center;gap:9px}.black-ai-icon{width:29px;height:29px;display:grid;place-items:center;border:1px solid rgba(212,175,55,.45);border-radius:7px;color:#d4af37;background:#151411}.black-ai-title strong,.black-ai-title small{display:block}.black-ai-title strong{font-size:10px;letter-spacing:.13em;color:#eeeef0}.black-ai-title small{margin-top:2px;font-size:6px;letter-spacing:.16em;color:#686871}.black-ai-close{border:0;background:transparent;color:#777780;cursor:pointer}.black-ai-context{display:flex;align-items:center;gap:6px;padding:8px 13px;color:#8e8e97;font-size:8px;border-bottom:1px solid #1b1b20}.black-ai-context svg{color:#d4af37}.black-ai-messages{flex:1;overflow:auto;padding:13px}.black-ai-message{max-width:88%;padding:9px 10px;margin-bottom:8px;border:1px solid #242429;border-radius:7px;color:#c8c8ce;font-size:10px;line-height:1.55}.black-ai-message.user{margin-left:auto;background:#171613;border-color:#3a3427;color:#eee5c9}.black-ai-message.assistant{background:#111113}.black-ai-suggestions{display:grid;grid-template-columns:1fr 1fr;gap:5px;padding:0 13px 10px}.black-ai-suggestions button{min-height:31px;border:1px solid #28282d;border-radius:5px;background:#111113;color:#8e8e97;font-size:7px;text-align:left;padding:5px 7px;cursor:pointer}.black-ai-suggestions button:hover{border-color:#5b4b2a;color:#d7bf6e}.black-ai-input{display:flex;gap:6px;padding:10px 13px;border-top:1px solid #242429}.black-ai-input input{flex:1;height:36px;border:1px solid #2a2a30;border-radius:6px;background:#111113;color:#eeeef0;padding:0 10px;outline:0;font-size:10px}.black-ai-input input:focus{border-color:rgba(212,175,55,.5)}.black-ai-input button{width:36px;height:36px;border:1px solid #4c4027;border-radius:6px;background:#d4af37;color:#090909;display:grid;place-items:center;cursor:pointer}.black-ai-input button:disabled{opacity:.45;cursor:not-allowed}.black-ai-disclaimer{padding:0 13px 10px;color:#50505a;font-size:7px;line-height:1.45}
.black-dex-pro-terminal.is-focus-mode{padding-top:92px}.black-dex-pro-terminal.is-focus-mode .black-dex-terminal-topline{position:fixed;top:0;left:0;right:0;z-index:1000}.black-dex-pro-terminal.is-focus-mode .black-dex-terminal-market-strip{position:fixed;top:28px;left:0;right:0;z-index:999}.black-dex-pro-terminal.is-focus-mode .oui-main-nav,.black-dex-pro-terminal.is-focus-mode header{display:none!important}
@media(max-width:900px){.black-dex-terminal-market-stat{min-width:105px;padding:0 12px}.black-dex-terminal-market-title{min-width:150px}.black-pro-tool-dock{left:8px;right:8px;bottom:8px;justify-content:space-between}.black-pro-tool-dock button{flex:1;justify-content:center}.black-pro-tool-dock button:last-child{display:none}}
@media(max-width:640px){.black-dex-terminal-market-strip{min-height:54px;padding:0 10px}.black-dex-terminal-market-title{min-width:125px;padding-right:12px}.black-dex-terminal-market-title strong{font-size:17px}.black-dex-terminal-market-stat{display:none}.black-dex-terminal-market-risk{font-size:7px}.black-dex-pro-terminal [class*="oui-order-entry"] button{min-height:46px}.black-dex-pro-terminal [class*="orderbook"]{max-height:42vh;overflow:auto}.black-quick-trade,.black-ai-panel{right:8px;left:8px;width:auto;bottom:58px}.black-command-backdrop{padding-top:8vh}}
`;

export default function PerpSymbol() {
  const params = useParams();
  const [symbol, setSymbol] = useState(params.symbol!);
  const [focusMode, setFocusMode] = useState(false);
  const config = useOrderlyConfig();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => { updateSymbol(symbol); }, [symbol]);

  const onSymbolChange = useCallback((data: API.Symbol) => {
    const nextSymbol = data.symbol;
    setSymbol(nextSymbol);
    const searchParamsString = searchParams.toString();
    navigate(`/perp/${nextSymbol}${searchParamsString ? `?${searchParamsString}` : ""}`);
  }, [navigate, searchParams]);

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch { /* Fullscreen can be unavailable in embedded/mobile browsers. */ }
  };

  const pageMeta = getPageMeta();
  const pageTitle = generatePageTitle(formatSymbol(params.symbol!));

  return (
    <div className={`black-dex-pro-terminal h-full${focusMode ? " is-focus-mode" : ""}`}>
      <style>{terminalStyles}</style>
      {renderSEOTags(pageMeta, pageTitle)}
      <div className="black-dex-terminal-topline">
        <span className="black-dex-terminal-live-dot" />
        <span>BLACK DEX PRO</span><span className="black-dex-terminal-divider" /><span>REAL-TIME MARKET DATA</span>
        <span className="black-dex-terminal-spacer" />
        <span className="black-dex-terminal-mode">PRO MODE · Q QUICK · A AI · ⌘K COMMAND</span>
      </div>
      <div className="black-dex-terminal-market-strip" aria-label="Trading terminal status">
        <div className="black-dex-terminal-market-title"><span className="black-dex-terminal-kicker">PERPETUALS</span><strong>{formatSymbol(symbol)}</strong></div>
        <div className="black-dex-terminal-market-stat"><span>EXECUTION</span><strong>ORDERLY</strong></div>
        <div className="black-dex-terminal-market-stat"><span>DATA</span><strong>REAL-TIME</strong></div>
        <div className="black-dex-terminal-market-stat"><span>ACCOUNT</span><strong>NON-CUSTODIAL</strong></div>
        <div className="black-dex-terminal-market-risk"><span className="black-dex-terminal-live-dot" /> SYSTEM OPERATIONAL</div>
      </div>
      <TradingPage symbol={symbol} onSymbolChange={onSymbolChange} tradingViewConfig={config.tradingPage.tradingViewConfig} sharePnLConfig={config.tradingPage.sharePnLConfig} />
      <BlackProTraderTools symbol={symbol} focusMode={focusMode} onFocusMode={() => setFocusMode((value) => !value)} onFullscreen={toggleFullscreen} />
      <div className="black-dex-terminal-footer-note md:hidden">Charts powered by <a href="https://tradingview.com" target="_blank" rel="noopener noreferrer">TradingView</a></div>
    </div>
  );
}
