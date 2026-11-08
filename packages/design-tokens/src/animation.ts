export const duration = {
  instant: 0,
  micro: 120,
  fast: 200,
  normal: 300,
  slow: 500,
} as const;

export const easing = {
  default: "ease",
  in: "ease-in",
  out: "ease-out",
  inOut: "ease-in-out",
  linear: "linear",
} as const;

export type Duration = typeof duration;
export type Easing = typeof easing;
