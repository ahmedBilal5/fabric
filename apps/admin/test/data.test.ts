import { describe, expect, it } from "vitest";
import {
  applyFormValues,
  customerFormSchema,
  emptyCustomerForm,
  toFormInput,
} from "../src/data/customerForm";
import {
  addDays,
  type Customer,
  customerInvoices,
  customerMrr,
  fromDay,
  generateCustomers,
  toDay,
} from "../src/data/customers";
import {
  bucketRange,
  dashboardMetrics,
  filterCustomers,
  granularityFor,
  mrrOn,
  pastDue,
} from "../src/data/query";

const today = new Date(2026, 10, 12);
const customers = generateCustomers(today);

const make = (over: Partial<Customer>): Customer => ({
  id: "c-1",
  name: "Acme Traders",
  website: "",
  industry: "retail",
  region: "eu",
  plan: "starter",
  status: "active",
  seats: 10,
  owner: "Jane Doe",
  contact: { name: "Ana Novak", email: "ana@acme.example.com", phone: "" },
  createdAt: "2026-01-01",
  notes: "",
  ...over,
});

describe("generateCustomers", () => {
  it("is stable for the same day and seed", () => {
    expect(generateCustomers(today)).toEqual(customers);
  });

  it("makes unique IDs and names, newest first", () => {
    expect(new Set(customers.map((c) => c.id)).size).toBe(customers.length);
    expect(new Set(customers.map((c) => c.name)).size).toBe(customers.length);
    const days = customers.map((c) => c.createdAt);
    expect([...days].sort().reverse()).toEqual(days);
  });

  it("keeps every record valid for the edit form", () => {
    for (const c of customers) {
      const result = customerFormSchema.safeParse(toFormInput(c));
      expect(result.success, `${c.id}: ${result.error?.message}`).toBe(true);
    }
  });

  it("dates churn after sign-up and never in the future", () => {
    for (const c of customers.filter((x) => x.churnedAt)) {
      expect(c.status).toBe("churned");
      expect((c.churnedAt ?? "") > c.createdAt).toBe(true);
      expect((c.churnedAt ?? "") <= toDay(today)).toBe(true);
    }
  });
});

describe("dates", () => {
  it("round-trips local days", () => {
    expect(toDay(fromDay("2026-03-09"))).toBe("2026-03-09");
    expect(toDay(addDays(fromDay("2026-02-27"), 2))).toBe("2026-03-01");
  });
});

describe("customerMrr and invoices", () => {
  it("bills paying customers only", () => {
    expect(customerMrr(make({ plan: "growth", seats: 10 }))).toBe(240);
    expect(customerMrr(make({ status: "trial" }))).toBe(0);
    expect(customerMrr(make({ status: "churned" }))).toBe(0);
  });

  it("makes one invoice per month, newest first, the latest open or overdue", () => {
    const list = customerInvoices(make({ createdAt: "2026-08-15", status: "past_due" }), today);
    expect(list.map((i) => i.period)).toEqual([
      "2026-11-01",
      "2026-10-01",
      "2026-09-01",
      "2026-08-01",
    ]);
    expect(list.map((i) => i.status)).toEqual(["overdue", "paid", "paid", "paid"]);
    expect(customerInvoices(make({ status: "trial" }), today)).toEqual([]);
  });
});

describe("filterCustomers", () => {
  const list = [
    make({ id: "c-1", name: "Acme Traders", status: "active", plan: "growth", owner: "Sam Lee" }),
    make({
      id: "c-2",
      name: "Globex",
      status: "trial",
      contact: { name: "Hugo Ito", email: "hugo@globex.example.com", phone: "" },
    }),
    make({
      id: "c-3",
      name: "Initech",
      status: "churned",
      contact: { name: "Eli Berg", email: "eli@initech.example.com", phone: "" },
    }),
  ];

  it("searches names, IDs and contacts, ignoring case", () => {
    expect(filterCustomers(list, { search: "acme" }).map((c) => c.id)).toEqual(["c-1"]);
    expect(filterCustomers(list, { search: "HUGO" }).map((c) => c.id)).toEqual(["c-2"]);
    expect(filterCustomers(list, { search: "c-3" }).map((c) => c.id)).toEqual(["c-3"]);
  });

  it("combines filters", () => {
    expect(filterCustomers(list, { status: ["active", "trial"] })).toHaveLength(2);
    expect(filterCustomers(list, { status: ["active", "trial"], owner: "Sam Lee" })).toHaveLength(
      1,
    );
    expect(filterCustomers(list, { plan: ["enterprise"] })).toHaveLength(0);
    expect(filterCustomers(list, {})).toHaveLength(3);
  });
});

