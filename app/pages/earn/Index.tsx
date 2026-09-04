import { lazy, Suspense, useEffect, useState } from "react";
import { generatePageTitle } from "@/utils/utils";
import { getPageMeta } from "@/utils/seo";
import { renderSEOTags } from "@/utils/seo-tags";
import {
  formatApy,
  formatUsdCompact,
  loadMorphoVaults,
  type MorphoVaultLive,
} from "@/utils/morpho-earn";
import { useMorphoVault } from "@/hooks/useMorphoVault";
import PageSafe from "@/components/PageSafe";

const VaultsPageComponent = lazy(() =>
  import("@orderly.network/vaults").then((mod) => ({ default: mod.VaultsPage })),
);

function MorphoCard({ vault }: { vault: MorphoVaultLive }) {
  const chainLabel = vault.chain === "base" ? "Base" : "Ethereum";
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState<"deposit" | "withdraw">("deposit");
  const morpho = useMorphoVault(vault);

  const onSubmit = async () => {
    try {
      if (mode === "deposit") await morpho.deposit(amount);
      else await morpho.withdraw(amount);
    } catch {
      // status already set
    }
  };

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
          <span>Wallet USDC</span>
          <b>
            {morpho.isConnected
              ? Number(morpho.formattedBalance).toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })
              : "\u2014"}
          </b>
        </div>
        <div>
          <span>In vault</span>
          <b>
            {morpho.isConnected
              ? Number(morpho.formattedPosition).toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })
              : "\u2014"}
          </b>
        </div>
      </div>
      {!morpho.isConnected ? (
        <button type="button" className="bd-earn-cta" onClick={() => void morpho.connect()}>
          Connect wallet
        </button>
      ) : (
        <div className="bd-earn-form">
          <div className="bd-earn-mode">
            <button type="button" className={mode === "deposit" ? "is-on" : ""} onClick={() => setMode("deposit")}>
              Deposit
            </button>
            <button type="button" className={mode === "withdraw" ? "is-on" : ""} onClick={() => setMode("withdraw")}>
              Withdraw
            </button>
          </div>
          <label className="bd-earn-field">
            <span>Amount ({vault.asset})</span>
            <input
              inputMode="decimal"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="0.00"
            />
            <button
              type="button"
              className="bd-earn-max"
              onClick={() =>
                setAmount(mode === "deposit" ? morpho.formattedBalance : morpho.formattedPosition)
              }
            >
              Max
            </button>
          </label>
          <button
            type="button"
            className="bd-earn-cta"
            disabled={Boolean(morpho.busy)}
            onClick={() => void onSubmit()}
          >
            {morpho.busy
              ? morpho.status || "Working\u2026"
              : mode === "deposit"
                ? "Deposit from wallet"
                : "Withdraw to wallet"}
          </button>
        </div>
      )}
      {morpho.status && !morpho.busy && <p className="bd-earn-status">{morpho.status}</p>}
      <p className="bd-earn-powered">Powered by Morpho, curated by {vault.curator}</p>
    </article>
  );
}

export default function EarnIndex() {
  const pageMeta = getPageMeta();
  const pageTitle = generatePageTitle("Earn");
  const [morpho, setMorpho] = useState<MorphoVaultLive[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    loadMorphoVaults()
      .then((rows) => {
        if (!cancelled) setMorpho(rows);
      })
      .catch(() => {
        if (!cancelled) setMorpho([]);
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
      <div className="bd-earn bd-earn-original">
        <section className="bd-earn-orderly">
          <Suspense fallback={<div className="bd-earn-loading">Loading vaults\u2026</div>}>
            <PageSafe>
              <VaultsPageComponent
                className="bd-earn-vaults-page"
                config={{ overallInfoBrokerIds: "orderly,thegangdex" }}
              />
            </PageSafe>
          </Suspense>
        </section>

        <section className="bd-earn-block">
          <header className="bd-earn-block-head">
            <h2>Morpho Earn</h2>
            <p>Available on Base and Ethereum</p>
          </header>
          {loading && morpho.length === 0 ? (
            <div className="bd-earn-loading">Loading Morpho vaults\u2026</div>
          ) : (
            <div className="bd-earn-grid">
              {morpho.map((vault) => (
                <PageSafe key={vault.id}>
                  <MorphoCard vault={vault} />
                </PageSafe>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
