/**
 * FabricSparkline — a small, axis-free trend line or bar strip, on the free MUI X
 * `SparkLineChart`. Use it beside a number (a stat card, a table cell) to show the
 * shape of a trend, not exact values.
 *
 * Draws in the brand color by default. Screen readers hear a summary such as
 * "Signups: from 120 to 134, up 11.7%. Low 98, high 140." Hovering shows each value.
 *
 * @example
 * ```tsx
 * <FabricSparkline data={[12, 15, 14, 18, 21, 19, 24]} title="Signups, last 7 days" />
 * ```
 */

import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";
import { SparkLineChart } from "@mui/x-charts/SparkLineChart";
import { forwardRef, useMemo } from "react";
import { describeTrend } from "../data";
import { tooltipSx, useChartPalette, useNumberFormat } from "../internal/shared";

export interface FabricSparklineProps {
  /** The values, oldest first. */
  data: number[];
  /** Labels for each value, shown in the tooltip, e.g. dates. */
  labels?: Array<string | Date>;
  /** What the values are, e.g. "Signups, last 7 days". Starts the screen-reader summary. */
  title?: string;
  /** A line, or one bar per value. @default "line" */
  plotType?: "line" | "bar";
  /** Fill under the line. @default true */
  area?: boolean;
  /** Line or bar color. Defaults to the theme's primary color. */
  color?: string;
  /** Height in px. @default 40 */
  height?: number;
  /** Width in px. Defaults to the container's width. */
  width?: number;
  /** Number format for the tooltip and summary. */
  valueFormat?: Intl.NumberFormatOptions;
  /** Locale for numbers. Defaults to the browser's. */
  locale?: string;
  /** Show the value under the pointer. @default true */
  showTooltip?: boolean;
  /** System styles on the root. */
  sx?: SxProps<Theme>;
}

/** A small trend line or bar strip with no axes. */
export const FabricSparkline = forwardRef<HTMLDivElement, FabricSparklineProps>(
  function FabricSparkline(
    {
      data,
      labels,
      title,
      plotType = "line",
      area = true,
      color,
      height = 40,
      width,
      valueFormat,
      locale,
      showTooltip = true,
      sx,
    },
    ref,
  ) {
    const palette = useChartPalette();
    const format = useNumberFormat(valueFormat, locale);
    const summary = useMemo(() => {
      const text = describeTrend(data, { format: (v) => format(v), locale });
      return title ? `${title}: ${text}` : text;
    }, [data, format, locale, title]);

    const line = plotType === "line";
    // A line scales to its own range so the shape of the trend shows; bars start at zero.
    const range = useMemo(() => {
      const values = data.filter((v) => Number.isFinite(v));
      if (values.length === 0) return undefined;
      const lo = Math.min(...values);
      const hi = Math.max(...values);
      const pad = (hi - lo) * 0.1 || Math.abs(hi) * 0.05 || 1;
      return { min: lo - pad, max: hi + pad };
    }, [data]);
    return (
      <Box
        ref={ref}
        role="img"
        aria-label={summary}
        sx={[
          {
            width: width ?? "100%",
            minWidth: 0,
            "& .MuiLineChart-line": { strokeWidth: 2 },
            "& .MuiLineChart-area": { fillOpacity: 0.14 },
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        {line ? (
          <SparkLineChart
            data={data}
            height={height}
            width={width}
            plotType="line"
            area={area}
            curve="monotoneX"
            baseline="min"
            yAxis={range}
            color={color ?? palette.primary}
            showHighlight={showTooltip}
            showTooltip={showTooltip}
            valueFormatter={(v) => format(v)}
            xAxis={labels ? { scaleType: "point", data: labels } : undefined}
            margin={{ top: 4, bottom: 4, left: 2, right: 2 }}
            slotProps={{ tooltip: { sx: tooltipSx } as never }}
          />
        ) : (
          <SparkLineChart
            data={data}
            height={height}
            width={width}
            plotType="bar"
            color={color ?? palette.primary}
            showHighlight={showTooltip}
            showTooltip={showTooltip}
            valueFormatter={(v) => format(v)}
            xAxis={labels ? { scaleType: "band", data: labels } : undefined}
            margin={{ top: 4, bottom: 0, left: 0, right: 0 }}
            slotProps={{ tooltip: { sx: tooltipSx } as never }}
          />
        )}
      </Box>
    );
  },
);
