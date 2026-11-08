import { Position } from "@xyflow/react";
import { describe, expect, it } from "vitest";
import { getAdjustedHandlePosition, getSimpleHandlePosition } from "../src/utils/handles";

describe("handles", () => {
  it("returns side-specific base positions", () => {
    expect(getSimpleHandlePosition(Position.Left)).toEqual({
      left: "-9px",
      top: "50%",
      transform: "translateY(-50%)",
    });
    expect(getSimpleHandlePosition(Position.Top)).toEqual({
      top: "-9px",
      left: "50%",
      transform: "translateX(-50%)",
    });
  });

  it("applies offsets for stacked handles on each side", () => {
    expect(getAdjustedHandlePosition(Position.Right, 20)).toEqual({
      right: "-9px",
      top: "calc(50% + 20px)",
      transform: "translateY(-50%)",
    });
    expect(getAdjustedHandlePosition(Position.Bottom, -10)).toEqual({
      bottom: "-9px",
      left: "calc(50% + -10px)",
      transform: "translateX(-50%)",
    });
  });
});
