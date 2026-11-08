/** Spacing scale in px. Named slots map to the 4px grid. */

export const spacing = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xlsm: 20,
  xl: 24,
  "2xl": 32,
  lgXl: 40,
  "3xl": 48,
  "4xl": 64,
  xlxl: 80,
  massive: 120,
} as const;

export type Spacing = typeof spacing;
