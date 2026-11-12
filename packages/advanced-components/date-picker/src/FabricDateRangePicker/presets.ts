/** A ready-made range, such as "Last 7 days", offered beside the range picker. */
export interface FabricDateRangePreset {
  /** Stable id, e.g. "last7Days". */
  id: string;
  /** Text on the button. */
  label: string;
  /** The range for a given "today". Ranges are whole days, start and end included. */
  getRange: (today: Date) => { start: Date; end: Date };
}

const day = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const monthStart = (y: number, m: number) => new Date(y, m, 1);
const monthEnd = (y: number, m: number) => new Date(y, m + 1, 0);

const lastDays = (n: number): FabricDateRangePreset => ({
  id: `last${n}Days`,
  label: `Last ${n} days`,
  getRange: (today) => ({ start: addDays(day(today), -(n - 1)), end: day(today) }),
});

/** Built-in presets. Combine them, or add your own with the same shape. */
export const dateRangePresets = {
  today: {
    id: "today",
    label: "Today",
    getRange: (today: Date) => ({ start: day(today), end: day(today) }),
  },
  yesterday: {
    id: "yesterday",
    label: "Yesterday",
    getRange: (today: Date) => ({ start: addDays(day(today), -1), end: addDays(day(today), -1) }),
  },
  last7Days: lastDays(7),
  last30Days: lastDays(30),
  last90Days: lastDays(90),
  thisMonth: {
    id: "thisMonth",
    label: "This month",
    getRange: (t: Date) => ({ start: monthStart(t.getFullYear(), t.getMonth()), end: day(t) }),
  },
  lastMonth: {
    id: "lastMonth",
    label: "Last month",
    getRange: (t: Date) => ({
      start: monthStart(t.getFullYear(), t.getMonth() - 1),
      end: monthEnd(t.getFullYear(), t.getMonth() - 1),
    }),
  },
  thisQuarter: {
    id: "thisQuarter",
    label: "This quarter",
    getRange: (t: Date) => ({
      start: monthStart(t.getFullYear(), Math.floor(t.getMonth() / 3) * 3),
      end: day(t),
    }),
  },
  lastQuarter: {
    id: "lastQuarter",
    label: "Last quarter",
    getRange: (t: Date) => {
      const q = Math.floor(t.getMonth() / 3) * 3;
      return { start: monthStart(t.getFullYear(), q - 3), end: monthEnd(t.getFullYear(), q - 1) };
    },
  },
  thisYear: {
    id: "thisYear",
    label: "This year",
    getRange: (t: Date) => ({ start: new Date(t.getFullYear(), 0, 1), end: day(t) }),
  },
  lastYear: {
    id: "lastYear",
    label: "Last year",
    getRange: (t: Date) => ({
      start: new Date(t.getFullYear() - 1, 0, 1),
      end: new Date(t.getFullYear() - 1, 11, 31),
    }),
  },
} satisfies Record<string, FabricDateRangePreset>;

/** The presets shown by `presets={true}`. */
export const defaultDateRangePresets: FabricDateRangePreset[] = [
  dateRangePresets.last7Days,
  dateRangePresets.last30Days,
  dateRangePresets.thisMonth,
  dateRangePresets.lastMonth,
  dateRangePresets.thisQuarter,
  dateRangePresets.thisYear,
];

const sameDay = (a: Date | null, b: Date) =>
  a !== null &&
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

/** The preset matching a range on `today`, if any. */
export function matchPreset(
  range: { start: Date | null; end: Date | null },
  presets: FabricDateRangePreset[],
  today: Date,
): FabricDateRangePreset | undefined {
  return presets.find((p) => {
    const r = p.getRange(today);
    return sameDay(range.start, r.start) && sameDay(range.end, r.end);
  });
}
