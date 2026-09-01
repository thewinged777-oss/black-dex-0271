import { Outlet, useLocation } from "react-router-dom";
import { PortfolioLayoutWidget } from "@orderly.network/portfolio";
import { useOrderlyConfig } from "@/utils/config";
import { useNav } from "@/hooks/useNav";
import PortfolioChrome from "@/components/portfolio/PortfolioChrome";

export default function PortfolioLayout() {
  const location = useLocation();
  const pathname = location.pathname;

  const { onRouteChange } = useNav();
  const config = useOrderlyConfig();

  return (
    <PortfolioLayoutWidget
      footerProps={config.scaffold.footerProps}
      mainNavProps={{
        ...config.scaffold.mainNavProps,
        initialMenu: "/portfolio",
      }}
      routerAdapter={{
        onRouteChange,
      }}
      leftSideProps={{
        current: pathname,
      }}
      bottomNavProps={config.scaffold.bottomNavProps}
    >
      <PortfolioChrome />
      <Outlet />
    </PortfolioLayoutWidget>
  );
}
