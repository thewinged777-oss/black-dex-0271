import { useEffect } from "react";
import { getDexThemeConfig } from "@/utils/theme-config";

export const BD_THEME_EVENT = "bd-theme-change";
export type BdThemeSlug = "original" | "classic" | "navy";

const STORAGE_KEYS = [
  "orderly_theme_id",
  "oui-theme-id",
  "orderly-theme",
  "oui_theme_id",
];

const normalizeRgb = (value: string) =>
  value
    .replace(/rgba?\(/gi, "")
    .replace(/\)/g, "")
    .split(/[,\s/]+/)
    .filter(Boolean)
    .slice(0, 3)
    .map((part) => String(Number.parseInt(part, 10) || 0))
    .join(" ");

export const slugFromThemeName = (name: string): BdThemeSlug => {
  const normalized = name.toLowerCase();
  if (normalized.includes("navy")) return "navy";
  if (normalized.includes("classic")) return "classic";
  return "original";
};

const detectSlug = (): BdThemeSlug => {
  const themes = getDexThemeConfig();

  for (const key of STORAGE_KEYS) {
    const raw = window.localStorage.getItem(key);
    if (!raw) continue;
    const match = themes.find(
      (theme) =>
        theme.id === raw ||
        theme.displayName.toLowerCase() === raw.toLowerCase(),
    );
    if (match) return slugFromThemeName(match.displayName);
  }

  const base9 = normalizeRgb(
    getComputedStyle(document.documentElement).getPropertyValue(
      "--oui-color-base-9",
    ),
  );
  const byToken = themes.find((theme) => {
    const token = theme.cssVars?.["--oui-color-base-9"];
    return token ? normalizeRgb(token) === base9 : false;
  });
  if (byToken) return slugFromThemeName(byToken.displayName);

  if (base9 === "7 9 15") return "navy";
  if (base9 === "11 14 17") return "classic";
  return "original";
};

export const applyBdTheme = (slug?: BdThemeSlug) => {
  const next = slug || detectSlug();
  const current = document.documentElement.getAttribute("data-bd-theme");
  if (current !== next) {
    document.documentElement.setAttribute("data-bd-theme", next);
    window.dispatchEvent(new CustomEvent(BD_THEME_EVENT, { detail: next }));
  }
  return next;
};

export const getBdThemeSlug = (): BdThemeSlug => {
  const current = document.documentElement.getAttribute("data-bd-theme");
  if (current === "classic" || current === "navy" || current === "original") {
    return current;
  }
  return detectSlug();
};

export default function ThemeSync() {
  useEffect(() => {
    applyBdTheme();
    const onStorage = () => applyBdTheme();
    window.addEventListener("storage", onStorage);
    const observer = new MutationObserver(() => applyBdTheme());
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["style", "class", "data-theme", "data-oui-theme"],
    });
    const id = window.setInterval(() => applyBdTheme(), 900);
    return () => {
      window.removeEventListener("storage", onStorage);
      observer.disconnect();
      window.clearInterval(id);
    };
  }, []);

  return null;
}
