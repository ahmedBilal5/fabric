import { describe, expect, it } from "vitest";
import {
  filtersFromSearchParams,
  filtersToSearchParams,
} from "../src/FabricFilterBar/filterParams";
import type { FabricFilterDef } from "../src/FabricFilterBar/types";

const defs: FabricFilterDef[] = [
  {
    id: "status",
    label: "Status",
    multiple: true,
    options: [
      { value: "draft", label: "Draft" },
      { value: "paid", label: "Paid" },
    ],
  },
  {
    id: "owner",
    label: "Owner",
    options: [
      { value: "jane", label: "Jane" },
      { value: "sam", label: "Sam" },
    ],
  },
];

describe("filtersToSearchParams", () => {
  it("repeats keys for multiple values and sets search", () => {
    const p = filtersToSearchParams(defs, { status: ["draft", "paid"], owner: "sam" }, "north");
    expect(p.toString()).toBe("q=north&status=draft&status=paid&owner=sam");
  });
  it("removes empty values and keeps unrelated params", () => {
    const base = new URLSearchParams("page=2&status=draft&q=old");
    const p = filtersToSearchParams(defs, { status: [], owner: undefined }, "  ", base);
    expect(p.toString()).toBe("page=2");
  });
});

describe("filtersFromSearchParams", () => {
  it("reads values back", () => {
    const { values, search } = filtersFromSearchParams(
      defs,
      new URLSearchParams("q=north&status=paid&status=draft&owner=jane"),
    );
    expect(search).toBe("north");
    expect(values).toEqual({ status: ["paid", "draft"], owner: "jane" });
  });
  it("drops unknown options and extra single values", () => {
    const { values } = filtersFromSearchParams(
      defs,
      new URLSearchParams("status=bogus&owner=sam&owner=jane"),
    );
    expect(values).toEqual({ owner: "sam" });
  });
  it("round-trips", () => {
    const values = { status: ["paid"], owner: "jane" };
    const p = filtersToSearchParams(defs, values, "x");
    expect(filtersFromSearchParams(defs, p)).toEqual({ values, search: "x" });
  });
});
