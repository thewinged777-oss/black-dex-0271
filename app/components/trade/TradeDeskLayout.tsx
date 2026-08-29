import { useEffect } from "react";

function text(el: Element | null) {
  return (el?.textContent || "").replace(/\s+/g, " ").trim();
}

function leaf(label: RegExp) {
  return Array.from(document.querySelectorAll("div,span,p,button,h2,h3,label")).find((node) => {
    const value = text(node);
    return label.test(value) && value.length < 48;
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

function hideAdvancedToggles() {
  const labels = Array.from(document.querySelectorAll("label, span, div"));
  labels.forEach((node) => {
    const value = text(node);
    if (!/^(post only|ioc|fok|order confirm|hidden)$/i.test(value)) return;
    const row = (node.closest("label") || node.parentElement) as HTMLElement | null;
    if (row) row.classList.add("bd-ticket-advanced");
  });
}

function colorSides() {
  document.querySelectorAll("button").forEach((btn) => {
    const value = text(btn);
    if (/^buy$/i.test(value) || /buy\s*\/?\s*long/i.test(value)) {
      btn.classList.add("bd-side-buy");
    }
    if (/^sell$/i.test(value) || /sell\s*\/?\s*short/i.test(value)) {
      btn.classList.add("bd-side-sell");
    }
  });
}

function flattenEmptyPositions() {
  const empty = Array.from(document.querySelectorAll("div")).find((node) =>
    /no results found/i.test(text(node)) && text(node).length < 48,
  ) as HTMLElement | undefined;
  if (!empty || empty.dataset.bdEmpty === "1") return;

  const symbol =
    text(document.querySelector("[class*='symbol']")) ||
    text(leaf(/^ETH$/) || null) ||
    "ETH";
  const pair = /PERP_/i.test(window.location.pathname)
    ? window.location.pathname.split("/").pop()?.replace(/^PERP_/, "").replace(/_/g, "-") || "ETH-USDC"
    : `${symbol}-USDC`;

  const box = pane(empty, 6);
  if (!box) return;
  box.dataset.bdEmpty = "1";
  box.classList.add("bd-pos-empty");
  box.querySelectorAll("svg, img").forEach((node) => node.remove());
  empty.textContent = `No open position · ${pair}`;
}

function layoutTradeDesk() {
  hideAdvancedToggles();
  colorSides();
  flattenEmptyPositions();

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
