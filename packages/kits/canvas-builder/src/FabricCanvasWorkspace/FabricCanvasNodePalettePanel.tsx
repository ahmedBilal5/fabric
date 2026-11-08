import { radii, shadows, spacing, zIndex } from "@fabric-kit/design-tokens";
import { FabricFlex } from "@fabric-kit/primitives";

import type { FabricCanvasNodePalettePanelProps } from "../types";
import { toSxArray } from "../utils/sx";
import { FabricCanvasNodePalette } from "./FabricCanvasNodePalette";

// Min-width floor keeps the compact look; max-width caps growth so long labels truncate instead of widening the rail.
const MIN_WIDTH_PX = spacing["4xl"] + spacing.xlsm;
const MAX_WIDTH_PX = spacing["4xl"] * 2;
// Optical centering: canvas controls and minimap crowd the bottom edge, so the rail sits above true center.
const CENTER_OFFSET_UP_PX = spacing["3xl"] + spacing.md;
const EDGE_MARGIN_PX = spacing["2xl"];

/**
 * `FabricCanvasNodePalette` in a floating surface pinned to the left of the canvas, slightly above vertical center.
 * Place it inside a `position: relative` container; override offsets via `sx`.
 * Hidden in `view` mode unless `showInViewMode` is set.
 *
 * @example
 * <FabricCanvasNodePalettePanel mode="edit" nodes={nodes} />
 */
export const FabricCanvasNodePalettePanel = <DropItem,>({
  mode,
  nodes,
  dragItemType,
  onNodeSelect,
  onNodeDragStart,
  renderNodeIcon,
  emptyMessage,
  backAriaLabel,
  showInViewMode = false,
  sx,
  ...boxProps
}: FabricCanvasNodePalettePanelProps<DropItem>) => {
  if (!showInViewMode && mode === "view") {
    return null;
  }

  return (
    <FabricFlex
      direction="column"
      {...boxProps}
      sx={[
        {
          position: "absolute",
          left: { xs: `${spacing.xs}px`, sm: `${spacing.md}px` },
          top: `calc(50% - ${CENTER_OFFSET_UP_PX}px)`,
          transform: "translateY(-50%)",
          zIndex: zIndex.sticky,
          boxSizing: "border-box",
          minWidth: `${MIN_WIDTH_PX}px`,
          maxWidth: `${MAX_WIDTH_PX}px`,
          maxHeight: `calc(100% - ${(CENTER_OFFSET_UP_PX + EDGE_MARGIN_PX) * 2}px)`,
          p: `${spacing.xs}px`,
          backgroundColor: "var(--mui-palette-background-default)",
          borderRadius: `${radii.md}px`,
          boxShadow: shadows.panel,
        },
        ...toSxArray(sx),
      ]}
    >
      <FabricCanvasNodePalette
        mode={mode}
        nodes={nodes}
        dragItemType={dragItemType}
        onNodeSelect={onNodeSelect}
        onNodeDragStart={onNodeDragStart}
        renderNodeIcon={renderNodeIcon}
        emptyMessage={emptyMessage}
        backAriaLabel={backAriaLabel}
      />
    </FabricFlex>
  );
};
