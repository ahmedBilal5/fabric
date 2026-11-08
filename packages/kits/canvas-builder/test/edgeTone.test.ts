import { describe, expect, it } from "vitest";
import { resolveEdgeTone } from "../src/utils/edgeTone";

describe("resolveEdgeTone", () => {
  it("infers tone from conventional handle names, ignoring case and whitespace", () => {
    expect(resolveEdgeTone("Success")).toBe("success");
    expect(resolveEdgeTone(" error ")).toBe("error");
    expect(resolveEdgeTone("FAILED")).toBe("error");
  });

  it("falls back to neutral for other or missing labels", () => {
    expect(resolveEdgeTone("Transform")).toBe("neutral");
    expect(resolveEdgeTone(undefined)).toBe("neutral");
  });

  it("lets an explicit tone override the label", () => {
    expect(resolveEdgeTone("success", "error")).toBe("error");
    expect(resolveEdgeTone("anything", "success")).toBe("success");
  });
});
