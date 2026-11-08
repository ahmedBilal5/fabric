import { FabricBox, FabricChip, FabricIconButton } from "@fabric-kit/components";
import { duration, easing, iconSize, radii, spacing } from "@fabric-kit/design-tokens";
import { useTheme } from "@mui/material/styles";
import {
  BaseEdge,
  type Edge,
  EdgeLabelRenderer,
  type EdgeProps,
  getBezierPath,
  useStore,
} from "@xyflow/react";
import type { ReactNode } from "react";
import { NodeDeleteIcon as DeleteIcon } from "../icons/NodeIcons";
import type { CanvasMode, FabricCanvasEdgeActionHandlers } from "../types";
import { getCanvasChipSx } from "../utils/chipStyles";
import { type CanvasEdgeTone, resolveEdgeTone } from "../utils/edgeTone";
import { BORDER_WIDTH_PX, HANDLE_ANCHOR_INSET_PX } from "../utils/geometry";
import { getCanvasThemeColors, tintOver, withAlpha } from "../utils/themeColors";

// FABRIC_TOKEN_MISS: Edge hit-target width and loop-path offsets are fixed geometry constants.
const EDGE_HIT_STROKE_WIDTH_PX = 20;
const LOOP_HORIZONTAL_OFFSET_PX = 50;
const LOOP_VERTICAL_OFFSET_PX = 100;
// FABRIC_TOKEN_MISS: Marker geometry constants are fixed pixel values.
const EDGE_ARROW_MARKER_WIDTH_PX = 6;
const EDGE_ARROW_MARKER_HEIGHT_PX = 6;
const EDGE_ARROW_VIEWBOX_SIZE = 12;
const EDGE_ARROW_MARKER_VIEWBOX = `0 0 ${EDGE_ARROW_VIEWBOX_SIZE} ${EDGE_ARROW_VIEWBOX_SIZE}`;
const EDGE_ARROW_REF_X = 10;
const EDGE_ARROW_REF_Y = 6;
// Both edge ends tuck slightly under the handle ring (drawn above edges) so no antialiasing gap shows.
const EDGE_END_OVERLAP_PX = 1;
// React Flow anchors edges to the handle's hit-area border, so ends are pulled in to reach the visible ring.
const EDGE_END_INSET_PX = EDGE_END_OVERLAP_PX + HANDLE_ANCHOR_INSET_PX;
// The marker tip extends past the path end, so the path stops short by that amount and the tip lands on the ring.
const TARGET_TRIM_WITH_ARROW_PX = EDGE_ARROW_VIEWBOX_SIZE - EDGE_ARROW_REF_X - EDGE_END_INSET_PX;
// No-arrow edges overrun into the handle ring so the stroke doesn't appear detached.
const TARGET_JOIN_WITHOUT_ARROW_PX = -10;
// Opacity (percent) of the edge-selection glow.
const EDGE_SELECTION_GLOW_PERCENT = 40;
// FABRIC_TOKEN_MISS: label delete-control Y offset has no direct spacing token.
const EDGE_DELETE_CONTROL_Y_OFFSET_PX = -15;
// FABRIC_TOKEN_MISS: pale tint of the tone color, mixed into the paper color so the pill stays opaque.
const EDGE_LABEL_TINT_PERCENT = 20;
// FABRIC_TOKEN_MISS: share of the tone color used for the pill outline, so the pill reads on both white and dark canvases.
const EDGE_LABEL_BORDER_PERCENT = 60;
// FABRIC_TOKEN_MISS: share of text.primary mixed into the tone color so pill text reaches 4.5:1 contrast.
const EDGE_LABEL_TEXT_DARKEN_PERCENT = 65;

const capitalizeLabel = (value: string) => {
  if (!value) return value;
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
};

/** Additional edge metadata consumed by `FabricCanvasEdge`. */
export type FabricCanvasEdgeData = {
  label?: string;
  isLoop?: boolean;
  hideTargetArrow?: boolean;
  /** Color intent of the label pill. Defaults from the label ("success" / "error"), else neutral. */
  tone?: CanvasEdgeTone;
};

/** Public props for `FabricCanvasEdge`. */
export type FabricCanvasEdgeProps = EdgeProps<Edge<FabricCanvasEdgeData>> &
  FabricCanvasEdgeActionHandlers & {
    mode: CanvasMode;
    selectedColor?: string;
    labelTextColor?: string;
    renderDeleteControl?: (args: {
      edgeId: string;
      onEdgeDelete?: (edgeId: string) => void;
    }) => ReactNode;
  };

