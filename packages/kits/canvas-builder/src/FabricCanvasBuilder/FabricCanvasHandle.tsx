import { FabricBox } from "@fabric-kit/components";
import { spacing } from "@fabric-kit/design-tokens";
import { FabricFlex, FabricText } from "@fabric-kit/primitives";
import { useTheme } from "@mui/material/styles";
import type { Edge } from "@xyflow/react";
import { Handle, Position } from "@xyflow/react";
import type { CanvasHandleDefinition } from "../types";
import {
  BORDER_WIDTH_PX,
  HANDLE_CLEARANCE_PX,
  HANDLE_HIT_AREA_PX,
  HANDLE_SIZE_PX,
} from "../utils/geometry";
import { getAdjustedHandlePosition } from "../utils/handles";
import { getCanvasThemeColors } from "../utils/themeColors";
import { canvasLabelText } from "../utils/typography";

// FABRIC_TOKEN_MISS: Multi-handle lane spacing has no exact token.
const HANDLE_SPACING_PX = 30;
const HANDLE_RING_WIDTH_PX = BORDER_WIDTH_PX.medium;
const HANDLE_LABEL_GAP_PX = HANDLE_CLEARANCE_PX + spacing.xs;
const HANDLE_CENTER_DOT_PX = spacing.sm;

/** Public props for `FabricCanvasHandle`. */
export type FabricCanvasHandleProps = {
  handle: CanvasHandleDefinition;
  nodeId: string;
  edges: Edge[];
  index?: number;
  totalHandles?: number;
  nodeSelected?: boolean;
  nodeLabel?: string;
  activeColor?: string;
  defaultColor?: string;
  labelColor?: string;
};

/** Renders a node connection handle with optional inline label. */
export const FabricCanvasHandle = ({
  handle,
  nodeId,
  edges,
  nodeSelected = false,
  index = 0,
  totalHandles = 2,
  nodeLabel,
  activeColor,
  defaultColor,
  labelColor,
}: FabricCanvasHandleProps) => {
  const theme = useTheme();
  const colors = getCanvasThemeColors(theme);
  const position = handle.position ?? Position.Right;
  const resolvedLabelColor = labelColor ?? colors.textPrimary;
  const resolvedActiveColor = activeColor ?? colors.primary;
  const resolvedDefaultColor = defaultColor ?? colors.divider;
  const isConnected = edges.some((edge) =>
    handle.type === "source"
      ? edge.source === nodeId && edge.sourceHandle === handle.id
      : edge.target === nodeId && edge.targetHandle === handle.id,
  );
  const showLabel = !isConnected && handle.name?.toLowerCase?.() !== "default";

  const getHandleOffset = () => {
    if (totalHandles <= 1) return 0;

    const totalHeight = (totalHandles - 1) * HANDLE_SPACING_PX;
    return index * HANDLE_SPACING_PX - totalHeight / 2;
  };

  const getLabelOffset = () => {
    switch (position) {
      case Position.Left:
        return {
          transform: `translate(calc(-100% - ${HANDLE_LABEL_GAP_PX}px), -50%)`,
          textAlign: "right" as const,
        };
      case Position.Right:
        return {
          transform: `translate(${HANDLE_LABEL_GAP_PX}px, -50%)`,
          textAlign: "left" as const,
        };
      case Position.Top:
        return {
          transform: `translate(-50%, calc(-100% - ${HANDLE_LABEL_GAP_PX}px))`,
          textAlign: "center" as const,
        };
      case Position.Bottom:
        return {
          transform: `translate(-50%, ${HANDLE_LABEL_GAP_PX}px)`,
          textAlign: "center" as const,
        };
      default:
        return {
          transform: `translate(${HANDLE_LABEL_GAP_PX}px, -50%)`,
          textAlign: "left" as const,
        };
    }
  };

  return (
    <FabricFlex
      align="center"
      justify="center"
      sx={{
        position: "absolute",
        ...getAdjustedHandlePosition(position, getHandleOffset()),
      }}
      data-testid={`node-handle-${handle.type}-${nodeLabel}`}
    >
      <FabricBox sx={{ position: "relative" }}>
        <FabricFlex
          align="center"
          justify="center"
          sx={{
            width: `${HANDLE_SIZE_PX}px`,
            height: `${HANDLE_SIZE_PX}px`,
            boxSizing: "border-box",
            borderRadius: "50%",
            background: colors.paper,
            border: `${HANDLE_RING_WIDTH_PX}px solid ${isConnected || nodeSelected ? resolvedActiveColor : resolvedDefaultColor}`,
            cursor: "crosshair",
            position: "relative",
          }}
        >
          {isConnected && (
            <FabricBox
              sx={{
                width: `${HANDLE_CENTER_DOT_PX}px`,
                height: `${HANDLE_CENTER_DOT_PX}px`,
                borderRadius: "50%",
                background: resolvedActiveColor,
              }}
            />
          )}
          <Handle
            id={handle.id}
            type={handle.type}
            position={position}
            style={{
              width: `${HANDLE_HIT_AREA_PX}px`,
              height: `${HANDLE_HIT_AREA_PX}px`,
              background: "transparent",
              border: "none",
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              opacity: 0,
              cursor: "crosshair",
            }}
          />
        </FabricFlex>

        {showLabel && (
          <FabricText
            component="span"
            sx={{
              ...canvasLabelText,
              position: "absolute",
              top: "50%",
              left: "50%",
              userSelect: "none",
              pointerEvents: "none",
              whiteSpace: "nowrap",
              textTransform: "capitalize",
              color: resolvedLabelColor,
              ...getLabelOffset(),
            }}
          >
            {handle.name}
          </FabricText>
        )}
      </FabricBox>
    </FabricFlex>
  );
};
