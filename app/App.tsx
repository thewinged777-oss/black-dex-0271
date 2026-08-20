import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import OrderlyProvider from "@/components/orderlyProvider";
import { HttpsRequiredWarning } from "@/components/HttpsRequiredWarning";
import { withBasePath } from "./utils/base-path";
import { getSEOConfig, getUserLanguage } from "./utils/seo";

const TOGGLES = ["TP/SL", "Reduce only", "Post only", "FOK", "IOC", "Hidden", "Reverse"];

function compactTradingSwitches() {
  const nodes = document.querySelectorAll("[role='switch'], input[type='checkbox'], label, button, [role='button']");
  nodes.forEach((node) => {
    const text = (node.textContent || "").replace(/\s+/g, " ").trim();
    const label = TOGGLES.find((name) => text === name || text.startsWith(`${name} `) || text.endsWith(` ${name}`));
    if (!label) return;

    const isSwitch = node.matches("[role='switch'], input[type='checkbox'], label") || !!node.querySelector("[role='switch'], input[type='checkbox']");
    if (!isSwitch && label === "Reverse") return;

    node.classList.add("black-dex-compact-toggle");
    node.querySelector("[role='switch'], input[type='checkbox']")?.classList.add("black-dex-compact-toggle-control");
  });
}

function NativeDesignStyles() {
  return <style>{`
    /* Black DEX styling is integrated into Orderly Scaffold's existing header/nav. */
    .black-dex-integrated-nav{display:flex!important;align-items:center!important;gap:2px!important;min-width:0!important;overflow:hidden!important}
    .black-dex-integrated-nav a,.black-dex-integrated-nav button{height:34px!important;min-height:34px!important;padding:0 11px!important;border:1px solid transparent!important;border-radius:7px!important;background:transparent!important;color:#85858e!important;text-decoration:none!important;font-size:12px!important;font-weight:750!important;letter-spacing:.01em!important;white-space:nowrap!important;box-shadow:none!important;transition:background .15s ease,color .15s ease,border-color .15s ease!important}
    .black-dex-integrated-nav a:hover,.black-dex-integrated-nav button:hover{color:#f0f0f2!important;background:rgba(255,255,255,.035)!important}
    .black-dex-integrated-nav a[aria-current="page"],.black-dex-integrated-nav a[data-active="true"],.black-dex-integrated-nav button[data-state="active"]{color:#f5d678!important;background:rgba(212,175,55,.085)!important;border-color:rgba(212,175,55,.18)!important;box-shadow:inset 0 1px rgba(245,214,120,.08)!important}
    .black-dex-integrated-nav a[href*="/perp"],.black-dex-integrated-nav a[href="/markets"],.black-dex-integrated-nav a[href="/portfolio"],.black-dex-integrated-nav a[href="/leaderboard"]{font-weight:800!important}
    .black-dex-compact-toggle{min-height:24px!important;height:24px!important;padding:0 7px!important;border-radius:6px!important;gap:5px!important;font-size:10px!important;font-weight:700!important;background:rgba(255,255,255,.025)!important;border:1px solid rgba(255,255,255,.07)!important;box-shadow:none!important;line-height:1!important}
    .black-dex-compact-toggle[data-state="checked"],.black-dex-compact-toggle[aria-checked="true"],.black-dex-compact-toggle.is-active{border-color:rgba(212,175,55,.3)!important;background:rgba(212,175,55,.09)!important;color:#f5d678!important}
    .black-dex-compact-toggle-control{transform:scale(.68)!important;transform-origin:center!important}
    @media(max-width:768px){
      .black-dex-integrated-nav{display:none!important}
      .black-dex-compact-toggle{min-height:22px!important;height:22px!important;padding:0 6px!important;font-size:9px!important}
      .black-dex-compact-toggle-control{transform:scale(.62)!important}
    }
  `}</style>;
}

export default function App() {
  const seoConfig = getSEOConfig();
  const defaultLanguage = getUserLanguage();

  useEffect(() => {
    compactTradingSwitches();
    const observer = new MutationObserver(compactTradingSwitches);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

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
        <Outlet />
      </OrderlyProvider>
    </>
  );
}
