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

  const all = Array.from(root.querySelectorAll("*")) as HTMLElement[];
  const overview = all.find((el) => {
    const text = (el.textContent || "").replace(/\s+/g, " ");
    return (
      text.includes("24h volume") &&
      text.includes("Open interest") &&
      text.includes("New listings")
    );
  });
  if (overview) {
    let node: HTMLElement | null = overview;
    let best = overview;
    while (node && node !== root) {
      const text = (node.textContent || "").replace(/\s+/g, " ");
      if (
        text.includes("24h volume") &&
        text.includes("New listings") &&
        text.includes("Top gainers") &&
        node.innerText.length < 2500
      ) {
        best = node;
      }
      node = node.parentElement;
    }
    best.style.display = "none";
  }
}

export default function MarketsIndex() {
  const pageMeta = getPageMeta();
  const pageTitle = generatePageTitle("Markets");
  const navigate = useNavigate();

  useEffect(() => {
    hideMarketsChrome();
    const id = window.setInterval(hideMarketsChrome, 400);
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
