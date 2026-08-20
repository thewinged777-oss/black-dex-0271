import { useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import OrderlyProvider from "@/components/orderlyProvider";
import { HttpsRequiredWarning } from "@/components/HttpsRequiredWarning";
import { withBasePath } from "./utils/base-path";
import { getSEOConfig, getUserLanguage } from "./utils/seo";
import { useModal } from "@orderly.network/ui";

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

const TOGGLES = ["TP/SL", "Reduce only", "Post only", "FOK", "IOC", "Hidden", "Reverse"];

function compactTradingSwitches() {
  document.querySelectorAll("button,[role='button'],label").forEach((node) => {
    const text = (node.textContent || "").replace(/\s+/g, " ").trim();
    if (TOGGLES.some((label) => text === label || text.includes(label))) {
      node.classList.add("black-dex-compact-toggle");
      node.querySelector("button,[role='switch'],input[type='checkbox']")?.classList.add("black-dex-compact-toggle-control");
    }
  });
}

function PremiumNavigation() {
  const location = useLocation();
  const openWallet = () => {
    const target = Array.from(document.querySelectorAll("button")).find((b) => /connect wallet|connect/i.test(b.textContent || ""));
    target?.click();
  };

  useEffect(() => {
    compactTradingSwitches();
    const observer = new MutationObserver(compactTradingSwitches);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [location.pathname]);

  return (
    <nav className="black-dex-native-nav" aria-label="Black DEX navigation">
      <div className="black-dex-native-nav-main">
        {NAV.map(([label, href]) => (
          <NavLink key={label} to={href} className={({ isActive }) => `black-dex-native-link${isActive ? " is-active" : ""}`}>
            <span className="black-dex-native-dot" aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
      <div className="black-dex-native-actions">
        <button type="button" onClick={openWallet} className="black-dex-native-connect">Connect</button>
        <button type="button" className="black-dex-native-tool">Languages</button>
        <button type="button" className="black-dex-native-tool">Blockchain</button>
      </div>
    </nav>
  );
}

function NativeDesignStyles() {
  return <style>{`
    .black-dex-native-nav{position:relative;z-index:20;display:flex;align-items:center;justify-content:space-between;gap:18px;width:100%;min-height:48px;padding:7px 18px;border-bottom:1px solid rgba(255,255,255,.07);background:rgba(8,8,10,.96);font-family:inherit}
    .black-dex-native-nav-main{display:flex;align-items:center;gap:2px;min-width:0}
    .black-dex-native-link{display:inline-flex;align-items:center;justify-content:center;gap:7px;height:34px;padding:0 12px;border:1px solid transparent;border-radius:8px;color:#85858e;text-decoration:none;font-size:12px;font-weight:750;letter-spacing:.01em;transition:background .16s ease,color .16s ease,border-color .16s ease}
    .black-dex-native-link:hover{color:#eeeef1;background:rgba(255,255,255,.035)}
    .black-dex-native-link.is-active{color:#f5d678;background:rgba(212,175,55,.085);border-color:rgba(212,175,55,.18);box-shadow:inset 0 1px rgba(245,214,120,.08)}
    .black-dex-native-dot{display:none;width:4px;height:4px;border-radius:50%;background:#d4af37;box-shadow:0 0 6px rgba(212,175,55,.3)}
    .black-dex-native-actions{display:flex;align-items:center;gap:6px;flex:0 0 auto}
    .black-dex-native-actions button{height:30px;padding:0 10px;border-radius:7px;border:1px solid rgba(255,255,255,.075);background:rgba(255,255,255,.025);color:#a6a6ae;font:700 11px inherit}
    .black-dex-native-actions .black-dex-native-connect{color:#f5d678;border-color:rgba(212,175,55,.28);background:rgba(212,175,55,.075)}
    .black-dex-compact-toggle{min-height:24px!important;height:24px!important;padding:0 7px!important;border-radius:6px!important;gap:5px!important;font-size:10px!important;font-weight:700!important;background:rgba(255,255,255,.025)!important;border:1px solid rgba(255,255,255,.07)!important;box-shadow:none!important}
    .black-dex-compact-toggle[data-state=checked],.black-dex-compact-toggle.is-active{border-color:rgba(212,175,55,.3)!important;background:rgba(212,175,55,.09)!important;color:#f5d678!important}
    .black-dex-compact-toggle-control{transform:scale(.72);transform-origin:center}
    @media(max-width:768px){
      .black-dex-native-nav{min-height:auto;padding:8px 8px calc(9px + env(safe-area-inset-bottom));border-top:1px solid rgba(255,255,255,.08);border-bottom:0}
      .black-dex-native-nav-main{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:4px;width:100%}
      .black-dex-native-link{height:48px;padding:0 4px;flex-direction:column;gap:4px;border-radius:10px;font-size:10px;color:#8a8a92}
      .black-dex-native-link.is-active{color:#f5d678;background:rgba(212,175,55,.085);border-color:rgba(212,175,55,.18)}
      .black-dex-native-dot{display:block}
      .black-dex-native-actions{display:none}
      .black-dex-compact-toggle{min-height:22px!important;height:22px!important;padding:0 6px!important;font-size:9px!important}
      .black-dex-compact-toggle-control{transform:scale(.64)}
    }
  `}</style>;
}

export default function App() {
  const seoConfig = getSEOConfig();
  const defaultLanguage = getUserLanguage();
  return (
    <>
      <Helmet>
        <html lang={seoConfig.language || defaultLanguage} />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/webp" href={withBasePath("/favicon.webp")} />
      </Helmet>
      <NativeDesignStyles />
      <HttpsRequiredWarning />
      <OrderlyProvider>
        <PremiumNavigation />
        <Outlet />
      </OrderlyProvider>
    </>
  );
}
