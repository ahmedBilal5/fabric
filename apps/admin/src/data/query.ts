/**
 * Filtering and dashboard maths over the mock customers. Pure functions: a real app
 * would ask its API for these, and the pages wouldn't change.
 */

import {
  addDays,
  type Customer,
  type CustomerStatus,
  INDUSTRIES,
  type Industry,
  PLANS,
  type Plan,
  toDay,
} from "./customers";

export interface CustomerQuery {
  /** Matches the name, ID, website or contact. */
  search?: string;
  status?: CustomerStatus[];
  plan?: Plan[];
  owner?: string;
}

/** The customers that match every part of the query. */
export function filterCustomers(customers: readonly Customer[], q: CustomerQuery): Customer[] {
  const text = q.search?.trim().toLowerCase() ?? "";
  return customers.filter(
    (c) =>
      (!text ||
        [c.name, c.id, c.website, c.contact.name, c.contact.email].some((v) =>
          v.toLowerCase().includes(text),
        )) &&
      (!q.status?.length || q.status.includes(c.status)) &&
      (!q.plan?.length || q.plan.includes(c.plan)) &&
      (!q.owner || c.owner === q.owner),
  );
}

// ---------------------------------------------------------------------------
// Dashboard.

export type Granularity = "day" | "week" | "month";

export interface Bucket {
  start: Date;
  end: Date;
}

const DAY_MS = 86_400_000;
/** Whole days from `a` to `b`, ignoring daylight-saving shifts. */
export const daysBetween = (a: Date, b: Date) => Math.round((b.getTime() - a.getTime()) / DAY_MS);

/** Days for up to a month, weeks for up to six months, then calendar months. */
export function granularityFor(start: Date, end: Date): Granularity {
  const days = daysBetween(start, end) + 1;
  if (days <= 31) return "day";
  if (days <= 183) return "week";
  return "month";
}

/** Splits an inclusive date range into consecutive buckets. The last may be shorter. */
export function bucketRange(
  start: Date,
  end: Date,
  granularity = granularityFor(start, end),
): Bucket[] {
  const buckets: Bucket[] = [];
  let cursor = start;
  while (cursor <= end) {
    let next: Date;
    if (granularity === "day") next = addDays(cursor, 1);
    else if (granularity === "week") next = addDays(cursor, 7);
    else next = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
    const last = addDays(next, -1);
    buckets.push({ start: cursor, end: last > end ? end : last });
    cursor = next;
  }
  return buckets;
}

/** Whether the customer was a paying customer on `day` (`YYYY-MM-DD`). */
function payingOn(c: Customer, day: string): boolean {
  return c.status !== "trial" && c.createdAt <= day && (!c.churnedAt || c.churnedAt > day);
}

/** Monthly recurring revenue on a day, from the customers paying then. */
export function mrrOn(customers: readonly Customer[], day: Date): number {
  const key = toDay(day);
  return customers.reduce(
    (sum, c) => sum + (payingOn(c, key) ? c.seats * PLANS[c.plan].price : 0),
    0,
  );
}

/** Paying customers on a day. */
export function payingCustomersOn(customers: readonly Customer[], day: Date): number {
  const key = toDay(day);
  return customers.filter((c) => payingOn(c, key)).length;
}

const inRange = (day: string | undefined, start: string, end: string) =>
  day !== undefined && day >= start && day <= end;

export interface DashboardMetrics {
  granularity: Granularity;
  /** Revenue on the last day of the range, and on the day before it started. */
  mrr: { value: number; previous: number };
  /** Paying customers on the last day, and on the day before the range. */
  paying: { value: number; previous: number };
  /** Sign-ups in the range, and in the same number of days before it. */
  signups: { value: number; previous: number };
  /** Cancellations in the range, and in the same number of days before it. */
  churned: { value: number; previous: number };
  /** One point per bucket: revenue at its end, and sign-ups during it. */
  series: { start: Date; mrr: number; signups: number }[];
  /** Paying customers by plan on the last day. */
  byPlan: { id: Plan; label: string; value: number }[];
  /** Revenue by industry on the last day, largest first. */
  byIndustry: { id: Industry; label: string; value: number }[];
}

/**
 * Everything the dashboard shows for a date range. Days after `today` are left out,
 * so a range that runs into the future doesn't show a drop to zero.
 */
export function dashboardMetrics(
  customers: readonly Customer[],
  start: Date,
  end: Date,
  today: Date,
): DashboardMetrics {
  const last = end > today ? today : end;
  const span = daysBetween(start, end) + 1;
  const prevStart = addDays(start, -span);
  const prevEnd = addDays(start, -1);
  const [s, e, ps, pe] = [start, last, prevStart, prevEnd].map(toDay);

  const count = (pick: (c: Customer) => string | undefined, from: string, to: string) =>
    customers.filter((c) => inRange(pick(c), from, to)).length;

  const granularity = granularityFor(start, end);
  const series = bucketRange(start, last, granularity).map((b) => {
    const [bs, be] = [toDay(b.start), toDay(b.end)];
    return {
      start: b.start,
      mrr: mrrOn(customers, b.end),
      signups: count((c) => c.createdAt, bs, be),
    };
  });

  const lastKey = toDay(last);
  const paying = customers.filter((c) => payingOn(c, lastKey));
  const byPlan = (Object.keys(PLANS) as Plan[]).map((id) => ({
    id,
    label: PLANS[id].label,
    value: paying.filter((c) => c.plan === id).length,
  }));
  const byIndustry = (Object.keys(INDUSTRIES) as Industry[])
    .map((id) => ({
      id,
      label: INDUSTRIES[id].label,
      value: paying
        .filter((c) => c.industry === id)
        .reduce((sum, c) => sum + c.seats * PLANS[c.plan].price, 0),
    }))
    .sort((a, b) => b.value - a.value);

  return {
    granularity,
    mrr: { value: mrrOn(customers, last), previous: mrrOn(customers, prevEnd) },
    paying: { value: paying.length, previous: payingCustomersOn(customers, prevEnd) },
    signups: {
      value: count((c) => c.createdAt, s, e),
      previous: count((c) => c.createdAt, ps, pe),
    },
    churned: {
      value: count((c) => c.churnedAt, s, e),
      previous: count((c) => c.churnedAt, ps, pe),
    },
    series,
    byPlan,
    byIndustry,
  };
}

/** Customers whose latest invoice is overdue, biggest first: the dashboard's to-do list. */
export function pastDue(customers: readonly Customer[]): Customer[] {
  return customers
    .filter((c) => c.status === "past_due")
    .sort((a, b) => b.seats * PLANS[b.plan].price - a.seats * PLANS[a.plan].price);
}
