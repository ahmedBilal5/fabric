import { describe, expect, it } from "vitest";
import {
  axisTickFormatter,
  cartesianTable,
  computeDelta,
  deltaTone,
  describeTrend,
  foldSlices,
  maxAbsValue,
  pieTable,
} from "../src/data";

describe("cartesianTable", () => {
  it("makes one row per category and one column per series", () => {
    const t = cartesianTable({
      categories: ["Jan", "Feb"],
      categoryLabel: "Month",
      series: [
        { label: "Revenue", data: [1200, 1500], format: (v) => `$${v}` },
        { label: "Costs", data: [800, null] },
      ],
    });
    expect(t.columns).toEqual(["Month", "Revenue", "Costs"]);
    expect(t.rows).toEqual([
      ["Jan", "$1200", "800"],
      ["Feb", "$1500", "–"],
    ]);
  });

  it("reads categories and values from a dataset", () => {
    const t = cartesianTable({
      categoryKey: "month",
      dataset: [
        { month: "Jan", users: 10 },
        { month: "Feb", users: 12 },
      ],
      series: [{ dataKey: "users" }],
    });
    expect(t.columns).toEqual(["Category", "Series 1"]);
    expect(t.rows).toEqual([
      ["Jan", "10"],
      ["Feb", "12"],
    ]);
  });
});

describe("pieTable", () => {
  it("adds each slice's share of the total", () => {
    const t = pieTable(
      [
        { label: "Starter", value: 25 },
        { label: "Growth", value: 75 },
      ],
      { locale: "en-US" },
    );
    expect(t.columns).toEqual(["Category", "Value", "Share"]);
    expect(t.rows[0][2]).toBe("25%");
    expect(t.rows[1][2]).toBe("75%");
  });
});

describe("axis ticks", () => {
  it("finds the largest absolute value, ignoring gaps", () => {
    expect(
      maxAbsValue([
        [1, null, -40],
        [12, undefined],
      ]),
    ).toBe(40);
  });

  it("stays in full under 10,000 and goes compact above", () => {
    expect(axisTickFormatter(9_000, { locale: "en-US" })(2_500)).toBe("2,500");
    const compact = axisTickFormatter(25_000, { locale: "en-US" });
    expect(compact(20_000)).toBe("20K");
    expect(compact(5_000)).toBe("5K");
    const money = axisTickFormatter(4_000, { locale: "en-US", style: "currency", currency: "USD" });
    expect(money(4_000)).toBe("$4,000");
  });
});

describe("computeDelta and deltaTone", () => {
  it("works out the change and its direction", () => {
    expect(computeDelta(110, 100)).toEqual({ change: 10, ratio: 0.1, direction: "up" });
    expect(computeDelta(90, 100).direction).toBe("down");
    expect(computeDelta(5, 0).ratio).toBeNull();
    expect(computeDelta(7, 7).direction).toBe("flat");
  });

  it("colors by whether the move is good news", () => {
    expect(deltaTone("up")).toBe("positive");
    expect(deltaTone("up", "down")).toBe("negative");
    expect(deltaTone("down", "down")).toBe("positive");
    expect(deltaTone("down", "neutral")).toBe("neutral");
    expect(deltaTone("flat")).toBe("neutral");
  });
});

describe("describeTrend", () => {
  it("summarises first, last, change and range", () => {
    expect(describeTrend([120, 98, 140, 134], { locale: "en-US" })).toBe(
      "From 120 to 134, up 11.7%. Low 98, high 140.",
    );
    expect(describeTrend([], {})).toBe("No data");
    expect(describeTrend([5, 5])).toContain("unchanged");
  });
});

describe("foldSlices", () => {
  it("keeps the largest slices in order and folds the rest into Other", () => {
    const folded = foldSlices(
      [
        { label: "A", value: 5 },
        { label: "B", value: 40 },
        { label: "C", value: 2 },
        { label: "D", value: 30 },
        { label: "E", value: 1 },
      ],
      3,
    );
    expect(folded.map((s) => s.label)).toEqual(["B", "D", "Other"]);
    expect(folded[2].value).toBe(8);
  });

  it("leaves short lists alone", () => {
    expect(foldSlices([{ value: 1 }, { value: 2 }], 6)).toHaveLength(2);
  });
});
