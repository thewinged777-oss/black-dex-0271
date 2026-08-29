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
        className={className}
        style={{
          height: height ?? 32,
          width: "auto",
          objectFit: "contain",
          background: "transparent",
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

export const BrandMark: FC<{ className?: string; height?: number }> = ({
  className,
  height = 32,
}) => {
  return (
    <span className={["oui-inline-flex oui-items-center oui-gap-2", className].filter(Boolean).join(" ")}>
      <ThemeLogo variant="secondary" height={height} />
      <ThemeLogo />
    </span>
  );
};

export default ThemeLogo;
