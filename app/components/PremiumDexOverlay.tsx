import { useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import "@/styles/premium-overlay.css";

const NAV = [
  ["Trade", "/perp/ETH_USDC"],
  ["Swap", "/swap"],
  ["Portfolio", "/portfolio"],
  ["Markets", "/markets"],
  ["Leaderboards", "/leaderboard"],
  ["Rewards", "/rewards"],
  ["Vaults", "/vaults"],
  ["Points", "/points"],
] as const;

function compactOrderlyToggles() {
  const labels = ["TP/SL", "Reduce only", "Post only", "FOK", "IOC", "Hidden", "Reverse"];
  const nodes = document.querySelectorAll("button, [role='button'], label");
  nodes.forEach((node) => {
    const text = (node.textContent || "").replace(/\s+/g, " ").trim();
    if (labels.some((label) => text === label || text.includes(label))) {
      node.classList.add("black-dex-compact-toggle");
      const control = node.querySelector("button, [role='switch'], input[type='checkbox']");
      control?.classList.add("black-dex-compact-toggle-control");
    }
  });
}

export default function PremiumDexOverlay() {
  const location = useLocation();

  useEffect(() => {
    compactOrderlyToggles();
    const observer = new MutationObserver(compactOrderlyToggles);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [location.pathname]);

  return (
    <header className="black-dex-premium-overlay" aria-label="Black DEX navigation">
      <div className="black-dex-premium-nav-row">
        <nav className="black-dex-premium-links">
          {NAV.map(([label, href]) => (
            <NavLink key={label} to={href} className={({ isActive }) => `black-dex-premium-link${isActive ? " is-active" : ""}`}>
              <span className="black-dex-mobile-dot" aria-hidden="true" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="black-dex-premium-utilities">
          <button type="button" className="black-dex-utility black-dex-connect" onClick={() => {
            const candidates = Array.from(document.querySelectorAll("button"));
            const target = candidates.find((button) => /connect wallet|connect/i.test(button.textContent || ""));
            if (target && target !== document.activeElement) target.click();
          }}>Connect</button>
        </div>
      </div>
      <div className="black-dex-premium-desktop-tools">
        <button type="button" className="black-dex-utility">Languages</button>
        <button type="button" className="black-dex-utility">Blockchain</button>
      </div>
    </header>
  );
}
