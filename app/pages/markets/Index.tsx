import { useEffect } from "react";
import { MarketsHomePage } from "@orderly.network/markets";
import { generatePageTitle } from "@/utils/utils";
import { getPageMeta } from "@/utils/seo";
import { getRuntimeConfig, getRuntimeConfigBoolean } from "@/utils/runtime-config";
import { renderSEOTags } from "@/utils/seo-tags";
import { useNavigate } from "react-router-dom";

function hideMarketsChrome() {
  const root = document.querySelector(".bd-markets-list") as HTMLElement | null;
  if (!root) return;

  const tabLike = Array.from(root.querySelectorAll("button, a, [role='tab']")) as HTMLElement[];
  tabLike.forEach((node) => {
    const text = (node.textContent || "").replace(/\s+/g, " ").trim();
    if (text === "Markets" || text === "Funding") node.style.display = "none";
  });

  const nodes = Array.from(root.querySelectorAll("div")) as HTMLElement[];
  const matches = nodes.filter((el) => {
    const text = (el.innerText || "").replace(/\s+/g, " ");
    return (
      text.includes("24h volume") &&
      text.includes("Open interest") &&
      (text.includes("New listings") || text.includes("Top gainers"))
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
    const id = window.setInterval(hideMarketsChrome, 700);
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
