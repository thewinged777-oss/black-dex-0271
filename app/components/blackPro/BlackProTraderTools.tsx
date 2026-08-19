import { useEffect, useState } from "react";
import { BookOpen, Command, ExternalLink, Keyboard, PanelRight, Plus, Settings2, Trash2, Zap } from "lucide-react";
import BlackAIAssistant from "./BlackAIAssistant";

const commands = [
  { key: "focus", label: "Toggle Focus Mode" },
  { key: "fullscreen", label: "Toggle Fullscreen" },
  { key: "quick", label: "Open Quick Trade" },
  { key: "ai", label: "Open BLACK DEX AI" },
  { key: "help", label: "Open Trader Help" },
];

type CustomLink = { id: string; label: string; url: string };

const defaultLinks: CustomLink[] = [
  { id: "shortcuts", label: "Pro Shortcuts", url: "#shortcuts" },
  { id: "risk", label: "Risk & Liquidation Guide", url: "#risk" },
  { id: "orders", label: "Order Types Guide", url: "#orders" },
];

export default function BlackProTraderTools({ symbol, focusMode, onFocusMode, onFullscreen }: { symbol: string; focusMode: boolean; onFocusMode: () => void; onFullscreen: () => void }) {
  const [commandOpen, setCommandOpen] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [compact, setCompact] = useState(false);
  const [customLinks, setCustomLinks] = useState<CustomLink[]>(() => {
    try { return JSON.parse(localStorage.getItem("black-dex:trader-links") || "null") || defaultLinks; } catch { return defaultLinks; }
  });
  const [linkLabel, setLinkLabel] = useState("");
  const [linkUrl, setLinkUrl] = useState("");

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.isContentEditable;
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setCommandOpen(true); return; }
      if (typing) return;
      if (event.key.toLowerCase() === "q") { event.preventDefault(); setQuickOpen((value) => !value); }
      if (event.key.toLowerCase() === "a") { event.preventDefault(); setAiOpen((value) => !value); }
      if (event.key.toLowerCase() === "f") { event.preventDefault(); onFocusMode(); }
      if (event.key.toLowerCase() === "escape") { setCommandOpen(false); setQuickOpen(false); setHelpOpen(false); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onFocusMode]);

  const persistLinks = (next: CustomLink[]) => {
    setCustomLinks(next);
    try { localStorage.setItem("black-dex:trader-links", JSON.stringify(next)); } catch { /* storage may be unavailable */ }
  };

  const addLink = () => {
    const label = linkLabel.trim();
    const url = linkUrl.trim();
    if (!label || !/^https?:\/\//i.test(url)) return;
    persistLinks([...customLinks, { id: `${Date.now()}`, label, url }]);
    setLinkLabel("");
    setLinkUrl("");
  };

  const openHelp = () => { setCommandOpen(false); setHelpOpen(true); };

  return <>
    <div className="black-pro-tool-dock" aria-label="Pro trader tools">
      <button onClick={() => setQuickOpen((value) => !value)} className={quickOpen ? "active" : ""}><Zap size={14} /> QUICK <kbd>Q</kbd></button>
      <button onClick={() => setCompact((value) => !value)} className={compact ? "active" : ""}><PanelRight size={14} /> PANELS</button>
      <button onClick={() => setCommandOpen(true)}><Command size={14} /> COMMAND <kbd>⌘K</kbd></button>
      <button onClick={() => setAiOpen((value) => !value)} className={aiOpen ? "active" : ""}><span className="black-pro-ai-dot" /> BLACK DEX AI <kbd>A</kbd></button>
      <button onClick={openHelp}><BookOpen size={14} /> HELP</button>
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
        <div className="black-command-list">{commands.map((item) => <button key={item.key} onClick={() => { setCommandOpen(false); if (item.key === "focus") onFocusMode(); if (item.key === "fullscreen") onFullscreen(); if (item.key === "quick") setQuickOpen(true); if (item.key === "ai") setAiOpen(true); if (item.key === "help") openHelp(); }}><span>{item.label}</span><kbd>{item.key === "ai" ? "A" : item.key === "quick" ? "Q" : ""}</kbd></button>)}</div>
        <div className="black-command-footer">Black DEX Pro · Keyboard-first trading workspace</div>
      </div>
    </div>}

    {helpOpen && <div className="black-command-backdrop" onMouseDown={() => setHelpOpen(false)}>
      <div className="black-trader-help" onMouseDown={(event) => event.stopPropagation()}>
        <div className="black-trader-help-header"><div><span>TRADER KNOWLEDGE CENTER</span><strong>Everything you need at the terminal</strong></div><button onClick={() => setHelpOpen(false)} aria-label="Close">×</button></div>
        <div className="black-trader-help-grid">
          <section><h3><Keyboard size={14}/> PRO SHORTCUTS</h3><p><kbd>Q</kbd> Quick Trade · <kbd>A</kbd> BLACK DEX AI · <kbd>F</kbd> Focus Mode · <kbd>⌘K</kbd> Command Palette · <kbd>Esc</kbd> Close overlays</p></section>
          <section><h3><BookOpen size={14}/> TRADING BASICS</h3><p>Use Market for immediate execution, Limit for price-controlled entries, and Stop/TP/SL controls for risk management. Always verify the live Orderly order ticket before submitting.</p></section>
          <section><h3>RISK CHECK</h3><p>Review leverage, margin, liquidation price, TP/SL and reduce-only settings before execution. Orderly remains the source of truth for account and risk values.</p></section>
          <section><h3><ExternalLink size={14}/> YOUR LINKS</h3><div className="black-custom-links">{customLinks.map((link) => <div key={link.id}><a href={link.url} target={link.url.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">{link.label}<ExternalLink size={11}/></a>{link.id !== "shortcuts" && link.id !== "risk" && link.id !== "orders" && <button onClick={() => persistLinks(customLinks.filter((item) => item.id !== link.id))} aria-label={`Delete ${link.label}`}><Trash2 size={11}/></button>}</div>)}</div><div className="black-add-link"><input value={linkLabel} onChange={(e) => setLinkLabel(e.target.value)} placeholder="Label"/><input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://…"/><button onClick={addLink} disabled={!linkLabel.trim() || !/^https?:\/\//i.test(linkUrl.trim())}><Plus size={12}/></button></div></section>
          <section className="black-helper-footer"><Settings2 size={14}/> Helper links are saved locally to this browser. Add Orderly docs, your risk playbook, strategy notes, or internal Black DEX pages.</section>
        </div>
      </div>
    </div>}

    {compact && <div className="black-panel-layout-note"><PanelRight size={14} /> Panel customization is enabled for the Pro workspace. Individual Orderly panels remain the source of truth.</div>}
    <BlackAIAssistant symbol={symbol} open={aiOpen} onClose={() => setAiOpen(false)} />
  </>;
}
