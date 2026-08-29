import type { ReactNode, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & {
  active?: boolean;
  size?: number;
};

const stroke = (active?: boolean) => (active ? "#d4af37" : "#848e9c");

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

export function TradeIcon({ active, size, ...rest }: IconProps) {
  const c = stroke(active);
  return (
    <Base size={size} {...rest}>
      <path d="M4 18V8" stroke={c} strokeWidth="1.6" strokeLinecap="square" />
      <path d="M4 11h3v4H4" stroke={c} strokeWidth="1.6" />
      <path d="M11 18V5" stroke={c} strokeWidth="1.6" strokeLinecap="square" />
      <path d="M11 8h3v7h-3" stroke={c} strokeWidth="1.6" />
      <path d="M18 18V10" stroke={c} strokeWidth="1.6" strokeLinecap="square" />
      <path d="M18 12h3v4h-3" stroke={c} strokeWidth="1.6" />
    </Base>
  );
}

export function MarketsIcon({ active, size, ...rest }: IconProps) {
  const c = stroke(active);
  return (
    <Base size={size} {...rest}>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1" stroke={c} strokeWidth="1.6" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1" stroke={c} strokeWidth="1.6" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1" stroke={c} strokeWidth="1.6" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1" stroke={c} strokeWidth="1.6" />
    </Base>
  );
}

export function PortfolioIcon({ active, size, ...rest }: IconProps) {
  const c = stroke(active);
  return (
    <Base size={size} {...rest}>
      <rect x="3.5" y="7.5" width="17" height="12" rx="1.5" stroke={c} strokeWidth="1.6" />
      <path d="M8 7.5V6.2A2.2 2.2 0 0 1 10.2 4h3.6A2.2 2.2 0 0 1 16 6.2v1.3" stroke={c} strokeWidth="1.6" />
      <path d="M3.5 13h17" stroke={c} strokeWidth="1.6" />
    </Base>
  );
}

export function LeaderboardIcon({ active, size, ...rest }: IconProps) {
  const c = stroke(active);
  return (
    <Base size={size} {...rest}>
      <path d="M5 19V11h4v8H5Z" stroke={c} strokeWidth="1.6" />
      <path d="M10 19V6h4v13h-4Z" stroke={c} strokeWidth="1.6" />
      <path d="M15 19v-6h4v6h-4Z" stroke={c} strokeWidth="1.6" />
    </Base>
  );
}

export function SwapIcon({ active, size, ...rest }: IconProps) {
  const c = stroke(active);
  return (
    <Base size={size} {...rest}>
      <path d="M7 7h11" stroke={c} strokeWidth="1.6" strokeLinecap="square" />
      <path d="M15 4l3 3-3 3" stroke={c} strokeWidth="1.6" strokeLinejoin="miter" />
      <path d="M17 17H6" stroke={c} strokeWidth="1.6" strokeLinecap="square" />
      <path d="M9 20l-3-3 3-3" stroke={c} strokeWidth="1.6" strokeLinejoin="miter" />
    </Base>
  );
}

export function RewardsIcon({ active, size, ...rest }: IconProps) {
  const c = stroke(active);
  return (
    <Base size={size} {...rest}>
      <path d="M8 5h8l1.5 3.5H6.5L8 5Z" stroke={c} strokeWidth="1.6" strokeLinejoin="miter" />
      <path d="M7 8.5h10v3.5l-5 2-5-2V8.5Z" stroke={c} strokeWidth="1.6" />
      <path d="M12 14v5" stroke={c} strokeWidth="1.6" />
      <path d="M8 19h8" stroke={c} strokeWidth="1.6" strokeLinecap="square" />
    </Base>
  );
}

export function VaultsIcon({ active, size, ...rest }: IconProps) {
  const c = stroke(active);
  return (
    <Base size={size} {...rest}>
      <rect x="4" y="7" width="16" height="13" rx="1.5" stroke={c} strokeWidth="1.6" />
      <path d="M4 11h16" stroke={c} strokeWidth="1.6" />
      <circle cx="12" cy="15.5" r="1.6" stroke={c} strokeWidth="1.6" />
      <path d="M9 7V5.8A3 3 0 0 1 12 2.8 3 3 0 0 1 15 5.8V7" stroke={c} strokeWidth="1.6" />
    </Base>
  );
}

export function PointsIcon({ active, size, ...rest }: IconProps) {
  const c = stroke(active);
  return (
    <Base size={size} {...rest}>
      <path d="M12 3.5l2.1 4.4 4.8.6-3.5 3.3.9 4.8L12 14.4 7.7 16.6l.9-4.8L5.1 8.5l4.8-.6L12 3.5Z" stroke={c} strokeWidth="1.6" strokeLinejoin="miter" />
    </Base>
  );
}

export function SettingsIcon({ active, size, ...rest }: IconProps) {
  const c = stroke(active);
  return (
    <Base size={size} {...rest}>
      <circle cx="12" cy="12" r="2.7" stroke={c} strokeWidth="1.6" />
      <path
        d="M10.4 3.6h3.2l.4 2.2 1.9.8 1.9-1.2 2.3 2.3-1.2 1.9.8 1.9 2.2.4v3.2l-2.2.4-.8 1.9 1.2 1.9-2.3 2.3-1.9-1.2-1.9.8-.4 2.2h-3.2l-.4-2.2-1.9-.8-1.9 1.2-2.3-2.3 1.2-1.9-.8-1.9-2.2-.4v-3.2l2.2-.4.8-1.9-1.2-1.9 2.3-2.3 1.9 1.2 1.9-.8.4-2.2Z"
        stroke={c}
        strokeWidth="1.6"
        strokeLinejoin="miter"
      />
    </Base>
  );
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
