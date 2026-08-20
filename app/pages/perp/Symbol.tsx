import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { API } from "@orderly.network/types";
import { TradingPage } from "@orderly.network/trading";
import { updateSymbol } from "@/utils/storage";
import { formatSymbol, generatePageTitle } from "@/utils/utils";
import { useOrderlyConfig } from "@/utils/config";
import { getPageMeta } from "@/utils/seo";
import { renderSEOTags } from "@/utils/seo-tags";

const BLACK_DEX_NAV = [
  { label: "Trade", href: "__TRADE__" },
  { label: "Swap", href: "/swap" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Markets", href: "/markets" },
  { label: "Leaderboards", href: "/leaderboard" },
  { label: "Rewards", href: "/rewards" },
  { label: "Vaults", href: "/vaults" },
  { label: "Points", href: "/points" },
] as const;

const terminalStyles = `
/* Black DEX premium terminal: presentation only. Orderly functionality and palette are preserved. */
.black-dex-terminal{background:#050505;color:#e5e5e5;min-height:100%;overflow:hidden}
.black-dex-terminal [class*="oui-trading-page"]{max-width:none!important;width:100%!important;background:#050505!important}
.black-dex-terminal [class*="oui-trading-page"]>div{min-width:0}

/* Premium workspace: remove default card feeling and use a single coherent terminal surface. */
.black-dex-terminal [class*="orderbook"],
.black-dex-terminal [class*="order-entry"],
.black-dex-terminal [class*="order-form"],
.black-dex-terminal [class*="oui-orderbook"],
.black-dex-terminal [class*="oui-order-entry"]{border-radius:0!important;box-shadow:none!important}

/* Chart remains the dominant visual workspace. */
.black-dex-terminal [class*="chart"],.black-dex-terminal [class*="Chart"]{min-width:0}
.black-dex-terminal [class*="oui-trading-view"],.black-dex-terminal [class*="trading-view"]{background:#050505!important}

/* Clean execution rail with consistent internal rhythm. */
.black-dex-terminal [class*="oui-order-entry"]{border-left:1px solid #242428!important;background:#0a0a0b}
.black-dex-terminal [class*="oui-order-entry"] button{min-height:40px;font-weight:700;border-radius:4px}
.black-dex-terminal [class*="oui-order-entry"] [role="tab"]{font-size:11px;font-weight:700;letter-spacing:.02em}
.black-dex-terminal [class*="oui-order-entry"] input{font-variant-numeric:tabular-nums}

/* Order book as a clean data column, not a separate floating card. */
.black-dex-terminal [class*="oui-orderbook"]{border-left:1px solid #18181b;background:#0a0a0b;font-variant-numeric:tabular-nums}
.black-dex-terminal [class*="oui-orderbook"] table{font-variant-numeric:tabular-nums}
.black-dex-terminal [class*="oui-orderbook"] [class*="ask"]{background:linear-gradient(90deg,transparent,rgba(239,68,68,.045))!important}
.black-dex-terminal [class*="oui-orderbook"] [class*="bid"]{background:linear-gradient(90deg,transparent,rgba(34,197,94,.045))!important}
.black-dex-terminal [class*="oui-orderbook"] [class*="row"]{min-height:22px}

/* Bottom account workspace: dense, professional and full width. */
.black-dex-terminal [class*="oui-position"],.black-dex-terminal [class*="position"],.black-dex-terminal [class*="orders"],.black-dex-terminal table{font-variant-numeric:tabular-nums}
.black-dex-terminal [class*="oui-position"]{border-top:1px solid #18181b}

/* Consistent controls; no decorative motion or extra product UI. */
.black-dex-terminal [class*="oui-button"]{transition:background .15s,border-color .15s,color .15s!important}
.black-dex-terminal [class*="oui-button"]:hover{transform:none!important}
.black-dex-terminal button{font-weight:650}
.black-dex-terminal input,.black-dex-terminal select{border-radius:4px!important}

/* Desktop: Black DEX navigation is inserted into the existing Orderly header,
   immediately after the secondary logo. It is not a separate bar or overlay. */
.black-dex-header-nav{display:flex;align-items:center;gap:2px;margin-left:8px;min-width:0;flex:1;height:100%;overflow:hidden}
.black-dex-header-nav a{display:inline-flex;align-items:center;justify-content:center;height:32px;padding:0 10px;border:1px solid transparent;border-radius:7px;color:#8d8d95;text-decoration:none;font-size:11px;font-weight:750;letter-spacing:.01em;white-space:nowrap;transition:background .15s ease,color .15s ease,border-color .15s ease}
.black-dex-header-nav a:hover{color:#f2f2f3;background:rgba(255,255,255,.035)}
.black-dex-header-nav a[data-black-active="true"]{color:#f5d678;background:rgba(212,175,55,.09);border-color:rgba(212,175,55,.2);box-shadow:inset 0 1px rgba(245,214,120,.08)}
.black-dex-header-nav a[data-black-priority="true"]{font-weight:850}

/* Native mobile bottom navigation: premium treatment without creating a second menu. */
.black-dex-mobile-nav-item{position:relative!important;min-height:44px!important;border-radius:9px!important;transition:background .15s ease,color .15s ease!important}
.black-dex-mobile-nav-item::before{content:"";width:4px;height:4px;border-radius:50%;background:#d4af37;display:inline-block;margin-right:5px;vertical-align:middle;box-shadow:0 0 6px rgba(212,175,55,.3)}
.black-dex-mobile-nav-item[data-black-active="true"]{color:#f5d678!important;background:rgba(212,175,55,.075)!important}

/* True/false controls only. These selectors are deliberately scoped to
   switch-like controls so order buttons are not accidentally resized. */
.black-dex-terminal .black-dex-compact-toggle{min-height:22px!important;height:22px!important;padding:0 6px!important;border-radius:6px!important;gap:4px!important;font-size:9px!important;font-weight:750!important;line-height:1!important;background:rgba(255,255,255,.025)!important;border:1px solid rgba(255,255,255,.07)!important;box-shadow:none!important}
.black-dex-terminal .black-dex-compact-toggle-control{transform:scale(.62)!important;transform-origin:center!important}
.black-dex-terminal .black-dex-compact-toggle[data-state="checked"],.black-dex-terminal .black-dex-compact-toggle[aria-checked="true"],.black-dex-terminal .black-dex-compact-toggle.is-active{border-color:rgba(212,175,55,.3)!important;background:rgba(212,175,55,.09)!important;color:#f5d678!important}

/* Account tabs: TP/SL tab is styled exactly like the surrounding tabs,
   separately from the TP/SL order-placement switch. */
.black-dex-account-tab{height:30px!important;min-height:30px!important;padding:0 10px!important;border-radius:6px!important;background:transparent!important;border:1px solid transparent!important;color:#8c8c94!important;font-size:10px!important;font-weight:750!important;line-height:1!important}
.black-dex-account-tab:hover{color:#e8e8ea!important;background:rgba(255,255,255,.035)!important}
.black-dex-account-tab[aria-selected="true"],.black-dex-account-tab[data-state="active"],.black-dex-account-tab[data-active="true"]{color:#f5d678!important;background:rgba(212,175,55,.09)!important;border-color:rgba(212,175,55,.18)!important}

/* Make the terminal use the available viewport instead of creating a compressed canvas. */
@media(min-width:768px){
  .black-dex-terminal [class*="oui-order-entry"]{min-width:300px;width:clamp(300px,24vw,360px)}
  .black-dex-terminal [class*="oui-orderbook"]{min-width:250px;width:clamp(250px,20vw,310px)}
  .black-dex-terminal [class*="oui-trading-view"]{min-width:0;flex:1 1 auto}
}

@media(max-width:767px){
  .black-dex-terminal{padding-bottom:0}
  .black-dex-terminal [class*="oui-trading-page"]{width:100%!important}
  .black-dex-terminal [class*="oui-order-entry"]{border-left:0!important;border-top:1px solid #18181b;background:#0a0a0b}
  .black-dex-terminal [class*="oui-order-entry"] button{min-height:44px}
  .black-dex-terminal [class*="oui-orderbook"]{border-left:0;border-top:1px solid #18181b;max-height:none;overflow:auto}
  .black-dex-terminal [class*="oui-position"]{border-top:1px solid #18181b}
  .black-dex-terminal [class*="oui-trading-view"],.black-dex-terminal [class*="trading-view"]{min-height:320px}
  .black-dex-terminal table{font-size:11px}
  .black-dex-header-nav{display:none!important}
}
`;

const normalizedText = (node: Element) =>
  (node.textContent || "").replace(/\s+/g, " ").trim();

function findSmallestAncestorWithText(start: Element, text: string, maxDepth = 7) {
  let current: Element | null = start;
  for (let depth = 0; current && depth < maxDepth; depth += 1) {
    const content = normalizedText(current);
    if (content.includes(text)) return current;
    current = current.parentElement;
  }
  return null;
}

function compactOrderControls(root: HTMLElement) {
  const toggleNames = ["TP/SL", "Reduce only", "Post only", "FOK", "IOC", "Hidden", "Reverse"];
  const candidates = root.querySelectorAll("[role='switch'], input[type='checkbox'], label, button, [role='button']");

  candidates.forEach((node) => {
    const text = normalizedText(node);
    const label = toggleNames.find(
      (name) => text === name || text.startsWith(`${name} `) || text.endsWith(` ${name}`),
    );
    if (!label) return;

    const switchControl = node.matches("[role='switch'], input[type='checkbox'], label") ||
      !!node.querySelector("[role='switch'], input[type='checkbox']");
    const reverseSwitch = label === "Reverse" && (
      node.matches("[role='switch'], input[type='checkbox']") ||
      !!node.querySelector("[role='switch'], input[type='checkbox']")
    );

    if (switchControl || reverseSwitch) {
      node.classList.add("black-dex-compact-toggle");
      node.querySelector("[role='switch'], input[type='checkbox']")?.classList.add("black-dex-compact-toggle-control");
    }
  });

  root.querySelectorAll("button, [role='tab'], a").forEach((node) => {
    if (normalizedText(node) !== "TP/SL") return;
    const nearby = findSmallestAncestorWithText(node, "Positions", 6);
    if (nearby && normalizedText(nearby).includes("Pending") && normalizedText(nearby).includes("History")) {
      node.classList.add("black-dex-account-tab");
    }
  });
}

function integrateBlackDexHeader(root: HTMLElement, symbol: string) {
  const existing = root.querySelector<HTMLElement>(".black-dex-header-nav");
  if (existing) return;

  const headerConnect = Array.from(root.querySelectorAll("button, [role='button'], a")).find(
    (node) => /^connect$/i.test(normalizedText(node)),
  );
  if (!headerConnect) return;

  let header: HTMLElement | null = headerConnect.parentElement;
  for (let i = 0; header && i < 8; i += 1) {
    const rect = header.getBoundingClientRect();
    if (rect.height >= 40 && rect.height <= 100 && rect.top >= -5 && rect.top < 140) break;
    header = header.parentElement;
  }
  if (!header) return;

  const images = Array.from(header.querySelectorAll("img"));
  const secondaryLogo = images.find((img) => {
    const source = `${img.getAttribute("src") || ""} ${img.getAttribute("alt") || ""} ${img.getAttribute("title") || ""}`.toLowerCase();
    return source.includes("secondary") || source.includes("logo-secondary");
  }) || images.find((img) => {
    const rect = img.getBoundingClientRect();
    return rect.width > 15 && rect.width < 180 && rect.height > 10 && rect.height < 80;
  });

  const nav = document.createElement("nav");
  nav.className = "black-dex-header-nav";
  nav.setAttribute("aria-label", "Black DEX navigation");

  BLACK_DEX_NAV.forEach(({ label, href }) => {
    const link = document.createElement("a");
    link.textContent = label;
    link.href = href === "__TRADE__" ? `/perp/${encodeURIComponent(symbol)}` : href;
    link.dataset.blackPriority = ["Trade", "Markets", "Portfolio", "Leaderboards"].includes(label) ? "true" : "false";
    const currentPath = window.location.pathname;
    const targetPath = new URL(link.href, window.location.origin).pathname;
    link.dataset.blackActive = currentPath === targetPath ? "true" : "false";
    nav.appendChild(link);
  });

  if (secondaryLogo?.parentElement) {
    secondaryLogo.parentElement.insertAdjacentElement("afterend", nav);
  } else {
    header.insertBefore(nav, headerConnect);
  }

  // Remove only the native mobile menu trigger on small screens. The navigation
  // itself is not recreated on mobile; native Orderly mobile navigation remains.
  const hideMobileMenu = () => {
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    if (!isMobile) return;
    const logoRect = secondaryLogo?.getBoundingClientRect();
    const headerButtons = Array.from(header.querySelectorAll("button")).filter((button) => {
      const rect = button.getBoundingClientRect();
      return rect.width >= 20 && rect.width <= 60 && rect.height >= 20 && rect.height <= 60;
    });
    const menuButton = headerButtons.find((button) => {
      const rect = button.getBoundingClientRect();
      return !normalizedText(button) && (!logoRect || rect.left < logoRect.left);
    });
    if (menuButton) menuButton.classList.add("black-dex-mobile-menu-hidden");
  };

  hideMobileMenu();
  window.addEventListener("resize", hideMobileMenu);
  nav.dataset.blackCleanup = "resize-listener";
}

function premiumizeMobileNativeNav(root: HTMLElement) {
  if (!window.matchMedia("(max-width: 767px)").matches) return;
  const labels = new Set(["Trade", "Portfolio", "Markets", "Leaderboard", "Leaderboards"]);
  root.querySelectorAll("a, button, [role='button']").forEach((node) => {
    const text = normalizedText(node);
    if (!labels.has(text)) return;
    const rect = node.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.7) return;
    node.classList.add("black-dex-mobile-nav-item");
    if (text === "Trade" && window.location.pathname.startsWith("/perp/")) node.dataset.blackActive = "true";
  });
}