describe("dashboard maths", () => {
  it("picks days, weeks or months by the range's length", () => {
    expect(granularityFor(fromDay("2026-10-01"), fromDay("2026-10-31"))).toBe("day");
    expect(granularityFor(fromDay("2026-08-01"), fromDay("2026-10-31"))).toBe("week");
    expect(granularityFor(fromDay("2025-11-01"), fromDay("2026-10-31"))).toBe("month");
  });

  it("covers the range with no gaps or overlaps", () => {
    const start = fromDay("2026-01-15");
    const end = fromDay("2026-04-10");
    for (const g of ["day", "week", "month"] as const) {
      const buckets = bucketRange(start, end, g);
      expect(toDay(buckets[0].start)).toBe("2026-01-15");
      expect(toDay(buckets[buckets.length - 1].end)).toBe("2026-04-10");
      for (let i = 1; i < buckets.length; i++)
        expect(toDay(buckets[i].start)).toBe(toDay(addDays(buckets[i - 1].end, 1)));
    }
    expect(bucketRange(start, end, "month").map((b) => toDay(b.start))).toEqual([
      "2026-01-15",
      "2026-02-01",
      "2026-03-01",
      "2026-04-01",
    ]);
  });

  it("counts revenue only while a customer pays", () => {
    const list = [
      make({ createdAt: "2026-03-01", churnedAt: "2026-06-01", status: "churned", seats: 5 }),
    ];
    expect(mrrOn(list, fromDay("2026-02-28"))).toBe(0);
    expect(mrrOn(list, fromDay("2026-03-01"))).toBe(60);
    expect(mrrOn(list, fromDay("2026-05-31"))).toBe(60);
    expect(mrrOn(list, fromDay("2026-06-01"))).toBe(0);
  });

  it("compares the range with the one before it", () => {
    const list = [
      make({ id: "a", createdAt: "2026-10-05" }),
      make({ id: "b", createdAt: "2026-09-20" }),
      make({ id: "c", createdAt: "2026-09-25" }),
      make({ id: "d", createdAt: "2025-01-01", churnedAt: "2026-10-10", status: "churned" }),
    ];
    const m = dashboardMetrics(list, fromDay("2026-10-01"), fromDay("2026-10-30"), today);
    expect(m.signups).toEqual({ value: 1, previous: 2 });
    expect(m.churned).toEqual({ value: 1, previous: 0 });
    expect(m.paying).toEqual({ value: 3, previous: 3 });
    expect(m.series).toHaveLength(30);
    expect(m.byPlan.find((p) => p.id === "starter")?.value).toBe(3);
  });

  it("stops at today when the range runs into the future", () => {
    const m = dashboardMetrics(customers, fromDay("2026-11-01"), fromDay("2026-11-30"), today);
    expect(m.series).toHaveLength(12);
  });

  it("lists past-due customers, biggest first", () => {
    const list = pastDue(customers);
    expect(list.every((c) => c.status === "past_due")).toBe(true);
    const values = list.map(customerMrr);
    expect([...values].sort((a, b) => b - a)).toEqual(values);
  });
});

describe("customer form", () => {
  it("asks for the required fields on a blank form", () => {
    const result = customerFormSchema.safeParse({ ...emptyCustomerForm, seats: null });
    expect(result.success).toBe(false);
    const paths = result.error?.issues.map((i) => i.path.join("."));
    expect(paths).toEqual(
      expect.arrayContaining([
        "name",
        "industry",
        "region",
        "seats",
        "contact.name",
        "contact.email",
      ]),
    );
  });

  it("checks the website and phone formats", () => {
    const base = toFormInput(customers[0]);
    const bad = customerFormSchema.safeParse({
      ...base,
      website: "acme.com",
      contact: { ...base.contact, phone: "555 0100" },
    });
    expect(bad.error?.issues.map((i) => i.path.join("."))).toEqual(["website", "contact.phone"]);
    expect(
      customerFormSchema.safeParse({ ...base, website: "https://acme.example.com" }).success,
    ).toBe(true);
  });

  it("records the cancel date once, and clears it on reactivation", () => {
    const c = make({});
    const values = customerFormSchema.parse({ ...toFormInput(c), status: "churned" });
    const churned = applyFormValues(c, values, "2026-11-12");
    expect(churned.churnedAt).toBe("2026-11-12");
    expect(applyFormValues(churned, values, "2026-12-01").churnedAt).toBe("2026-11-12");
    const back = customerFormSchema.parse({ ...toFormInput(churned), status: "active" });
    expect(applyFormValues(churned, back, "2026-12-01").churnedAt).toBeUndefined();
  });
});
