import { Box, type BoxProps } from "@mui/material";
import React from "react";
import type { Breakpoint } from "./system";

export interface ShowProps extends Omit<BoxProps, "display"> {
  /** Show children at this breakpoint and above. */
  above?: Breakpoint;
  /** Show children at this breakpoint and below. */
  below?: Breakpoint;
}

/**
 * Conditionally renders children via CSS `display` at breakpoints. No JS — no layout shift.
 *
 * @example
 * <Show above="md"><DesktopSidebar /></Show>
 * <Show below="md"><MobileDrawer /></Show>
 */
export const Show = React.forwardRef<HTMLDivElement, ShowProps>(function Show(
  { above, below, sx, ...rest },
  ref,
) {
  const displaySx = buildDisplaySx(above, below, "block");
  return <Box ref={ref} sx={[displaySx, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]} {...rest} />;
});

export interface HideProps extends Omit<BoxProps, "display"> {
  /** Hide children at this breakpoint and above. */
  above?: Breakpoint;
  /** Hide children at this breakpoint and below. */
  below?: Breakpoint;
}

/**
 * Hides children via CSS `display: none` at breakpoints. No JS — no layout shift.
 *
 * @example
 * <Hide below="md"><WideContent /></Hide>
 * <Hide above="lg"><CompactContent /></Hide>
 */
export const Hide = React.forwardRef<HTMLDivElement, HideProps>(function Hide(
  { above, below, sx, ...rest },
  ref,
) {
  const displaySx = buildDisplaySx(above, below, "none");
  return <Box ref={ref} sx={[displaySx, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]} {...rest} />;
});

const BP_ORDER: Breakpoint[] = ["xs", "sm", "md", "lg", "xl", "2xl"];

// For Show: display = 'none' outside the range, 'block' inside.
// For Hide: display = 'block' outside the range, 'none' inside.
function buildDisplaySx(
  above: Breakpoint | undefined,
  below: Breakpoint | undefined,
  mode: "block" | "none",
): { display: string | Record<string, string> } {
  const visible = mode === "block" ? "block" : "none";
  const hidden = mode === "block" ? "none" : "block";

  if (above && below) {
    const result: Record<string, string> = {};
    const startIdx = BP_ORDER.indexOf(below);
    const endIdx = BP_ORDER.indexOf(above);
    for (let i = 0; i < BP_ORDER.length; i++) {
      result[BP_ORDER[i]] = i >= endIdx && i <= startIdx ? visible : hidden;
    }
    return { display: result };
  }

  if (above) {
    const result: Record<string, string> = {};
    const idx = BP_ORDER.indexOf(above);
    for (let i = 0; i < BP_ORDER.length; i++) {
      result[BP_ORDER[i]] = i >= idx ? visible : hidden;
    }
    return { display: result };
  }

  if (below) {
    const result: Record<string, string> = {};
    const idx = BP_ORDER.indexOf(below);
    for (let i = 0; i < BP_ORDER.length; i++) {
      result[BP_ORDER[i]] = i < idx ? visible : hidden;
    }
    return { display: result };
  }

  return { display: visible };
}
