import { useEffect } from "react";
import { MarketsHomePage } from "@orderly.network/markets";
import { generatePageTitle } from "@/utils/utils";
import { getPageMeta } from "@/utils/seo";
import { getRuntimeConfig, getRuntimeConfigBoolean } from "@/utils/runtime-config";
import { renderSEOTags } from "@/utils/seo-tags";
import { useNavigate } from "react-router-dom";
import MarketsChrome from "@/components/markets/MarketsChrome";

function liftSearch(root: HTMLElement) {
  const input = root.querySelector(
    "input[type='search'], input[type='text'], [role='searchbox']",
  ) as HTMLInputElement | null;
  if (!input) return;
  input.placeholder = "Search the market";
  input.setAttribute("aria-label", "Search the market");

  let wrap = input.closest("div") as HTMLElement | null;
  let steps = 0;
  while (wrap && wrap.parentElement && wrap.parentElement !== root && steps < 6) {
    const box = wrap.getBoundingClientRect();
    if (box.width > 220 && box.height < 72) break;
    wrap = wrap.parentElement;
    steps += 1;
  }
  if (!wrap) return;
  wrap.classList.add("bd-markets-search");
  wrap.querySelectorAll("svg, img, i").forEach((node) => {
    (node as HTMLElement).style.display = "none";
  });
  if (root.firstElementChild !== wrap) {
    root.insertBefore(wrap, root.firstElementChild);
  }
}

function hideMarketsChrome() {
  const root = document.querySelector(".bd-markets-list") as HTMLElement | null;
  if (!root) return;
  liftSearch(root);

  const tabLike = Array.from(root.querySelectorAll("button, a, [role='tab']")) as HTMLElement[];
  const pageTabs = tabLike.filter((node) => {
    const text = (node.textContent || "").replace(/\s+/g, " ").trim();
    return text === "Markets" || text === "Funding";
  });
  pageTabs.forEach((node) => {
    node.style.display = "none";
  });
  const bar = pageTabs[0]?.parentElement as HTMLElement | undefined;
  if (bar && bar.childElementCount <= 4) {
    bar.style.display = "none";
  }

  const nodes = Array.from(root.querySelectorAll("div")) as HTMLElement[];
  const matches = nodes.filter((el) => {
    const text = (el.innerText || "").replace(/\s+/g, " ");
    return (
      text.includes("24h volume") &&
      text.includes("Open interest") &&
      text.includes("New listings") &&
      text.includes("Top gainers")
    );
  });
  if (matches.length) {
    const header = matches.sort((a, b) => a.innerText.length - b.innerText.length)[0];
    if (header && header.innerText.length < 5000) header.style.display = "none";
  }
}

export default function MarketsIndex() {
  const pageMeta = getPageMeta();
  const pageTitle = generatePageTitle("Markets");
  const navigate = useNavigate();

  useEffect(() => {
    hideMarketsChrome();
    const root = document.querySelector(".bd-markets-list");
    const observer = root
      ? new MutationObserver(() => hideMarketsChrome())
      : null;
    if (root && observer) observer.observe(root, { childList: true, subtree: true });
    const id = window.setInterval(hideMarketsChrome, 500);
    const stop = window.setTimeout(() => window.clearInterval(id), 10000);
    return () => {
      observer?.disconnect();
      window.clearInterval(id);
      window.clearTimeout(stop);
    };
  }, []);

  return (
    <>
      {renderSEOTags(pageMeta, pageTitle)}
      <div className="bd-markets-list">
        <MarketsHomePage
          comparisonProps={{
            exchangesIconSrc:
              getRuntimeConfigBoolean("VITE_HAS_SECONDARY_LOGO")
                ? "/logo-secondary.webp"
                : undefined,
            exchangesName:
              getRuntimeConfig("VITE_ORDERLY_BROKER_NAME"),
          }}
          onSymbolChange={(symbol) => {
            navigate(`/perp/${symbol.symbol}`);
          }}
        />
        <MarketsChrome />
      </div>
    </>
  );
}
