import { generatePageTitle } from "@/utils/utils";
import { getPageMeta } from "@/utils/seo";
import { renderSEOTags } from "@/utils/seo-tags";
import FundingDesk from "@/components/desk/FundingDesk";

export default function DeskIndex() {
  const pageMeta = getPageMeta();
  const pageTitle = generatePageTitle("Funding Desk");

  return (
    <>
      {renderSEOTags(pageMeta, pageTitle)}
      <FundingDesk />
    </>
  );
}
