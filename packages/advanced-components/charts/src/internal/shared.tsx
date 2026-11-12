import {
  chart as chartTokens,
  dark,
  fontSize,
  fontWeight,
  spacing,
} from "@fabric-kit/design-tokens";
import Box from "@mui/material/Box";
import { type SxProps, type Theme, useColorScheme, useTheme } from "@mui/material/styles";
import { createContext, type ReactNode, useContext, useMemo } from "react";
import type { ChartTableData } from "../data";

/** Whether a chart shows its marks or the same data as a table. */
export type FabricChartView = "chart" | "table";

/** Set by `FabricChartCard` so the chart inside follows the card's Chart/Table switch. */
export interface ChartCardContextValue {
  view: FabricChartView;
  /** The card's title, used as the chart's accessible name. */
  title?: string;
}

export const ChartCardContext = createContext<ChartCardContextValue | null>(null);

/** Props every Fabric chart shares. */
export interface FabricChartBaseProps {
  /**
   * What the chart shows, e.g. "Revenue by month". It names the chart for screen
   * readers and captions the table. Inside a `FabricChartCard` the card's title is used.
   */
  title?: string;
  /**
   * Show the chart or the same data as a table. Inside a `FabricChartCard` the card's
   * Chart/Table switch sets it.
   * @default "chart"
   */
  view?: FabricChartView;
  /** Number format for values in tooltips, the table and the value axis. */
  valueFormat?: Intl.NumberFormatOptions;
  /** Locale for numbers and dates. Defaults to the browser's. */
  locale?: string;
  /** Heading of the first column in the table view. @default "Category" */
  categoryLabel?: string;
}

/** The colors charts draw with, for the current color mode. */
export interface ChartPalette {
  /** Series colors in order. */
  categorical: string[];
  /** The brand color, for single-series charts and sparklines. */
  primary: string;
}

/** Reads chart colors from the theme, for the current color mode. */
export function useChartPalette(): ChartPalette {
  const theme = useTheme();
  const { mode, systemMode } = useColorScheme();
  // With CSS variables, `theme.palette` stays on the default scheme; pick the active one.
  const active = (mode === "system" ? systemMode : mode) ?? theme.palette.mode;
  const schemes = (theme as { colorSchemes?: Record<string, { palette?: unknown }> }).colorSchemes;
  const palette = (schemes?.[active]?.palette ?? theme.palette) as {
    chart?: { categorical?: string[] };
    primary: { main: string };
  };
  const categorical =
    palette.chart?.categorical ??
    (active === "dark" ? dark.chart.categorical : chartTokens.categorical);
  const primary = palette.primary.main;
  return useMemo(() => ({ categorical: [...categorical], primary }), [categorical, primary]);
}

/** Formats values with `Intl.NumberFormat`. */
export function useNumberFormat(options?: Intl.NumberFormatOptions, locale?: string) {
  const key = JSON.stringify(options ?? null);
  // biome-ignore lint/correctness/useExhaustiveDependencies: options are compared by value through `key`.
  return useMemo(() => {
    const nf = new Intl.NumberFormat(locale, options);
    return (value: number | null | undefined) =>
      typeof value === "number" && Number.isFinite(value) ? nf.format(value) : "–";
  }, [key, locale]);
}

/** Resolves the view and accessible name from props and the surrounding card. */
export function useChartFrame(view?: FabricChartView, title?: string) {
  const card = useContext(ChartCardContext);
  return { view: view ?? card?.view ?? "chart", title: title ?? card?.title };
}

/**
 * Fabric's look for MUI X Charts: hairline solid grid and axes one step off the
 * surface, quiet axis text, 2px lines, washed area fills and a surface gap between
 * pie slices. Colors are CSS variables, so light, dark and brand themes all apply.
 */
export const chartSx = {
  fontFamily: "inherit",
  "& .MuiChartsAxis-root .MuiChartsAxis-line, & .MuiChartsAxis-root .MuiChartsAxis-tick": {
    stroke: "var(--mui-palette-divider)",
  },
  "& .MuiChartsAxis-root .MuiChartsAxis-tickLabel, & .MuiChartsAxis-root .MuiChartsAxis-label": {
    fill: "var(--mui-palette-text-secondary)",
    fontFamily: "inherit",
  },
  "& .MuiChartsAxis-root .MuiChartsAxis-tickLabel": { fontSize: fontSize.sm },
  "& .MuiChartsGrid-line": {
    stroke: "var(--mui-palette-divider)",
    strokeDasharray: "none",
    strokeWidth: 1,
    shapeRendering: "crispEdges",
  },
  "& .MuiChartsLegend-label": {
    color: "var(--mui-palette-text-secondary)",
    fontFamily: "inherit",
    fontSize: fontSize.sm,
  },
  "& .MuiLineChart-line": { strokeWidth: 2, strokeLinejoin: "round", strokeLinecap: "round" },
  "& .MuiLineChart-area": { fillOpacity: 0.12 },
  "& .MuiLineChart-mark": { strokeWidth: 2, fill: "var(--mui-palette-background-paper)" },
  "& .MuiPieArc-root": { stroke: "var(--mui-palette-background-paper)", strokeWidth: 2 },
  "& .MuiChartsAxisHighlight-root": { stroke: "var(--mui-palette-text-disabled)" },
} as const;

