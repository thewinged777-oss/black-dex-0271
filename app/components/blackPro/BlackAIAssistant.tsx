import { useEffect, useMemo, useState } from "react";
import { Bot, Send, Sparkles, X } from "lucide-react";

type Message = { role: "user" | "assistant"; content: string };

type BlackAIContext = {
  symbol: string;
  mode: "pro";
  page: string;
};

const endpoint = import.meta.env.VITE_BLACK_DEX_AI_ENDPOINT as string | undefined;

const suggestions = [
  "Explain my current trading screen",
  "What should I check before opening a position?",
  "Explain liquidation price and margin",
  "How do TP and SL work on Black DEX?",
];

function localAnswer(input: string, context: BlackAIContext) {
  const q = input.toLowerCase();
  if (q.includes("liquidation")) return `Liquidation is the price where your position can be forcibly closed because available margin is no longer sufficient. For ${context.symbol}, use the live Orderly liquidation value shown in the position/order-entry UI rather than an estimate from the assistant.`;
  if (q.includes("tp") || q.includes("stop") || q.includes("sl")) return "TP/SL should be configured from the live Orderly trading controls. I can explain the mechanics, but I will never invent trigger prices or claim an order was submitted unless the trading UI confirms it.";
  if (q.includes("position") || q.includes("trade")) return `You are viewing ${context.symbol} in Black DEX Pro Mode. I can help explain the market, risk controls and Orderly trading workflow. For execution, always confirm the live order ticket before submitting.`;
  return "I’m BLACK DEX AI. I can explain the trading interface, risk controls and Orderly-powered workflows. Connect the BLACK DEX AI backend to enable live account-aware analysis and tool calls.";
}

export default function BlackAIAssistant({ symbol, open, onClose }: { symbol: string; open: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "BLACK DEX AI online. I can explain the terminal, risk controls and Orderly trading workflows. I will not invent market or account data." },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const context = useMemo<BlackAIContext>(() => ({ symbol, mode: "pro", page: window.location.pathname }), [symbol]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const send = async (text = input) => {
    const question = text.trim();
    if (!question || busy) return;
    setInput("");
    setMessages((current) => [...current, { role: "user", content: question }]);
    setBusy(true);
    try {
      if (endpoint) {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: question, context }),
        });
        if (!response.ok) throw new Error(`BLACK DEX AI endpoint returned ${response.status}`);
        const data = (await response.json()) as { answer?: string };
        setMessages((current) => [...current, { role: "assistant", content: data.answer || "The AI backend returned no answer." }]);
      } else {
        await new Promise((resolve) => window.setTimeout(resolve, 250));
        setMessages((current) => [...current, { role: "assistant", content: localAnswer(question, context) }]);
      }
    } catch {
      setMessages((current) => [...current, { role: "assistant", content: "BLACK DEX AI could not reach its backend. Your trading interface remains independent and Orderly continues to be the source of truth." }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <aside className="black-ai-panel" aria-label="BLACK DEX AI assistant">
      <div className="black-ai-header">
        <div className="black-ai-title"><span className="black-ai-icon"><Bot size={16} /></span><div><strong>BLACK DEX AI</strong><small>TRADING ASSISTANT</small></div></div>
        <button className="black-ai-close" onClick={onClose} aria-label="Close"><X size={16} /></button>
      </div>
      <div className="black-ai-context"><Sparkles size={12} /> Context: {symbol} · Pro Mode</div>
      <div className="black-ai-messages">
        {messages.map((message, index) => <div key={`${message.role}-${index}`} className={`black-ai-message ${message.role}`}>{message.content}</div>)}
        {busy && <div className="black-ai-message assistant">Analyzing…</div>}
      </div>
      <div className="black-ai-suggestions">
        {suggestions.slice(0, 2).map((suggestion) => <button key={suggestion} onClick={() => void send(suggestion)}>{suggestion}</button>)}
      </div>
      <form className="black-ai-input" onSubmit={(event) => { event.preventDefault(); void send(); }}>
        <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask BLACK DEX AI…" aria-label="Ask BLACK DEX AI" />
        <button type="submit" disabled={busy || !input.trim()} aria-label="Send"><Send size={15} /></button>
      </form>
      <div className="black-ai-disclaimer">AI is informational only. Never rely on AI as the source of truth for prices, balances, liquidation or execution.</div>
    </aside>
  );
}
