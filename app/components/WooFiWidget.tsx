import { useCallback, useEffect } from "react";
import { useWalletConnector } from "@orderly.network/hooks";
import { WooFiSwapWidgetReact } from "woofi-swap-widget-kit/react";
import { getRuntimeConfig } from "../utils/runtime-config";

import "woofi-swap-widget-kit/style.css";
import "../styles/woofi-widget.css";

const META =
  /^(From|To|Trading route|Ethereum|Arbitrum|Optimism|Base|Polygon|BNB(?: Chain)?|Avalanche|Solana|Mantle|Linea)$/i;

function shrinkTicketMeta() {
  const root = document.querySelector(".dex .swap") as HTMLElement | null;
  if (!root) return;

  const nodes = root.querySelectorAll<HTMLElement>("span, div, button, label, p, em, strong");
  nodes.forEach((node) => {
    const own = Array.from(node.childNodes)
      .filter((child) => child.nodeType === Node.TEXT_NODE)
      .map((child) => (child.textContent || "").replace(/\s+/g, " ").trim())
      .filter(Boolean)
      .join(" ");
    const compact = own || (node.children.length === 0 ? (node.textContent || "").replace(/\s+/g, " ").trim() : "");
    if (!compact || !META.test(compact.replace(/[\u25be\u25bc\u25b2\u25b8▶]/g, "").trim())) return;
    node.style.setProperty("font-size", "10px", "important");
    node.style.setProperty("line-height", "1.15", "important");
    node.style.setProperty("font-weight", "600", "important");
    node.style.setProperty("letter-spacing", "0", "important");
  });

  root.querySelectorAll<HTMLElement>(".swap-input-view, .coin-input").forEach((well) => {
    const header = well.firstElementChild as HTMLElement | null;
    if (!header) return;
    header.style.setProperty("font-size", "10px", "important");
    header.style.setProperty("gap", "6px", "important");
    header.style.setProperty("flex-wrap", "wrap", "important");
  });
}

export default function WooFiWidget() {
  const { wallet, setChain, connectedChain, connect } = useWalletConnector();
  const brokerAddress = getRuntimeConfig("VITE_BROKER_EOA_ADDRESS") || "";

  const handleConnectWallet = useCallback(() => {
    connect();
  }, [connect]);

  const handleChainSwitch = useCallback(
    (targetChain: { chainName: string; chainId?: string; key: string }) => {
      if (targetChain.chainId) {
        setChain({ chainId: Number(targetChain.chainId) });
      }
    },
    [setChain],
  );

  useEffect(() => {
    shrinkTicketMeta();
    const id = window.setInterval(shrinkTicketMeta, 500);
    const observer = new MutationObserver(shrinkTicketMeta);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      window.clearInterval(id);
      observer.disconnect();
    };
  }, []);

  return (
    <WooFiSwapWidgetReact
      evmProvider={wallet?.provider}
      currentChain={connectedChain?.id}
      onConnectWallet={handleConnectWallet}
      onChainSwitch={handleChainSwitch}
      brokerAddress={brokerAddress}
      config={{
        enableLinea: false,
        enableMerlin: false,
        enableHyperevm: false,
        enableZksync: false,
      }}
    />
  );
}
