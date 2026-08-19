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
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      // Fullscreen can be unavailable in embedded/mobile browsers.
    }
  };

  const pageMeta = getPageMeta();
  const pageTitle = generatePageTitle(formatSymbol(params.symbol!));

  return (
    <div className={`black-dex-pro-terminal h-full${focusMode ? " is-focus-mode" : ""}`}>
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
        <button className="black-dex-terminal-control" onClick={toggleFullscreen}>
          FULLSCREEN
        </button>
        <span className="black-dex-terminal-mode">PRO MODE</span>
      </div>
      <div className="black-dex-terminal-market-strip" aria-label="Trading terminal information">
        <div className="black-dex-terminal-market-title">
          <span className="black-dex-terminal-kicker">PERPETUALS</span>
          <strong>{formatSymbol(symbol)}</strong>
        </div>
        <div className="black-dex-terminal-market-stat"><span>EXECUTION</span><strong>ORDERLY</strong></div>
        <div className="black-dex-terminal-market-stat"><span>DATA</span><strong>REAL-TIME</strong></div>
        <div className="black-dex-terminal-market-stat"><span>MODE</span><strong>NON-CUSTODIAL</strong></div>
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
        <a href="https://tradingview.com" target="_blank" rel="noopener noreferrer">
          TradingView
        </a>
      </div>
    </div>
  );
}
