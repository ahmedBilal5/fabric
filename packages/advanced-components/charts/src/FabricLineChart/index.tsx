/**
 * FabricLineChart and FabricAreaChart — trends over time on the free MUI X `LineChart`.
 *
 * Same `series`, `xAxis`, `yAxis` and `dataset` as MUI's chart. Fabric adds 2px smooth
 * lines that never overshoot the data, theme colors, a light area wash, hairline grid,
 * clean value ticks, a legend only for two or more series, and a table view. The x axis
 * picks its scale from its data: dates get a time scale, text gets evenly spaced points.
 *
 * @example
 * ```tsx
 * <FabricLineChart
 *   title="Weekly active users"
 *   xAxis={[{ data: weeks }]}
 *   series={[{ label: "Users", data: users }]}
 * />
 * ```
 */

import { LineChart, type LineChartProps } from "@mui/x-charts/LineChart";
import { forwardRef } from "react";
import { useCartesian } from "../internal/cartesian";
import {
  ChartFrame,
  chartSx,
  type FabricChartBaseProps,
  tooltipSx,
  useChartFrame,
} from "../internal/shared";

type Axis = NonNullable<LineChartProps["xAxis"]>[number];

export interface FabricLineChartProps extends Omit<LineChartProps, "title">, FabricChartBaseProps {
  /** Chart height in px, not counting the legend. @default 300 */
  height?: number;
  /** Fill the area under every line. Set `area` on a series to fill only that one. */
  area?: boolean;
  /** Stack every series on top of the last, e.g. revenue by plan adding up to the total. */
  stacked?: boolean;
  /** Show a dot at each point. Off by default; hovering still marks the nearest point. */
  showMarks?: boolean;
}

/** Dates get a time scale; anything else evenly spaced points. */
const pointDefaults = (axis: Axis | undefined): Partial<Axis> => {
  const first = axis && "data" in axis ? axis.data?.[0] : undefined;
  return { scaleType: first instanceof Date ? "time" : "point" } as Partial<Axis>;
};

/** A line chart with Fabric's defaults. */
export const FabricLineChart = forwardRef<HTMLDivElement, FabricLineChartProps>(
  function FabricLineChart(
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
      height = 300,
      area,
      stacked,
      showMarks = false,
      hideLegend,
      grid,
      loading,
      sx,
      slotProps,
      ...rest
    },
    ref,
  ) {
    const frame = useChartFrame(view, title);
    const c = useCartesian({
      series: series.map((s) => ({
        curve: "monotoneX" as const,
        showMark: showMarks,
        ...(area && { area: true }),
        ...(stacked && { stack: "total" }),
        ...s,
      })),
      categoryAxis: xAxis as Axis[] | undefined,
      valueAxis: yAxis as Axis[] | undefined,
      dataset,
      categoryDefaults: pointDefaults,
      valueFormat,
      locale,
      categoryLabel,
      yAxis: "value",
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
        <LineChart
          ref={ref}
          {...rest}
          dataset={dataset}
          series={c.series}
          xAxis={c.categoryAxis as LineChartProps["xAxis"]}
          yAxis={c.valueAxis as LineChartProps["yAxis"]}
          height={height}
          grid={grid ?? { horizontal: true }}
          hideLegend={hideLegend ?? series.length < 2}
          loading={loading && !c.hasData}
          slotProps={{
            ...slotProps,
            legend: { position: { vertical: "top", horizontal: "start" }, ...slotProps?.legend },
            tooltip: { ...slotProps?.tooltip, sx: tooltipSx } as never,
          }}
          sx={[
            chartSx,
            // Stacked bands need more than a wash to read as separate parts.
            stacked ? { "& .MuiLineChart-area": { fillOpacity: 0.35 } } : {},
            ...(Array.isArray(sx) ? sx : [sx]),
          ]}
        />
      </ChartFrame>
    );
  },
);

export type FabricAreaChartProps = Omit<FabricLineChartProps, "area">;

/** A line chart with the area under each line filled. Pass `stacked` for parts of a whole. */
export const FabricAreaChart = forwardRef<HTMLDivElement, FabricAreaChartProps>(
  function FabricAreaChart(props, ref) {
    return <FabricLineChart ref={ref} {...props} area />;
  },
);