/** Shared canvas edge renderer with labels, delete affordance and loop support. */
export const FabricCanvasEdge = ({
  id,
  sourceX,
  sourceY,
  sourcePosition,
  targetX,
  targetY,
  targetPosition,
  markerEnd: incomingMarkerEnd,
  data,
  selected,
  mode,
  onEdgeDelete,
  selectedColor,
  labelTextColor,
  renderDeleteControl,
}: FabricCanvasEdgeProps) => {
  const theme = useTheme();
  const colors = getCanvasThemeColors(theme);
  const zoom = useStore((state) => state.transform[2]);
  const isEditMode = mode === "edit";
  const isLoop = data?.isLoop ?? false;
  const hasTargetArrow = !data?.hideTargetArrow && incomingMarkerEnd !== null;
  // No-arrow edges need a deeper endpoint join so layering does not leave a visible gap at the target handle.
  const targetTrimOffset = hasTargetArrow
    ? TARGET_TRIM_WITH_ARROW_PX
    : TARGET_JOIN_WITHOUT_ARROW_PX;
  const resolvedSelectedColor = selectedColor ?? colors.primary;
  const adjustedSource = getAdjustedEndpoint({
    sourceX: targetX,
    sourceY: targetY,
    targetX: sourceX,
    targetY: sourceY,
    targetPosition: sourcePosition,
    trimOffset: -EDGE_END_INSET_PX,
  });
  const adjustedTarget = getAdjustedEndpoint({
    sourceX,
    sourceY,
    targetX,
    targetY,
    targetPosition,
    trimOffset: targetTrimOffset,
  });

  let edgePath: string;
  let labelX: number;
  let labelY: number;

  if (isLoop) {
    const horizontalOffset = LOOP_HORIZONTAL_OFFSET_PX;
    const baseVerticalOffset = LOOP_VERTICAL_OFFSET_PX;
    const cornerRadius = 0;
    const sourceRightX = adjustedSource.x + horizontalOffset;
    const targetLeftX = adjustedTarget.x - horizontalOffset;
    const bottomY = Math.max(sourceY, targetY) + baseVerticalOffset;

    edgePath = `
      M ${adjustedSource.x},${adjustedSource.y}
      L ${sourceRightX},${sourceY}
      Q ${sourceRightX + cornerRadius},${sourceY} ${sourceRightX + cornerRadius},${sourceY + cornerRadius}
      L ${sourceRightX + cornerRadius},${bottomY - cornerRadius}
      Q ${sourceRightX + cornerRadius},${bottomY} ${sourceRightX + cornerRadius * 2},${bottomY}
      L ${targetLeftX - cornerRadius * 2},${bottomY}
      Q ${targetLeftX - cornerRadius},${bottomY} ${targetLeftX - cornerRadius},${bottomY - cornerRadius}
      L ${targetLeftX - cornerRadius},${targetY + cornerRadius}
      Q ${targetLeftX - cornerRadius},${targetY} ${targetLeftX},${targetY}
      L ${adjustedTarget.x},${adjustedTarget.y}
    `;

    labelX = (sourceRightX + targetLeftX) / 2;
    labelY = bottomY;
  } else {
    [edgePath, labelX, labelY] = getBezierPath({
      sourceX: adjustedSource.x,
      sourceY: adjustedSource.y,
      sourcePosition,
      targetX: adjustedTarget.x,
      targetY: adjustedTarget.y,
      targetPosition,
    });
  }

  const markerEndId = `${id}-arrow`;
  const strokeColor = selected ? resolvedSelectedColor : colors.textPrimary;
  const label = data?.label?.trim();
  const displayLabel = label ? capitalizeLabel(label) : undefined;
  const hasVisibleLabel = !!displayLabel && displayLabel.toLowerCase() !== "default";
  const tone = resolveEdgeTone(label, data?.tone);
  const toneColor = {
    success: colors.success,
    error: colors.error,
    neutral: colors.textSecondary,
  }[tone];
  // The design's tone text (e.g. #62BB46 on its pale tint) is 2.2:1; darkening it toward text.primary meets WCAG AA (4.5:1).
  const pillTextColor =
    labelTextColor ?? tintOver(colors.textPrimary, EDGE_LABEL_TEXT_DARKEN_PERCENT, toneColor);

  return (
    <>
      {hasTargetArrow && (
        <svg>
          <title>Edge arrow marker</title>
          <defs>
            <marker
              id={markerEndId}
              markerWidth={EDGE_ARROW_MARKER_WIDTH_PX}
              markerHeight={EDGE_ARROW_MARKER_HEIGHT_PX}
              viewBox={EDGE_ARROW_MARKER_VIEWBOX}
              refX={EDGE_ARROW_REF_X}
              refY={EDGE_ARROW_REF_Y}
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path d="M0,0 L12,6 L0,12 Z" fill={strokeColor} />
            </marker>
          </defs>
        </svg>
      )}

      <BaseEdge
        id={`${id}-hit`}
        path={edgePath}
        style={{
          stroke: "transparent",
          strokeWidth: EDGE_HIT_STROKE_WIDTH_PX,
          fill: "none",
          cursor: "pointer",
          pointerEvents: "stroke",
        }}
      />

      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={hasTargetArrow ? `url(#${markerEndId})` : undefined}
        style={{
          strokeWidth: selected ? BORDER_WIDTH_PX.thick : BORDER_WIDTH_PX.medium,
          stroke: strokeColor,
          strokeOpacity: selected ? 1 : 1,
          strokeLinecap: hasTargetArrow ? undefined : "round",
          transition: `stroke ${duration.micro}ms ${easing.default}, stroke-width ${duration.micro}ms ${easing.default}`,
          filter: selected
            ? `drop-shadow(0 0 ${spacing.xs}px ${withAlpha(resolvedSelectedColor, EDGE_SELECTION_GLOW_PERCENT)})`
            : "none",
        }}
      />

      {(hasVisibleLabel || (selected && isEditMode)) && (
        <EdgeLabelRenderer>
          {hasVisibleLabel && (
            <FabricChip
              className="nodrag nopan"
              size="small"
              label={displayLabel}
              sx={{
                ...getCanvasChipSx(
                  // Opaque tint: the edge line must not show through the pill.
                  tintOver(toneColor, EDGE_LABEL_TINT_PERCENT, colors.paper),
                  pillTextColor,
                ),
                position: "absolute",
                border: `${BORDER_WIDTH_PX.thin}px solid ${tintOver(toneColor, EDGE_LABEL_BORDER_PERCENT, colors.paper)}`,
                transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
                outline: selected
                  ? `${BORDER_WIDTH_PX.thin}px solid ${resolvedSelectedColor}`
                  : "none",
                pointerEvents: "all",
              }}
            />
          )}
          {selected && isEditMode && (
            <FabricBox
              className="nodrag nopan"
              sx={{
                position: "absolute",
                transform: `translate(${labelX}px, ${labelY}px)`,
                pointerEvents: "all",
              }}
            >
              <FabricBox
                sx={{
                  transform: `translate(-50%, -100%) translate(0, ${EDGE_DELETE_CONTROL_Y_OFFSET_PX}px) scale(${1 / zoom})`,
                  transformOrigin: "center bottom",
                }}
              >
                {renderDeleteControl ? (
                  renderDeleteControl({ edgeId: id, onEdgeDelete })
                ) : (
                  <FabricIconButton
                    type="button"
                    size="small"
                    aria-label="Delete"
                    onClick={() => onEdgeDelete?.(id)}
                    sx={getDeleteButtonSx(colors.divider, colors.paper, colors.error)}
                  >
                    <DeleteIcon sx={{ fontSize: `${iconSize.xs}px` }} />
                  </FabricIconButton>
                )}
              </FabricBox>
            </FabricBox>
          )}
        </EdgeLabelRenderer>
      )}
    </>
  );
};

