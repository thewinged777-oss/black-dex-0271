import { CSSProperties, FC } from "react";
import { withBasePath } from "@/utils/base-path";
import { getRuntimeConfig } from "@/utils/runtime-config";

type ThemeLogoProps = {
  variant?: "primary" | "secondary";
  alt?: string;
  className?: string;
  height?: number | string;
  style?: CSSProperties;
};

export const ThemeLogo: FC<ThemeLogoProps> = ({
  variant = "primary",
  alt = "Black DEX",
  className,
  height,
  style,
}) => {
  if (variant === "secondary") {
    return (
      <img
        src={withBasePath("/logo-secondary.webp")}
        alt={alt}
        className={["bd-header-shield", className].filter(Boolean).join(" ")}
        style={{
          height: height ?? 28,
          width: height ?? 28,
          objectFit: "contain",
          background: "transparent",
          display: "block",
          ...style,
        }}
      />
    );
  }

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
