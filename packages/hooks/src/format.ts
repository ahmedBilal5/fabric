/**
 * Locale-aware formatting on the built-in `Intl` APIs: no date or number library
 * needed. Every function takes an optional `locale` (a BCP 47 tag such as "en-GB" or
 * "de"); without one, the browser's locale is used. Formatters are cached, so calling
 * these in a render or a table cell is cheap.
 */

/** Anything that can be read as a date: a `Date`, a timestamp in ms, or an ISO string. */
export type DateInput = Date | number | string;

/** Turns a `DateInput` into a `Date`. Throws on an unparseable string. */
export function toDate(input: DateInput): Date {
  const d = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(d.getTime())) throw new RangeError(`Invalid date: ${String(input)}`);
  return d;
}

const cache = new Map<string, unknown>();
function cached<T>(kind: string, locale: string | undefined, options: object, make: () => T): T {
  const key = `${kind}|${locale ?? ""}|${JSON.stringify(options)}`;
  let f = cache.get(key) as T | undefined;
  if (!f) {
    f = make();
    cache.set(key, f);
  }
  return f;
}

// ── Dates ────────────────────────────────────────────────────────────────────

/**
 * Named date styles:
 * - `date`: "12 Mar 2026" (medium date)
 * - `short`: "12/03/2026"
 * - `long`: "12 March 2026"
 * - `full`: "Thursday 12 March 2026"
 * - `time`: "14:05"
 * - `datetime`: "12 Mar 2026, 14:05"
 * - `monthYear`: "March 2026"
 */
export type DateStyle = "date" | "short" | "long" | "full" | "time" | "datetime" | "monthYear";

const DATE_STYLES: Record<DateStyle, Intl.DateTimeFormatOptions> = {
  date: { dateStyle: "medium" },
  short: { dateStyle: "short" },
  long: { dateStyle: "long" },
  full: { dateStyle: "full" },
  time: { timeStyle: "short" },
  datetime: { dateStyle: "medium", timeStyle: "short" },
  monthYear: { month: "long", year: "numeric" },
};

export interface FormatDateOptions {
  locale?: string;
  /** IANA time zone, e.g. "Europe/London". Defaults to the user's. */
  timeZone?: string;
}

/**
 * Formats a date in a named style or with your own `Intl.DateTimeFormat` options.
 *
 * @example
 * formatDate("2026-03-12T14:05:00Z", "datetime", { locale: "en-GB", timeZone: "UTC" }) // "12 Mar 2026, 14:05"
 */
export function formatDate(
  date: DateInput,
  style: DateStyle | Intl.DateTimeFormatOptions = "date",
  { locale, timeZone }: FormatDateOptions = {},
): string {
  const base = typeof style === "string" ? DATE_STYLES[style] : style;
  const options = timeZone ? { ...base, timeZone } : base;
  return cached("date", locale, options, () => new Intl.DateTimeFormat(locale, options)).format(
    toDate(date),
  );
}

// ── Relative time ────────────────────────────────────────────────────────────

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 24 * 3600],
  ["month", 30 * 24 * 3600],
  ["week", 7 * 24 * 3600],
  ["day", 24 * 3600],
  ["hour", 3600],
  ["minute", 60],
  ["second", 1],
];

export interface FormatRelativeTimeOptions {
  locale?: string;
  /** The moment to compare against. @default now */
  now?: DateInput;
  /** `"auto"` gives "yesterday" and "now"; `"always"` gives "1 day ago". @default "auto" */
  numeric?: "auto" | "always";
  /** `"long"` ("3 minutes ago"), `"short"` ("3 min. ago") or `"narrow"`. @default "long" */
  style?: Intl.RelativeTimeFormatStyle;
}

/** Whole local calendar days from `now` to `date` (negative in the past). */
function calendarDayDiff(date: Date, now: Date): number {
  const a = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const b = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  // Rounding absorbs the hour lost or gained at daylight-saving changes.
  return Math.round((a - b) / 86_400_000);
}

/**
 * Formats a date relative to now: "just now", "3 minutes ago", "yesterday",
 * "in 2 weeks". Anything under 45 seconds reads as "now". Days follow the calendar:
 * anything on the previous date is "yesterday".
 *
 * @example
 * formatRelativeTime(Date.now() - 5 * 60_000) // "5 minutes ago"
 */
