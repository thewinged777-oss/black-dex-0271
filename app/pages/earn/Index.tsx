import { useEffect } from "react";
import { VaultsPage as VaultsPageComponent } from "@orderly.network/vaults";
import { generatePageTitle } from "@/utils/utils";
import { getPageMeta } from "@/utils/seo";
import { renderSEOTags } from "@/utils/seo-tags";

const ALLOWED_VAULTS = ["orderly omnivault", "smaug"];

function hideOtherVaultRows(root: Element) {
  const rows = root.querySelectorAll("tbody tr, [role='row']");
  rows.forEach((row) => {
    const text = (row.textContent || "").toLowerCase();
    if (!text.trim()) return;
    if (!/tvl|apy|usdc|deposit|withdraw|balance/i.test(text)) return;
    const keep = ALLOWED_VAULTS.some((name) => text.includes(name));
    (row as HTMLElement).style.display = keep ? "" : "none";
  });
}

function FilterOrderlyVaults() {
  useEffect(() => {
    const run = () => {
      const root = document.querySelector(".bd-earn-orderly");
      if (root) hideOtherVaultRows(root);
    };
    run();
    const root = document.querySelector(".bd-earn-orderly");
    const observer = new MutationObserver(run);
    if (root) observer.observe(root, { childList: true, subtree: true });
    const timer = window.setInterval(run, 700);
    return () => {
      observer.disconnect();
      window.clearInterval(timer);
    };
  }, []);
  return null;
}

export default function EarnIndex() {
  const pageMeta = getPageMeta();
  const pageTitle = generatePageTitle("Earn");

  return (
    <>
      {renderSEOTags(pageMeta, pageTitle)}
      <div className="bd-earn">
        <header className="bd-earn-hero">
          <span className="bd-earn-kicker">Earn</span>
          <h1>Earn passive yield with vault strategies</h1>
          <p className="bd-earn-lead">
            Put your idle or extra assets to work effortlessly. Deposit into
            curated vault strategies directly from Black DEX — using USDC from
            any supported blockchain or your Black DEX account, with no gas
            fees.
          </p>
        </header>

        <FilterOrderlyVaults />
        <div className="bd-earn-orderly">
          <VaultsPageComponent
            className="bd-earn-vaults-page"
            config={{ overallInfoBrokerIds: "orderly,thegangdex" }}
          />
        </div>
      </div>
    </>
  );
}
