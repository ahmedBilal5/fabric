/**
 * FabricDashboardPage — a page of key numbers and charts: a page header, one filter
 * row (a date range with quick presets, plus your own filters) that scopes everything
 * below it, and a responsive grid of widgets.
 *
 * Lay widgets out with `FabricDashboardGrid` and `FabricDashboardItem`. Items take a
 * `size` ("quarter", "third", "half", "twoThirds", "full") that collapses sensibly on
 * smaller screens, or an exact `span` per breakpoint on a 12-column grid. Give chart cards
 * `headingLevel="h2"`, since the page title is the `h1`. The page
 * never fetches: it hands you the date range and you load the data.
 *
 * @example
 * ```tsx
 * <FabricDashboardPage
 *   title="Sales overview"
 *   dateRange={range}
 *   onDateRangeChange={setRange}
 *   lastUpdated={fetchedAt}
 *   onRefresh={refetch}
 * >
 *   <FabricDashboardGrid>
 *     <FabricDashboardItem size="quarter"><FabricStatCard … /></FabricDashboardItem>
 *     <FabricDashboardItem size="twoThirds"><FabricChartCard … /></FabricDashboardItem>
 *   </FabricDashboardGrid>
 * </FabricDashboardPage>
 * ```
 */

import { FabricIconButton, FabricRelativeTime } from "@fabric-kit/components";
import {
  type FabricDateRange,
  FabricDateRangePicker,
  type FabricDateRangePreset,
} from "@fabric-kit/date-picker";
import { fontSize, spacing } from "@fabric-kit/design-tokens";
import RefreshIcon from "@fabric-kit/icons/Refresh";
import { FabricPageHeader, type FabricPageHeaderProps } from "@fabric-kit/layout";
import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";
import type { ReactNode } from "react";

export interface FabricDashboardPageProps extends Omit<FabricPageHeaderProps, "tabs" | "sx"> {
  /** The date range every widget shows. Leave out to hide the date filter. */
  dateRange?: FabricDateRange;
  /** Called when the user picks a new range. */
  onDateRangeChange?: (range: FabricDateRange) => void;
  /** Quick ranges beside the date fields. `true` for Fabric's set. @default true */
  datePresets?: boolean | FabricDateRangePreset[];
  /** "Today" for the presets. Defaults to now; set it for stable stories and tests. */
  today?: Date;
  /** More filters in the same row, e.g. a region select. */
  filters?: ReactNode;
  /** When the data was loaded. Shows "Updated 3 minutes ago". */
  lastUpdated?: Date | number;
  /** Reload the data. Shows a refresh button. */
  onRefresh?: () => void;
  /** Data is reloading: the refresh button is disabled. Widgets show their own state. */
  refreshing?: boolean;
  /** The widgets, usually a `FabricDashboardGrid`. */
  children: ReactNode;
  /** System styles on the root. */
  sx?: SxProps<Theme>;
}

/** A dashboard page: header, one filter row and a widget grid. */
export function FabricDashboardPage({
  dateRange,
  onDateRangeChange,
  datePresets = true,
  today,
  filters,
  lastUpdated,
  onRefresh,
  refreshing = false,
  children,
  sx,
  ...header
}: Readonly<FabricDashboardPageProps>) {
  const hasFilterRow = dateRange || filters || lastUpdated !== undefined || onRefresh;
  return (
    <Box
      sx={[
        { display: "flex", flexDirection: "column", gap: `${spacing.lg}px`, minWidth: 0 },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <FabricPageHeader {...header} divider={header.divider ?? false} />
      {hasFilterRow && (
        <Box
          role="search"
          aria-label="Dashboard filters"
          sx={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "flex-end",
            gap: `${spacing.md}px`,
          }}
        >
          {dateRange && (
            <FabricDateRangePicker
              value={dateRange}
              onChange={onDateRangeChange}
              presets={datePresets}
              today={today}
              pickerWidth={180}
              sx={{ flex: "0 1 auto", maxWidth: "100%" }}
            />
          )}
          {filters}
          {(lastUpdated !== undefined || onRefresh) && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: `${spacing.xs}px`,
                ml: { sm: "auto" },
                fontSize: fontSize.sm,
                color: "var(--mui-palette-text-secondary)",
              }}
            >
              {lastUpdated !== undefined && (
                <span aria-live="polite">
                  Updated <FabricRelativeTime date={lastUpdated} />
                </span>
              )}
              {onRefresh && (
                <FabricIconButton
                  aria-label="Refresh data"
                  onClick={onRefresh}
                  disabled={refreshing}
                  size="small"
                >
                  <RefreshIcon fontSize="small" />
                </FabricIconButton>
              )}
            </Box>
          )}
        </Box>
      )}
      <Box aria-busy={refreshing || undefined} sx={{ minWidth: 0 }}>
        {children}
      </Box>
    </Box>
  );
}

export interface FabricDashboardGridProps {
  /** `FabricDashboardItem`s. */
  children: ReactNode;
  /** Space between widgets, in px. @default 16 */
  gap?: number;
  /** System styles on the grid. */
  sx?: SxProps<Theme>;
}

/** A 12-column grid for dashboard widgets. Each `FabricDashboardItem` says how wide it is. */
export function FabricDashboardGrid({
  children,
  gap = spacing.lg,
  sx,
}: Readonly<FabricDashboardGridProps>) {
  return (
    <Box
      sx={[
        {
          display: "grid",
          gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
          gap: `${gap}px`,
          alignItems: "stretch",
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {children}
    </Box>
  );
}

type Breakpoint = "xs" | "sm" | "md" | "lg" | "xl";

/** Columns out of 12 at each breakpoint. Missing breakpoints take the one below. */
export type FabricDashboardSpan = number | Partial<Record<Breakpoint, number>>;

/** Named widths and how they collapse on smaller screens. */
export const dashboardItemSizes = {
  quarter: { xs: 12, sm: 6, lg: 3 },
  third: { xs: 12, md: 6, lg: 4 },
  half: { xs: 12, md: 6 },
  twoThirds: { xs: 12, lg: 8 },
  full: { xs: 12 },
} as const satisfies Record<string, Partial<Record<Breakpoint, number>>>;

export interface FabricDashboardItemProps {
  /** A named width. Ignored when `span` is set. @default "full" */
  size?: keyof typeof dashboardItemSizes;
  /** Exact columns out of 12, e.g. `{ xs: 12, md: 4 }`. */
  span?: FabricDashboardSpan;
  /** Rows to take, for a tall widget beside two short ones. @default 1 */
  rowSpan?: number;
  /** The widget, e.g. a `FabricStatCard` or `FabricChartCard`. */
  children: ReactNode;
  /** System styles on the item. */
  sx?: SxProps<Theme>;
}

/** One widget's place in a `FabricDashboardGrid`. */
export function FabricDashboardItem({
  size = "full",
  span,
  rowSpan = 1,
  children,
  sx,
}: Readonly<FabricDashboardItemProps>) {
  const cols = span ?? dashboardItemSizes[size];
  const gridColumn =
    typeof cols === "number"
      ? `span ${cols}`
      : Object.fromEntries(Object.entries(cols).map(([bp, n]) => [bp, `span ${n}`]));
  return (
    <Box
      sx={[
        {
          gridColumn:
            typeof gridColumn === "string" ? gridColumn : { xs: "span 12", ...gridColumn },
          gridRow: rowSpan > 1 ? `span ${rowSpan}` : undefined,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          "& > *": { flex: 1 },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {children}
    </Box>
  );
}
