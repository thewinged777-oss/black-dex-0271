import { useEffect } from "react";

function text(el: Element | null) {
  return (el?.textContent || "").replace(/\s+/g, " ").trim();
}

function leaf(label: RegExp) {
  return Array.from(document.querySelectorAll("div,span,p,button,h2,h3")).find((node) => {
    const value = text(node);
    return label.test(value) && value.length < 40;
  }) as HTMLElement | undefined;
}

function pane(start: Element | null, max = 12) {
  let current = start as HTMLElement | null;
  let best = current;
  let steps = 0;
  while (current && steps < max) {
    if (current.offsetHeight >= 120 && current.offsetWidth >= 160) best = current;
    current = current.parentElement;
    steps += 1;
  }
  return best;
}

function findChart() {
  const frame =
    document.querySelector("iframe[id*='tradingview']") ||
    document.querySelector("iframe[src*='tradingview']") ||
    document.querySelector("[class*='tradingview']") ||
    document.querySelector("canvas");
  return pane(frame, 14);
}

function findTicket() {
  return pane(
    leaf(/buy\s*\/?\s*long/i) || leaf(/^available$/i) || leaf(/^cross$/i),
    10,
  );
}

function markSubviews() {
  const root = document.querySelector(".bd-perp-page") as HTMLElement | null;
  if (!root) return;
  const tabs = Array.from(root.querySelectorAll("button, [role='tab']")).filter((node) =>
    /^(chart|charts|trades|data)$/i.test(text(node)),
  ) as HTMLElement[];
  const list = tabs[0]
    ? ((tabs[0].closest("[role='tablist']") || tabs[0].parentElement) as HTMLElement | null)
    : null;
  list?.classList.add("bd-trade-subtabs");
  Array.from(root.querySelectorAll("[role='tabpanel']")).forEach((panel) => {
    panel.classList.add("bd-trade-panel");
  });
  findChart()?.classList.add("bd-trade-chart");
  findTicket()?.classList.add("bd-trade-ticket");
}

function CandleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M5 3v2M5 13v2M9 2v3M9 12v4M13 4v2M13 12v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <rect x="3.6" y="5" width="2.8" height="8" rx="0.6" fill="currentColor" />
      <rect x="7.6" y="5" width="2.8" height="7" rx="0.6" fill="currentColor" />
      <rect x="11.6" y="6" width="2.8" height="6" rx="0.6" fill="currentColor" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M3 4h5M3 7h7M3 10h4M3 13h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M11 4h4M11 7h4M11 10h4M11 13h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export default function TradeDeskLayout({
  mode,
  onMode,
}: {
  mode: "ticket" | "chart";
  onMode: (mode: "ticket" | "chart") => void;
}) {
  useEffect(() => {
    markSubviews();
    const id = window.setInterval(markSubviews, 700);
    return () => window.clearInterval(id);
  }, [mode]);

  return (
    <div className="bd-trade-modes">
      <button type="button" aria-label="Chart" className={mode === "chart" ? "is-on" : ""} onClick={() => onMode("chart")}>
        <CandleIcon />
      </button>
      <button type="button" aria-label="Trade" className={mode === "ticket" ? "is-on" : ""} onClick={() => onMode("ticket")}>
        <BookIcon />
      </button>
    </div>
  );
}
