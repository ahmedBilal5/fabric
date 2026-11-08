import { radii, spacing } from "@fabric-kit/design-tokens";
import { canvasLabelText } from "./typography";

// FABRIC_TOKEN_MISS: the design specifies 2px vertical chip padding; spacing tokens start at 4px.
const CHIP_VERTICAL_PADDING_PX = 2;

/** Compact chip look shared by edge label pills and node badges. */
export const getCanvasChipSx = (background: string, color: string) => ({
  height: "auto",
  backgroundColor: background,
  color,
  borderRadius: `${radii.md}px`,
  ...canvasLabelText,
  "& .MuiChip-label": {
    padding: `${CHIP_VERTICAL_PADDING_PX}px ${spacing.sm}px`,
    lineHeight: "inherit",
  },
});
