import { describe, expect, it } from "vitest";
import { meterState, meterValueText } from "../src/FabricMeter/meter";

describe("meterState", () => {
  const thresholds = { warning: 0.8, critical: 1 };

  it("fills by share and picks the level", () => {
    expect(meterState(5, { max: 10, thresholds })).toEqual({
      ratio: 0.5,
      used: 0.5,
      level: "normal",
      over: false,
    });
    expect(meterState(8, { max: 10, thresholds }).level).toBe("warning");
    expect(meterState(10, { max: 10, thresholds }).level).toBe("critical");
  });

  it("clamps the bar but reports overage", () => {
    const s = meterState(12, { max: 10, thresholds });
    expect(s.ratio).toBe(1);
    expect(s.used).toBeCloseTo(1.2);
    expect(s.over).toBe(true);
  });

  it("has no levels without thresholds", () => {
    expect(meterState(100, { max: 100 }).level).toBe("normal");
  });

  it("respects min", () => {
    expect(meterState(15, { min: 10, max: 20 }).ratio).toBe(0.5);
  });
});

describe("meterValueText", () => {
  it("reads as a fraction, a percentage or a value", () => {
    expect(meterValueText(8, { max: 10, unit: "seats", locale: "en-US" })).toBe("8 of 10 seats");
    expect(meterValueText(8, { max: 10, format: "percent", locale: "en-US" })).toBe("80%");
    expect(
      meterValueText(1250, { max: 5000, format: "value", unit: "calls", locale: "en-US" }),
    ).toBe("1,250 calls");
  });
});
