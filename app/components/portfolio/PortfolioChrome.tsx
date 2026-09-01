import { useEffect } from "react";

function label(node: Element) {
  return ((node.getAttribute("aria-label") || "") + " " + (node.textContent || ""))
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function tagPortfolio() {
  const root =
    (document.querySelector(".oui-portfolio-page") as HTMLElement | null) ||
    (document.querySelector("[class*='portfolio']") as HTMLElement | null);
  if (!root) return;
  root.classList.add("bd-portfolio");

  root.querySelectorAll("button, a").forEach((node) => {
    const text = label(node);
    const el = node as HTMLElement;
    if (/^deposit$|^withdraw$|^history$/.test(text) || /\bdeposit\b|\bwithdraw\b|^history$/.test(text) && text.length < 18) {
      if (/deposit|withdraw|history/.test(text) && !/affiliate|setting/.test(text)) {
        el.classList.add("bd-pf-gold");
      }
    }
    if (/affiliate/.test(text)) {
      el.classList.add("bd-pf-aff");
    }
    if (/setting/.test(text) || el.getAttribute("aria-label")?.toLowerCase().includes("setting")) {
      el.classList.add("bd-pf-gear");
    }
  });

  root.querySelectorAll("button").forEach((node) => {
    const el = node as HTMLElement;
    const text = (el.textContent || "").trim();
    if (text) return;
    if (el.querySelector("svg") && el.closest(".bd-pf-gold") === null) {
      const row = el.parentElement;
      if (row && row.querySelector(".bd-pf-gold")) el.classList.add("bd-pf-gear");
    }
  });
}

export default function PortfolioChrome() {
  useEffect(() => {
    tagPortfolio();
    const id = window.setInterval(tagPortfolio, 600);
    const stop = window.setTimeout(() => window.clearInterval(id), 8000);
    return () => {
      window.clearInterval(id);
      window.clearTimeout(stop);
    };
  }, []);
  return null;
}
