import { describe, expect, it } from "vitest";
import { dateRangePresets, matchPreset } from "../src/FabricDateRangePicker/presets";

const ymd = (d: Date) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
const range = (p: { getRange: (t: Date) => { start: Date; end: Date } }, today: Date) => {
  const r = p.getRange(today);
  return [ymd(r.start), ymd(r.end)];
};

describe("date range presets", () => {
  const today = new Date(2026, 10, 12, 15, 30); // 12 Nov 2026, mid-afternoon

  it("counts whole days, today included", () => {
    expect(range(dateRangePresets.today, today)).toEqual(["2026-11-12", "2026-11-12"]);
    expect(range(dateRangePresets.yesterday, today)).toEqual(["2026-11-11", "2026-11-11"]);
    expect(range(dateRangePresets.last7Days, today)).toEqual(["2026-11-6", "2026-11-12"]);
    expect(range(dateRangePresets.last30Days, today)).toEqual(["2026-10-14", "2026-11-12"]);
  });

  it("handles months, quarters and years", () => {
    expect(range(dateRangePresets.thisMonth, today)).toEqual(["2026-11-1", "2026-11-12"]);
    expect(range(dateRangePresets.lastMonth, today)).toEqual(["2026-10-1", "2026-10-31"]);
    expect(range(dateRangePresets.thisQuarter, today)).toEqual(["2026-10-1", "2026-11-12"]);
    expect(range(dateRangePresets.lastQuarter, today)).toEqual(["2026-7-1", "2026-9-30"]);
    expect(range(dateRangePresets.thisYear, today)).toEqual(["2026-1-1", "2026-11-12"]);
    expect(range(dateRangePresets.lastYear, today)).toEqual(["2025-1-1", "2025-12-31"]);
  });

  it("crosses year boundaries", () => {
    const jan = new Date(2027, 0, 15);
    expect(range(dateRangePresets.lastMonth, jan)).toEqual(["2026-12-1", "2026-12-31"]);
    expect(range(dateRangePresets.lastQuarter, jan)).toEqual(["2026-10-1", "2026-12-31"]);
  });

  it("finds the preset matching a range, ignoring the time of day", () => {
    const presets = [dateRangePresets.last7Days, dateRangePresets.thisMonth];
    const r = { start: new Date(2026, 10, 6, 9), end: new Date(2026, 10, 12, 23) };
    expect(matchPreset(r, presets, today)?.id).toBe("last7Days");
    expect(matchPreset({ start: null, end: null }, presets, today)).toBeUndefined();
  });
});
