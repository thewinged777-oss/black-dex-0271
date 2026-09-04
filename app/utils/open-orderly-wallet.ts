export function clickHeaderWallet() {
  const scopes = [
    document.querySelector(".bd-navbar"),
    document.querySelector(".bd-header-row"),
    document.querySelector(".oui-top-nav"),
    document.querySelector("[class*='topNavbar']"),
    document.querySelector("header"),
    document.querySelector(".oui-navbar"),
    document.body,
  ].filter(Boolean) as Element[];

  for (const scope of scopes) {
    const nodes = Array.from(
      scope.querySelectorAll<HTMLElement>("button, [role='button'], a"),
    );
    const match = nodes.find((el) => {
      if (el.closest(".bd-earn-card")) return false;
      if (el.closest(".bd-earn-form")) return false;
      const text = `${el.textContent || ""} ${el.getAttribute("aria-label") || ""}`;
      return /connect\s*wallet/i.test(text) || /^connect$/i.test((el.textContent || "").trim());
    });
    if (match) {
      match.click();
      return true;
    }
  }
  return false;
}

export async function openOrderlyWallet() {
  return clickHeaderWallet();
}
