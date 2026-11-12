import { useMemo } from "react";
import {
  axisTickFormatter,
  type ChartDatasetRow,
  type ChartTableData,
  type ChartValue,
  cartesianTable,
  maxAbsValue,
} from "../data";
import { type ChartPalette, useChartPalette, useNumberFormat } from "./shared";

/** The series fields Fabric reads or fills in. */
interface SeriesLike {
  data?: ReadonlyArray<ChartValue>;
  dataKey?: string;
  label?: unknown;
  color?: unknown;
  valueFormatter?: unknown;
  stack?: string;
}

/** The axis fields Fabric reads or fills in. */
interface AxisLike {
  data?: ReadonlyArray<unknown>;
  dataKey?: string;
  scaleType?: string;
  valueFormatter?: unknown;
  label?: string;
  width?: number | "auto";
}

interface Options<S extends SeriesLike, A extends AxisLike> {
  series: ReadonlyArray<S>;
  /** The category axis config (x for columns and lines, y for horizontal bars). */
  categoryAxis?: ReadonlyArray<A>;
  /** The value axis config. */
  valueAxis?: ReadonlyArray<A>;
  dataset?: ReadonlyArray<ChartDatasetRow>;
  /** Defaults merged into the first category axis, e.g. band gaps or a point scale. */
  categoryDefaults: (axis: A | undefined) => Partial<A>;
  valueFormat?: Intl.NumberFormatOptions;
  locale?: string;
  categoryLabel?: string;
  /** Which axis runs up the side: it gets `width: "auto"` so tick labels are never cut off. */
  yAxis: "value" | "category";
}

const formatCategory = (value: unknown) =>
  value instanceof Date ? value.toLocaleDateString() : value == null ? "" : String(value);

/**
 * Fills in Fabric defaults for a bar or line chart: series colors (the brand color for
 * one series, the categorical palette in order for several), value formatting in
 * tooltips, clean value-axis ticks, and the table view's data.
 */
export function useCartesian<S extends SeriesLike, A extends AxisLike>({
  series,
  categoryAxis,
  valueAxis,
  dataset,
  categoryDefaults,
  valueFormat,
  locale,
  categoryLabel,
  yAxis,
}: Options<S, A>): {
  series: S[];
  categoryAxis: A[];
  valueAxis: A[];
  table: ChartTableData;
  hasData: boolean;
  palette: ChartPalette;
} {
  const palette = useChartPalette();
  const format = useNumberFormat(valueFormat, locale);

  return useMemo(() => {
    const valuesOf = (s: S): ReadonlyArray<ChartValue> =>
      s.data ??
      (s.dataKey && dataset ? dataset.map((row) => row[s.dataKey as string] as ChartValue) : []);
    const allValues = series.map(valuesOf);
    // Stacked series add up, so the axis reaches their sum.
    const stackTotals = new Map<string, number[]>();
    series.forEach((s, i) => {
      if (!s.stack) return;
      const totals = stackTotals.get(s.stack) ?? [];
      allValues[i].forEach((v, j) => {
        totals[j] = (totals[j] ?? 0) + (typeof v === "number" ? Math.abs(v) : 0);
      });
      stackTotals.set(s.stack, totals);
    });
    const max = maxAbsValue([...allValues, ...stackTotals.values()]);
    const tick = axisTickFormatter(max, {
      locale,
      ...(valueFormat?.style === "currency" && {
        style: "currency",
        currency: valueFormat.currency,
      }),
      ...(valueFormat?.style === "percent" && { style: "percent" }),
    });

    const single = series.length === 1;
    const filled = series.map((s, i) => ({
      ...s,
      color:
        s.color ?? (single ? palette.primary : palette.categorical[i % palette.categorical.length]),
      valueFormatter: s.valueFormatter ?? ((v: number | null) => format(v)),
    }));

    const [firstCat, ...restCat] = categoryAxis ?? [];
    const autoWidth = (axis: A, isY: boolean) =>
      (isY && axis.width === undefined ? { ...axis, width: "auto" } : axis) as A;
    const cats = [{ ...categoryDefaults(firstCat), ...firstCat } as A, ...restCat].map((a) =>
      autoWidth(a, yAxis === "category"),
    );

    const values = (valueAxis && valueAxis.length > 0 ? valueAxis : [{} as A])
      .map(
        (axis) =>
          ({
            ...axis,
            valueFormatter: axis.valueFormatter ?? ((v: number) => tick(v)),
          }) as A,
      )
      .map((a) => autoWidth(a, yAxis === "value"));

    const table = cartesianTable({
      categories: cats[0]?.data,
      categoryKey: cats[0]?.dataKey,
      categoryLabel: categoryLabel ?? cats[0]?.label ?? "Category",
      formatCategory,
      dataset,
      series: series.map((s, i) => ({
        label: typeof s.label === "string" ? s.label : `Series ${i + 1}`,
        data: allValues[i],
        format: (v) => format(v),
      })),
    });

    return {
      series: filled,
      categoryAxis: cats,
      valueAxis: values,
      table,
      hasData: allValues.some((v) => v.some((x) => typeof x === "number")),
      palette,
    };
  }, [
    series,
    categoryAxis,
    valueAxis,
    dataset,
    categoryDefaults,
    format,
    locale,
    valueFormat,
    categoryLabel,
    palette,
    yAxis,
  ]);
}
