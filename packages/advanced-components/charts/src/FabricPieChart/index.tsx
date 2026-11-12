/**
 * FabricPieChart — parts of a whole on the free MUI X `PieChart`, as a donut by default.
 *
 * Takes a plain `data` list instead of MUI's `series`. Fabric adds theme colors in order,
 * a surface gap between slices, a legend, an optional total in the middle, and a table
 * view with each slice's share. Past `maxSlices` (6) the smallest slices fold into
 * "Other", because a pie stops being readable beyond that. To compare close values,
 * use a bar chart instead.
 *
 * @example
 * ```tsx
 * <FabricPieChart
 *   title="Revenue by plan"
 *   data={[
 *     { label: "Starter", value: 18_400 },
 *     { label: "Growth", value: 52_100 },
 *     { label: "Enterprise", value: 96_300 },
 *   ]}
 *   valueFormat={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }}
 *   centerLabel="Total"
 * />
 * ```
 */

import { fontSize, fontWeight } from "@fabric-kit/design-tokens";
import { useDrawingArea } from "@mui/x-charts/hooks";
import { PieChart, type PieChartProps } from "@mui/x-charts/PieChart";
import { forwardRef, useMemo } from "react";
import { foldSlices, pieTable } from "../data";
import {
  ChartFrame,
  chartSx,
  type FabricChartBaseProps,
  tooltipSx,
  useChartFrame,
  useChartPalette,
  useNumberFormat,
} from "../internal/shared";

/** One slice. */
export interface FabricPieDatum {
  /** Stable id. Defaults to the label. */
  id?: string | number;
  label: string;
  value: number;
  /** Override the slice color. Normally the chart palette is used, in order. */
  color?: string;
}

export interface FabricPieChartProps
  extends Omit<PieChartProps, "series" | "title">,
    FabricChartBaseProps {
  /** The slices, in the order to draw them. */
  data: FabricPieDatum[];
  /** "donut" leaves room in the middle for a total. @default "donut" */
  variant?: "donut" | "pie";
  /**
   * Text under the total in the middle of a donut, e.g. "Total" or "Customers".
   * When set, the donut shows the sum of all slices above it.
   */
  centerLabel?: string;
  /** Most slices to draw before the smallest fold into "Other". @default 6 */
  maxSlices?: number;
  /** Label of the folded slice. @default "Other" */
  otherLabel?: string;
  /** Chart height in px, not counting the legend. @default 240 */
  height?: number;
}

function CenterLabel({ value, label }: { value: string; label: string }) {
  const { left, top, width, height } = useDrawingArea();
  const x = left + width / 2;
  const y = top + height / 2;
  return (
    <g>
      <text
        x={x}
        y={y - 4}
        textAnchor="middle"
        dominantBaseline="auto"
        style={{
          fill: "var(--mui-palette-text-primary)",
          fontSize: fontSize["2xl"],
          fontWeight: fontWeight.semiBold,
        }}
      >
        {value}
      </text>
      <text
        x={x}
        y={y + 16}
        textAnchor="middle"
        dominantBaseline="auto"
        style={{ fill: "var(--mui-palette-text-secondary)", fontSize: fontSize.sm }}
      >
        {label}
      </text>
    </g>
  );
}

/** A donut or pie chart with Fabric's defaults. */
export const FabricPieChart = forwardRef<HTMLDivElement, FabricPieChartProps>(
  function FabricPieChart(
    {
      title,
      view,
      valueFormat,
      locale,
      categoryLabel,
      data,
      variant = "donut",
      centerLabel,
      maxSlices = 6,
      otherLabel = "Other",
      height = 240,
      loading,
      sx,
      slotProps,
      children,
      ...rest
    },
    ref,
  ) {
    const frame = useChartFrame(view, title);
    const palette = useChartPalette();
    const format = useNumberFormat(valueFormat, locale);

    const { slices, table, total } = useMemo(() => {
      const folded = foldSlices(data, maxSlices, otherLabel);
      return {
        slices: folded.map((d, i) => ({
          id: d.id ?? d.label ?? i,
          label: d.label,
          value: d.value,
          color:
            ("color" in d && typeof d.color === "string" ? d.color : undefined) ??
            palette.categorical[i % palette.categorical.length],
        })),
        table: pieTable(folded, { categoryLabel, format: (v) => format(v), locale }),
        total: folded.reduce((sum, d) => sum + d.value, 0),
      };
    }, [data, maxSlices, otherLabel, palette, categoryLabel, format, locale]);

    const donut = variant === "donut";
    const hasData = slices.some((s) => s.value > 0);

    return (
      <ChartFrame
        title={frame.title}
        view={frame.view}
        table={table}
        loading={loading}
        hasData={hasData}
        height={height}
      >
        <PieChart
          ref={ref}
          {...rest}
          height={height}
          loading={loading && !hasData}
          series={[
            {
              data: slices,
              innerRadius: donut ? "62%" : 0,
              paddingAngle: donut ? 1 : 0,
              cornerRadius: donut ? 4 : 0,
              valueFormatter: (item) => format(item.value),
              highlightScope: { fade: "global", highlight: "item" },
              faded: { additionalRadius: -2 },
            },
          ]}
          slotProps={{
            ...slotProps,
            tooltip: { ...slotProps?.tooltip, sx: tooltipSx } as never,
          }}
          sx={[chartSx, ...(Array.isArray(sx) ? sx : [sx])]}
        >
          {donut && centerLabel && hasData && (
            <CenterLabel
              value={new Intl.NumberFormat(locale, {
                ...valueFormat,
                notation: total >= 100_000 ? "compact" : valueFormat?.notation,
                maximumFractionDigits: total >= 100_000 ? 1 : valueFormat?.maximumFractionDigits,
              }).format(total)}
              label={centerLabel}
            />
          )}
          {children}
        </PieChart>
      </ChartFrame>
    );
  },
);
