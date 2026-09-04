import { OverviewModule } from "@orderly.network/portfolio";
import { generatePageTitle } from "@/utils/utils";
import { getPageMeta } from "@/utils/seo";
import { renderSEOTags } from "@/utils/seo-tags";
import BuyUsdcCard from "@/components/portfolio/BuyUsdcCard";

export default function PortfolioIndex() {
  const pageMeta = getPageMeta();
  const pageTitle = generatePageTitle("Portfolio");

  return (
    <div className="oui-portfolio-page">
      {renderSEOTags(pageMeta, pageTitle)}
      <BuyUsdcCard />
      <OverviewModule.OverviewPage />
    </div>
  );
}
