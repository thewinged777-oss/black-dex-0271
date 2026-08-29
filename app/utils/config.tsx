import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "@orderly.network/i18n";
import { AppLogos } from "@orderly.network/react-app";
import { TradingPageProps } from "@orderly.network/trading";
import {
  useScreen,
  Flex,
  cn,
} from "@orderly.network/ui";
import {
  BottomNavProps,
  FooterProps,
  MainNavWidgetProps,
  MainNavItem as MainNavItemType,
} from "@orderly.network/ui-scaffold";
import { CampaignsNavTitle } from "@/components/CampaignsNavTitle";
import CustomLeftNav from "@/components/CustomLeftNav";
import { SettingsNavButton } from "@/components/SettingsNavButton";
import { ThemeLogo } from "@/components/ThemeLogo";
import { OrderlyActiveIcon, OrderlyIcon } from "../components/icons/orderly";
import {
  TradeActiveIcon,
  TradeInactiveIcon,
  MarketsActiveIcon,
  MarketsInactiveIcon,
  PortfolioActiveIcon,
  PortfolioInactiveIcon,
  LeaderboardActiveIcon,
  LeaderboardInactiveIcon,
  TradeIcon,
  MarketsIcon,
  PortfolioIcon,
  LeaderboardIcon,
  SwapIcon,
  RewardsIcon,
  VaultsIcon,
  PointsIcon,
  DeskIcon,
} from "../components/icons/desk";
import { withBasePath } from "./base-path";
import {
  getRuntimeConfig,
  getRuntimeConfigBoolean,
  getRuntimeConfigNumber,
} from "./runtime-config";
import { resolveDexThemeConfig } from "./theme-config";
import { createTradingViewConfig } from "./trading-view-config";

interface MainNavItem {
  name: string;
  href: string;
  target?: string;
}

type MenuConfigItem = {
  id: string;
  href: string;
  name: string;
  target?: string;
  isDefault?: boolean;
} & Pick<MainNavItemType, "customRender">;

export type OrderlyConfig = {
  orderlyAppProvider: {
    appIcons: AppLogos;
  };
  scaffold: {
    mainNavProps: MainNavWidgetProps;
    footerProps: FooterProps;
    bottomNavProps: BottomNavProps;
  };
  tradingPage: {
    tradingViewConfig: TradingPageProps["tradingViewConfig"];
    sharePnLConfig: TradingPageProps["sharePnLConfig"];
  };
};

const getCustomMenuItems = (): MainNavItem[] => {
  const customMenusEnv = getRuntimeConfig("VITE_CUSTOM_MENUS");

  if (
    !customMenusEnv ||
    typeof customMenusEnv !== "string" ||
    customMenusEnv.trim() === ""
  ) {
    return [];
  }

  try {
    const menuPairs = customMenusEnv
      .split(";")
      .map((pair) => pair.trim())
      .filter((pair) => pair.length > 0);

    const validCustomMenus: MainNavItem[] = [];

    for (const pair of menuPairs) {
      const [name, href] = pair.split(",").map((item) => item.trim());

      if (!name || !href) {
        console.warn(
          "Invalid custom menu item format. Expected 'name,url':",
          pair,
        );
        continue;
      }

      validCustomMenus.push({
        name,
        href,
        target: "_blank",
      });
    }

    return validCustomMenus;
  } catch (e) {
    console.warn("Error parsing VITE_CUSTOM_MENUS:", e);
    return [];
  }
};

const getEnabledMenus = (
  allMenuItems: MenuConfigItem[],
  defaultEnabledMenus: MenuConfigItem[],
) => {
  const enabledMenusEnv = getRuntimeConfig("VITE_ENABLED_MENUS");

  if (
    !enabledMenusEnv ||
    typeof enabledMenusEnv !== "string" ||
    enabledMenusEnv.trim() === ""
  ) {
    return defaultEnabledMenus;
  }

  try {
    const enabledMenuIds = enabledMenusEnv.split(",").map((id) => id.trim());

    const enabledMenus = [];
    for (const menuId of enabledMenuIds) {
      const menuItem = allMenuItems.find((item) => item.id === menuId);
      if (menuItem) {
        enabledMenus.push(menuItem);
      }
    }

    return enabledMenus.length > 0 ? enabledMenus : defaultEnabledMenus;
  } catch (e) {
    console.warn("Error parsing VITE_ENABLED_MENUS:", e);
    return defaultEnabledMenus;
  }
};

