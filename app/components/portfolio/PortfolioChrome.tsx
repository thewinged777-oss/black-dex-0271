import { useEffect } from "react";

function label(node: Element) {
  return ((node.getAttribute("aria-label") || "") + " " + (node.textContent || ""))
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function tagPortfolio() {
  const nodes = Array.from(document.querySelectorAll("button, a"));
  nodes.forEach((node) => {
    const text = label(node);
    const el = node as HTMLElement;
    if (
      text.length < 22 &&
      /\b(deposit|withdraw|history)\b/.test(text) &&
      !/affiliate|setting|transfer/.test(text)
    ) {
      el.classList.add("bd-pf-gold");
    }
    if (/affiliate/.test(text) && text.length < 24) {
      el.classList.add("bd-pf-aff");
    }
    if (/setting/.test(text)) {
      el.classList.add("bd-pf-gear");
    }
  });
}

export default function PortfolioChrome() {
  useEffect(() => {
    tagPortfolio();
    const id = window.setInterval(tagPortfolio, 400);
    return () => window.clearInterval(id);
  }, []);
  return null;
}
