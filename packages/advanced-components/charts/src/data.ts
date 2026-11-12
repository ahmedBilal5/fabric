/**
 * Pure helpers behind the charts: the table view, number formats for axes, and the
 * change and trend maths used by stat cards and sparklines. No React, so they are
 * tested in Node.
 */

/** A value a series point can hold. `null` is a gap. */
export type ChartValue = number | null | undefined;

/** One row of a chart's `dataset`. */
export type ChartDatasetRow = Record<string, unknown>;

/** The parts of a cartesian series the table view reads. */
export interface TableSeries {
  /** Series name, shown as the column heading. */
  label?: string;
  /** Values, one per category. */
  data?: ReadonlyArray<ChartValue>;
  /** Key in `dataset` to read values from, instead of `data`. */
  dataKey?: string;
  /** Formats a value for display. */
  format?: (value: number) => string;
}

/** A chart as a table: column headings and rows of display text. */
export interface ChartTableData {
  /** Column headings. The first is the category column. */
  columns: string[];
  /** One row per category (or slice). The first cell is the row heading. */
  rows: string[][];
}

const plain = (value: number) => value.toLocaleString();

const asText = (value: unknown): string => {
  if (value instanceof Date) return value.toLocaleDateString();
  if (value === null || value === undefined) return "";
  return String(value);
};

/**
 * Builds the table for a bar, line or area chart: one row per category, one column per
 * series. Values come from each series' `data`, or from `dataset[dataKey]`.
 */
export function cartesianTable({
  categories,
  categoryKey,
  categoryLabel = "Category",
  formatCategory = asText,
  series,
  dataset,
}: {
  /** Category values (the band or time axis). */
  categories?: ReadonlyArray<unknown>;
  /** Key in `dataset` for the categories, instead of `categories`. */
  categoryKey?: string;
  /** Heading of the category column. */
  categoryLabel?: string;
  /** Formats a category for display. */
  formatCategory?: (value: unknown) => string;
  series: ReadonlyArray<TableSeries>;
  dataset?: ReadonlyArray<ChartDatasetRow>;
}): ChartTableData {
  const cats =
    categories ?? (categoryKey && dataset ? dataset.map((row) => row[categoryKey]) : undefined);
  const valuesOf = (s: TableSeries): ReadonlyArray<ChartValue> => {
    if (s.data) return s.data;
    if (s.dataKey && dataset) return dataset.map((row) => row[s.dataKey as string] as ChartValue);
    return [];
  };
  const columnValues = series.map(valuesOf);
  const length = cats?.length ?? Math.max(0, ...columnValues.map((v) => v.length));

  const rows: string[][] = [];
  for (let i = 0; i < length; i++) {
    rows.push([
      cats ? formatCategory(cats[i]) : String(i + 1),
      ...series.map((s, j) => {
        const v = columnValues[j][i];
        return typeof v === "number" && Number.isFinite(v) ? (s.format ?? plain)(v) : "–";
      }),
    ]);
  }
  return {
    columns: [categoryLabel, ...series.map((s, j) => s.label ?? `Series ${j + 1}`)],
    rows,
  };
}

/** The parts of a pie slice the table view reads. */
export interface TableSlice {
  label?: string;
  value: number;
}

/** Builds the table for a pie or donut: one row per slice, with its share of the total. */
export function pieTable(
  slices: ReadonlyArray<TableSlice>,
  {
    categoryLabel = "Category",
    valueLabel = "Value",
    format = plain,
    locale,
  }: {
    categoryLabel?: string;
    valueLabel?: string;
    format?: (value: number) => string;
    locale?: string;
  } = {},
): ChartTableData {
  const total = slices.reduce((sum, s) => sum + (Number.isFinite(s.value) ? s.value : 0), 0);
  const share = new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 1 });
  return {
    columns: [categoryLabel, valueLabel, "Share"],
    rows: slices.map((s, i) => [
      s.label ?? `Slice ${i + 1}`,
      format(s.value),
      total > 0 ? share.format(s.value / total) : "–",
    ]),
  };
}

