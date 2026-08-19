import { Link } from "react-router-dom";
import "@/styles/ecosystem.css";

type Props = {
  eyebrow: string;
  title: string;
  description: string;
  active?: "portfolio" | "markets" | "leaderboard" | "season" | "affiliate" | "vaults";
};

const links = [
  ["portfolio", "Portfolio", "/portfolio"],
  ["markets", "Markets", "/markets"],
  ["leaderboard", "Leaderboard", "/leaderboard"],
  ["season", "Black Season", "/points"],
  ["affiliate", "Affiliate", "/rewards/affiliate"],
  ["vaults", "Earn", "/vaults"],
] as const;

export function BlackEcosystemHeader({ eyebrow, title, description, active }: Props) {
  return (
    <div className="black-dex-ecosystem-header">
      <div className="black-dex-ecosystem-header-copy">
        <span>{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <div className="black-dex-ecosystem-links" aria-label="Black DEX ecosystem">
        {links.map(([key, label, href]) => (
          <Link key={key} to={href} className={active === key ? "is-active" : ""}>
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
