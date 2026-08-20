import { useMemo } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { AppLogos } from "@orderly.network/react-app";
import { TradingPageProps } from "@orderly.network/trading";
import {
  PortfolioActiveIcon, PortfolioInactiveIcon, TradingActiveIcon, TradingInactiveIcon,
  LeaderboardActiveIcon, LeaderboardInactiveIcon, MarketsActiveIcon, MarketsInactiveIcon,
  useScreen,
} from "@orderly.network/ui";
import { BottomNavProps, FooterProps, MainNavWidgetProps, MainNavItem as MainNavItemType } from "@orderly.network/ui-scaffold";
import { CampaignsNavTitle } from "@/components/CampaignsNavTitle";
import { OrderlyActiveIcon, OrderlyIcon } from "../components/icons/orderly";
import { withBasePath } from "./base-path";
import { getRuntimeConfig, getRuntimeConfigBoolean, getRuntimeConfigNumber } from "./runtime-config";
import { resolveDexThemeConfig } from "./theme-config";
import { createTradingViewConfig } from "./trading-view-config";

interface MainNavItem { name: string; href: string; target?: string; }
type MenuConfigItem = { id: string; href: string; name: string; target?: string; isDefault?: boolean } & Pick<MainNavItemType, "customRender">;
export type OrderlyConfig = { orderlyAppProvider: { appIcons: AppLogos }; scaffold: { mainNavProps: MainNavWidgetProps; footerProps: FooterProps; bottomNavProps: BottomNavProps }; tradingPage: { tradingViewConfig: TradingPageProps["tradingViewConfig"]; sharePnLConfig: TradingPageProps["sharePnLConfig"] } };

const getCustomMenuItems = (): MainNavItem[] => {
  const raw = getRuntimeConfig("VITE_CUSTOM_MENUS");
  if (!raw || typeof raw !== "string" || !raw.trim()) return [];
  return raw.split(";").map((pair) => pair.trim()).filter(Boolean).map((pair) => {
    const [name, href] = pair.split(",").map((item) => item.trim());
    return name && href ? { name, href, target: "_blank" } : null;
  }).filter((item): item is MainNavItem => !!item);
};

const getEnabledMenus = (all: MenuConfigItem[], defaults: MenuConfigItem[]) => {
  const raw = getRuntimeConfig("VITE_ENABLED_MENUS");
  if (!raw || typeof raw !== "string" || !raw.trim()) return defaults;
  const enabled = raw.split(",").map((id) => all.find((item) => item.id === id.trim())).filter(Boolean) as MenuConfigItem[];
  return enabled.length ? enabled : defaults;
};

const getPnLBackgroundImages = (): string[] => {
  if (getRuntimeConfigBoolean("VITE_USE_CUSTOM_PNL_POSTERS")) {
    const count = getRuntimeConfigNumber("VITE_CUSTOM_PNL_POSTER_COUNT");
    if (!isNaN(count) && count >= 1) return Array.from({ length: count }, (_, i) => withBasePath(`/pnl/poster_bg_${i + 1}.webp`));
  }
  return [1, 2, 3, 4].map((i) => withBasePath(`/pnl/poster_bg_${i}.png`));
};

const getBottomNavIcon = (id: string) => {
  switch (id) {
    case "Trading": return { activeIcon: <TradingActiveIcon />, inactiveIcon: <TradingInactiveIcon /> };
    case "Portfolio": return { activeIcon: <PortfolioActiveIcon />, inactiveIcon: <PortfolioInactiveIcon /> };
    case "Leaderboard": return { activeIcon: <LeaderboardActiveIcon />, inactiveIcon: <LeaderboardInactiveIcon /> };
    case "Markets": return { activeIcon: <MarketsActiveIcon />, inactiveIcon: <MarketsInactiveIcon /> };
    default: throw new Error(`Unsupported menu id: ${id}`);
  }
};

