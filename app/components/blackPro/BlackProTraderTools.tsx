import { useEffect, useState } from "react";
import { Command, Keyboard, PanelRight, Zap } from "lucide-react";
import BlackAIAssistant from "./BlackAIAssistant";

const commands = [
  { key: "focus", label: "Toggle Focus Mode" },
  { key: "fullscreen", label: "Toggle Fullscreen" },
  { key: "quick", label: "Open Quick Trade" },
  { key: "ai", label: "Open Black AI" },
];

export default function BlackProTraderTools({ symbol, focusMode, onFocusMode, onFullscreen }: { symbol: string; focusMode: boolean; onFocusMode: () => void; onFullscreen: () => void }) {
  const [commandOpen, setCommandOpen] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.isContentEditable;
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setCommandOpen(true); return; }
      if (typing) return;
      if (event.key.toLowerCase() === "q") { event.preventDefault(); setQuickOpen((value) => !value); }
      if (event.key.toLowerCase() === "a") { event.preventDefault(); setAiOpen((value) => !value); }
      if (event.key.toLowerCase() === "f") { event.preventDefault(); onFocusMode(); }
      if (event.key.toLowerCase() === "escape") { setCommandOpen(false); setQuickOpen(false); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onFocusMode]);

  return <>
    <div className="black-pro-tool-dock" aria-label="Pro trader tools">
      <button onClick={() => setQuickOpen((value) => !value)} className={quickOpen ? "active" : ""}><Zap size={14} /> QUICK <kbd>Q</kbd></button>
      <button onClick={() => setCompact((value) => !value)} className={compact ? "active" : ""}><PanelRight size={14} /> PANELS</button>
      <button onClick={() => setCommandOpen(true)}><Command size={14} /> COMMAND <kbd>⌘K</kbd></button>
      <button onClick={() => setAiOpen((value) => !value)} className={aiOpen ? "active" : ""}><span className="black-pro-ai-dot" /> BLACK AI <kbd>A</kbd></button>
      <button onClick={onFullscreen}><Keyboard size={14} /> SHORTCUTS</button>
    </div>

    {quickOpen && <div className="black-quick-trade">
      <div className="black-quick-header"><div><span>QUICK TRADE</span><strong>{symbol}</strong></div><small>OPENS ORDER ENTRY</small></div>
      <div className="black-quick-actions"><button className="long" onClick={() => window.dispatchEvent(new CustomEvent("black-dex:quick-trade", { detail: { side: "BUY", symbol } }))}>LONG</button><button className="short" onClick={() => window.dispatchEvent(new CustomEvent("black-dex:quick-trade", { detail: { side: "SELL", symbol } }))}>SHORT</button></div>
      <div className="black-quick-presets"><button>25%</button><button>50%</button><button>75%</button><button>100%</button></div>
      <p>Quick Trade prepares the live Orderly order flow. It does not bypass confirmations or fabricate execution.</p>
    </div>}

    {commandOpen && <div className="black-command-backdrop" onMouseDown={() => setCommandOpen(false)}>
      <div className="black-command" onMouseDown={(event) => event.stopPropagation()}>
        <div className="black-command-input"><Command size={16} /><input autoFocus placeholder="Search Black DEX actions…" onChange={() => undefined} /></div>
        <div className="black-command-list">{commands.map((item) => <button key={item.key} onClick={() => { setCommandOpen(false); if (item.key === "focus") onFocusMode(); if (item.key === "fullscreen") onFullscreen(); if (item.key === "quick") setQuickOpen(true); if (item.key === "ai") setAiOpen(true); }}><span>{item.label}</span><kbd>{item.key === "ai" ? "A" : item.key === "quick" ? "Q" : ""}</kbd></button>)}</div>
        <div className="black-command-footer">Black DEX Pro · Keyboard-first trading workspace</div>
      </div>
    </div>}

    {compact && <div className="black-panel-layout-note"><PanelRight size={14} /> Panel customization is enabled for the Pro workspace. Individual Orderly panels remain the source of truth.</div>}
    <BlackAIAssistant symbol={symbol} open={aiOpen} onClose={() => setAiOpen(false)} />
  </>;
}
