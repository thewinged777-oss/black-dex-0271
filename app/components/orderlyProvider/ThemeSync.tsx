import { useEffect } from "react";
import { getDexThemeConfig } from "@/utils/theme-config";

export const BD_THEME_EVENT = "bd-theme-change";
export type BdThemeSlug = "original" | "classic" | "navy";

const STORAGE_KEYS = [
  "orderly_theme_id",
  "oui-theme-id",
  "orderly-theme",
  "oui_theme_id",
  "oui-theme",
  "theme-id",
  "themeId",
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

const matchTheme = (raw: string | null): BdThemeSlug | null => {
  if (!raw) return null;
  const value = raw.trim();
  if (value === "classic" || value === "navy" || value === "original") return value;
  const themes = getDexThemeConfig();
  const match = themes.find(
    (theme) =>
      theme.id === value ||
      theme.displayName.toLowerCase() === value.toLowerCase(),
  );
  return match ? slugFromThemeName(match.displayName) : null;
};

const slugFromRgb = (rgb: string): BdThemeSlug | null => {
  const value = normalizeRgb(rgb);
  if (!value || value === "0 0 0") return null;
  if (value === "7 9 15") return "navy";
  if (value === "11 14 17") return "classic";
  if (value === "0 0 0") return "original";
  const themes = getDexThemeConfig();
  const byToken = themes.find((theme) => {
    const token = theme.cssVars?.["--oui-color-base-9"];
    return token ? normalizeRgb(token) === value : false;
  });
  return byToken ? slugFromThemeName(byToken.displayName) : null;
};

const detectSlug = (): BdThemeSlug => {
  for (const key of STORAGE_KEYS) {
    const fromLocal = matchTheme(window.localStorage.getItem(key));
    if (fromLocal) return fromLocal;
    const fromSession = matchTheme(window.sessionStorage.getItem(key));
    if (fromSession) return fromSession;
  }

  for (let i = 0; i < window.localStorage.length; i += 1) {
    const key = window.localStorage.key(i);
    if (!key || !/theme/i.test(key)) continue;
    const hit = matchTheme(window.localStorage.getItem(key));
    if (hit) return hit;
  }

  const inline = document.documentElement.style.getPropertyValue("--oui-color-base-9");
  const fromInline = slugFromRgb(inline);
  if (fromInline) return fromInline;

  const computed = getComputedStyle(document.documentElement).getPropertyValue(
    "--oui-color-base-9",
  );
  return slugFromRgb(computed) || "original";
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

const slugFromLabel = (label: string): BdThemeSlug | null => {
  const value = label.replace(/\s+/g, " ").trim().toLowerCase();
  if (value.includes("navy")) return "navy";
  if (value.includes("classic")) return "classic";
  if (value.includes("original") || value === "default") return "original";
  return matchTheme(label);
};

export default function ThemeSync() {
  useEffect(() => {
    applyBdTheme();

    const onStorage = () => applyBdTheme();
    window.addEventListener("storage", onStorage);

    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const node = target?.closest("button, [role='menuitem'], [role='option'], li, div") as HTMLElement | null;
      if (!node) return;
      const label = (node.textContent || "").replace(/\s+/g, " ").trim();
      if (label.length > 24) return;
      const slug = slugFromLabel(label);
      if (slug) {
        window.localStorage.setItem("orderly_theme_id", slug);
        applyBdTheme(slug);
      }
    };
    document.addEventListener("click", onClick, true);

    const observer = new MutationObserver(() => applyBdTheme());
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["style", "class", "data-theme", "data-oui-theme"],
    });
    const id = window.setInterval(() => applyBdTheme(), 500);
    return () => {
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("click", onClick, true);
      observer.disconnect();
      window.clearInterval(id);
    };
  }, []);

  return null;
}
