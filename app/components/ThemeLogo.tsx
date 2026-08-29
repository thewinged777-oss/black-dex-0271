import { CSSProperties, FC, useEffect, useState } from "react";
import { withBasePath } from "@/utils/base-path";

export type DexThemeName = "original" | "classic" | "navy";

export const readActiveDexTheme = (): DexThemeName => {
  if (typeof document === "undefined") {
    return "original";
  }

  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue("--oui-color-base-9")
    .trim()
    .replace(/,/g, " ")
    .replace(/\s+/g, " ");

  if (raw.startsWith("11 14")) {
    return "classic";
  }
  if (raw.startsWith("7 9")) {
    return "navy";
  }
  return "original";
};

export const useActiveDexTheme = (): DexThemeName => {
  const [theme, setTheme] = useState<DexThemeName>("original");

  useEffect(() => {
    const sync = () => {
      setTheme(readActiveDexTheme());
    };

    sync();

    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["style", "class", "data-theme", "data-oui-theme"],
    });

    window.addEventListener("storage", sync);
    const timer = window.setInterval(sync, 400);

    return () => {
      observer.disconnect();
      window.removeEventListener("storage", sync);
      window.clearInterval(timer);
    };
  }, []);

  return theme;
};

type ThemeLogoProps = {
  variant?: "primary" | "secondary";
  alt?: string;
  className?: string;
  height?: number | string;
  style?: CSSProperties;
};

export const ThemeLogo: FC<ThemeLogoProps> = ({
  variant = "primary",
  alt = "logo",
  className,
  height,
  style,
}) => {
  const theme = useActiveDexTheme();
  const src =
    variant === "secondary"
      ? withBasePath("/logo-secondary.webp")
      : withBasePath(`/logo-${theme}.svg`);

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={{
        height: height ?? (variant === "secondary" ? 32 : 36),
        width: "auto",
        objectFit: "contain",
        background: "transparent",
        ...style,
      }}
    />
  );
};

export default ThemeLogo;
