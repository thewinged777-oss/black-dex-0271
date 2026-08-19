import { GeneralLeaderboardWidget } from "@orderly.network/trading-leaderboard";
import { generatePageTitle } from "@/utils/utils";
import { getPageMeta } from "@/utils/seo";
import { renderSEOTags } from "@/utils/seo-tags";
import { BlackEcosystemHeader } from "@/components/BlackEcosystemHeader";

export default function LeaderboardIndex() {
  const pageMeta = getPageMeta();
  const pageTitle = generatePageTitle("Leaderboard");

  return (
    <div className="black-dex-ecosystem-page black-dex-leaderboard-page">
      {renderSEOTags(pageMeta, pageTitle)}
      <BlackEcosystemHeader
        eyebrow="BLACK DEX · COMPETITION"
        title="Leaderboard"
        description="Compete on real trading performance. Rankings remain powered by the connected Orderly leaderboard system."
        active="leaderboard"
      />
      <div className="black-dex-leaderboard-intro">
        <div><span>BLACK SEASON</span><strong>TRADE. COMPETE. EARN YOUR PLACE.</strong></div>
        <div className="black-dex-leaderboard-badge">LIVE DATA</div>
      </div>
      <div className="black-dex-ecosystem-module">
        <GeneralLeaderboardWidget />
      </div>
    </div>
  );
}
