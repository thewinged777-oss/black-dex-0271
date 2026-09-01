import { useEffect } from "react";

const GOLD = "rgb(var(--oui-color-primary))";
const PLATE = "rgb(var(--oui-color-base-8))";

function paintWell(el: HTMLElement) {
  el.classList.add("bd-pf-gold");
  el.style.setProperty("background", GOLD, "important");
  el.style.setProperty("background-color", GOLD, "important");
  el.style.setProperty("background-image", "none", "important");
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
    const text = (node.textContent || "").replace(/\s+/g, " ").trim();
    if (!/^(deposit|withdraw|history)$/i.test(text)) return;

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
    if (well) paintWell(well);
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
