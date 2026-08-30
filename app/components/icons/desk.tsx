import type { ReactNode, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & {
  active?: boolean;
  size?: number;
};

function Base({
  size = 20,
  children,
  ...rest
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

function paint(active?: boolean) {
  return active ? "#d4af37" : "currentColor";
}

export function HomeIcon({ active, size, ...rest }: IconProps) {
  const c = paint(active);
  return (
    <Base size={size} {...rest}>
      <path
        d="M4.6 11.2 12 4.8l7.4 6.4V19a1.4 1.4 0 0 1-1.4 1.4H6A1.4 1.4 0 0 1 4.6 19V11.2Z"
        stroke={c}
        strokeWidth="1.7"
        strokeLinejoin="round"
        fill={active ? "rgba(212,175,55,0.16)" : "none"}
      />
      <path d="M10 20.2v-5.2h4v5.2" stroke={c} strokeWidth="1.7" strokeLinejoin="round" />
    </Base>
  );
}

export function TradeIcon({ active, size, ...rest }: IconProps) {
  const c = paint(active);
  return (
    <Base size={size} {...rest}>
      <path d="M5 18V8" stroke={c} strokeWidth="1.7" strokeLinecap="round" />
      <path d="M5 11.2h3.2V16H5" stroke={c} strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M10.8 18V5.6" stroke={c} strokeWidth="1.7" strokeLinecap="round" />
      <path d="M10.8 8.4H14V16h-3.2" stroke={c} strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M16.6 18v-6.6" stroke={c} strokeWidth="1.7" strokeLinecap="round" />
      <path d="M16.6 12.6H19.8V16h-3.2" stroke={c} strokeWidth="1.7" strokeLinejoin="round" />
    </Base>
  );
}

export function MarketsIcon({ active, size, ...rest }: IconProps) {
  const c = paint(active);
  return (
    <Base size={size} {...rest}>
      <path d="M4 16.4 8.2 12l3.1 3 8.7-8.4" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15.2 6.6H20v4.8" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </Base>
  );
}

export function PortfolioIcon({ active, size, ...rest }: IconProps) {
  const c = paint(active);
  return (
    <Base size={size} {...rest}>
      <rect x="3.6" y="8" width="16.8" height="11.4" rx="2.2" stroke={c} strokeWidth="1.7" fill={active ? "rgba(212,175,55,0.12)" : "none"} />
      <path d="M8.2 8V6.6A2.4 2.4 0 0 1 10.6 4.2h2.8A2.4 2.4 0 0 1 15.8 6.6V8" stroke={c} strokeWidth="1.7" />
      <path d="M3.6 12.6h16.8" stroke={c} strokeWidth="1.7" />
    </Base>
  );
}

export function LeaderboardIcon({ active, size, ...rest }: IconProps) {
  const c = paint(active);
  return (
    <Base size={size} {...rest}>
      <path d="M8.2 19.2V12H5.4v7.2h2.8Z" stroke={c} strokeWidth="1.7" strokeLinejoin="round" fill={active ? "rgba(212,175,55,0.16)" : "none"} />
      <path d="M13.4 19.2V5.8h-2.8v13.4h2.8Z" stroke={c} strokeWidth="1.7" strokeLinejoin="round" fill={active ? "rgba(212,175,55,0.22)" : "none"} />
      <path d="M18.6 19.2v-5.2h-2.8v5.2h2.8Z" stroke={c} strokeWidth="1.7" strokeLinejoin="round" fill={active ? "rgba(212,175,55,0.12)" : "none"} />
    </Base>
  );
}

export function SwapIcon({ active, size, ...rest }: IconProps) {
  const c = paint(active);
  return (
    <Base size={size} {...rest}>
      <path d="M7.2 8.2h10.2" stroke={c} strokeWidth="1.7" strokeLinecap="round" />
      <path d="M14.8 5.4 17.4 8.2 14.8 11" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16.8 15.8H6.6" stroke={c} strokeWidth="1.7" strokeLinecap="round" />
      <path d="M9.2 18.6 6.6 15.8 9.2 13" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </Base>
  );
}

export function RewardsIcon({ active, size, ...rest }: IconProps) {
  const c = paint(active);
  return (
    <Base size={size} {...rest}>
      <path d="M7.4 9.2h9.2v8.2a2 2 0 0 1-2 2H9.4a2 2 0 0 1-2-2V9.2Z" stroke={c} strokeWidth="1.7" fill={active ? "rgba(212,175,55,0.12)" : "none"} />
      <path d="M7.4 9.2C7.4 6.8 9.4 5 12 5s4.6 1.8 4.6 4.2" stroke={c} strokeWidth="1.7" />
      <path d="M12 12.2v4.2" stroke={c} strokeWidth="1.7" strokeLinecap="round" />
    </Base>
  );
}

export function VaultsIcon({ active, size, ...rest }: IconProps) {
  const c = paint(active);
  return (
    <Base size={size} {...rest}>
      <rect x="4.2" y="8.2" width="15.6" height="11.4" rx="2.2" stroke={c} strokeWidth="1.7" fill={active ? "rgba(212,175,55,0.12)" : "none"} />
      <path d="M9 8.2V6.4A3 3 0 0 1 12 3.6 3 3 0 0 1 15 6.4v1.8" stroke={c} strokeWidth="1.7" />
      <circle cx="12" cy="14.4" r="1.5" stroke={c} strokeWidth="1.7" />
    </Base>
  );
}

export function PointsIcon({ active, size, ...rest }: IconProps) {
  const c = paint(active);
  return (
    <Base size={size} {...rest}>
      <path
        d="M12 3.8 13.9 8.4l5 .6-3.7 3.4.9 4.9L12 15.1 7.9 17.3l.9-4.9L5.1 9l5-.6L12 3.8Z"
        stroke={c}
        strokeWidth="1.7"
        strokeLinejoin="round"
        fill={active ? "rgba(212,175,55,0.16)" : "none"}
      />
    </Base>
  );
}

export function MenuIcon({ active, size, ...rest }: IconProps) {
  const c = paint(active);
  return (
    <Base size={size} {...rest}>
      <path d="M5 7.2h14" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M5 12h10" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M5 16.8h12" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
    </Base>
  );
}

export function SettingsIcon({ active, size, ...rest }: IconProps) {
  const c = paint(active);
  return (
    <Base size={size} {...rest}>
      <circle cx="12" cy="12" r="3.1" stroke={c} strokeWidth="1.7" />
      <path d="M12 4.2v2.2" stroke={c} strokeWidth="1.7" strokeLinecap="round" />
      <path d="M12 17.6v2.2" stroke={c} strokeWidth="1.7" strokeLinecap="round" />
      <path d="M4.2 12h2.2" stroke={c} strokeWidth="1.7" strokeLinecap="round" />
      <path d="M17.6 12h2.2" stroke={c} strokeWidth="1.7" strokeLinecap="round" />
      <path d="M6.5 6.5l1.55 1.55" stroke={c} strokeWidth="1.7" strokeLinecap="round" />
      <path d="M15.95 15.95l1.55 1.55" stroke={c} strokeWidth="1.7" strokeLinecap="round" />
      <path d="M17.5 6.5l-1.55 1.55" stroke={c} strokeWidth="1.7" strokeLinecap="round" />
      <path d="M8.05 15.95l-1.55 1.55" stroke={c} strokeWidth="1.7" strokeLinecap="round" />
    </Base>
  );
}

export function DeskIcon({ active, size, ...rest }: IconProps) {
  const c = paint(active);
  return (
    <Base size={size} {...rest}>
      <circle cx="12" cy="12" r="7" stroke={c} strokeWidth="1.7" fill={active ? "rgba(212,175,55,0.12)" : "none"} />
      <path d="M12 8v4.1l2.4 1.5" stroke={c} strokeWidth="1.7" strokeLinecap="round" />
    </Base>
  );
}

export function HomeActiveIcon(props: IconProps) {
  return <HomeIcon active {...props} />;
}
export function HomeInactiveIcon(props: IconProps) {
  return <HomeIcon {...props} />;
}
export function TradeActiveIcon(props: IconProps) {
  return <TradeIcon active {...props} />;
}
export function TradeInactiveIcon(props: IconProps) {
  return <TradeIcon {...props} />;
}
export function MarketsActiveIcon(props: IconProps) {
  return <MarketsIcon active {...props} />;
}
export function MarketsInactiveIcon(props: IconProps) {
  return <MarketsIcon {...props} />;
}
export function PortfolioActiveIcon(props: IconProps) {
  return <PortfolioIcon active {...props} />;
}
export function PortfolioInactiveIcon(props: IconProps) {
  return <PortfolioIcon {...props} />;
}
export function LeaderboardActiveIcon(props: IconProps) {
  return <LeaderboardIcon active {...props} />;
}
export function LeaderboardInactiveIcon(props: IconProps) {
  return <LeaderboardIcon {...props} />;
}
