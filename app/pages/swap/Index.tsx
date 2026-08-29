import { generatePageTitle } from "@/utils/utils";
import { getPageMeta } from "@/utils/seo";
import { renderSEOTags } from "@/utils/seo-tags";
import { lazy, Suspense, useCallback, useState } from "react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import SwapTokenIntel from "@/components/swap/SwapTokenIntel";
import SwapChart from "@/components/swap/SwapChart";

const WooFiWidget = lazy(() => import("@/components/WooFiWidget"));

export default function SwapIndex() {
  const pageMeta = getPageMeta();
  const pageTitle = generatePageTitle("Swap");
  const [chartUrl, setChartUrl] = useState<string | null>(null);
  const [chartLabel, setChartLabel] = useState("Pair chart");

  const onChartPair = useCallback((pairUrl: string | null, label: string) => {
    setChartUrl(pairUrl);
    setChartLabel(label);
  }, []);

  return (
    <>
      {renderSEOTags(pageMeta, pageTitle)}
      <div className="bd-swap-page">
        <div className="bd-swap-widget">
          <div className="bd-swap-intel-kicker">
            <span>Swap</span>
            <p>Ticket for the pair. Route and quote come from WooFi.</p>
          </div>
          <Suspense fallback={<LoadingSpinner />}>
            <WooFiWidget />
          </Suspense>
        </div>
        <SwapTokenIntel onChartPair={onChartPair} />
        <SwapChart pairUrl={chartUrl} label={chartLabel} />
      </div>
    </>
  );
}
