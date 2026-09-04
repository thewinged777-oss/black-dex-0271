import { useState } from "react";
import { useAccount, useWalletConnector } from "@orderly.network/hooks";
import { useFundWallet } from "@privy-io/react-auth";
import { base } from "viem/chains";
import { openOrderlyWallet } from "@/utils/open-orderly-wallet";

function hexAddress(value: unknown): string {
  if (typeof value === "string" && /^0x[0-9a-fA-F]{40}$/.test(value)) return value;
  if (value && typeof value === "object") {
    const row = value as Record<string, unknown>;
    for (const key of ["address", "accountAddress", "evmAddress"]) {
      const inner = hexAddress(row[key]);
      if (inner) return inner;
    }
  }
  return "";
}

export default function BuyUsdcCard() {
  const { state } = useAccount();
  const connector = useWalletConnector();
  const { fundWallet } = useFundWallet();
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const address =
    hexAddress(state?.address) ||
    hexAddress((connector.wallet as { address?: unknown } | undefined)?.address) ||
    hexAddress(connector.wallet);

  const openConnect = async () => {
    try {
      if (typeof connector.connect === "function") await connector.connect();
      else await openOrderlyWallet();
    } catch {
      await openOrderlyWallet();
    }
  };

  const onBuy = async () => {
    setStatus(null);
    if (!address) {
      await openConnect();
      setStatus("Connect a wallet, then tap Buy USDC again.");
      return;
    }
    setBusy(true);
    const options = {
      chain: base,
      amount: "50",
      asset: "USDC" as const,
      defaultFundingMethod: "card" as const,
      card: { preferredProvider: "moonpay" as const },
    };
    try {
      const fund = fundWallet as unknown as (
        ...args: unknown[]
      ) => Promise<unknown>;
      try {
        await fund(address, options);
      } catch (first) {
        const msg = first instanceof Error ? first.message : "";
        if (/object Object|invalid/i.test(msg) || /options/i.test(msg)) {
          await fund({ address, options });
        } else {
          throw first;
        }
      }
      setStatus("Card checkout opened. USDC lands on Base in this wallet.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Card checkout failed.";
      if (/not configured|disabled|funding/i.test(message)) {
        setStatus("Enable Card onramps in the Privy Dashboard → Funding, then retry.");
      } else {
        setStatus(message);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="bd-buy-usdc">
      <div>
        <strong>Buy USDC with card</strong>
        <p>
          Privy card checkout (MoonPay / Stripe / Coinbase). Funds Base USDC to
          the connected Black DEX wallet. Debit cards clear more often than credit.
        </p>
      </div>
      <button type="button" className="bd-buy-usdc-cta" disabled={busy} onClick={() => void onBuy()}>
        {busy ? "Opening checkout…" : address ? "Buy USDC" : "Connect wallet"}
      </button>
      {status && <p className="bd-buy-usdc-status">{status}</p>}
    </section>
  );
}
