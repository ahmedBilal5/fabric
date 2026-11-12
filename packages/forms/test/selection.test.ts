import { describe, expect, it } from "vitest";
import { setMembership } from "../src/internal/selection";

describe("checkbox group values", () => {
  it("adds a checked option without mutating the form's defaults", () => {
    const defaults = Object.freeze(["email"]);
    expect(setMembership(defaults, "sms", true)).toEqual(["email", "sms"]);
    expect(defaults).toEqual(["email"]);
  });
  it("does not duplicate an option when checked more than once", () => {
    expect(setMembership(["email"], "email", true)).toEqual(["email"]);
  });
  it("removes a deselected value and preserves the other values' order", () => {
    expect(setMembership(["email", "sms", "push"], "sms", false)).toEqual(["email", "push"]);
  });
  it("handles an empty selection and removal of an absent option", () => {
    expect(setMembership([], "email", false)).toEqual([]);
    expect(setMembership(["sms"], "email", false)).toEqual(["sms"]);
  });
});
