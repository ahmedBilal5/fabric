/**
 * Sample data for the dashboard stories. Deterministic, and it follows the chosen date
 * range: daily numbers are generated per day, and stat cards compare the range with
 * the same number of days just before it.
 */

export interface DayPoint {
  date: Date;
  signups: number;
  revenue: number;
  tickets: number;
}

const DAY = 86_400_000;

/** A repeatable pseudo-random number for a day, 0–1. */
function noise(day: number, salt: number) {
  const x = Math.sin(day * 12.9898 + salt * 78.233) * 43_758.5453;
  return x - Math.floor(x);
}

function point(date: Date): DayPoint {
  const day = Math.floor(date.getTime() / DAY);
  const growth = 1 + (day - 20_000) / 2_000;
  const weekend = [0, 6].includes(date.getDay()) ? 0.55 : 1;
  return {
    date,
    signups: Math.round((18 + noise(day, 1) * 14) * growth * weekend),
    revenue: Math.round((1_900 + noise(day, 2) * 900) * growth * weekend),
    tickets: Math.round((22 + noise(day, 3) * 16) * weekend),
  };
}

export function daysBetween(start: Date, end: Date): DayPoint[] {
  const out: DayPoint[] = [];
  const from = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const to = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  for (let t = from.getTime(); t <= to.getTime(); t += DAY) out.push(point(new Date(t)));
  return out;
}

const sum = (points: DayPoint[], key: keyof Omit<DayPoint, "date">) =>
  points.reduce((s, p) => s + p[key], 0);

/** Totals for the range and for the same length of time just before it. */
export function summarise(start: Date, end: Date) {
  const current = daysBetween(start, end);
  const length = current.length;
  const prevEnd = new Date(start.getTime() - DAY);
  const prevStart = new Date(prevEnd.getTime() - (length - 1) * DAY);
  const previous = daysBetween(prevStart, prevEnd);
  return {
    current,
    signups: { value: sum(current, "signups"), previous: sum(previous, "signups") },
    revenue: { value: sum(current, "revenue"), previous: sum(previous, "revenue") },
    tickets: { value: sum(current, "tickets"), previous: sum(previous, "tickets") },
  };
}

/** Groups days into weeks when the range is long, so the chart stays readable. */
export function bucket(points: DayPoint[]) {
  if (points.length <= 31) return points.map((p) => ({ ...p, label: p.date }));
  const weeks: Array<DayPoint & { label: Date }> = [];
  for (let i = 0; i < points.length; i += 7) {
    const slice = points.slice(i, i + 7);
    weeks.push({
      date: slice[0].date,
      label: slice[0].date,
      signups: sum(slice, "signups"),
      revenue: sum(slice, "revenue"),
      tickets: sum(slice, "tickets"),
    });
  }
  return weeks;
}

export const planMix = [
  { label: "Starter", value: 612 },
  { label: "Growth", value: 418 },
  { label: "Enterprise", value: 64 },
];

export const channelMix = [
  { label: "Email", value: 341 },
  { label: "Chat", value: 462 },
  { label: "Phone", value: 81 },
];
