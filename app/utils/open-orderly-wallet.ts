import type { useWalletConnector } from "@orderly.network/hooks";

type Connector = ReturnType<typeof useWalletConnector>;

export function clickHeaderWallet() {
  const scopes = [
    document.querySelector(".bd-navbar"),
    document.querySelector(".bd-header-row"),
    document.querySelector("header"),
  ].filter(Boolean) as Element[];

  for (const scope of scopes) {
    const nodes = Array.from(
      scope.querySelectorAll<HTMLElement>("button, [role='button'], a"),
    );
    const match = nodes.find((el) => {
      const text = `${el.textContent || ""} ${el.getAttribute("aria-label") || ""}`;
      return /connect/i.test(text);
    });
    if (match) {
      match.click();
      return true;
    }
  }
  return false;
}

export async function openOrderlyWallet(connector?: Connector) {
  const opened = clickHeaderWallet();
  if (opened) return;
  if (connector?.connect) {
    await connector.connect();
  }
}