const getPnLBackgroundImages = (): string[] => {
  const useCustomPnL = getRuntimeConfigBoolean("VITE_USE_CUSTOM_PNL_POSTERS");

  if (useCustomPnL) {
    const customPnLCount = getRuntimeConfigNumber(
      "VITE_CUSTOM_PNL_POSTER_COUNT",
    );

    if (isNaN(customPnLCount) || customPnLCount < 1) {
      return [
        withBasePath("/pnl/poster_bg_1.png"),
        withBasePath("/pnl/poster_bg_2.png"),
        withBasePath("/pnl/poster_bg_3.png"),
        withBasePath("/pnl/poster_bg_4.png"),
      ];
    }

    const customPosters: string[] = [];
    for (let i = 1; i <= customPnLCount; i++) {
      customPosters.push(withBasePath(`/pnl/poster_bg_${i}.webp`));
    }

    return customPosters;
  }

  return [
    withBasePath("/pnl/poster_bg_1.png"),
    withBasePath("/pnl/poster_bg_2.png"),
    withBasePath("/pnl/poster_bg_3.png"),
    withBasePath("/pnl/poster_bg_4.png"),
  ];
};

const deskMark = (menuId: string) => {
  switch (menuId) {
    case "Trading":
      return <TradeIcon size={14} />;
    case "Markets":
      return <MarketsIcon size={14} />;
    case "Portfolio":
      return <PortfolioIcon size={14} />;
    case "Leaderboard":
      return <LeaderboardIcon size={14} />;
    case "Swap":
      return <SwapIcon size={14} />;
    case "Rewards":
      return <RewardsIcon size={14} />;
    case "Vaults":
      return <VaultsIcon size={14} />;
    case "Points":
      return <PointsIcon size={14} />;
    case "Desk":
      return <DeskIcon size={14} />;
    default:
      return null;
  }
};

const labeled = (id: string, label: string) => (
  <Flex itemAlign="center" className="oui-gap-1.5">
    {deskMark(id)}
    <span>{label}</span>
  </Flex>
);

const getBottomNavIcon = (menuId: string) => {
  switch (menuId) {
    case "Trading":
      return {
        activeIcon: <TradeActiveIcon />,
        inactiveIcon: <TradeInactiveIcon />,
      };
    case "Portfolio":
      return {
        activeIcon: <PortfolioActiveIcon />,
        inactiveIcon: <PortfolioInactiveIcon />,
      };
    case "Leaderboard":
      return {
        activeIcon: <LeaderboardActiveIcon />,
        inactiveIcon: <LeaderboardInactiveIcon />,
      };
    case "Markets":
      return {
        activeIcon: <MarketsActiveIcon />,
        inactiveIcon: <MarketsInactiveIcon />,
      };
    default:
      throw new Error(`Unsupported menu id: ${menuId}`);
  }
};

