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

function stackSubviews() {
  const root = document.querySelector(".bd-perp-page") as HTMLElement | null;
  if (!root) return;

  const tabs = Array.from(root.querySelectorAll("button, [role='tab']")).filter((node) =>
    /^(chart|charts|trades|data)$/i.test(text(node)),
  ) as HTMLElement[];
  if (tabs.length >= 2) {
    const list = (tabs[0].closest("[role='tablist']") || tabs[0].parentElement) as HTMLElement | null;
    list?.classList.add("bd-trade-subtabs");
  }

  const panels = Array.from(root.querySelectorAll("[role='tabpanel']")) as HTMLElement[];
  if (panels.length >= 2) {
    panels.forEach((panel) => {
      panel.classList.add("bd-trade-panel");
      panel.style.display = "block";
      panel.hidden = false;
      panel.setAttribute("data-state", "active");
    });
    const parent = panels[0].parentElement;
    parent?.classList.add("bd-trade-stack");
  }
}

function layoutTradeDesk() {
  const chart = findChart();
  const ticket = findTicket();
  const book = findBook();
  chart?.classList.add("bd-trade-chart");
  ticket?.classList.add("bd-trade-ticket");
  book?.classList.add("bd-trade-book");
  stackSubviews();

  if (window.innerWidth < 720) return;
  if (!chart || !ticket || !book) return;
  if (chart.contains(ticket) || chart.contains(book)) return;

  const row = ticket.parentElement;
  if (!row || !row.contains(book)) return;

  const chartBox = chart.getBoundingClientRect();
  const rowBox = row.getBoundingClientRect();
  if (chartBox.top >= rowBox.top - 8) return;

  row.parentElement?.insertBefore(chart, row.nextSibling);
  row.classList.add("bd-trade-top");
}

type Mode = "ticket" | "chart";

export default function TradeDeskLayout({
  mode,
  onMode,
}: {
  mode: Mode;
  onMode: (mode: Mode) => void;
}) {
  useEffect(() => {
    layoutTradeDesk();
    const id = window.setInterval(layoutTradeDesk, 600);
    const observer = new MutationObserver(layoutTradeDesk);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      window.clearInterval(id);
      observer.disconnect();
    };
  }, [mode]);

  return (
    <div className="bd-trade-modes">
      <button type="button" className={mode === "ticket" ? "is-on" : ""} onClick={() => onMode("ticket")}>
        Trade
      </button>
      <button type="button" className={mode === "chart" ? "is-on" : ""} onClick={() => onMode("chart")}>
        Chart
      </button>
    </div>
  );
}