/** The largest absolute value across all series, ignoring gaps. */
export function maxAbsValue(series: ReadonlyArray<ReadonlyArray<ChartValue>>): number {
  let max = 0;
  for (const values of series) {
    for (const v of values) {
      if (typeof v === "number" && Number.isFinite(v)) max = Math.max(max, Math.abs(v));
    }
  }
  return max;
}

/**
 * Formats axis ticks: in full under 10,000 (0, 2,500, 5,000) and compact on an axis
 * that reaches it (0, 10K, 20K), so one axis never mixes the two styles.
 */
export function axisTickFormatter(
  maxAbs: number,
  { locale, ...options }: Intl.NumberFormatOptions & { locale?: string } = {},
): (value: number) => string {
  const compact = maxAbs >= 10_000;
  const format = new Intl.NumberFormat(locale, {
    // Ticks are round numbers, so never pad them with zeros ("$4,000", not "$4,000.00").
    minimumFractionDigits: 0,
    ...(compact ? { notation: "compact", maximumFractionDigits: 1 } : { maximumFractionDigits: 2 }),
    ...options,
  });
  return (value) => format.format(value);
}

/** Which way a value moved, and how much. */
export interface ChartDelta {
  /** `value - previous`. */
  change: number;
  /** Change as a ratio of `previous` (0.12 is 12%). `null` when `previous` is 0. */
  ratio: number | null;
  direction: "up" | "down" | "flat";
}

/** Compares a value with the previous period's. */
export function computeDelta(value: number, previous: number): ChartDelta {
  const change = value - previous;
  const direction = change > 0 ? "up" : change < 0 ? "down" : "flat";
  const ratio = previous === 0 ? null : change / Math.abs(previous);
  return { change, ratio, direction };
}

/** Whether a move is good news, bad news or neither, given which way is good. */
export function deltaTone(
  direction: ChartDelta["direction"],
  goodDirection: "up" | "down" | "neutral" = "up",
): "positive" | "negative" | "neutral" {
  if (direction === "flat" || goodDirection === "neutral") return "neutral";
  return direction === goodDirection ? "positive" : "negative";
}

/**
 * A sentence describing a series for screen readers, e.g.
 * "From 120 to 134, up 11.7%. Low 98, high 140."
 */
export function describeTrend(
  data: ReadonlyArray<ChartValue>,
  {
    format = plain,
    locale,
  }: {
    format?: (value: number) => string;
    locale?: string;
  } = {},
): string {
  const values = data.filter((v): v is number => typeof v === "number" && Number.isFinite(v));
  if (values.length === 0) return "No data";
  const first = values[0];
  const last = values[values.length - 1];
  if (values.length === 1) return `${format(last)}`;
  const { ratio, direction } = computeDelta(last, first);
  const pct = new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 1 });
  const move =
    direction === "flat"
      ? "unchanged"
      : ratio === null
        ? direction
        : `${direction} ${pct.format(Math.abs(ratio))}`;
  return `From ${format(first)} to ${format(last)}, ${move}. Low ${format(Math.min(...values))}, high ${format(Math.max(...values))}.`;
}

/** A pie slice before Fabric folds the smallest ones together. */
export interface FoldableSlice {
  id?: string | number;
  label?: string;
  value: number;
}

/**
 * Keeps at most `max` slices: the largest `max - 1` stay in their original order and
 * the rest add up to one "Other" slice at the end. Past six or so slices a pie stops
 * being readable, and charts have only eight series colors.
 */
export function foldSlices<T extends FoldableSlice>(
  slices: ReadonlyArray<T>,
  max: number,
  otherLabel = "Other",
): Array<T | FoldableSlice> {
  if (slices.length <= max || max < 2) return [...slices];
  const keep = new Set(
    [...slices]
      .map((s, i) => ({ v: s.value, i }))
      .sort((a, b) => b.v - a.v)
      .slice(0, max - 1)
      .map((x) => x.i),
  );
  const kept = slices.filter((_, i) => keep.has(i));
  const rest = slices.filter((_, i) => !keep.has(i)).reduce((sum, s) => sum + s.value, 0);
  return [...kept, { id: "__other", label: otherLabel, value: rest }];
}