/** Shared fallback delete icon-button style for edges (24px square, matching the node toolbar look). */
const getDeleteButtonSx = (borderColor: string, background: string, iconColor: string) => ({
  border: `${BORDER_WIDTH_PX.thin}px solid ${borderColor}`,
  borderRadius: `${radii.sm}px`,
  backgroundColor: background,
  color: iconColor,
  width: `${iconSize.xl}px`,
  height: `${iconSize.xl}px`,
  boxSizing: "border-box",
  padding: 0,
  "&:hover": {
    backgroundColor: background,
    borderColor: iconColor,
  },
});

/** Moves an endpoint outward (positive) or into the handle (negative) along its handle direction. */
const getAdjustedEndpoint = ({
  sourceX,
  sourceY,
  targetX,
  targetY,
  targetPosition,
  trimOffset,
}: {
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  targetPosition: EdgeProps<Edge<FabricCanvasEdgeData>>["targetPosition"];
  trimOffset: number;
}) => {
  switch (targetPosition) {
    case "left":
      return { x: targetX - trimOffset, y: targetY };
    case "right":
      return { x: targetX + trimOffset, y: targetY };
    case "top":
      return { x: targetX, y: targetY - trimOffset };
    case "bottom":
      return { x: targetX, y: targetY + trimOffset };
    default: {
      const deltaX = targetX - sourceX;
      const deltaY = targetY - sourceY;
      const magnitude = Math.hypot(deltaX, deltaY);
      if (magnitude === 0) {
        return { x: targetX, y: targetY };
      }

      return {
        x: targetX - (deltaX / magnitude) * trimOffset,
        y: targetY - (deltaY / magnitude) * trimOffset,
      };
    }
  }
};
