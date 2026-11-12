import { zodResolver } from "@hookform/resolvers/zod";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { z as z3 } from "zod/v3";

const options = { fields: {}, shouldUseNativeValidation: false };

describe("Zod form validation", () => {
  it("also accepts the supported Zod 3 schema API", async () => {
    const schema = z3.object({ email: z3.string().email("Enter a valid email.") });
    const result = await zodResolver(schema)({ email: "invalid" }, undefined, options);
    expect(result.errors).toMatchObject({ email: { message: "Enter a valid email." } });
  });
  it("returns transformed output while preserving editable input values", async () => {
    const schema = z.object({ seats: z.string().transform(Number) });
    const input = { seats: "12" };
    const result = await zodResolver(schema)(input, undefined, options);
    expect(result).toEqual({ values: { seats: 12 }, errors: {} });
    expect(input.seats).toBe("12");
  });
  it("preserves nested and field-array error paths", async () => {
    const schema = z.object({
      members: z.array(z.object({ email: z.email("Enter a valid email.") })),
    });
    const result = await zodResolver(schema)(
      { members: [{ email: "invalid" }] },
      undefined,
      options,
    );
    expect(result.errors).toMatchObject({
      members: [{ email: { message: "Enter a valid email." } }],
    });
    expect(result.values).toEqual({});
  });
  it("supports asynchronous validation", async () => {
    const schema = z.object({
      name: z.string().refine(async (value) => value !== "reserved", "Choose another name."),
    });
    const result = await zodResolver(schema)({ name: "reserved" }, undefined, options);
    expect(result.errors).toMatchObject({ name: { message: "Choose another name." } });
  });
});
