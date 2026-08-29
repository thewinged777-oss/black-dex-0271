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
    if (current.offsetHeight >= 160 && current.offsetWidth >= 200) best = current;
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

function layoutTradeDesk() {
  if (window.innerWidth < 720) return;

  const chart = findChart();
  const ticket = findTicket();
  const book = findBook();
  if (!chart || !ticket || !book) return;
  if (chart.contains(ticket) || chart.contains(book)) return;

  const row = ticket.parentElement;
  if (!row || !row.contains(book)) return;

  const chartBox = chart.getBoundingClientRect();
  const rowBox = row.getBoundingClientRect();
  if (chartBox.top >= rowBox.top - 8) return;

  row.parentElement?.insertBefore(chart, row.nextSibling);
  chart.classList.add("bd-trade-chart");
  row.classList.add("bd-trade-top");
}

export default function TradeDeskLayout() {
  useEffect(() => {
    layoutTradeDesk();
    const id = window.setInterval(layoutTradeDesk, 600);
    const observer = new MutationObserver(layoutTradeDesk);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      window.clearInterval(id);
      observer.disconnect();
    };
  }, []);
  return null;
}
