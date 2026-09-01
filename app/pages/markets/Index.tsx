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

function clickIf(root: Element, label: string) {
  const nodes = Array.from(root.querySelectorAll("button, a, [role='tab'], [role='button']"));
  const match = nodes.find((node) => textOf(node) === label) as HTMLElement | undefined;
  match?.click();
}

function tidyMarkets() {
  const root = document.querySelector(".bd-markets-list");
  if (!root) return;

  clickIf(root, "All markets");
  clickIf(root, "Crypto");
  clickIf(root, "All");
}

export default function MarketsIndex() {
  const pageMeta = getPageMeta();
  const pageTitle = generatePageTitle("Markets");
  const navigate = useNavigate();

  useEffect(() => {
    const start = window.setTimeout(tidyMarkets, 250);
    const again = window.setTimeout(tidyMarkets, 1200);
    return () => {
      window.clearTimeout(start);
      window.clearTimeout(again);
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
