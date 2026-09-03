import { useEffect, useState } from "react";
import { VaultsPage as VaultsPageComponent } from "@orderly.network/vaults";
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

function hideVaultsMarketing(root: Element) {
  root.querySelectorAll("h1, h2, p").forEach((el) => {
    const text = (el.textContent || "").toLowerCase();
    if (
      text.includes("earn passive yield") ||
      text.includes("idle or extra assets") ||
      text.includes("available on")
    ) {
      (el as HTMLElement).style.display = "none";
    }
  });
}

function FilterOrderlyVaults() {
  useEffect(() => {
    const run = () => {
      const root = document.querySelector(".bd-earn-orderly");
      if (!root) return;
      hideOtherVaultRows(root);
      hideVaultsMarketing(root);
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
              : "—"}
          </b>
        </div>
        <div>
          <span>In vault</span>
          <b>
            {morpho.isConnected
              ? Number(morpho.formattedPosition).toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })
              : "—"}
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
          {!morpho.onVault && (
            <p className="bd-earn-hint">Switch to {chainLabel} when you confirm the transaction.</p>
          )}
          <button
            type="button"
            className="bd-earn-cta"
            disabled={Boolean(morpho.busy)}
            onClick={() => void onSubmit()}
          >
            {morpho.busy
              ? morpho.status || "Working…"
              : mode === "deposit"
                ? "Deposit from wallet"
                : "Withdraw to wallet"}
          </button>
        </div>
      )}

      {morpho.status && !morpho.busy && <p className="bd-earn-status">{morpho.status}</p>}
      <p className="bd-earn-powered">Powered by Morpho · curated by {vault.curator}</p>
    </article>
  );
}

export default function EarnIndex() {
  const pageMeta = getPageMeta();
  const pageTitle = generatePageTitle("Earn");
  const [vaults, setVaults] = useState<MorphoVaultLive[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    loadMorphoVaults()
      .then((rows) => {
        if (!cancelled) setVaults(rows);
      })
      .catch(() => {
        if (!cancelled) setVaults([]);
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
          <h1>Earn passive yield with vault strategies</h1>
          <p className="bd-earn-lead">
            Put your idle or extra assets to work effortlessly. Deposit into
            curated vault strategies directly from Black DEX — using USDC from
            any supported blockchain or your Black DEX account, with no gas
            fees.
          </p>
        </header>

        <section className="bd-earn-block">
          <header className="bd-earn-block-head">
            <h2>Morpho Earn</h2>
            <p>Connect the Black DEX wallet and deposit USDC on-chain from this page.</p>
          </header>
          {loading && vaults.length === 0 ? (
            <div className="bd-earn-loading">Loading Morpho APY…</div>
          ) : (
            <div className="bd-earn-grid">
              {vaults.map((vault) => (
                <MorphoCard key={vault.id} vault={vault} />
              ))}
            </div>
          )}
        </section>

        <section className="bd-earn-block">
          <header className="bd-earn-block-head">
            <h2>Orderly strategy vaults</h2>
            <p>OmniVault and Smaug. Deposit from the Black DEX account, no gas.</p>
          </header>
          <FilterOrderlyVaults />
          <div className="bd-earn-orderly">
            <VaultsPageComponent
              className="bd-earn-vaults-page"
              config={{ overallInfoBrokerIds: "orderly,thegangdex" }}
            />
          </div>
        </section>
      </div>
    </>
  );
}
