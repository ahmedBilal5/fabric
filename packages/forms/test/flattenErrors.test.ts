import { describe, expect, it } from "vitest";
import { flattenErrors } from "../src/internal/flattenErrors";

describe("flattenErrors", () => {
  it("lists nested field errors with their paths, form-wide errors first", () => {
    const errors = {
      company: { name: { type: "too_small", message: "Enter the company name." } },
      members: [undefined, { email: { type: "invalid", message: "Enter an email address." } }],
      root: { submit: { type: "submit", message: "We couldn't save." } },
    };
    expect(flattenErrors(errors)).toEqual([
      { name: "root", message: "We couldn't save." },
      { name: "company.name", message: "Enter the company name." },
      { name: "members.1.email", message: "Enter an email address." },
    ]);
  });

  it("uses a composite field's own message, not its parts'", () => {
    const errors = {
      contract: {
        message: "Choose both dates.",
        type: "custom",
        start: { message: "Choose a start date." },
      },
    };
    expect(flattenErrors(errors)).toEqual([{ name: "contract", message: "Choose both dates." }]);
  });

  it("ignores refs and empty messages", () => {
    const node = { self: null as unknown };
    node.self = node;
    expect(flattenErrors({ a: { message: "", ref: node } })).toEqual([]);
  });
});
