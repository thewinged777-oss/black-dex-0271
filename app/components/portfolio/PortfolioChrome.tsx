import { useEffect } from "react";

const GOLD = "rgb(var(--oui-color-primary))";
const PLATE = "rgb(var(--oui-color-base-8))";
const INK = "rgb(var(--oui-color-primary-contrast))";

const ICONS: Record<string, string> = {
  deposit:
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 4.2v10.2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M8.2 11.2 12 15l3.8-3.8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><path d="M5.2 19.2h13.6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
  withdraw:
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 19.8V9.6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M8.2 12.8 12 9l3.8 3.8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><path d="M5.2 4.8h13.6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
  history:
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="7.2" stroke="currentColor" stroke-width="1.7"/><path d="M12 8.2V12l2.6 1.6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
};

function paintWell(el: HTMLElement, kind: "deposit" | "withdraw" | "history") {
  el.classList.add("bd-pf-gold");
  el.setAttribute("data-bd-action", kind);
  el.style.setProperty("background", GOLD, "important");
  el.style.setProperty("background-color", GOLD, "important");
  el.style.setProperty("background-image", "none", "important");
  el.style.setProperty("color", INK, "important");
  if (el.dataset.bdIcon === "1") return;
  el.querySelectorAll("svg").forEach((svg) => svg.remove());
  el.insertAdjacentHTML("afterbegin", ICONS[kind]);
  el.dataset.bdIcon = "1";
}

function paintAffiliates() {
  const nodes = Array.from(document.querySelectorAll("a,button,div"));
  const title = nodes.find((node) => {
    const text = (node.textContent || "").replace(/\s+/g, " ").trim();
    return /^affiliates\b/i.test(text) && text.length < 90;
  }) as HTMLElement | undefined;
  if (!title) return;

  let card = title;
  for (let i = 0; i < 7 && card.parentElement; i += 1) {
    if (card.offsetWidth >= 220 && card.offsetHeight >= 48) break;
    card = card.parentElement;
  }
  if (card.offsetHeight > 220) return;
  card.classList.add("bd-pf-aff");
  card.style.setProperty("background", PLATE, "important");
  card.style.setProperty("background-color", PLATE, "important");
  card.style.setProperty("background-image", "none", "important");
  card.style.setProperty("border-color", "rgb(var(--oui-color-line))", "important");
}

function stripNotice() {
  const nodes = Array.from(document.querySelectorAll("div,span,p,section"));
  nodes.forEach((node) => {
    const text = (node.textContent || "").replace(/\s+/g, " ").trim();
    if (!/please connect wallet before starting to trade/i.test(text)) return;
    if (text.length > 80) return;
    let bar = node as HTMLElement;
    for (let i = 0; i < 5 && bar.parentElement; i += 1) {
      if (bar.offsetWidth >= 200) break;
      bar = bar.parentElement;
    }
    bar.classList.add("bd-pf-notice");
    bar.style.setProperty("background", "transparent", "important");
    bar.style.setProperty("background-image", "none", "important");
    bar.style.setProperty("box-shadow", "none", "important");
    bar.style.setProperty("border", "0", "important");
  });
}

function tagPortfolio() {
  if (!window.location.pathname.includes("/portfolio")) return;

  const leaves = Array.from(document.querySelectorAll("div,span,p,a,button"));
  leaves.forEach((node) => {
    const text = (node.textContent || "").replace(/\s+/g, " ").trim().toLowerCase();
    if (text !== "deposit" && text !== "withdraw" && text !== "history") return;
    const kind = text as "deposit" | "withdraw" | "history";

    let current = node as HTMLElement | null;
    let well: HTMLElement | null = null;
    for (let i = 0; i < 8 && current; i += 1) {
      const svg = current.querySelector("svg");
      if (svg) {
        well = (svg.parentElement as HTMLElement) || current;
        break;
      }
      current = current.parentElement;
    }
    if (well) paintWell(well, kind);
  });

  paintAffiliates();
  stripNotice();
}

export default function PortfolioChrome() {
  useEffect(() => {
    tagPortfolio();
    const id = window.setInterval(tagPortfolio, 500);
    const observer = new MutationObserver(tagPortfolio);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      window.clearInterval(id);
      observer.disconnect();
    };
  }, []);
  return null;
}
