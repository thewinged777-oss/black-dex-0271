import { OverviewModule } from "@orderly.network/portfolio";
import { generatePageTitle } from "@/utils/utils";
import { getPageMeta } from "@/utils/seo";
import { renderSEOTags } from "@/utils/seo-tags";
import { BlackEcosystemHeader } from "@/components/BlackEcosystemHeader";

export default function PortfolioIndex() {
  const pageMeta = getPageMeta();
  const pageTitle = generatePageTitle("Portfolio");

  return (
    <div className="black-dex-ecosystem-page black-dex-portfolio-page">
      {renderSEOTags(pageMeta, pageTitle)}
      <BlackEcosystemHeader
        eyebrow="BLACK DEX · ACCOUNT COMMAND CENTER"
        title="Portfolio"
        description="Monitor equity, positions, orders and account activity from one professional workspace."
        active="portfolio"
      />
      <div className="black-dex-ecosystem-module">
        <OverviewModule.OverviewPage />
      </div>
    </div>
  );
}
