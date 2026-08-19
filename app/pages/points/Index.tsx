import { generatePageTitle } from "@/utils/utils";
import { getPageMeta } from "@/utils/seo";
import { renderSEOTags } from "@/utils/seo-tags";
import { PointSystemPage } from "@orderly.network/trading-points";
import { getSymbol } from "@/utils/storage";
import { useNavigate } from "react-router-dom";
import { RouteOption } from "@orderly.network/types";

export default function PointsIndex() {
  const pageMeta = getPageMeta();
  const pageTitle = generatePageTitle("Black Season");
  const navigate = useNavigate();

  const onRouteChange = (pathObject: RouteOption) => {
    const path = pathObject.href;
    if (path && path === "/perp") {
      const symbol = getSymbol();
      navigate(`/perp/${symbol}`);
    }
  };

  return (
    <div className="black-dex-season-page">
      {renderSEOTags(pageMeta, pageTitle)}

      <section className="black-dex-season-hero">
        <div className="black-dex-season-kicker">BLACK DEX · TRADER PROGRAM</div>
        <div className="black-dex-season-title-row">
          <div>
            <h1>BLACK SEASON</h1>
            <p>Trade. Compete. Earn your place.</p>
          </div>
          <div className="black-dex-season-badge">SEASON I</div>
        </div>
        <div className="black-dex-season-grid">
          <div className="black-dex-season-card black-dex-season-card-primary">
            <span>YOUR TRADING ACTIVITY</span>
            <strong>REAL-TIME</strong>
            <small>Powered by your connected Orderly account</small>
          </div>
          <div className="black-dex-season-card">
            <span>REWARD ENGINE</span>
            <strong>POINTS</strong>
            <small>Track your points and progression below</small>
          </div>
          <div className="black-dex-season-card">
            <span>STATUS</span>
            <strong>LIVE</strong>
            <small>Keep trading to improve your standing</small>
          </div>
        </div>
      </section>

      <section className="black-dex-season-content">
        <div className="black-dex-season-section-head">
          <div>
            <span>BLACK REWARDS</span>
            <h2>Your points</h2>
          </div>
          <p>Live points data from the Orderly trading-points system.</p>
        </div>
        <div className="black-dex-season-orderly">
          <PointSystemPage onRouteChange={onRouteChange} />
        </div>
      </section>
    </div>
  );
}
