import { FC, useCallback } from "react";
import { Link } from "react-router-dom";
import { modal, useModal } from "@orderly.network/ui";
import { LeftNavProps, LeftNavItem } from "@orderly.network/ui-scaffold";
import {
  HomeIcon,
  TradeIcon,
  MarketsIcon,
  PortfolioIcon,
  SwapIcon,
  LeaderboardIcon,
  RewardsIcon,
  VaultsIcon,
  PointsIcon,
  DeskIcon,
  EarnIcon,
  MenuIcon,
} from "@/components/icons/desk";

type LeftNavUIProps = LeftNavProps & {
  className?: string;
  externalLinks?: Array<{
    name: string;
    href: string;
    target?: string;
  }>;
};

const TILES: Array<{ href: string; label: string; icon: FC<{ size?: number }> }> = [
  { href: "/home", label: "Home", icon: HomeIcon },
  { href: "/", label: "Trade", icon: TradeIcon },
  { href: "/markets", label: "Markets", icon: MarketsIcon },
  { href: "/portfolio", label: "Portfolio", icon: PortfolioIcon },
  { href: "/swap", label: "Swap", icon: SwapIcon },
  { href: "/leaderboard", label: "Leaderboard", icon: LeaderboardIcon },
  { href: "/rewards", label: "Rewards", icon: RewardsIcon },
  { href: "/vaults", label: "Vaults", icon: VaultsIcon },
  { href: "/points", label: "Points", icon: PointsIcon },
  { href: "/earn", label: "Earn", icon: EarnIcon },
  { href: "/desk", label: "Desk", icon: DeskIcon },
];

const LeftNavUI: FC<LeftNavUIProps> = (props) => {
  const showModal = useCallback(() => {
    modal.show(LauncherSheet, { ...props });
  }, [props]);

  return (
    <button
      onClick={showModal}
      className={props?.className}
      aria-label="Open navigation menu"
      style={{ zoom: "1.15", color: "currentColor" }}
    >
      <MenuIcon size={22} />
    </button>
  );
};

function isTile(href?: string) {
  return TILES.some((tile) => tile.href === href);
}

const LauncherSheet = modal.create<LeftNavUIProps>((props) => {
  const { visible, hide, onOpenChange } = useModal();
  if (!visible) return null;

  const extras = [
    ...(props.menus || []).filter((item: LeftNavItem) => item.href && !isTile(item.href)),
    ...(props.externalLinks || []),
  ];

  return (
    <div className="bd-launcher-root" onClick={() => onOpenChange(false)}>
      <div className="bd-launcher" onClick={(event) => event.stopPropagation()}>
        <div className="bd-launcher-handle" />
        <header className="bd-launcher-head">
          <span>Menu</span>
          <button className="bd-launcher-close" onClick={hide} aria-label="Close">
            ×
          </button>
        </header>
        <div className="bd-launcher-grid">
          {TILES.map((tile) => {
            const Icon = tile.icon;
            return (
              <Link key={tile.href} to={tile.href} onClick={hide} className="bd-launcher-tile">
                <i>
                  <Icon size={18} />
                </i>
                <span>{tile.label}</span>
              </Link>
            );
          })}
        </div>
        {extras.length > 0 && (
          <div className="bd-launcher-links">
            {extras.map((item) =>
              item.target === "_blank" ? (
                <a
                  key={`${item.name}-${item.href}`}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={hide}
                >
                  {item.name}
                </a>
              ) : (
                <Link key={`${item.name}-${item.href}`} to={item.href || "/"} onClick={hide}>
                  {item.name}
                </Link>
              ),
            )}
          </div>
        )}
      </div>
    </div>
  );
});

export default LeftNavUI;
