import { create } from "storybook/theming/create";
import { BRAND_PALETTES, type BrandName, DEFAULT_BRAND, isBrand } from "./brand-palettes";

/**
 * Storybook UI themes (sidebar, toolbar and docs chrome), one per sample brand
 * and mode, so the whole window follows the brand picked in the toolbar.
 */
const shared = {
  brandTitle: "Fabric",
  brandUrl: "../",
  brandTarget: "_self",
  appBorderRadius: 8,
  inputBorderRadius: 6,
  fontBase: "'Geist', ui-sans-serif, system-ui, sans-serif",
  fontCode: "'Geist Mono', ui-monospace, monospace",
} as const;

export type Mode = "light" | "dark";

function build(brand: BrandName, mode: Mode) {
  const c = BRAND_PALETTES[brand][mode];
  const light = mode === "light";
  return create({
    ...shared,
    base: mode,
    brandImage: light ? "./fabric-logo.svg" : "./fabric-logo-dark.svg",
    colorPrimary: c.primary,
    colorSecondary: c.selected,
    appBg: light ? c.bg : c.subtle,
    appContentBg: light ? c.paper : c.bg,
    appPreviewBg: light ? c.paper : c.bg,
    appBorderColor: light ? c.divider : c.dividerLight,
    textColor: c.text,
    textInverseColor: light ? "#FFFFFF" : c.bg,
    textMutedColor: c.textSecondary,
    barTextColor: c.textSecondary,
    barSelectedColor: c.primary,
    barHoverColor: c.primary,
    barBg: c.paper,
    buttonBg: light ? c.bg : c.paper,
    buttonBorder: c.divider,
    booleanBg: light ? c.subtle : c.bg,
    booleanSelectedBg: light ? c.paper : c.dividerLight,
    inputBg: light ? c.paper : c.bg,
    inputBorder: c.borderStrong,
    inputTextColor: c.text,
  });
}

const cache = new Map<string, ReturnType<typeof create>>();

/** The Storybook UI theme for a brand and mode. Unknown brands fall back to Fabric. */
export function sbTheme(brand: unknown, mode: Mode) {
  const name = isBrand(brand) ? brand : DEFAULT_BRAND;
  const key = `${name}/${mode}`;
  let theme = cache.get(key);
  if (!theme) {
    theme = build(name, mode);
    cache.set(key, theme);
  }
  return theme;
}

export const sbLightTheme = sbTheme(DEFAULT_BRAND, "light");
export const sbDarkTheme = sbTheme(DEFAULT_BRAND, "dark");
