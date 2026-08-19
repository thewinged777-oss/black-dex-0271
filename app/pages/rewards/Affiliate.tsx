import { Helmet } from "react-helmet-async";
import { generatePageTitle } from "@/utils/utils";
import { Dashboard, ReferralProvider } from "@orderly.network/affiliate";
import { getRuntimeConfig } from "@/utils/runtime-config";
import { BlackEcosystemHeader } from "@/components/BlackEcosystemHeader";

export default function RewardsAffiliate() {
  const brokerName = getRuntimeConfig("VITE_ORDERLY_BROKER_NAME");
  const referralLinkUrl = typeof window !== "undefined" ? window.location.origin : "https://black-dex.online";

  return (
    <div className="black-dex-ecosystem-page black-dex-affiliate-page">
      <Helmet><title>{generatePageTitle("Affiliate")}</title></Helmet>
      <BlackEcosystemHeader
        eyebrow="BLACK DEX · PARTNER NETWORK"
        title="Black Affiliate"
        description="Turn referred trading activity into a measurable partner business with Orderly-powered referral infrastructure."
        active="affiliate"
      />
      <section className="black-dex-affiliate-hero">
        <div>
          <span>PARTNER PROGRAM</span>
          <h2>55% FEE SHARE</h2>
          <p>Designed for traders, communities, creators and partners who bring active volume to Black DEX.</p>
        </div>
        <div className="black-dex-affiliate-actions">
          <a href="#affiliate-dashboard">Open dashboard</a>
          <span>Powered by Orderly affiliate infrastructure</span>
        </div>
      </section>
      <section id="affiliate-dashboard" className="black-dex-ecosystem-module">
        <ReferralProvider
          becomeAnAffiliateUrl="https://orderly.network"
          learnAffiliateUrl="https://orderly.network"
          referralLinkUrl={referralLinkUrl}
          overwrite={{ shortBrokerName: brokerName, brokerName }}
        >
          <Dashboard.DashboardPage
            classNames={{
              root: "oui-flex oui-justify-center",
              home: "oui-py-6 oui-px-4 lg:oui-px-6 lg:oui-py-12 xl:oui-pl-4 xl:oui-pr-6 oui-w-full",
              dashboard: "oui-py-6 oui-px-4 lg:oui-px-6 xl:oui-pl-3 xl:oui-pr-6",
            }}
          />
        </ReferralProvider>
      </section>
    </div>
  );
}
