export const iconSize = {
  xs: 12,
  sm: 16,
  md: 18,
  lg: 20,
  xl: 24,
  "2xl": 28,
  "3xl": 32,
} as const;

export const controlHeight = {
  sm: 36,
  md: 44,
  lg: 48,
} as const;

export const scrollbarSize = {
  thickness: "0.5em",
} as const;

export type IconSize = typeof iconSize;
export type ControlHeight = typeof controlHeight;
export type ScrollbarSize = typeof scrollbarSize;
