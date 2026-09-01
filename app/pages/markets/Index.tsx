import { useEffect } from "react";
import { MarketsHomePage } from "@orderly.network/markets";
import { generatePageTitle } from "@/utils/utils";
import { getPageMeta } from "@/utils/seo";
import { getRuntimeConfig, getRuntimeConfigBoolean } from "@/utils/runtime-config";
import { renderSEOTags } from "@/utils/seo-tags";
import { useNavigate } from "react-router-dom";

function textOf(el: Element) {
  return (el.textContent || "").replace(/\s+/g, " ").trim();
}

function lineUpTabs() {
  const root = document.querySelector(".bd-markets-list");
  if (!root) return;

  root.querySelectorAll("button, a, [role='tab']").forEach((node) => {
    const label = textOf(node);
    if (label === "L1" || label === "MEME" || label === "DEX" || label === "Markets" || label === "Funding") {
      (node as HTMLElement).style.display = "none";
    }
  });

  const buttons = Array.from(root.querySelectorAll("button, [role='tab'], [role='button']")) as HTMLElement[];
  const allMarkets = buttons.find((node) => textOf(node) === "All markets");
  const prelaunch = buttons.find((node) => textOf(node) === "Pre-launch");
  if (!allMarkets || !prelaunch) return;

  let row: HTMLElement | null = allMarkets.parentElement;
  while (row && row !== root) {
    if (row.contains(prelaunch) && row.contains(allMarkets)) break;
    row = row.parentElement;
  }
  if (!row) return;

  row.classList.add("bd-markets-tabrow");
  row.style.display = "flex";
  row.style.flexWrap = "nowrap";
  row.style.overflowX = "auto";
  row.style.overflowY = "hidden";
  row.style.gap = "8px";
  row.style.whiteSpace = "nowrap";
  row.style.webkitOverflowScrolling = "touch";
}

export default function MarketsIndex() {
  const pageMeta = getPageMeta();
  const pageTitle = generatePageTitle("Markets");
  const navigate = useNavigate();

  useEffect(() => {
    lineUpTabs();
    const first = window.setTimeout(lineUpTabs, 200);
    const second = window.setTimeout(lineUpTabs, 900);
    return () => {
      window.clearTimeout(first);
      window.clearTimeout(second);
    };
  }, []);

  return (
    <>
      {renderSEOTags(pageMeta, pageTitle)}
      <div className="bd-markets-list">
        <MarketsHomePage
          comparisonProps={{
            exchangesIconSrc: getRuntimeConfigBoolean("VITE_HAS_SECONDARY_LOGO")
              ? "/logo-secondary.webp"
              : undefined,
            exchangesName: getRuntimeConfig("VITE_ORDERLY_BROKER_NAME"),
          }}
          onSymbolChange={(symbol) => {
            navigate(`/perp/${symbol.symbol}`);
          }}
        />
      </div>
    </>
  );
}
