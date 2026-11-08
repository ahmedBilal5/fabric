import { Position } from "@xyflow/react";
import { HANDLE_OUTSET_PX } from "./geometry";

/**
 * Returns the absolute anchor position for a single handle,
 * centered on the outer edge of the node card border.
 */
export const getSimpleHandlePosition = (position: Position) => {
  const outset = `-${HANDLE_OUTSET_PX}px`;

  switch (position) {
    case Position.Left:
      return { left: outset, top: "50%", transform: "translateY(-50%)" };
    case Position.Right:
      return { right: outset, top: "50%", transform: "translateY(-50%)" };
    case Position.Top:
      return { top: outset, left: "50%", transform: "translateX(-50%)" };
    case Position.Bottom:
      return { bottom: outset, left: "50%", transform: "translateX(-50%)" };
    default:
      return { right: outset, top: "50%", transform: "translateY(-50%)" };
  }
};

/**
 * Returns the anchor position for one handle among many on the same side,
 * applying a vertical/horizontal offset from the side's midpoint.
 */
export const getAdjustedHandlePosition = (position: Position, offset: number) => {
  const basePosition = getSimpleHandlePosition(position);

  switch (position) {
    case Position.Left:
    case Position.Right:
      return {
        ...basePosition,
        top: `calc(50% + ${offset}px)`,
      };
    case Position.Top:
    case Position.Bottom:
      return {
        ...basePosition,
        left: `calc(50% + ${offset}px)`,
      };
    default:
      return basePosition;
  }
};
