import { useMediaQuery, useTheme } from "@mui/material";
import type { Breakpoint } from "@mui/material/styles";

type Direction = "up" | "down" | "between" | "only";

/**
 * Responsive breakpoint hook tied to Fabric's breakpoint tokens.
 *
 * @example
 * const isMobile = useBreakpoint('down', 'md');
 * const isDesktop = useBreakpoint('up', 'lg');
 * const isTabletOnly = useBreakpoint('only', 'md');
 * const isBetween = useBreakpoint('between', 'sm', 'lg');
 */
export function useBreakpoint(direction: "between", start: Breakpoint, end: Breakpoint): boolean;
export function useBreakpoint(
  direction: Exclude<Direction, "between">,
  breakpoint: Breakpoint,
): boolean;
export function useBreakpoint(direction: Direction, start: Breakpoint, end?: Breakpoint): boolean {
  const theme = useTheme();
  let query: string;
  switch (direction) {
    case "up":
      query = theme.breakpoints.up(start);
      break;
    case "down":
      query = theme.breakpoints.down(start);
      break;
    case "only":
      query = theme.breakpoints.only(start);
      break;
    case "between": {
      if (!end) {
        throw new Error('useBreakpoint: "end" breakpoint is required when direction is "between".');
      }
      query = theme.breakpoints.between(start, end);
      break;
    }
  }
  return useMediaQuery(query, { noSsr: true });
}
