import { useEffect } from "react";

const GOLD = "rgb(var(--oui-color-primary))";
const PLATE = "rgb(var(--oui-color-base-8))";
const MUTED = "rgb(var(--oui-color-base-7))";
const INK = "rgb(var(--oui-color-primary-contrast))";
const FG = "rgb(var(--oui-color-base-foreground))";

const ICONS: Record<string, string> = {
  deposit:
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 4.2v10.2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M8.2 11.2 12 15l3.8-3.8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><path d="M5.2 19.2h13.6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
  withdraw:
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 19.8V9.6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M8.2 12.8 12 9l3.8 3.8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><path d="M5.2 4.8h13.6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
  history:
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="7.2" stroke="currentColor" stroke-width="1.7"/><path d="M12 8.2V12l2.6 1.6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
};

function labelOf(el: Element) {
  return (el.textContent || "").replace(/\s+/g, " ").trim().toLowerCase();
}

function paintTab(button: HTMLElement, on: boolean) {
  button.classList.remove("bd-pf-gold");
  button.classList.add("bd-pf-tab");
  button.classList.toggle("is-on", on);
  button.style.setProperty("width", "auto", "important");
  button.style.setProperty("height", "36px", "important");
  button.style.setProperty("min-width", "108px", "important");
  button.style.setProperty("background", on ? GOLD : MUTED, "important");
  button.style.setProperty("background-image", "none", "important");
  button.style.setProperty("color", on ? INK : FG, "important");
}

function bindTabs(tabs: HTMLElement[]) {
  tabs.forEach((button) => {
    if (button.dataset.bdBound === "1") return;
    button.dataset.bdBound = "1";
    button.addEventListener("click", () => {
      tabs.forEach((item) => paintTab(item, item === button));
      window.setTimeout(() => tabs.forEach((item) => paintTab(item, item === button)), 80);
    });
  });
}

function paintSheet() {
  const sheet = Array.from(document.querySelectorAll("div")).find((node) => {
    const text = (node.textContent || "").replace(/\s+/g, " ");
    return text.includes("Quantity") && (text.includes("Deposit") || text.includes("Withdraw")) && (node as HTMLElement).offsetHeight > 160;
  }) as HTMLElement | undefined;
  if (!sheet) return;
  sheet.classList.add("bd-pf-sheet");

  const buttons = Array.from(sheet.querySelectorAll("button")) as HTMLElement[];
  const tabs = buttons.filter((button) => {
    const text = labelOf(button);
    return text === "deposit" || text === "withdraw" || text.endsWith("deposit") || text.endsWith("withdraw");
  });
  const pair = tabs.filter((button) => {
    const parent = button.parentElement;
    if (!parent) return false;
    const labels = Array.from(parent.querySelectorAll("button")).map(labelOf);
    return labels.some((item) => item.includes("deposit")) && labels.some((item) => item.includes("withdraw"));
  });
  if (pair.length >= 2) {
    const active =
      pair.find((item) => item.classList.contains("is-on")) ||
      pair.find((item) => /contained|primary|active/.test(item.className)) ||
      pair[0];
    pair.forEach((item) => paintTab(item, item === active));
    bindTabs(pair);
  }

  sheet.querySelectorAll("input").forEach((input) => {
    let wrap = input.parentElement as HTMLElement | null;
    let field = wrap;
    for (let i = 0; i < 5 && wrap; i += 1) {
      if (wrap.offsetWidth > 180 && wrap.offsetHeight > 40) {
        field = wrap;
        break;
      }
      wrap = wrap.parentElement;
    }
    if (!field) return;
    field.classList.add("bd-pf-field");
    field.style.setProperty("background", PLATE, "important");
    field.style.setProperty("background-image", "none", "important");
    Array.from(field.querySelectorAll("div,span,button")).forEach((child) => {
      const el = child as HTMLElement;
      if (el === field) return;
      if (el.offsetWidth < field.offsetWidth - 24) {
        el.style.setProperty("background", "transparent", "important");
        el.style.setProperty("box-shadow", "none", "important");
      }
    });
    input.style.setProperty("background", "transparent", "important");
  });
}

function paintWell(el: HTMLElement, kind: "deposit" | "withdraw" | "history") {
  if (el.closest(".bd-pf-sheet") || el.classList.contains("bd-pf-tab")) return;
  el.classList.add("bd-pf-gold");
  el.style.setProperty("background", GOLD, "important");
  if (el.dataset.bdIcon === "1") return;
  el.querySelectorAll("svg").forEach((svg) => svg.remove());
  el.insertAdjacentHTML("afterbegin", ICONS[kind]);
  el.dataset.bdIcon = "1";
}

function tagPortfolio() {
  if (!window.location.pathname.includes("/portfolio")) return;
  paintSheet();
  Array.from(document.querySelectorAll("div,span,p,a,button")).forEach((node) => {
    const text = labelOf(node);
    if (text !== "deposit" && text !== "withdraw" && text !== "history") return;
    if ((node as HTMLElement).closest(".bd-pf-sheet")) return;
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
    if (well && !well.classList.contains("bd-pf-tab")) {
      paintWell(well, text as "deposit" | "withdraw" | "history");
    }
  });
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
