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
import { useMorphoVault } from "@/hooks/useMorphoVault";

function openHeaderConnect() {
  const buttons = Array.from(document.querySelectorAll("button"));
  const connect = buttons.find((btn) => /connect/i.test(btn.textContent || ""));
  connect?.click();
}

function VaultCard({ vault }: { vault: MorphoVaultLive }) {
  const href = morphoVaultUrl(vault);
  const chainLabel = vault.chain === "base" ? "Base" : "Ethereum";
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState<"deposit" | "withdraw">("deposit");
  const morpho = useMorphoVault(vault);

  const onSubmit = async () => {
    try {
      if (mode === "deposit") await morpho.deposit(amount);
      else await morpho.withdraw(amount);
    } catch {
      // status already set in hook
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
          <b>{morpho.isConnected ? Number(morpho.formattedBalance).toLocaleString(undefined, { maximumFractionDigits: 2 }) : "—"}</b>
        </div>
        <div>
          <span>In vault</span>
          <b>{morpho.isConnected ? Number(morpho.formattedPosition).toLocaleString(undefined, { maximumFractionDigits: 2 }) : "—"}</b>
        </div>
      </div>

      {!morpho.isConnected ? (
        <button type="button" className="bd-earn-cta" onClick={openHeaderConnect}>
          Connect Black DEX wallet
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
          {!morpho.onVault && (
            <p className="bd-earn-hint">Switch wallet network to {chainLabel} to send the tx.</p>
          )}
          <div className="bd-earn-actions">
            <button
              type="button"
              className="bd-earn-cta"
              disabled={Boolean(morpho.busy)}
              onClick={() => void onSubmit()}
            >
              {morpho.busy ? morpho.status || "Working…" : mode === "deposit" ? "Deposit from wallet" : "Withdraw to wallet"}
            </button>
            {mode === "withdraw" && morpho.shares > 0n && (
              <button
                type="button"
                className="bd-earn-cta is-ghost"
                disabled={Boolean(morpho.busy)}
                onClick={() => void morpho.redeemAll()}
              >
                Redeem all
              </button>
            )}
          </div>
        </div>
      )}

      {morpho.status && !morpho.busy && <p className="bd-earn-status">{morpho.status}</p>}

      <p className="bd-earn-powered">
        Powered by Morpho · curated by {vault.curator} ·{" "}
        <a href={href} target="_blank" rel="noopener noreferrer">
          vault
        </a>
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
            Connect the Black DEX wallet, then deposit USDC into curated Morpho
            vaults from this page. Approve + deposit run on-chain from your
            address. Black DEX does not custody funds.
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
          Positions are ERC-4626 vault shares on Base or Ethereum. Verify the
          vault address on{" "}
          <a href="https://app.morpho.org" target="_blank" rel="noopener noreferrer">
            app.morpho.org
          </a>{" "}
          before depositing size.
        </p>
      </div>
    </>
  );
}
