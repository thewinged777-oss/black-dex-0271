import { generatePageTitle } from "@/utils/utils";
import { getPageMeta } from "@/utils/seo";
import { renderSEOTags } from "@/utils/seo-tags";
import MarketsDesk from "@/components/markets/MarketsDesk";

export default function MarketsIndex() {
  const pageMeta = getPageMeta();
  const pageTitle = generatePageTitle("Markets");

  return (
    <>
      {renderSEOTags(pageMeta, pageTitle)}
      <MarketsDesk />
    </>
  );
}
