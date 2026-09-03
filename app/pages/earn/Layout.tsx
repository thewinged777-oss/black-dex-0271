import { Outlet } from "react-router-dom";
import { Scaffold } from "@orderly.network/ui-scaffold";
import { useOrderlyConfig } from "@/utils/config";
import { useNav } from "@/hooks/useNav";
import PageSafe from "@/components/PageSafe";

export default function EarnLayout() {
  const config = useOrderlyConfig();
  const { onRouteChange } = useNav();

  return (
    <Scaffold
      classNames={{
        root: "bd-root",
        topNavbar: "bd-navbar",
        footer: "bd-footer",
      }}
      mainNavProps={{
        ...config.scaffold.mainNavProps,
        initialMenu: "/home",
      }}
      footerProps={config.scaffold.footerProps}
      routerAdapter={{
        onRouteChange,
      }}
      bottomNavProps={config.scaffold.bottomNavProps}
    >
      <PageSafe>
        <Outlet />
      </PageSafe>
    </Scaffold>
  );
}
