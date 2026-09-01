import { useEffect } from "react";

const GOLD = "rgb(var(--oui-color-primary))";

function paintWell(el: HTMLElement) {
  el.classList.add("bd-pf-gold");
  el.style.setProperty("background", GOLD, "important");
  el.style.setProperty("background-color", GOLD, "important");
  el.style.setProperty("background-image", "none", "important");
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
}

export default function PortfolioChrome() {
  useEffect(() => {
    tagPortfolio();
    const id = window.setInterval(tagPortfolio, 400);
    const observer = new MutationObserver(tagPortfolio);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      window.clearInterval(id);
      observer.disconnect();
    };
  }, []);
  return null;
}
