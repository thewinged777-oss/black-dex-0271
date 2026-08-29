import { generatePageTitle } from "@/utils/utils";
import { getPageMeta } from "@/utils/seo";
import { renderSEOTags } from "@/utils/seo-tags";
import HomeDesk from "@/components/home/HomeDesk";

export default function HomeIndex() {
  const pageMeta = getPageMeta();
  const pageTitle = generatePageTitle("Home");

  return (
    <>
      {renderSEOTags(pageMeta, pageTitle)}
      <HomeDesk />
    </>
  );
}
