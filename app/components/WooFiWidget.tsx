import { useCallback, useEffect } from "react";
import { useWalletConnector } from "@orderly.network/hooks";
import { WooFiSwapWidgetReact } from "woofi-swap-widget-kit/react";
import { getRuntimeConfig } from "../utils/runtime-config";

import "woofi-swap-widget-kit/style.css";
import "../styles/woofi-widget.css";

function widen(node: HTMLElement) {
  node.style.setProperty("width", "100%", "important");
  node.style.setProperty("max-width", "none", "important");
}

function layoutSwapTicket() {
  const root = document.querySelector(".bd-swap-widget") as HTMLElement | null;
  const swap = document.querySelector(".dex .swap") as HTMLElement | null;
  if (root) widen(root);
  if (!swap) return;

  [swap, swap.parentElement, document.querySelector(".dex")].forEach((node) => {
    if (node instanceof HTMLElement) widen(node);
  });

  if (swap.querySelector(".bd-swap-pair")) return;

  const inputs = Array.from(swap.querySelectorAll(".swap-input-view")) as HTMLElement[];
  const flip = swap.querySelector(".swap-icon-view") as HTMLElement | null;
  if (inputs.length < 2 || !flip) return;

  const row = document.createElement("div");
  row.className = "bd-swap-pair";
  inputs[0].parentElement?.insertBefore(row, inputs[0]);
  row.appendChild(inputs[0]);
  row.appendChild(flip);
  row.appendChild(inputs[1]);
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
    layoutSwapTicket();
    const id = window.setInterval(layoutSwapTicket, 400);
    const stop = window.setTimeout(() => window.clearInterval(id), 12000);
    const observer = new MutationObserver(layoutSwapTicket);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      window.clearInterval(id);
      window.clearTimeout(stop);
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
