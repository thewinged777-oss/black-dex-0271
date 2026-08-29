import { CSSProperties, FC } from "react";
import { getRuntimeConfig } from "@/utils/runtime-config";

type ThemeLogoProps = {
  variant?: "primary" | "secondary";
  alt?: string;
  className?: string;
  height?: number | string;
  style?: CSSProperties;
};

export const ThemeLogo: FC<ThemeLogoProps> = ({
  className,
  style,
}) => {
  const name = getRuntimeConfig("VITE_ORDERLY_BROKER_NAME") || "BLACK DEX";

  return (
    <span
      className={["bd-brand-title", className].filter(Boolean).join(" ")}
      style={style}
      aria-label={name}
    >
      BLACK DEX
    </span>
  );
};

export default ThemeLogo;