/** Tooltip styling, passed through `slotProps.tooltip`. */
export const tooltipSx = {
  "& .MuiChartsTooltip-paper, & .MuiChartsTooltip-root": {
    borderRadius: 2,
    border: "1px solid var(--mui-palette-divider)",
    backgroundColor: "var(--mui-palette-background-paper)",
    color: "var(--mui-palette-text-primary)",
    boxShadow: "var(--mui-shadows-4)",
  },
} as const;

const visuallyHidden = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  whiteSpace: "nowrap",
} as const;

/** The chart's data as a table: visible in table view, otherwise for screen readers only. */
export function ChartTable({
  data,
  caption,
  visible,
}: {
  data: ChartTableData;
  caption?: string;
  visible: boolean;
}) {
  const cell = {
    px: `${spacing.md}px`,
    py: `${spacing.sm}px`,
    borderBottom: "1px solid var(--mui-palette-divider)",
    textAlign: "right",
    fontVariantNumeric: "tabular-nums",
    whiteSpace: "nowrap",
  } as const;
  return (
    <Box
      sx={
        visible
          ? { overflowX: "auto", maxHeight: 360, overflowY: "auto" }
          : (visuallyHidden as SxProps<Theme>)
      }
      tabIndex={visible ? 0 : undefined}
      role={visible ? "region" : undefined}
      aria-label={visible ? (caption ? `${caption} table` : "Chart data") : undefined}
    >
      <Box
        component="table"
        sx={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: fontSize.md,
          color: "var(--mui-palette-text-primary)",
        }}
      >
        {caption && (
          <Box component="caption" sx={visuallyHidden as SxProps<Theme>}>
            {caption}
          </Box>
        )}
        <thead>
          <tr>
            {data.columns.map((c, i) => (
              <Box
                component="th"
                key={c}
                scope="col"
                sx={{
                  ...cell,
                  textAlign: i === 0 ? "left" : "right",
                  fontWeight: fontWeight.semiBold,
                  color: "var(--mui-palette-text-secondary)",
                  position: "sticky",
                  top: 0,
                  backgroundColor: "var(--mui-palette-background-paper)",
                }}
              >
                {c}
              </Box>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row, r) => (
            <tr key={r}>
              {row.map((value, i) =>
                i === 0 ? (
                  <Box
                    component="th"
                    scope="row"
                    key="head"
                    sx={{ ...cell, textAlign: "left", fontWeight: fontWeight.regular }}
                  >
                    {value}
                  </Box>
                ) : (
                  <Box component="td" key={i} sx={cell}>
                    {value}
                  </Box>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </Box>
    </Box>
  );
}

/**
 * Wraps a chart: names it, keeps the last render visible (dimmed) while new data
 * loads instead of flashing a skeleton, and swaps in the table view.
 */
export function ChartFrame({
  title,
  view,
  table,
  loading,
  hasData,
  height,
  sx,
  children,
}: {
  title?: string;
  view: FabricChartView;
  table: ChartTableData;
  loading?: boolean;
  hasData: boolean;
  height: number;
  sx?: SxProps<Theme>;
  children: ReactNode;
}) {
  const refreshing = Boolean(loading && hasData);
  return (
    <Box
      component="figure"
      aria-label={title}
      aria-busy={loading || undefined}
      sx={[
        {
          m: 0,
          position: "relative",
          minWidth: 0,
          opacity: refreshing ? 0.5 : 1,
          transition: "opacity 150ms",
          "@media (prefers-reduced-motion: reduce)": { transition: "none" },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {view === "table" ? (
        <ChartTable data={table} caption={title} visible />
      ) : (
        <>
          <Box sx={{ minHeight: height, minWidth: 0 }}>{children}</Box>
          {hasData && <ChartTable data={table} caption={title} visible={false} />}
        </>
      )}
    </Box>
  );
}
