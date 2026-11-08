/**
 * Shadow tokens.
 * Global Header uses: drop-shadow(0 0 24px rgba(19,38,64,0.08)) spread -6.
 */

export const shadows = {
  none: "none",
  xs: "0px 1px 2px rgba(42, 36, 32, 0.05)",
  sm: "0px 1px 3px rgba(42, 36, 32, 0.1), 0px 1px 2px rgba(42, 36, 32, 0.06)",
  md: "0px 4px 8px -2px rgba(42, 36, 32, 0.1), 0px 2px 4px -2px rgba(42, 36, 32, 0.06)",
  lg: "0px 12px 16px -4px rgba(42, 36, 32, 0.08), 0px 4px 6px -2px rgba(42, 36, 32, 0.03)",
  xl: "0px 20px 24px -4px rgba(42, 36, 32, 0.08), 0px 8px 8px -4px rgba(42, 36, 32, 0.03)",
  dropdown: "0px 4px 8px rgba(42, 36, 32, 0.25)",
  panel: "0px 8px 20px -3px rgba(42, 36, 32, 0.16)",
  header: "0px 0px 24px -6px rgba(42, 36, 32, 0.08)",
} as const;

export type Shadows = typeof shadows;
