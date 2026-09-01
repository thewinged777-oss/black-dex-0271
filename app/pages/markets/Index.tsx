import { useEffect } from "react";
import { MarketsHomePage } from "@orderly.network/markets";
import { generatePageTitle } from "@/utils/utils";
import { getPageMeta } from "@/utils/seo";
import { getRuntimeConfig, getRuntimeConfigBoolean } from "@/utils/runtime-config";
import { renderSEOTags } from "@/utils/seo-tags";
import { useNavigate } from "react-router-dom";
import MarketsChrome from "@/components/markets/MarketsChrome";
import MarketsSearch from "@/components/markets/MarketsSearch";

function hideMarketsChrome() {
  const root = document.querySelector(".bd-markets-list") as HTMLElement | null;
  if (!root) return;

  const tabLike = Array.from(root.querySelectorAll("button, a, [role='tab']")) as HTMLElement[];
  const pageTabs = tabLike.filter((node) => {
    const text = (node.textContent || "").replace(/\s+/g, " ").trim();
    return text === "Markets" || text === "Funding";
  });
  pageTabs.forEach((node) => {
    node.style.display = "none";
  });
}

export default function MarketsIndex() {
  const pageMeta = getPageMeta();
  const pageTitle = generatePageTitle("Markets");
  const navigate = useNavigate();

  useEffect(() => {
    hideMarketsChrome();
    const id = window.setInterval(hideMarketsChrome, 800);
    const stop = window.setTimeout(() => window.clearInterval(id), 6000);
    return () => {
      window.clearInterval(id);
      window.clearTimeout(stop);
    };
  }, []);

  return (
    <>
      {renderSEOTags(pageMeta, pageTitle)}
      <div className="bd-markets-list">
        <MarketsSearch />
        <MarketsChrome />
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
