/**
 * Mock customers for the example app. Generated from a fixed seed relative to "today",
 * so every visit shows the same mix and the date filters always have data.
 * Every name is fictional; websites and emails use example.com.
 */

export type CustomerStatus = "active" | "trial" | "past_due" | "churned";
export type Plan = "starter" | "growth" | "enterprise";
export type Industry = "retail" | "logistics" | "manufacturing" | "software" | "finance" | "health";
export type Region = "na" | "eu" | "apac";

export interface Contact {
  name: string;
  email: string;
  /** E.164, e.g. `+442079460123`, or empty. */
  phone: string;
}

export interface Customer {
  /** `c-1001`, `c-1002`, … */
  id: string;
  name: string;
  /** Full URL or empty. */
  website: string;
  industry: Industry;
  region: Region;
  plan: Plan;
  status: CustomerStatus;
  seats: number;
  /** The account owner on your team. */
  owner: string;
  contact: Contact;
  /** Day the account was created, `YYYY-MM-DD`. */
  createdAt: string;
  /** Day the account cancelled, `YYYY-MM-DD`. Only for churned customers. */
  churnedAt?: string;
  notes: string;
}

export const STATUSES: Record<CustomerStatus, { label: string }> = {
  active: { label: "Active" },
  trial: { label: "Trial" },
  past_due: { label: "Past due" },
  churned: { label: "Churned" },
};

/** Monthly price per seat, in USD. */
export const PLANS: Record<Plan, { label: string; price: number }> = {
  starter: { label: "Starter", price: 12 },
  growth: { label: "Growth", price: 24 },
  enterprise: { label: "Enterprise", price: 40 },
};

export const INDUSTRIES: Record<Industry, { label: string }> = {
  retail: { label: "Retail" },
  logistics: { label: "Logistics" },
  manufacturing: { label: "Manufacturing" },
  software: { label: "Software" },
  finance: { label: "Finance" },
  health: { label: "Healthcare" },
};

export const REGIONS: Record<Region, { label: string }> = {
  na: { label: "North America" },
  eu: { label: "Europe" },
  apac: { label: "Asia Pacific" },
};

export const OWNERS = ["Jane Doe", "Sam Lee", "Priya Patel", "Alex Kim"] as const;

/** Options lists for selects and filters, in display order. */
export const options = <K extends string>(record: Record<K, { label: string }>) =>
  (Object.keys(record) as K[]).map((value) => ({ value, label: record[value].label }));

/** Monthly recurring revenue right now: trials and churned accounts pay nothing. */
export function customerMrr(c: Pick<Customer, "status" | "plan" | "seats">): number {
  if (c.status === "trial" || c.status === "churned") return 0;
  return c.seats * PLANS[c.plan].price;
}

// ---------------------------------------------------------------------------
// Dates as local calendar days.

