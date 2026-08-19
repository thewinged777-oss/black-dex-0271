import { MarketsHomePage } from "@orderly.network/markets";
import { generatePageTitle } from "@/utils/utils";
import { getPageMeta } from "@/utils/seo";
import { getRuntimeConfig, getRuntimeConfigBoolean } from "@/utils/runtime-config";
import { renderSEOTags } from "@/utils/seo-tags";
import { useNavigate } from "react-router-dom";
import { BlackEcosystemHeader } from "@/components/BlackEcosystemHeader";

export default function MarketsIndex() {
  const pageMeta = getPageMeta();
  const pageTitle = generatePageTitle("Markets");
  const navigate = useNavigate();

  return (
    <div className="black-dex-ecosystem-page black-dex-markets-page">
      {renderSEOTags(pageMeta, pageTitle)}
      <BlackEcosystemHeader
        eyebrow="BLACK DEX · MARKET DISCOVERY"
        title="Markets"
        description="Find the markets that matter with live Orderly market data and direct access to the professional terminal."
        active="markets"
      />
      <div className="black-dex-ecosystem-module">
        <MarketsHomePage
          comparisonProps={{
            exchangesIconSrc:
              getRuntimeConfigBoolean("VITE_HAS_SECONDARY_LOGO") ? "/logo-secondary.webp" : undefined,
            exchangesName: getRuntimeConfig("VITE_ORDERLY_BROKER_NAME"),
          }}
          onSymbolChange={(symbol) => navigate(`/perp/${symbol.symbol}`)}
        />
      </div>
    </div>
  );
}
