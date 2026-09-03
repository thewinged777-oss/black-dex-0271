import { useEffect, useState } from "react";
import { generatePageTitle } from "@/utils/utils";
import { getPageMeta } from "@/utils/seo";
import { renderSEOTags } from "@/utils/seo-tags";
import {
  formatApy,
  formatUsdCompact,
  loadMorphoVaults,
  morphoVaultUrl,
  type MorphoVaultLive,
} from "@/utils/morpho-earn";

function VaultCard({ vault }: { vault: MorphoVaultLive }) {
  const href = morphoVaultUrl(vault);
  const chainLabel = vault.chain === "base" ? "Base" : "Ethereum";

  return (
    <article className="bd-earn-card">
      <header className="bd-earn-card-head">
        <div className="bd-earn-card-title">
          <strong>{vault.name}</strong>
          <span className="bd-earn-chip">{vault.asset}</span>
          <span className="bd-earn-chip is-chain">{chainLabel}</span>
        </div>
        <div className="bd-earn-apy">
          <em>{formatApy(vault.netApy)}</em>
          <small>Net APY</small>
        </div>
      </header>

      <p className="bd-earn-desc">{vault.description}</p>

      <div className="bd-earn-stats">
        <div>
          <span>TVL</span>
          <b>{formatUsdCompact(vault.totalAssetsUsd)}</b>
        </div>
        <div>
          <span>Network</span>
          <b>{chainLabel}</b>
        </div>
        <div>
          <span>Curator</span>
          <b>{vault.curator}</b>
        </div>
      </div>

      <footer className="bd-earn-actions">
        <a
          className="bd-earn-cta"
          href={href}
          target="_blank"
          rel="noopener noreferrer"
        >
          Deposit
        </a>
        <a
          className="bd-earn-cta is-ghost"
          href={href}
          target="_blank"
          rel="noopener noreferrer"
        >
          Withdraw
        </a>
      </footer>

      <p className="bd-earn-powered">
        Powered by Morpho · curated by {vault.curator}
      </p>
    </article>
  );
}

export default function EarnIndex() {
  const pageMeta = getPageMeta();
  const pageTitle = generatePageTitle("Earn");
  const [vaults, setVaults] = useState<MorphoVaultLive[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    loadMorphoVaults()
      .then((rows) => {
        if (!cancelled) {
          setVaults(rows);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load vaults");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      {renderSEOTags(pageMeta, pageTitle)}
      <div className="bd-earn">
        <header className="bd-earn-hero">
          <span className="bd-earn-kicker">Earn</span>
          <h1>Morpho vaults</h1>
          <p className="bd-earn-lead">
            Deposit USDC into curated Morpho vaults without leaving Black DEX.
            Yield comes from Morpho Blue lending markets. Deposit and withdraw
            open on Morpho; your position stays on-chain under your wallet.
          </p>
        </header>

        {error && <div className="bd-earn-error">{error}</div>}

        {loading && vaults.length === 0 ? (
          <div className="bd-earn-loading">Loading live APY…</div>
        ) : (
          <div className="bd-earn-grid">
            {vaults.map((vault) => (
              <VaultCard key={vault.id} vault={vault} />
            ))}
          </div>
        )}

        <p className="bd-earn-footnote">
          Black DEX does not custody deposits. Vaults are ERC-4626 contracts on
          Morpho. Always verify the vault address on{" "}
          <a
            href="https://app.morpho.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            app.morpho.org
          </a>{" "}
          before depositing.
        </p>
      </div>
    </>
  );
}
