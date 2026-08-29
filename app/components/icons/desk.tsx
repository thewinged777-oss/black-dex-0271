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
