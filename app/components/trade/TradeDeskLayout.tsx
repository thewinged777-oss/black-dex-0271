import { useEffect } from "react";

function text(el: Element | null) {
  return (el?.textContent || "").replace(/\s+/g, " ").trim();
}

function closestPane(node: Element | null, max = 8): HTMLElement | null {
  let current = node as HTMLElement | null;
  let steps = 0;
  while (current && steps < max) {
    const style = window.getComputedStyle(current);
    const tall = current.offsetHeight >= 180;
    const block = style.display.includes("flex") || style.display === "grid" || current.childElementCount >= 2;
    if (tall && block) return current;
    current = current.parentElement;
    steps += 1;
  }
  return node as HTMLElement | null;
}

function findHeadingPane(label: RegExp) {
  const nodes = Array.from(document.querySelectorAll("div,span,p,h2,h3,button"));
  const hit = nodes.find((node) => label.test(text(node)) && text(node).length < 28);
  return closestPane(hit || null);
}

function findChartPane() {
  const frame =
    document.querySelector("iframe[id*='tradingview']") ||
    document.querySelector("iframe[src*='tradingview']") ||
    document.querySelector("[id*='tv_chart']") ||
    document.querySelector("[class*='tradingview']") ||
    document.querySelector("[class*='TradingView']");
  return closestPane(frame, 10);
}

function layoutTradeDesk() {
  if (window.innerWidth < 1024) return;
  if (document.querySelector(".bd-trade-desk")) return;

  const chart = findChartPane();
  const book = findHeadingPane(/^(order book|orderbook)$/i);
  const ticket =
    findHeadingPane(/^(margin mode|available|order type)$/i) ||
    findHeadingPane(/^(limit|market|advanced)$/i);

  if (!chart || !book || !ticket) return;
  if (chart === book || chart === ticket || book === ticket) return;

  const host = chart.parentElement;
  if (!host) return;

  const desk = document.createElement("div");
  desk.className = "bd-trade-desk";
  const top = document.createElement("div");
  top.className = "bd-trade-top";
  const chartSlot = document.createElement("div");
  chartSlot.className = "bd-trade-chart";

  host.insertBefore(desk, chart);
  desk.appendChild(top);
  desk.appendChild(chartSlot);
  top.appendChild(ticket);
  top.appendChild(book);
  chartSlot.appendChild(chart);
}

export default function TradeDeskLayout() {
  useEffect(() => {
    layoutTradeDesk();
    const id = window.setInterval(layoutTradeDesk, 700);
    const observer = new MutationObserver(layoutTradeDesk);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      window.clearInterval(id);
      observer.disconnect();
    };
  }, []);
  return null;
}
