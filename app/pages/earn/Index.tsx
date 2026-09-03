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
import {
  loadOrderlyEarnVaults,
  type OrderlyEarnVault,
} from "@/utils/orderly-earn";
import { useMorphoVault } from "@/hooks/useMorphoVault";

function hideVaultsChrome(root: Element) {
  root.querySelectorAll("h1, h2, p, span").forEach((el) => {
    const text = (el.textContent || "").toLowerCase();
    if (
      text.includes("earn passive yield") ||
      text.includes("idle or extra assets") ||
      text.includes("available on") ||
      text.includes("curated vault strategies directly from black dex")
    ) {
      (el as HTMLElement).style.display = "none";
    }
  });
}

function OrderlyDepositDesk({ open }: { open: boolean }) {
  useEffect(() => {
    if (!open) return;
    const run = () => {
      const root = document.querySelector(".bd-earn-orderly");
      if (root) hideVaultsChrome(root);
    };
    run();
    const root = document.querySelector(".bd-earn-orderly");
    const observer = new MutationObserver(run);
    if (root) observer.observe(root, { childList: true, subtree: true });
    const timer = window.setInterval(run, 600);
    return () => {
      observer.disconnect();
      window.clearInterval(timer);
    };
  }, [open]);
  if (!open) return null;
  return (
    <div className="bd-earn-orderly">
      <VaultsPageComponent
        className="bd-earn-vaults-page"
        config={{ overallInfoBrokerIds: "orderly,thegangdex" }}
      />
    </div>
  );
}

function openHeaderConnect() {
  const buttons = Array.from(document.querySelectorAll("button"));
  const connect = buttons.find((btn) => /connect/i.test(btn.textContent || ""));
  connect?.click();
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

function OrderlyCard({
  vault,
  onDeposit,
}: {
  vault: OrderlyEarnVault;
  onDeposit: () => void;
}) {
  return (
    <article className="bd-earn-card">
      <header className="bd-earn-card-head">
        <div className="bd-earn-card-title">
          <strong>{vault.name}</strong>
          <span className="bd-earn-chip">{vault.asset}</span>
          <span className="bd-earn-chip is-chain">{vault.status === "live" ? "Active" : vault.status}</span>
        </div>
        <div className="bd-earn-apy">
          <em>{formatApy(vault.apy)}</em>
          <small>Net APY</small>
        </div>
      </header>
      <p className="bd-earn-desc">{vault.description}</p>
      <div className="bd-earn-stats">
        <div>
          <span>TVL</span>
          <b>{formatUsdCompact(vault.tvl)}</b>
        </div>
        <div>
          <span>Depositors</span>
          <b>{vault.depositors ?? "\u2014"}</b>
        </div>
        <div>
          <span>Min deposit</span>
          <b>{vault.minDeposit != null ? `${vault.minDeposit} USDC` : "\u2014"}</b>
        </div>
      </div>
      <button
        type="button"
        className="bd-earn-cta"
        onClick={() => {
          openHeaderConnect();
          onDeposit();
        }}
      >
        Connect wallet
      </button>
      <p className="bd-earn-powered">Powered by Orderly, no gas on deposit</p>
    </article>
  );
}

export default function EarnIndex() {
  const pageMeta = getPageMeta();
  const pageTitle = generatePageTitle("Earn");
  const [morpho, setMorpho] = useState<MorphoVaultLive[]>([]);
  const [orderly, setOrderly] = useState<OrderlyEarnVault[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOrderlyDesk, setShowOrderlyDesk] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([loadMorphoVaults(), loadOrderlyEarnVaults()])
      .then(([morphoRows, orderlyRows]) => {
        if (cancelled) return;
        setMorpho(morphoRows);
        setOrderly(orderlyRows);
      })
      .catch(() => {
        if (!cancelled) {
          setMorpho([]);
          setOrderly([]);
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
            <p>Available on Base and Ethereum</p>
          </header>
          {loading && morpho.length === 0 ? (
            <div className="bd-earn-loading">Loading vaults\u2026</div>
          ) : (
            <div className="bd-earn-grid">
              {morpho.map((vault) => (
                <MorphoCard key={vault.id} vault={vault} />
              ))}
            </div>
          )}
        </section>

        <section className="bd-earn-block">
          <header className="bd-earn-block-head">
            <h2>Orderly strategy vaults</h2>
            <p>Available on Black DEX, any supported chain, no gas</p>
          </header>
          <div className="bd-earn-grid">
            {orderly.map((vault) => (
              <OrderlyCard
                key={vault.id}
                vault={vault}
                onDeposit={() => setShowOrderlyDesk(true)}
              />
            ))}
          </div>
          <OrderlyDepositDesk open={showOrderlyDesk} />
        </section>
      </div>
    </>
  );
}
