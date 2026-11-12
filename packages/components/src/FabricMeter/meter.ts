/** Pure meter maths and wording, tested in Node. */

/** Where the meter turns amber and red, as fractions of `max` (0.8 is 80%). */
export interface FabricMeterThresholds {
  warning?: number;
  critical?: number;
}

/** How full the meter is. */
export type FabricMeterLevel = "normal" | "warning" | "critical";

export interface MeterState {
  /** Share filled, clamped to 0–1 for drawing. */
  ratio: number;
  /** Share used, not clamped: 1.2 is 20% over. */
  used: number;
  level: FabricMeterLevel;
  /** The value is above `max`. */
  over: boolean;
}

/** Works out how full a meter is and which level it's at. */
export function meterState(
  value: number,
  {
    min = 0,
    max = 100,
    thresholds,
  }: { min?: number; max?: number; thresholds?: FabricMeterThresholds } = {},
): MeterState {
  const span = max - min;
  const used = span > 0 ? (value - min) / span : 0;
  const ratio = Math.min(1, Math.max(0, used));
  let level: FabricMeterLevel = "normal";
  if (thresholds?.critical != null && used >= thresholds.critical) level = "critical";
  else if (thresholds?.warning != null && used >= thresholds.warning) level = "warning";
  return { ratio, used, level, over: value > max };
}

/**
 * The value as words: "8 of 10 seats", "80%" or "8 seats".
 * `unit` is the plural noun; it's left off when not given.
 */
export function meterValueText(
  value: number,
  {
    min = 0,
    max = 100,
    unit,
    format = "fraction",
    locale,
  }: {
    min?: number;
    max?: number;
    unit?: string;
    format?: "fraction" | "percent" | "value";
    locale?: string;
  } = {},
): string {
  const n = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });
  const suffix = unit ? ` ${unit}` : "";
  if (format === "percent") {
    const span = max - min;
    return new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 0 }).format(
      span > 0 ? (value - min) / span : 0,
    );
  }
  if (format === "value") return `${n.format(value)}${suffix}`;
  return `${n.format(value)} of ${n.format(max)}${suffix}`;
}
