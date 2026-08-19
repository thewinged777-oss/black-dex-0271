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

const helperStyles = `
.black-trader-help{width:min(760px,calc(100vw - 24px));max-height:min(760px,calc(100vh - 80px));overflow:auto;border:1px solid #383329;border-radius:12px;background:#0c0c0d;box-shadow:0 30px 110px rgba(0,0,0,.72);color:#e8e8eb}.black-trader-help-header{display:flex;align-items:center;justify-content:space-between;padding:18px 20px;border-bottom:1px solid #25252a}.black-trader-help-header span{display:block;font-size:7px;font-weight:900;letter-spacing:.18em;color:#d4af37}.black-trader-help-header strong{display:block;margin-top:6px;font-size:16px;letter-spacing:-.01em}.black-trader-help-header button{border:0;background:transparent;color:#777780;font-size:22px;cursor:pointer}.black-trader-help-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:10px}.black-trader-help-grid section{padding:14px;border:1px solid #222228;border-radius:8px;background:#111113}.black-trader-help-grid h3{display:flex;align-items:center;gap:7px;margin:0 0 9px;font-size:8px;letter-spacing:.13em;color:#d4af37}.black-trader-help-grid p{margin:0;color:#8f8f98;font-size:9px;line-height:1.65}.black-trader-help-grid kbd{display:inline-flex;min-width:19px;justify-content:center;padding:2px 5px;border:1px solid #3a3832;border-radius:4px;background:#171613;color:#e0c76d;font-size:7px}.black-custom-links{display:grid;gap:4px}.black-custom-links>div{display:flex;align-items:center;gap:4px}.black-custom-links a{flex:1;display:flex;align-items:center;justify-content:space-between;padding:8px 9px;border:1px solid #24242a;border-radius:5px;background:#0d0d0f;color:#b7b7bf;text-decoration:none;font-size:8px}.black-custom-links a:hover{border-color:#5a4a28;color:#e0c76d}.black-custom-links button{width:30px;height:30px;border:1px solid #29292f;border-radius:5px;background:#111113;color:#66666e;cursor:pointer}.black-custom-links button:hover{color:#f06470}.black-add-link{display:grid;grid-template-columns:1fr 1.4fr 32px;gap:4px;margin-top:7px}.black-add-link input{min-width:0;height:30px;border:1px solid #29292f;border-radius:5px;background:#0d0d0f;color:#eeeef0;padding:0 8px;font-size:8px;outline:none}.black-add-link input:focus{border-color:rgba(212,175,55,.5)}.black-add-link button{border:1px solid #5a4a28;border-radius:5px;background:#d4af37;color:#090909;display:grid;place-items:center;cursor:pointer}.black-add-link button:disabled{opacity:.35;cursor:not-allowed}.black-helper-footer{grid-column:1/-1!important;display:flex;align-items:center;gap:8px;color:#65656d!important;font-size:8px!important}.black-helper-footer svg{color:#d4af37;flex:none}@media(max-width:640px){.black-trader-help-grid{grid-template-columns:1fr}.black-trader-help{max-height:calc(100vh - 70px)}.black-add-link{grid-template-columns:1fr 1fr 32px}}
`;

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
    <style>{helperStyles}</style>
    <div className="black-pro-tool-dock" aria-label="Pro trader tools">
      <button type="button" onClick={() => setQuickOpen((value) => !value)} className={quickOpen ? "active" : ""}><Zap size={14} /> QUICK <kbd>Q</kbd></button>
      <button type="button" onClick={() => setCompact((value) => !value)} className={compact ? "active" : ""}><PanelRight size={14} /> PANELS</button>
      <button type="button" onClick={() => setCommandOpen(true)}><Command size={14} /> COMMAND <kbd>⌘K</kbd></button>
      <button type="button" onClick={() => setAiOpen((value) => !value)} className={aiOpen ? "active" : ""}><span className="black-pro-ai-dot" /> BLACK DEX AI <kbd>A</kbd></button>
      <button type="button" onClick={openHelp}><BookOpen size={14} /> HELP</button>
    </div>

    {quickOpen && <div className="black-quick-trade">
      <div className="black-quick-header"><div><span>QUICK TRADE</span><strong>{symbol}</strong></div><small>OPENS ORDER ENTRY</small></div>
      <div className="black-quick-actions"><button type="button" className="long" onClick={() => window.dispatchEvent(new CustomEvent("black-dex:quick-trade", { detail: { side: "BUY", symbol } }))}>LONG</button><button type="button" className="short" onClick={() => window.dispatchEvent(new CustomEvent("black-dex:quick-trade", { detail: { side: "SELL", symbol } }))}>SHORT</button></div>
      <div className="black-quick-presets"><button type="button">25%</button><button type="button">50%</button><button type="button">75%</button><button type="button">100%</button></div>
      <p>Quick Trade prepares the live Orderly order flow. It does not bypass confirmations or fabricate execution.</p>
    </div>}

    {commandOpen && <div className="black-command-backdrop" onMouseDown={() => setCommandOpen(false)}>
      <div className="black-command" onMouseDown={(event) => event.stopPropagation()}>
        <div className="black-command-input"><Command size={16} /><input autoFocus placeholder="Search Black DEX actions…" onChange={() => undefined} /></div>
        <div className="black-command-list">{commands.map((item) => <button type="button" key={item.key} onClick={() => { setCommandOpen(false); if (item.key === "focus") onFocusMode(); if (item.key === "fullscreen") onFullscreen(); if (item.key === "quick") setQuickOpen(true); if (item.key === "ai") setAiOpen(true); if (item.key === "help") openHelp(); }}><span>{item.label}</span><kbd>{item.key === "ai" ? "A" : item.key === "quick" ? "Q" : ""}</kbd></button>)}</div>
        <div className="black-command-footer">Black DEX Pro · Keyboard-first trading workspace</div>
      </div>
    </div>}

    {helpOpen && <div className="black-command-backdrop" onMouseDown={() => setHelpOpen(false)}>
      <div className="black-trader-help" onMouseDown={(event) => event.stopPropagation()}>
        <div className="black-trader-help-header"><div><span>TRADER KNOWLEDGE CENTER</span><strong>Everything you need at the terminal</strong></div><button type="button" onClick={() => setHelpOpen(false)} aria-label="Close">×</button></div>
        <div className="black-trader-help-grid">
          <section><h3><Keyboard size={14}/> PRO SHORTCUTS</h3><p><kbd>Q</kbd> Quick Trade · <kbd>A</kbd> BLACK DEX AI · <kbd>F</kbd> Focus Mode · <kbd>⌘K</kbd> Command Palette · <kbd>Esc</kbd> Close overlays</p></section>
          <section><h3><BookOpen size={14}/> TRADING BASICS</h3><p>Use Market for immediate execution, Limit for price-controlled entries, and Stop/TP/SL controls for risk management. Always verify the live Orderly order ticket before submitting.</p></section>
          <section><h3>RISK CHECK</h3><p>Review leverage, margin, liquidation price, TP/SL and reduce-only settings before execution. Orderly remains the source of truth for account and risk values.</p></section>
          <section><h3><ExternalLink size={14}/> YOUR LINKS</h3><div className="black-custom-links">{customLinks.map((link) => <div key={link.id}><a href={link.url} target={link.url.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">{link.label}<ExternalLink size={11}/></a>{link.id !== "shortcuts" && link.id !== "risk" && link.id !== "orders" && <button type="button" onClick={() => persistLinks(customLinks.filter((item) => item.id !== link.id))} aria-label={`Delete ${link.label}`}><Trash2 size={11}/></button>}</div>)}</div><div className="black-add-link"><input value={linkLabel} onChange={(e) => setLinkLabel(e.target.value)} placeholder="Label"/><input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://…"/><button type="button" onClick={addLink} disabled={!linkLabel.trim() || !/^https?:\/\//i.test(linkUrl.trim())}><Plus size={12}/></button></div></section>
          <section className="black-helper-footer"><Settings2 size={14}/> Helper links are saved locally to this browser. Add Orderly docs, your risk playbook, strategy notes, or internal Black DEX pages.</section>
        </div>
      </div>
    </div>}

    {compact && <div className="black-panel-layout-note"><PanelRight size={14} /> Panel customization is enabled for the Pro workspace. Individual Orderly panels remain the source of truth.</div>}
    <BlackAIAssistant symbol={symbol} open={aiOpen} onClose={() => setAiOpen(false)} />
  </>;
}
