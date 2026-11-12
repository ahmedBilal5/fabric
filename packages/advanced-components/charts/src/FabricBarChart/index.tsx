/**
 * FabricBarChart — bars and columns on the free MUI X `BarChart`, with Fabric's look.
 *
 * Takes the same `series`, `xAxis`, `yAxis` and `dataset` as MUI's chart. Fabric adds:
 * series colors from the theme (the brand color for one series, the chart palette in
 * order for several), rounded bar ends, hairline grid, clean value-axis ticks
 * ("10K" once an axis reaches 10,000), a legend only when there are two or more series,
 * and a table of the same data for screen readers or the card's Table view.
 *
 * @example
 * ```tsx
 * <FabricBarChart
 *   title="New customers by month"
 *   xAxis={[{ data: ["Jan", "Feb", "Mar"] }]}
 *   series={[{ label: "Customers", data: [42, 57, 61] }]}
 * />
 * ```
 */

import { BarChart, type BarChartProps } from "@mui/x-charts/BarChart";
import { forwardRef } from "react";
import { useCartesian } from "../internal/cartesian";
import {
  ChartFrame,
  chartSx,
  type FabricChartBaseProps,
  tooltipSx,
  useChartFrame,
} from "../internal/shared";

type Axis = NonNullable<BarChartProps["xAxis"]>[number];

export interface FabricBarChartProps extends Omit<BarChartProps, "title">, FabricChartBaseProps {
  /** Chart height in px, not counting the legend. @default 300 */
  height?: number;
}

// Thin bars with air between categories, and a small gap between grouped bars.
const bandDefaults = (): Partial<Axis> =>
  ({ scaleType: "band", categoryGapRatio: 0.5, barGapRatio: 0.2 }) as Partial<Axis>;

/** A bar or column chart with Fabric's defaults. */
export const FabricBarChart = forwardRef<HTMLDivElement, FabricBarChartProps>(
  function FabricBarChart(
    {
      title,
      view,
      valueFormat,
      locale,
      categoryLabel,
      series,
      xAxis,
      yAxis,
      dataset,
      layout = "vertical",
      height = 300,
      hideLegend,
      grid,
      borderRadius = 4,
      loading,
      sx,
      slotProps,
      ...rest
    },
    ref,
  ) {
    const frame = useChartFrame(view, title);
    const horizontal = layout === "horizontal";
    const c = useCartesian({
      series,
      categoryAxis: (horizontal ? yAxis : xAxis) as Axis[] | undefined,
      valueAxis: (horizontal ? xAxis : yAxis) as Axis[] | undefined,
      dataset,
      categoryDefaults: bandDefaults,
      valueFormat,
      locale,
      categoryLabel,
      yAxis: horizontal ? "category" : "value",
    });

    return (
      <ChartFrame
        title={frame.title}
        view={frame.view}
        table={c.table}
        loading={loading}
        hasData={c.hasData}
        height={height}
      >
        <BarChart
          ref={ref}
          {...rest}
          dataset={dataset}
          layout={layout}
          series={c.series}
          xAxis={(horizontal ? c.valueAxis : c.categoryAxis) as BarChartProps["xAxis"]}
          yAxis={(horizontal ? c.categoryAxis : c.valueAxis) as BarChartProps["yAxis"]}
          height={height}
          borderRadius={borderRadius}
          grid={grid ?? (horizontal ? { vertical: true } : { horizontal: true })}
          hideLegend={hideLegend ?? series.length < 2}
          loading={loading && !c.hasData}
          slotProps={{
            ...slotProps,
            legend: { position: { vertical: "top", horizontal: "start" }, ...slotProps?.legend },
            tooltip: { ...slotProps?.tooltip, sx: tooltipSx } as never,
          }}
          sx={[chartSx, ...(Array.isArray(sx) ? sx : [sx])]}
        />
      </ChartFrame>
    );
  },
);
