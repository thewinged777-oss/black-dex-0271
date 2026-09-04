import { useEffect } from "react";

const GOLD = "rgb(var(--oui-color-primary))";
const PLATE = "rgb(var(--oui-color-base-8))";
const MUTED = "rgb(var(--oui-color-base-7))";
const INK = "rgb(var(--oui-color-primary-contrast))";
const FG = "rgb(var(--oui-color-base-foreground))";
const LINE = "1px solid rgb(var(--oui-color-line))";

let selected: "deposit" | "withdraw" = "deposit";

const ICONS: Record<string, string> = {
  deposit:
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 4.2v10.2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M8.2 11.2 12 15l3.8-3.8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><path d="M5.2 19.2h13.6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
  withdraw:
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 19.8V9.6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M8.2 12.8 12 9l3.8 3.8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><path d="M5.2 4.8h13.6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
  history:
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="7.2" stroke="currentColor" stroke-width="1.7"/><path d="M12 8.2V12l2.6 1.6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
};

function path() {
  return window.location.pathname.toLowerCase();
}

function isHistoryPage() {
  return /history/.test(path()) || document.body.innerText.includes("No results found");
}

function isOverview() {
  return /\/portfolio\/?$/.test(path()) && !isHistoryPage();
}

function labelOf(el: Element) {
  return (el.textContent || "").replace(/\s+/g, " ").trim().toLowerCase();
}