export function formatRelativeTime(
  date: DateInput,
  { locale, now = Date.now(), numeric = "auto", style = "long" }: FormatRelativeTimeOptions = {},
): string {
  const seconds = (toDate(date).getTime() - toDate(now).getTime()) / 1000;
  const options: Intl.RelativeTimeFormatOptions = { numeric, style };
  const rtf = cached("rel", locale, options, () => new Intl.RelativeTimeFormat(locale, options));
  const abs = Math.abs(seconds);
  if (abs < 45) return rtf.format(0, "second");
  for (const [unit, size] of UNITS) {
    if (abs >= size * 0.9 || unit === "second") {
      // Count days by the calendar, so 26 hours ago just after midnight reads
      // "2 days ago", matching the date people see, not "yesterday".
      if (unit === "day") {
        const days = calendarDayDiff(toDate(date), toDate(now));
        return days === 0
          ? rtf.format(Math.round(seconds / 3600), "hour")
          : rtf.format(days, "day");
      }
      return rtf.format(Math.round(seconds / size), unit);
    }
  }
  return rtf.format(0, "second");
}

/** Milliseconds until `formatRelativeTime(date)` could next change, for refresh timers. */
export function relativeTimeRefreshMs(date: DateInput, now: DateInput = Date.now()): number {
  const abs = Math.abs(toDate(date).getTime() - toDate(now).getTime()) / 1000;
  if (abs < 60) return 10_000;
  if (abs < 3600) return 30_000;
  if (abs < 24 * 3600) return 5 * 60_000;
  return 60 * 60_000;
}

// ── Numbers ──────────────────────────────────────────────────────────────────

export interface FormatNumberOptions extends Intl.NumberFormatOptions {
  locale?: string;
}

/**
 * Formats a number with grouping for the locale. Pass `notation: "compact"` for
 * "1.2K", or any other `Intl.NumberFormat` option.
 *
 * @example
 * formatNumber(1234567.891, { locale: "en-US" }) // "1,234,567.891"
 * formatNumber(1234567, { notation: "compact", locale: "en-US" }) // "1.2M"
 */
export function formatNumber(
  value: number,
  { locale, ...options }: FormatNumberOptions = {},
): string {
  return cached("num", locale, options, () => new Intl.NumberFormat(locale, options)).format(value);
}

/**
 * Formats money in a currency (ISO 4217 code). The locale sets the symbol position
 * and separators; the currency sets the decimals.
 *
 * @example
 * formatCurrency(1499.5, "USD", { locale: "en-US" }) // "$1,499.50"
 * formatCurrency(1499.5, "EUR", { locale: "de-DE" }) // "1.499,50 €"
 */
export function formatCurrency(
  amount: number,
  currency: string,
  { locale, ...options }: FormatNumberOptions = {},
): string {
  return formatNumber(amount, { locale, style: "currency", currency, ...options });
}

/**
 * Formats a ratio as a percentage: `0.256` → "26%". Set `maximumFractionDigits`
 * for more precision.
 *
 * @example
 * formatPercent(0.256, { locale: "en-US", maximumFractionDigits: 1 }) // "25.6%"
 */
export function formatPercent(
  ratio: number,
  { locale, ...options }: FormatNumberOptions = {},
): string {
  return formatNumber(ratio, { locale, style: "percent", maximumFractionDigits: 0, ...options });
}

// ── File sizes ───────────────────────────────────────────────────────────────

export interface FormatFileSizeOptions {
  locale?: string;
  /**
   * `1000` (default) gives kB, MB, GB, as macOS and most web apps show them.
   * `1024` gives KiB, MiB, GiB, as Windows and Linux tools count them.
   */
  base?: 1000 | 1024;
  /** Most decimals shown. @default 1 */
  maximumFractionDigits?: number;
}

const SI = ["byte", "kilobyte", "megabyte", "gigabyte", "terabyte", "petabyte"] as const;
const IEC = ["B", "KiB", "MiB", "GiB", "TiB", "PiB"] as const;

/**
 * Formats a byte count: `1536000` → "1.5 MB".
 *
 * @example
 * formatFileSize(1_536_000, { locale: "en-US" }) // "1.5 MB"
 * formatFileSize(1_572_864, { locale: "en-US", base: 1024 }) // "1.5 MiB"
 */
export function formatFileSize(
  bytes: number,
  { locale, base = 1000, maximumFractionDigits = 1 }: FormatFileSizeOptions = {},
): string {
  const abs = Math.abs(bytes);
  let i = 0;
  while (abs >= base ** (i + 1) && i < SI.length - 1) i++;
  const value = bytes / base ** i;
  const digits = i === 0 ? 0 : maximumFractionDigits;
  if (base === 1000) {
    return formatNumber(value, {
      locale,
      style: "unit",
      unit: SI[i],
      unitDisplay: i === 0 ? "long" : "short",
      maximumFractionDigits: digits,
    });
  }
  return `${formatNumber(value, { locale, maximumFractionDigits: digits })} ${IEC[i]}`;
}
