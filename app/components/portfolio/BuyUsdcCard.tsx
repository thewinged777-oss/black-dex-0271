import { useState } from "react";
import { useAccount, useWalletConnector } from "@orderly.network/hooks";
import { useFundWallet } from "@privy-io/react-auth";
import { base } from "viem/chains";
import { openOrderlyWallet } from "@/utils/open-orderly-wallet";

export default function BuyUsdcCard() {
  const { state } = useAccount();
  const connector = useWalletConnector();
  const { fundWallet } = useFundWallet();
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const address = typeof state?.address === "string" ? state.address : "";

  const onBuy = async () => {
    setStatus(null);
    if (!address) {
      try {
        if (typeof connector.connect === "function") await connector.connect();
        else await openOrderlyWallet();
      } catch {
        await openOrderlyWallet();
      }
      setStatus("Connect a wallet, then tap Buy USDC again.");
      return;
    }
    setBusy(true);
    try {
      await fundWallet({
        address,
        options: {
          chain: base,
          amount: "50",
          asset: "USDC",
          defaultFundingMethod: "card",
          card: { preferredProvider: "moonpay" },
        },
      });
      setStatus("Card checkout opened. USDC lands on Base in this wallet.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Card checkout failed.";
      if (/not configured|disabled|funding/i.test(message)) {
        setStatus(
          "Enable Card onramps in the Privy Dashboard → Funding, then retry.",
        );
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