/** `YYYY-MM-DD` for a local date. */
export function toDay(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${m}-${d}`;
}

/** Local midnight for `YYYY-MM-DD`. */
export function fromDay(day: string): Date {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** A local date `n` days after `date` (negative for before), at midnight. */
export function addDays(date: Date, n: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + n);
}

// ---------------------------------------------------------------------------
// Generator.

/** Small seeded random number generator (mulberry32): same seed, same sequence. */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const PREFIXES = [
  "Acme",
  "Northwind",
  "Globex",
  "Initech",
  "Contoso",
  "Fabrikam",
  "Tailspin",
  "Litware",
  "Proseware",
  "Woodgrove",
  "Alpine",
  "Coho",
  "Lucerne",
  "Trey",
  "Bluebird",
  "Wide World",
  "Riverside",
  "Harbor",
  "Summit",
  "Juniper",
];
const SUFFIXES = ["Traders", "Logistics", "Labs", "Supply", "Group", "Health", "Retail", "Systems"];
const FIRST = [
  "Ana",
  "Ben",
  "Chen",
  "Dara",
  "Eli",
  "Femi",
  "Gia",
  "Hugo",
  "Iris",
  "Jon",
  "Kai",
  "Lena",
];
const LAST = [
  "Novak",
  "Okafor",
  "Silva",
  "Berg",
  "Moreau",
  "Tanaka",
  "Reyes",
  "Walsh",
  "Ito",
  "Kaur",
];
const INDUSTRY_KEYS = Object.keys(INDUSTRIES) as Industry[];
const REGION_KEYS = Object.keys(REGIONS) as Region[];
const SEATS: Record<Plan, [number, number]> = {
  starter: [3, 20],
  growth: [10, 80],
  enterprise: [60, 400],
};
// Ranges set aside for fiction: UK 020 7946 0xxx, US 202-555-01xx, AU 02 5550 xxxx.
const PHONES: Record<Region, (n: number) => string> = {
  eu: (n) => `+442079460${String(n % 1000).padStart(3, "0")}`,
  na: (n) => `+12025550${String(100 + (n % 100))}`,
  apac: (n) => `+6125550${String(n % 10000).padStart(4, "0")}`,
};

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "");

/**
 * `count` customers created over the two years before `today`, with more recent
 * sign-ups than old ones (the business is growing). The same `today` and `seed`
 * always give the same customers.
 */
export function generateCustomers(today: Date, count = 120, seed = 7): Customer[] {
  const rand = seededRandom(seed);
  const pick = <T>(list: readonly T[]) => list[Math.floor(rand() * list.length)];
  const between = (lo: number, hi: number) => lo + Math.floor(rand() * (hi - lo + 1));

  const customers: Customer[] = [];
  for (let i = 0; i < count; i++) {
    // Each (prefix, suffix) pair is used once: see the stride below.
    const name = `${PREFIXES[i % PREFIXES.length]} ${SUFFIXES[(i * 3 + Math.floor(i / PREFIXES.length)) % SUFFIXES.length]}`;
    const domain = `${slug(name)}.example.com`;
    const plan: Plan = rand() < 0.45 ? "starter" : rand() < 0.75 ? "growth" : "enterprise";
    const region = pick(REGION_KEYS);
    const first = pick(FIRST);
    const last = pick(LAST);

    const roll = rand();
    let status: CustomerStatus = "active";
    // Skewed toward recent days, up to two years ago.
    let age = Math.floor(720 * (1 - Math.sqrt(rand())));
    let churnedAt: string | undefined;
    if (roll < 0.1 && age > 60) {
      status = "churned";
      churnedAt = toDay(addDays(today, -between(1, age - 30)));
    } else if (roll < 0.18) {
      status = "trial";
      age = between(0, 20);
    } else if (roll < 0.25) {
      status = "past_due";
    }

    customers.push({
      id: `c-${1001 + i}`,
      name,
      website: rand() < 0.85 ? `https://${domain}` : "",
      industry: pick(INDUSTRY_KEYS),
      region,
      plan,
      status,
      seats: between(...SEATS[plan]),
      owner: pick(OWNERS),
      contact: {
        name: `${first} ${last}`,
        email: `${slug(first)}.${slug(last)}@${domain}`,
        phone: rand() < 0.7 ? PHONES[region](i) : "",
      },
      createdAt: toDay(addDays(today, -age)),
      churnedAt,
      notes: "",
    });
  }
  return customers.sort(
    (a, b) => b.createdAt.localeCompare(a.createdAt) || a.id.localeCompare(b.id),
  );
}

// ---------------------------------------------------------------------------
// Invoices for the detail page.

export type InvoiceStatus = "paid" | "open" | "overdue";

export interface Invoice {
  id: string;
  /** First day of the billed month, `YYYY-MM-DD`. */
  period: string;
  amount: number;
  status: InvoiceStatus;
}

/**
 * One invoice per month the customer has paid for, newest first, up to `limit`. The
 * latest is open, or overdue for past-due customers. Trials have none.
 */
export function customerInvoices(c: Customer, today: Date, limit = 12): Invoice[] {
  if (c.status === "trial") return [];
  const created = fromDay(c.createdAt);
  const last = c.churnedAt ? fromDay(c.churnedAt) : today;
  const invoices: Invoice[] = [];
  let month = new Date(last.getFullYear(), last.getMonth(), 1);
  const amount = c.seats * PLANS[c.plan].price;
  let n = 0;
  while (month >= new Date(created.getFullYear(), created.getMonth(), 1) && n < limit) {
    const latest = n === 0 && !c.churnedAt;
    invoices.push({
      id: `INV-${c.id.slice(2)}-${String(month.getFullYear()).slice(2)}${String(month.getMonth() + 1).padStart(2, "0")}`,
      period: toDay(month),
      amount,
      status: latest ? (c.status === "past_due" ? "overdue" : "open") : "paid",
    });
    month = new Date(month.getFullYear(), month.getMonth() - 1, 1);
    n++;
  }
  return invoices;
}
