export const opacity = {
  0: 0,
  5: 0.05,
  10: 0.1,
  20: 0.2,
  40: 0.4,
  50: 0.5,
  60: 0.6,
  80: 0.8,
  100: 1,
  disabled: 0.5,
  muted: 0.6,
} as const;

export type Opacity = typeof opacity;
