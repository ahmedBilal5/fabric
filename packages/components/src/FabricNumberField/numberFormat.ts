/** How a number field shows its value. */
export type FabricNumberFormat =
  | { style?: "decimal" }
  | { style: "currency"; currency: string }
  | { style: "percent" }
  | { style: "unit"; unit: string; unitDisplay?: "short" | "long" | "narrow" };

export interface NumberFormatOptions {
  /** BCP 47 locale. Defaults to the browser's. */
  locale?: string;
  /** Display style. Percent shows the number as typed: 15 → "15%". */
  format?: FabricNumberFormat;
  /** Fewest decimals to show. */
  minimumFractionDigits?: number;
  /** Most decimals to show and keep. */
  maximumFractionDigits?: number;
  /** Group thousands ("12,480"). @default true */
  useGrouping?: boolean;
}

/** Builds the `Intl.NumberFormat` for a field. Percent uses the unit style so 15 shows as "15%". */
export function numberFormatter(options: NumberFormatOptions = {}): Intl.NumberFormat {
  const {
    locale,
    format = {},
    minimumFractionDigits,
    maximumFractionDigits,
    useGrouping,
  } = options;
  const base: Intl.NumberFormatOptions = {
    minimumFractionDigits,
    maximumFractionDigits,
    useGrouping: useGrouping ?? true,
  };
  switch (format.style) {
    case "currency":
      return new Intl.NumberFormat(locale, {
        ...base,
        style: "currency",
        currency: format.currency,
      });
    case "percent":
      return new Intl.NumberFormat(locale, { ...base, style: "unit", unit: "percent" });
    case "unit":
      return new Intl.NumberFormat(locale, {
        ...base,
        style: "unit",
        unit: format.unit,
        unitDisplay: format.unitDisplay ?? "short",
      });
    default:
      return new Intl.NumberFormat(locale, { ...base, style: "decimal" });
  }
}

/** The locale's decimal and group separators. */
export function numberSeparators(locale?: string): { decimal: string; group: string } {
  const parts = new Intl.NumberFormat(locale, { useGrouping: true }).formatToParts(12345.6);
  return {
    decimal: parts.find((p) => p.type === "decimal")?.value ?? ".",
    group: parts.find((p) => p.type === "group")?.value ?? ",",
  };
}

/**
 * Reads what someone typed as a number, in the given locale. Ignores currency
 * symbols, units, spaces and group separators. Returns `null` for empty text and
 * `NaN` when the text isn't a number.
 */
export function parseNumberInput(text: string, locale?: string): number | null {
  const { decimal, group } = numberSeparators(locale);
  let s = text.trim();
  if (s === "") return null;
  // Accounting-style negatives: "(12.50)".
  let negative = false;
  if (/^\(.*\)$/.test(s)) {
    negative = true;
    s = s.slice(1, -1);
  }
  // Unicode minus and dashes count as a minus sign.
  s = s.replace(/[−‒–—]/g, "-");
  if (s.includes("-")) negative = !negative;
  // Group separators can be narrow or non-breaking spaces; drop all whitespace.
  s = s.replace(/[\s  ]/g, "");
  if (group.trim() !== "") s = s.split(group).join("");
  if (decimal !== ".") {
    // Accept "." as the decimal mark too when the locale's mark is absent, so "1.5" works
    // everywhere unless "." is that locale's group separator (already removed above).
    s = s.split(decimal).join(".");
  }
  const digits = s.replace(/[^0-9.]/g, "");
  if (digits === "" || digits === ".") return Number.NaN;
  if ((digits.match(/\./g) ?? []).length > 1) return Number.NaN;
  const value = Number(digits);
  return negative ? -value : value;
}

/** Keeps a value inside `[min, max]`. */
export function clampNumber(value: number, min?: number, max?: number): number {
  let v = value;
  if (min !== undefined && v < min) v = min;
  if (max !== undefined && v > max) v = max;
  return v;
}

/** Rounds to a number of decimals without floating-point noise (0.1 + 0.2 → 0.3). */
export function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

/** Decimals in a step, so stepping by 0.05 keeps two decimals. */
export function decimalsOf(n: number): number {
  const s = String(n);
  if (s.includes("e-")) return Number(s.split("e-")[1]);
  return s.includes(".") ? s.split(".")[1].length : 0;
}

/** Steps a value up or down, clamped, starting from `min` (or 0) when empty. */
export function stepNumber(
  value: number | null,
  direction: 1 | -1,
  { step = 1, min, max }: { step?: number; min?: number; max?: number } = {},
): number {
  const start = value ?? (direction === 1 ? (min ?? 0) - step : (max ?? 0) + step);
  const next = roundTo(start + direction * step, Math.max(decimalsOf(step), decimalsOf(start)));
  return clampNumber(next, min, max);
}
