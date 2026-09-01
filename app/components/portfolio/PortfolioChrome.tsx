import { useEffect } from "react";

const GOLD = "rgb(var(--oui-color-primary))";
const PLATE = "rgb(var(--oui-color-base-8))";
const MUTED = "rgb(var(--oui-color-base-7))";
const LINE = "rgb(var(--oui-color-line))";
const INK = "rgb(var(--oui-color-primary-contrast))";
const FG = "rgb(var(--oui-color-base-foreground))";

const ICONS: Record<string, string> = {
  deposit:
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 4.2v10.2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M8.2 11.2 12 15l3.8-3.8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><path d="M5.2 19.2h13.6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
  withdraw:
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 19.8V9.6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M8.2 12.8 12 9l3.8 3.8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><path d="M5.2 4.8h13.6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
  history:
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="7.2" stroke="currentColor" stroke-width="1.7"/><path d="M12 8.2V12l2.6 1.6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
};

function inSheet(el: HTMLElement) {
  return Boolean(
    el.closest(".bd-pf-sheet") ||
      el.closest("[role='dialog']") ||
      el.closest("[data-state='open']"),
  );
}

function paintWell(el: HTMLElement, kind: "deposit" | "withdraw" | "history") {
  if (inSheet(el) || el.classList.contains("bd-pf-tab")) return;
  el.classList.add("bd-pf-gold");
  el.style.setProperty("background", GOLD, "important");
  el.style.setProperty("color", INK, "important");
  if (el.dataset.bdIcon === "1") return;
  el.querySelectorAll("svg").forEach((svg) => svg.remove());
  el.insertAdjacentHTML("afterbegin", ICONS[kind]);
  el.dataset.bdIcon = "1";
}

function isOn(el: HTMLElement) {
  return (
    el.getAttribute("aria-selected") === "true" ||
    el.getAttribute("aria-pressed") === "true" ||
    el.getAttribute("data-state") === "active" ||
    el.getAttribute("data-state") === "on" ||
    /contained|primary/.test(el.className)
  );
}

function paintSheet() {
  const sheet = Array.from(document.querySelectorAll("div")).find((node) => {
    const text = (node.textContent || "").replace(/\s+/g, " ");
    return text.includes("Your Web3 Wallet") && text.includes("Quantity") && (node as HTMLElement).offsetHeight > 180;
  }) as HTMLElement | undefined;
  if (!sheet) return;
  sheet.classList.add("bd-pf-sheet");

  const buttons = Array.from(sheet.querySelectorAll("button")) as HTMLElement[];
  const tabs = buttons.filter((button) => {
    const text = (button.textContent || "").replace(/\s+/g, " ").trim().toLowerCase();
    return text.includes("deposit") || text.includes("withdraw");
  });
  const grouped = tabs.filter((button) => {
    const parent = button.parentElement;
    if (!parent) return false;
    const labels = Array.from(parent.querySelectorAll("button")).map((item) =>
      (item.textContent || "").replace(/\s+/g, " ").trim().toLowerCase(),
    );
    return labels.some((item) => item.includes("deposit")) && labels.some((item) => item.includes("withdraw"));
  });

  grouped.forEach((button) => {
    button.classList.remove("bd-pf-gold");
    button.classList.add("bd-pf-tab");
    button.style.removeProperty("width");
    button.style.removeProperty("height");
    button.style.removeProperty("min-width");
    button.style.removeProperty("min-height");
    const on = isOn(button);
    button.classList.toggle("is-on", on);
    button.style.setProperty("background", on ? GOLD : MUTED, "important");
    button.style.setProperty("color", on ? INK : FG, "important");
  });

  sheet.querySelectorAll("input, textarea").forEach((input) => {
    const field = (input.parentElement as HTMLElement) || (input as HTMLElement);
    field.classList.add("bd-pf-field");
    field.style.setProperty("background", PLATE, "important");
    field.style.setProperty("border-color", LINE, "important");
  });
}

function paintAffiliates() {
  const title = Array.from(document.querySelectorAll("a,button,div")).find((node) => {
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
}

function stripNotice() {
  Array.from(document.querySelectorAll("div,span,p")).forEach((node) => {
    const text = (node.textContent || "").replace(/\s+/g, " ").trim();
    if (!/please connect wallet before starting to trade/i.test(text) || text.length > 80) return;
    (node as HTMLElement).classList.add("bd-pf-notice");
    (node as HTMLElement).style.setProperty("background", "transparent", "important");
  });
}

function tagPortfolio() {
  if (!window.location.pathname.includes("/portfolio")) return;
  paintSheet();

  Array.from(document.querySelectorAll("div,span,p,a,button")).forEach((node) => {
    const text = (node.textContent || "").replace(/\s+/g, " ").trim().toLowerCase();
    if (text !== "deposit" && text !== "withdraw" && text !== "history") return;
    if (inSheet(node as HTMLElement)) return;
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
    if (well && !well.classList.contains("bd-pf-tab")) paintWell(well, kind);
  });

  paintAffiliates();
  stripNotice();
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
