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

function findBook() {
  return pane(leaf(/est\.?\s*funding rate/i) || leaf(/^mid$/i) || leaf(/^bbo$/i), 10);
}

function stackSubviews(mode: "ticket" | "chart") {
  const root = document.querySelector(".bd-perp-page") as HTMLElement | null;
  if (!root) return;

  const tabs = Array.from(root.querySelectorAll("button, [role='tab']")).filter((node) =>
    /^(chart|charts|trades|data)$/i.test(text(node)),
  ) as HTMLElement[];
  const list = tabs[0]
    ? ((tabs[0].closest("[role='tablist']") || tabs[0].parentElement) as HTMLElement | null)
    : null;
  if (list) {
    list.classList.add("bd-trade-subtabs");
    list.style.display = mode === "chart" ? "none" : list.style.display;
  }
}

function layoutTradeDesk(mode: "ticket" | "chart") {
  const chart = findChart();
  const ticket = findTicket();
  const book = findBook();
  chart?.classList.add("bd-trade-chart");
  ticket?.classList.add("bd-trade-ticket");
  book?.classList.add("bd-trade-book");
  stackSubviews(mode);

  if (ticket && book && ticket.parentElement && ticket.parentElement === book.parentElement) {
    ticket.parentElement.classList.add("bd-trade-top");
  }
}

type Mode = "ticket" | "chart";

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
  mode: Mode;
  onMode: (mode: Mode) => void;
}) {
  useEffect(() => {
    layoutTradeDesk(mode);
    const id = window.setInterval(() => layoutTradeDesk(mode), 600);
    const observer = new MutationObserver(() => layoutTradeDesk(mode));
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      window.clearInterval(id);
      observer.disconnect();
    };
  }, [mode]);

  return (
    <div className="bd-trade-modes">
      <button
        type="button"
        aria-label="Chart"
        className={mode === "chart" ? "is-on" : ""}
        onClick={() => onMode("chart")}
      >
        <CandleIcon />
      </button>
      <button
        type="button"
        aria-label="Trade"
        className={mode === "ticket" ? "is-on" : ""}
        onClick={() => onMode("ticket")}
      >
        <BookIcon />
      </button>
    </div>
  );
}