function rgbChannels(color: string) {
  const match = color.match(/rgba?\((\d+)[,\s]+(\d+)[,\s]+(\d+)/i);
  if (!match) return null;
  return [Number(match[1]), Number(match[2]), Number(match[3])] as const;
}

function isSaturated(color: string) {
  const rgb = rgbChannels(color);
  if (!rgb) return false;
  const [r, g, b] = rgb;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return max - min > 40 && max > 60;
}

function flattenChainChrome(el: HTMLElement) {
  const style = window.getComputedStyle(el);
  if (isSaturated(style.borderTopColor) || isSaturated(style.borderColor) || isSaturated(style.outlineColor)) {
    el.style.setProperty("border-color", "transparent", "important");
    el.style.setProperty("outline", "none", "important");
    el.style.setProperty("box-shadow", "none", "important");
  }
  if (isSaturated(style.backgroundColor) && !el.classList.contains("bd-pf-gold") && !el.classList.contains("bd-buy-usdc-cta")) {
    el.style.setProperty("background", "transparent", "important");
    el.style.setProperty("background-image", "none", "important");
  }
}

function paintValueCard() {
  if (!isOverview()) return;
  const labels = Array.from(document.querySelectorAll("div,span,p")).filter((node) =>
    /^portfolio value/i.test((node.textContent || "").trim()),
  );
  labels.forEach((label) => {
    let card = label.parentElement as HTMLElement | null;
    let found: HTMLElement | null = null;
    for (let i = 0; i < 10 && card; i += 1) {
      const tall = card.offsetHeight >= 72 && card.offsetWidth >= 160;
      if (tall) {
        found = card;
        break;
      }
      card = card.parentElement;
    }
    if (!found) return;
    found.classList.add("bd-pf-value");
    found.style.setProperty("background", "transparent", "important");
    found.style.setProperty("background-image", "none", "important");
    found.style.setProperty("border", "0", "important");
    found.style.setProperty("box-shadow", "none", "important");
    found.style.setProperty("color", FG, "important");
    paintHero(found);
  });
}

function paintHero(value: HTMLElement) {
  let wrap = value.parentElement as HTMLElement | null;
  let hero: HTMLElement | null = null;
  for (let i = 0; i < 8 && wrap; i += 1) {
    const text = (wrap.textContent || "").replace(/\s+/g, " ");
    const hasAddr = /\b[0-9a-z]{3,6}\.\.\.[0-9a-z]{3,6}\b/i.test(text);
    const hasValue = /portfolio value/i.test(text);
    if (hasAddr && hasValue && wrap.offsetHeight >= 110) {
      hero = wrap;
      break;
    }
    wrap = wrap.parentElement;
  }
  if (!hero) hero = value;
  hero.classList.add("bd-pf-hero");
  hero.style.setProperty("background", PLATE, "important");
  hero.style.setProperty("background-image", "none", "important");
  hero.style.setProperty("border", LINE, "important");
  hero.style.setProperty("border-radius", "14px", "important");
  hero.style.setProperty("box-shadow", "none", "important");
  hero.querySelectorAll("div,span,p,button,a").forEach((node) => {
    const el = node as HTMLElement;
    if (el.classList.contains("bd-pf-gold") || el.classList.contains("bd-buy-usdc") || el.closest(".bd-buy-usdc")) return;
    flattenChainChrome(el);
    const text = labelOf(el);
    if (/\b[0-9a-z]{3,6}\.\.\.[0-9a-z]{3,6}\b/i.test(text) || text.includes("solana") || text.includes("evm") || text.includes("arbitrum") || text.includes("base")) {
      el.classList.add("bd-pf-addr");
      el.style.setProperty("background", "transparent", "important");
      el.style.setProperty("border", "0", "important");
    }
  });
}

function clearGold(el: HTMLElement) {
  el.classList.remove("bd-pf-gold");
  el.style.removeProperty("background");
  el.style.removeProperty("width");
  el.style.removeProperty("height");
  el.style.removeProperty("min-width");
  el.style.removeProperty("min-height");
}

function paintTab(button: HTMLElement, on: boolean) {
  button.classList.remove("bd-pf-gold");
  button.classList.add("bd-pf-tab");
  button.classList.toggle("is-on", on);
  button.style.setProperty("width", "auto", "important");
  button.style.setProperty("min-width", "108px", "important");
  button.style.setProperty("height", "36px", "important");
  button.style.setProperty("background", on ? GOLD : MUTED, "important");
  button.style.setProperty("color", on ? INK : FG, "important");
}

function kindOf(el: Element): "deposit" | "withdraw" | null {
  const text = labelOf(el);
  if (text.includes("withdraw")) return "withdraw";
  if (text.includes("deposit") && !text.includes("deposits")) return "deposit";
  return null;
}

function applySelected() {
  const tabs = Array.from(document.querySelectorAll(".bd-pf-sheet button")) as HTMLElement[];
  const pair = tabs.filter((button) => kindOf(button));
  pair.forEach((button) => paintTab(button, kindOf(button) === selected));
}

function onPointer(event: Event) {
  const button = (event.target as HTMLElement | null)?.closest("button") as HTMLElement | null;
  if (!button || !button.closest(".bd-pf-sheet")) return;
  const kind = kindOf(button);
  if (!kind) return;
  selected = kind;
  applySelected();
}

function paintSheet() {
  const sheet = Array.from(document.querySelectorAll("div")).find((node) => {
    const text = (node.textContent || "").replace(/\s+/g, " ");
    return text.includes("Quantity") && text.includes("Deposit") && text.includes("Withdraw") && (node as HTMLElement).offsetHeight > 160;
  }) as HTMLElement | undefined;
  if (!sheet) return;
  sheet.classList.add("bd-pf-sheet");
  applySelected();
  sheet.querySelectorAll("input").forEach((input) => {
    const field = input.parentElement as HTMLElement | null;
    if (!field) return;
    field.classList.add("bd-pf-field");
    field.style.setProperty("background", PLATE, "important");
  });
}

function paintWell(el: HTMLElement, kind: "deposit" | "withdraw" | "history") {
  if (!isOverview()) return;
  if (el.closest(".bd-pf-sheet") || el.classList.contains("bd-pf-tab")) return;
  if (el.offsetWidth > 72 || el.offsetHeight > 72) return;
  el.classList.add("bd-pf-gold");
  el.style.setProperty("background", GOLD, "important");
  if (el.dataset.bdIcon === "1") return;
  el.querySelectorAll("svg").forEach((svg) => svg.remove());
  el.insertAdjacentHTML("afterbegin", ICONS[kind]);
  el.dataset.bdIcon = "1";
}

function unpaintHistory() {
  if (!isHistoryPage()) return;
  document.querySelectorAll(".bd-pf-gold").forEach((node) => clearGold(node as HTMLElement));
}

function tagPortfolio() {
  if (!path().includes("/portfolio")) return;
  unpaintHistory();
  if (isHistoryPage()) return;
  paintSheet();
  paintValueCard();
  if (!isOverview()) return;
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
    const id = window.setInterval(tagPortfolio, 700);
    document.addEventListener("pointerdown", onPointer, true);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("pointerdown", onPointer, true);
    };
  }, []);
  return null;
}
