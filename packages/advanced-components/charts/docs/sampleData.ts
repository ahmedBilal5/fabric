/** Sample data for the chart stories: a small SaaS business, fixed so stories are stable. */

export const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** Monthly recurring revenue by plan, USD. */
export const mrrByPlan = {
  Starter: [
    8_200, 8_600, 9_100, 9_400, 9_900, 10_300, 10_200, 10_800, 11_400, 11_900, 12_300, 12_800,
  ],
  Growth: [
    21_400, 22_900, 24_100, 25_800, 27_300, 28_100, 29_900, 31_200, 32_600, 34_100, 35_300, 36_900,
  ],
  Enterprise: [
    31_000, 31_000, 36_500, 36_500, 36_500, 42_800, 42_800, 44_100, 49_600, 49_600, 53_200, 58_400,
  ],
};

export const mrrTotal = months.map(
  (_, i) => mrrByPlan.Starter[i] + mrrByPlan.Growth[i] + mrrByPlan.Enterprise[i],
);

/** New customers per month. */
export const newCustomers = [42, 51, 57, 49, 63, 71, 58, 66, 74, 81, 77, 92];

/** Weekly active users, last 12 weeks. */
export const weeks = Array.from({ length: 12 }, (_, i) => new Date(2026, 8, 7 + i * 7));
export const weeklyActive = [
  3_840, 3_910, 4_120, 4_060, 4_380, 4_510, 4_470, 4_720, 4_890, 4_810, 5_060, 5_240,
];

/** Support tickets by channel and quarter. */
export const quarters = ["Q1", "Q2", "Q3", "Q4"];
export const ticketsByChannel = {
  Email: [412, 388, 356, 341],
  Chat: [290, 344, 401, 462],
  Phone: [118, 104, 96, 81],
};

/** Revenue by region, USD, this year. */
export const revenueByRegion = [
  { label: "North America", value: 412_000 },
  { label: "Europe", value: 288_000 },
  { label: "Asia Pacific", value: 141_000 },
  { label: "Latin America", value: 46_000 },
  { label: "Middle East", value: 22_000 },
  { label: "Africa", value: 9_000 },
  { label: "Oceania", value: 7_500 },
];

/** Customers by plan. */
export const customersByPlan = [
  { label: "Starter", value: 612 },
  { label: "Growth", value: 418 },
  { label: "Enterprise", value: 64 },
];

/** Top accounts by annual contract value, USD. */
export const topAccounts = [
  { name: "Northwind Traders", acv: 96_000 },
  { name: "Acme Corporation", acv: 84_500 },
  { name: "Contoso Ltd", acv: 61_200 },
  { name: "Fabrikam Inc", acv: 48_900 },
  { name: "Tailspin Toys", acv: 33_400 },
];

/** Churn rate per month, as a ratio. */
export const churnRate = [
  0.031, 0.029, 0.034, 0.027, 0.026, 0.024, 0.028, 0.023, 0.022, 0.021, 0.019, 0.018,
];

export const usd = { style: "currency", currency: "USD", maximumFractionDigits: 0 } as const;
