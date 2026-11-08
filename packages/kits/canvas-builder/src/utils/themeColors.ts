import type { Theme } from "@mui/material/styles";

/** Palette values the canvas components need, resolved so they follow light/dark mode. */
export type CanvasThemeColors = {
  divider: string;
  textPrimary: string;
  textSecondary: string;
  textDisabled: string;
  paper: string;
  background: string;
  primary: string;
  warning: string;
  warningLight: string;
  error: string;
  errorLight: string;
  info: string;
  infoLight: string;
  success: string;
  actionHover: string;
  actionSelected: string;
};

// Literal CSS variables (Fabric convention): `theme.vars` is not reliably populated, which left the static light palette.
const CANVAS_THEME_COLORS: CanvasThemeColors = {
  divider: "var(--mui-palette-divider)",
  textPrimary: "var(--mui-palette-text-primary)",
  textSecondary: "var(--mui-palette-text-secondary)",
  textDisabled: "var(--mui-palette-text-disabled)",
  paper: "var(--mui-palette-background-paper)",
  background: "var(--mui-palette-background-default)",
  primary: "var(--mui-palette-primary-main)",
  warning: "var(--mui-palette-warning-main)",
  warningLight: "var(--mui-palette-warning-light)",
  error: "var(--mui-palette-error-main)",
  errorLight: "var(--mui-palette-error-light)",
  info: "var(--mui-palette-info-main)",
  infoLight: "var(--mui-palette-info-light)",
  success: "var(--mui-palette-success-main)",
  actionHover: "var(--mui-palette-action-hover)",
  actionSelected: "var(--mui-palette-action-selected)",
};

/** Palette colors as CSS variables so they follow the active color scheme. */
export const getCanvasThemeColors = (_theme?: Theme): CanvasThemeColors => CANVAS_THEME_COLORS;

/** Mixes `percent`% of `color` with transparency; works with CSS variables, unlike hex alpha suffixes. */
export const withAlpha = (color: string, percent: number) =>
  `color-mix(in srgb, ${color} ${percent}%, transparent)`;

/** Mixes `percent`% of `color` into `base`, giving an opaque tint that hides whatever is behind it. */
export const tintOver = (color: string, percent: number, base: string) =>
  `color-mix(in srgb, ${color} ${percent}%, ${base})`;
