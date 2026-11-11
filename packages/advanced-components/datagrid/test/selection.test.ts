import { describe, expect, it } from "vitest";
import { emptySelection, getSelectedCount } from "../src/FabricBulkActionBar";
import { viewStatesEqual } from "../src/useSavedViews";

describe("getSelectedCount", () => {
  it("counts included rows", () => {
    expect(getSelectedCount({ type: "include", ids: new Set([1, 2, 3]) }, 20)).toBe(3);
  });
  it("counts every row except excluded ones", () => {
    expect(getSelectedCount({ type: "exclude", ids: new Set() }, 20)).toBe(20);
    expect(getSelectedCount({ type: "exclude", ids: new Set([4]) }, 20)).toBe(19);
  });
  it("never goes below zero", () => {
    expect(getSelectedCount({ type: "exclude", ids: new Set([1, 2]) }, 1)).toBe(0);
  });
  it("starts empty", () => {
    expect(getSelectedCount(emptySelection(), 5)).toBe(0);
  });
});

describe("viewStatesEqual", () => {
  it("ignores object key order", () => {
    expect(viewStatesEqual({ a: 1, b: { c: 2, d: 3 } }, { b: { d: 3, c: 2 }, a: 1 })).toBe(true);
  });
  it("respects array order and values", () => {
    expect(viewStatesEqual({ sort: ["a", "b"] }, { sort: ["b", "a"] })).toBe(false);
    expect(viewStatesEqual({ q: "x" }, { q: "y" })).toBe(false);
  });
});
