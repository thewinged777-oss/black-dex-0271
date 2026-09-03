import { NavLink } from "react-router-dom";
import {
  EarnIcon,
  HomeIcon,
  MarketsIcon,
  PortfolioIcon,
  TradeIcon,
} from "@/components/icons/desk";

const ITEMS = [
  { to: "/home", label: "Home", icon: HomeIcon },
  { to: "/markets", label: "Markets", icon: MarketsIcon },
  { to: "/", label: "Trade", icon: TradeIcon, match: "/perp" },
  { to: "/earn", label: "Earn", icon: EarnIcon },
  { to: "/portfolio", label: "Portfolio", icon: PortfolioIcon },
] as const;

export default function BottomDock() {
  return (
    <nav className="bd-dock" aria-label="Main">
      {ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.label}
            to={item.to}
            className={({ isActive }) => {
              const extra =
                "match" in item &&
                typeof window !== "undefined" &&
                window.location.pathname.startsWith(item.match);
              return `bd-dock-item${isActive || extra ? " is-on" : ""}`;
            }
            }
          >
            {({ isActive }) => {
              const extra =
                "match" in item &&
                typeof window !== "undefined" &&
                window.location.pathname.startsWith(item.match);
              return (
                <>
                  <Icon active={isActive || extra} size={20} />
                  <span>{item.label}</span>
                </>
              );
            }}
          </NavLink>
        );
      })}
    </nav>
  );
}
