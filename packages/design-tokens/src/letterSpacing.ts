export const letterSpacing = {
  none: "0em",
  tight: "0.03em",
  wide: "0.04em",
} as const;

export type LetterSpacing = typeof letterSpacing;
