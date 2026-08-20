import { Helmet } from "react-helmet-async";
import { Outlet } from "react-router-dom";
import OrderlyProvider from "@/components/orderlyProvider";
import { HttpsRequiredWarning } from "@/components/HttpsRequiredWarning";
import { withBasePath } from "./utils/base-path";
import { getSEOConfig, getUserLanguage } from "./utils/seo";

function NativeDesignStyles() {
  return <style>{`
    /* Black DEX styling is applied to Orderly's native Scaffold rather than injecting a second header. */
    .black-dex-compact-toggle{min-height:22px!important;height:22px!important;padding:0 6px!important;border-radius:6px!important;gap:4px!important;font-size:9px!important;font-weight:750!important;line-height:1!important;background:rgba(255,255,255,.025)!important;border:1px solid rgba(255,255,255,.07)!important;box-shadow:none!important}
    .black-dex-compact-toggle-control{transform:scale(.62)!important;transform-origin:center!important}
    .black-dex-compact-toggle[data-state="checked"],.black-dex-compact-toggle[aria-checked="true"],.black-dex-compact-toggle.is-active{border-color:rgba(212,175,55,.3)!important;background:rgba(212,175,55,.09)!important;color:#f5d678!important}
    .black-dex-account-tab{height:30px!important;min-height:30px!important;padding:0 10px!important;border-radius:6px!important;background:transparent!important;border:1px solid transparent!important;color:#8c8c94!important;font-size:10px!important;font-weight:750!important;line-height:1!important}
    .black-dex-account-tab:hover{color:#e8e8ea!important;background:rgba(255,255,255,.035)!important}
    .black-dex-account-tab[aria-selected="true"],.black-dex-account-tab[data-state="active"],.black-dex-account-tab[data-active="true"]{color:#f5d678!important;background:rgba(212,175,55,.09)!important;border-color:rgba(212,175,55,.18)!important}
    /* Native Scaffold main navigation: premium treatment without creating another bar. */
    header nav a,.oui-main-nav a{font-weight:700}
    @media(max-width:767px){
      /* Keep the native Orderly mobile left-menu trigger. Only style the native bottom nav. */
      .oui-bottom-nav a,.oui-bottom-nav button{min-height:44px!important;border-radius:9px!important}
      .oui-bottom-nav a::before,.oui-bottom-nav button::before{content:"";width:4px;height:4px;border-radius:50%;background:#d4af37;display:inline-block;margin-right:5px;vertical-align:middle;box-shadow:0 0 6px rgba(212,175,55,.3)}
      .oui-bottom-nav a[data-state="active"],.oui-bottom-nav button[data-state="active"]{color:#f5d678!important;background:rgba(212,175,55,.075)!important}
      .black-dex-compact-toggle{min-height:22px!important;height:22px!important;padding:0 6px!important;font-size:9px!important}
      .black-dex-compact-toggle-control{transform:scale(.62)!important}
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
      <OrderlyProvider><Outlet /></OrderlyProvider>
    </>
  );
}