export const useOrderlyConfig = () => {
  const { t } = useTranslation();
  const { isMobile } = useScreen();
  const themeConfigSource = useMemo(() => resolveDexThemeConfig().source, []);

  const footerProps = useMemo<FooterProps>(() => ({
    telegramUrl: getRuntimeConfig("VITE_TELEGRAM_URL") || undefined,
    discordUrl: getRuntimeConfig("VITE_DISCORD_URL") || undefined,
    twitterUrl: getRuntimeConfig("VITE_TWITTER_URL") || undefined,
    trailing: <span className="oui-text-2xs oui-text-base-contrast-54">Charts powered by <a href="https://tradingview.com" target="_blank" rel="noopener noreferrer">TradingView</a></span>,
  }), []);

  const appIcons = useMemo<AppLogos>(() => ({
    main: getRuntimeConfigBoolean("VITE_HAS_PRIMARY_LOGO") ? { component: <img src={withBasePath("/logo.webp")} alt="logo" style={{ height: "42px" }} /> } : { img: withBasePath("/orderly-logo.svg") },
    secondary: { img: getRuntimeConfigBoolean("VITE_HAS_SECONDARY_LOGO") ? withBasePath("/logo-secondary.webp") : withBasePath("/orderly-logo-secondary.svg") },
  }), []);

  const tradingViewConfig = useMemo(() => createTradingViewConfig(themeConfigSource), [themeConfigSource]);
  const sharePnLConfig = useMemo<TradingPageProps["sharePnLConfig"]>(() => ({
    backgroundImages: getPnLBackgroundImages(), color: "rgba(255, 255, 255, 0.98)", profitColor: "rgba(41, 223, 169, 1)", lossColor: "rgba(245, 97, 139, 1)", brandColor: "rgba(255, 255, 255, 0.98)", refLink: typeof window !== "undefined" ? window.location.origin : undefined, refSlogan: getRuntimeConfig("VITE_ORDERLY_BROKER_NAME") || "Orderly Network",
  }), []);

  return useMemo<OrderlyConfig>(() => {
    const allMenuItems: MenuConfigItem[] = [
      { id: "Trading", href: "/", name: t("common.trading"), isDefault: true },
      { id: "Swap", href: "/swap", name: t("extend.swap"), isDefault: true },
      { id: "Portfolio", href: "/portfolio", name: t("common.portfolio"), isDefault: true },
      { id: "Markets", href: "/markets", name: t("common.markets"), isDefault: true },
      { id: "Leaderboard", href: "/leaderboard", name: t("extend.tradingLeaderboard.leaderboard"), isDefault: true },
      { id: "Rewards", href: "/rewards", name: t("tradingRewards.rewards"), isDefault: true },
      { id: "Vaults", href: "/vaults", name: t("common.vaults"), isDefault: true },
      { id: "Points", href: "/points", name: t("extend.tradingPoints.points"), isDefault: true },
      { id: "Campaigns", href: "", name: t("extend.tradingLeaderboard.campaigns"), isDefault: true, target: "_blank", customRender: () => <CampaignsNavTitle title={t("extend.tradingLeaderboard.campaigns")} /> },
    ];
    const enabledMenus = getEnabledMenus(allMenuItems, allMenuItems.filter((m) => m.isDefault));
    const allMainMenus = [...enabledMenus.map((m) => ({ name: m.name, href: m.href, target: m.target, customRender: m.customRender })), ...getCustomMenuItems()];
    const bottomNavMenus = enabledMenus.filter((m) => ["Trading", "Portfolio", "Markets", "Leaderboard"].includes(m.id)).map((m) => ({ name: m.name, href: m.href, target: m.target, ...getBottomNavIcon(m.id) }));

    const mainNavProps: MainNavWidgetProps = {
      initialMenu: "/",
      mainMenus: allMainMenus,
      // Use the native Scaffold header. The secondary app icon is supplied by Orderly's
      // AppLogos and the menu items are rendered directly in the same desktop header.
    };

    if (getRuntimeConfigBoolean("VITE_ENABLE_CAMPAIGNS")) {
      mainNavProps.campaigns = { name: "$ORDER", href: "/rewards", children: [{ name: t("extend.staking"), href: "https://app.orderly.network/staking", description: t("extend.staking.description"), icon: <OrderlyIcon size={14} />, activeIcon: <OrderlyActiveIcon size={14} />, target: "_blank" }] };
    }

    return { scaffold: { mainNavProps, bottomNavProps: { mainMenus: bottomNavMenus }, footerProps }, orderlyAppProvider: { appIcons }, tradingPage: { tradingViewConfig, sharePnLConfig } };
  }, [appIcons, footerProps, isMobile, sharePnLConfig, t, tradingViewConfig]);
};