export default function PerpSymbol() {
  const params = useParams();
  const [symbol, setSymbol] = useState(params.symbol!);
  const config = useOrderlyConfig();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    updateSymbol(symbol);
  }, [symbol]);

  const onSymbolChange = useCallback(
    (data: API.Symbol) => {
      const nextSymbol = data.symbol;
      setSymbol(nextSymbol);
      const searchParamsString = searchParams.toString();
      const queryString = searchParamsString ? `?${searchParamsString}` : "";
      navigate(`/perp/${nextSymbol}${queryString}`);
    },
    [navigate, searchParams],
  );

  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".black-dex-terminal");
    if (!root) return;

    let frame = 0;
    let attempts = 0;
    const apply = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        integrateBlackDexHeader(root, symbol);
        compactOrderControls(root);
        premiumizeMobileNativeNav(root);
      });
    };

    const interval = window.setInterval(() => {
      apply();
      attempts += 1;
      if (root.querySelector(".black-dex-header-nav") && attempts > 4) window.clearInterval(interval);
      if (attempts > 20) window.clearInterval(interval);
    }, 300);

    const observer = new MutationObserver(apply);
    observer.observe(root, { childList: true, subtree: true });
    apply();

    return () => {
      window.clearInterval(interval);
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [symbol]);

  const pageMeta = getPageMeta();
  const pageTitle = generatePageTitle(formatSymbol(params.symbol!));

  return (
    <div className="black-dex-terminal h-full">
      <style>{terminalStyles}{`.black-dex-mobile-menu-hidden{display:none!important}`}</style>
      {renderSEOTags(pageMeta, pageTitle)}
      <TradingPage
        symbol={symbol}
        onSymbolChange={onSymbolChange}
        tradingViewConfig={config.tradingPage.tradingViewConfig}
        sharePnLConfig={config.tradingPage.sharePnLConfig}
      />
    </div>
  );
}
