import { useEffect } from "react";
import { MarketsHomePage } from "@orderly.network/markets";
import { generatePageTitle } from "@/utils/utils";
import { getPageMeta } from "@/utils/seo";
import { getRuntimeConfig, getRuntimeConfigBoolean } from "@/utils/runtime-config";
import { renderSEOTags } from "@/utils/seo-tags";
import { useNavigate } from "react-router-dom";

export default function MarketsIndex() {
  const pageMeta = getPageMeta();
  const pageTitle = generatePageTitle("Markets");
  const navigate = useNavigate();

  useEffect(() => {
    const hideFundingTabs = () => {
      const root = document.querySelector(".bd-markets-list");
      if (!root) return;
      const nodes = Array.from(root.querySelectorAll("button, a, [role='tab']"));
      const pair = nodes.filter((node) => {
        const text = (node.textContent || "").replace(/\s+/g, " ").trim();
        return text === "Markets" || text === "Funding";
      });
      pair.forEach((node) => {
        (node as HTMLElement).style.display = "none";
      });
      const parent = pair[0]?.parentElement as HTMLElement | undefined;
      if (parent && parent.childElementCount <= 4) {
        parent.style.display = "none";
      }
    };
    hideFundingTabs();
    const id = window.setInterval(hideFundingTabs, 400);
    const stop = window.setTimeout(() => window.clearInterval(id), 8000);
    return () => {
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
      </div>
    </>
  );
}
