import { describe, expect, it } from "vitest";
import { getErrorMessage } from "../src/internal/errors";

describe("composite field messages", () => {
  it("prefers a range-wide message over nested endpoint errors", () => {
    expect(
      getErrorMessage({ message: "Check the range.", start: { message: "Choose a start date." } }),
    ).toBe("Check the range.");
  });
  it("surfaces nested date-range errors on the bound range field", () => {
    expect(
      getErrorMessage({
        start: { type: "custom", message: "Choose a start date." },
        end: { message: "Choose an end date." },
      }),
    ).toBe("Choose a start date.");
  });
  it("supports array errors and absent messages", () => {
    expect(getErrorMessage([undefined, { email: { message: "Enter a valid email." } }])).toBe(
      "Enter a valid email.",
    );
    expect(getErrorMessage(undefined)).toBeUndefined();
    expect(getErrorMessage({ type: "required" })).toBeUndefined();
  });
  it("ignores native refs and safely handles cycles", () => {
    const cyclic: { self?: object } = {};
    cyclic.self = cyclic;
    expect(
      getErrorMessage({
        ref: { message: "Not an error" },
        cyclic,
        actual: { message: "Try again." },
      }),
    ).toBe("Try again.");
  });
});