export const useOrderlyConfig = () => {
  const { t } = useTranslation();
  const { isMobile } = useScreen();
  const themeConfigSource = useMemo(() => resolveDexThemeConfig().source, []);

  const footerProps = useMemo<FooterProps>(
    () => ({
      telegramUrl: getRuntimeConfig("VITE_TELEGRAM_URL") || undefined,
      discordUrl: getRuntimeConfig("VITE_DISCORD_URL") || undefined,
      twitterUrl: getRuntimeConfig("VITE_TWITTER_URL") || undefined,
      trailing: (
        <span className="oui-text-2xs oui-text-base-contrast-54">
          Charts powered by{" "}
          <a
            href="https://tradingview.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            TradingView
          </a>
        </span>
      ),
    }),
    [],
  );

  const appIcons = useMemo<AppLogos>(
    () => ({
      main: {
        component: <ThemeLogo variant="secondary" height={28} />,
      },
      secondary: {
        img: withBasePath("/logo-secondary.webp"),
      },
    }),
    [],
  );

  const tradingViewConfig = useMemo<TradingPageProps["tradingViewConfig"]>(
    () => createTradingViewConfig(themeConfigSource),
    [themeConfigSource],
  );

  const sharePnLConfig = useMemo<TradingPageProps["sharePnLConfig"]>(
    () => ({
      backgroundImages: getPnLBackgroundImages(),
      color: "rgba(234, 236, 239, 0.98)",
      profitColor: "rgba(14, 203, 129, 1)",
      lossColor: "rgba(246, 70, 93, 1)",
      brandColor: "rgba(212, 175, 55, 1)",
      refLink:
        typeof window !== "undefined" ? window.location.origin : undefined,
      refSlogan:
        getRuntimeConfig("VITE_ORDERLY_BROKER_NAME") || "Black DEX",
    }),
    [],
  );

  return useMemo<OrderlyConfig>(() => {
    const allMenuItems: MenuConfigItem[] = [
      {
        id: "Trading",
        href: "/",
        name: t("common.trading"),
        isDefault: true,
        customRender: () => labeled("Trading", t("common.trading")),
      },
      {
        id: "Portfolio",
        href: "/portfolio",
        name: t("common.portfolio"),
        isDefault: true,
        customRender: () => labeled("Portfolio", t("common.portfolio")),
      },
      {
        id: "Markets",
        href: "/markets",
        name: t("common.markets"),
        isDefault: true,
        customRender: () => labeled("Markets", t("common.markets")),
      },
      {
        id: "Swap",
        href: "/swap",
        name: t("extend.swap"),
        isDefault: true,
        customRender: () => labeled("Swap", t("extend.swap")),
      },
      {
        id: "Leaderboard",
        href: "/leaderboard",
        name: t("extend.tradingLeaderboard.leaderboard"),
        isDefault: true,
        customRender: () =>
          labeled("Leaderboard", t("extend.tradingLeaderboard.leaderboard")),
      },
      {
        id: "Campaigns",
        href: "",
        name: t("extend.tradingLeaderboard.campaigns"),
        isDefault: true,
        target: "_blank",
        customRender: () => {
          return (
            <CampaignsNavTitle
              title={t("extend.tradingLeaderboard.campaigns")}
            />
          );
        },
      },
      {
        id: "Rewards",
        href: "/rewards",
        name: t("tradingRewards.rewards"),
        customRender: () => labeled("Rewards", t("tradingRewards.rewards")),
      },
      {
        id: "Vaults",
        href: "/vaults",
        name: t("common.vaults"),
        customRender: () => labeled("Vaults", t("common.vaults")),
      },
      {
        id: "Points",
        href: "/points",
        name: t("extend.tradingPoints.points"),
        customRender: () => labeled("Points", t("extend.tradingPoints.points")),
      },
      {
        id: "Desk",
        href: "/desk",
        name: "Desk",
        customRender: () => labeled("Desk", "Desk"),
      },
    ];

    const defaultEnabledMenus = allMenuItems.filter((menu) => menu.isDefault);

    const enabledMenus = getEnabledMenus(allMenuItems, defaultEnabledMenus);
    const customMenus = getCustomMenuItems();

    const translatedEnabledMenus = enabledMenus.map((menu) => ({
      name: menu.name,
      href: menu.href,
      target: menu.target,
      customRender: menu.customRender,
    }));

    const deskMenu = allMenuItems.find((menu) => menu.id === "Desk");
    const hasDesk = translatedEnabledMenus.some((menu) => menu.href === "/desk");
    const allMainMenus = [
      ...translatedEnabledMenus,
      ...(!hasDesk && deskMenu
        ? [
            {
              name: deskMenu.name,
              href: deskMenu.href,
              target: deskMenu.target,
              customRender: deskMenu.customRender,
            },
          ]
        : []),
      ...customMenus,
    ];

    const supportedBottomNavMenus = [
      "Trading",
      "Portfolio",
      "Markets",
      "Leaderboard",
    ];
    const bottomNavMenus = enabledMenus
      .filter((menu) => supportedBottomNavMenus.includes(menu.id))
      .map((menu) => {
        const icons = getBottomNavIcon(menu.id);
        return {
          name: menu.name,
          href: menu.href,
          target: menu.target,
          ...icons,
        };
      })
      .filter((menu) => menu.activeIcon && menu.inactiveIcon);

    const mainNavProps: MainNavWidgetProps = {
      initialMenu: "/",
      mainMenus: allMainMenus,
    };

    if (getRuntimeConfigBoolean("VITE_ENABLE_CAMPAIGNS")) {
      mainNavProps.campaigns = {
        name: "$ORDER",
        href: "/rewards",
        children: [
          {
            name: t("extend.staking"),
            href: "https://app.orderly.network/staking",
            description: t("extend.staking.description"),
            icon: <OrderlyIcon size={14} />,
            activeIcon: <OrderlyActiveIcon size={14} />,
            target: "_blank",
          },
        ],
      };
    }

    mainNavProps.customRender = (components) => {
      return (
        <Flex justify="between" itemAlign="center" className="oui-w-full bd-header-row">
          <Flex
            itemAlign={"center"}
            className={cn("oui-gap-3", "oui-overflow-hidden")}
          >
            {isMobile && (
              <CustomLeftNav
                menus={allMainMenus.filter((menu) => !menu.target)}
                externalLinks={customMenus}
              />
            )}
            <Link to="/" className="oui-no-underline oui-flex oui-items-center">
              <ThemeLogo variant="secondary" height={28} />
            </Link>
            {components.mainNav}
          </Flex>

          <Flex itemAlign={"center"} className="oui-gap-2">
            {components.accountSummary}
            {components.linkDevice}
            <SettingsNavButton />
            {components.subAccount}
            {components.chainMenu}
            {components.walletConnect}
          </Flex>
        </Flex>
      );
    };

    return {
      scaffold: {
        mainNavProps,
        bottomNavProps: {
          mainMenus: bottomNavMenus,
        },
        footerProps,
      },
      orderlyAppProvider: {
        appIcons,
      },
      tradingPage: {
        tradingViewConfig,
        sharePnLConfig,
      },
    };
  }, [appIcons, footerProps, isMobile, sharePnLConfig, t, tradingViewConfig]);
};
