import { FabricBox, FabricChip, FabricTextField } from "@fabric-kit/components";
import { iconSize, radii, spacing } from "@fabric-kit/design-tokens";
import WarningAmberIcon from "@fabric-kit/icons/WarningAmber";
import { FabricText } from "@fabric-kit/primitives";
import { useTheme } from "@mui/material/styles";
import { type Edge, Position, useEdges } from "@xyflow/react";
import {
  type ChangeEvent,
  type ElementType,
  type KeyboardEvent,
  type ReactNode,
  useState,
} from "react";
import { NodeValidationIcon } from "../icons/NodeIcons";
import type { CanvasHandleDefinition, FabricCanvasNodeProps } from "../types";
import { BADGE_PALETTES, getBadgeTextColor, normalizeBadge } from "../utils/badges";
import { getCanvasChipSx } from "../utils/chipStyles";
import { BORDER_WIDTH_PX, NODE_BORDER_WIDTH_PX } from "../utils/geometry";
import { getCanvasThemeColors, tintOver } from "../utils/themeColors";
import { canvasLabelText } from "../utils/typography";
import { FabricCanvasHandle } from "./FabricCanvasHandle";
import { FabricCanvasNodeToolbar } from "./FabricCanvasNodeToolbar";

// FABRIC_TOKEN_MISS: the card is a compact 128px wide and 88px tall so many nodes fit on one canvas; no sizing tokens exist.
const NODE_WIDTH_PX = 128;
const NODE_MIN_HEIGHT_PX = 88;
// FABRIC_TOKEN_MISS: the "square" shape (112px wide, 96px tall) has no sizing tokens; the height is a minimum so content can grow it.
const NODE_SQUARE_MIN_HEIGHT_PX = 96;
// FABRIC_TOKEN_MISS: slightly wider than tall so names like "Manual Run 1" and the "Disabled" badge are not cut off.
const NODE_SQUARE_WIDTH_PX = 112;
const NODE_ICON_CIRCLE_PX = iconSize["3xl"];
const NODE_ICON_SIZE_PX = iconSize.xl;
// FABRIC_TOKEN_MISS: 25px inline label-editor height has no exact controlHeight token.
const LABEL_EDITOR_HEIGHT_PX = "25px";
// FABRIC_TOKEN_MISS: amber warning.main is 1.9:1 on white; mixing in text.primary reaches the 3:1 needed for icons.
const STATUS_ICON_CONTRAST_PERCENT = 45;

/** Shared canvas node renderer with toolbar, handles, badge and editable label. */
export const FabricCanvasNode = <
  NodeConfig,
  NodeData extends Record<string, unknown> = Record<string, unknown>,
>({
  nodeConfig,
  data,
  id: nodeId,
  selected = false,
  mode,
  nodeConfigData,
  validationStatus,
  disabled = false,
  shape = "wide",
  renderNodeToolbar,
  renderNodeStatus,
  onNodeDelete,
  onNodeConfigure,
  onNodeLabelChange,
}: FabricCanvasNodeProps<NodeConfig, NodeData>) => {
  const theme = useTheme();
  const colors = getCanvasThemeColors(theme);
  const initialLabel =
    typeof data.label === "string" || typeof data.label === "number"
      ? String(data.label)
      : nodeConfig.name;

  const [isEditing, setIsEditing] = useState(false);
  const [labelValue, setLabelValue] = useState(initialLabel);

  const edges = useEdges<Edge>();
  const Icon = nodeConfig.icon as ElementType<{ sx?: Record<string, unknown> }>;
  const resolvedNodeConfig = (nodeConfigData as NodeConfig) ?? nodeConfig.config;
  const connectorConfig = nodeConfig.connectors;
  const handles = connectorConfig?.getHandles
    ? connectorConfig.getHandles(resolvedNodeConfig)
    : connectorConfig?.handles || [];
  const groupedHandles = handles.reduce(
    (acc, handle) => {
      const position = handle.position ?? Position.Right;
      if (!acc[position]) {
        acc[position] = [];
      }
      acc[position].push(handle);
      return acc;
    },
    {} as Record<Position, CanvasHandleDefinition[]>,
  );

  const badgeReturn = nodeConfig.useBadge?.(resolvedNodeConfig);
  const customNodeContent = nodeConfig.customContent?.(resolvedNodeConfig);
  const badge = normalizeBadge(badgeReturn);
  const badgeColors = badge ? BADGE_PALETTES[badge.palette] : null;
  const subtitle = nodeConfig.getSubtitle?.(resolvedNodeConfig);
  const resolvedValidationStatus = validationStatus ?? {};

  let borderColor = colors.divider;
  if (resolvedValidationStatus.hasWarnings) {
    borderColor = colors.warningLight;
  }
  if (resolvedValidationStatus.hasErrors) {
    borderColor = colors.error;
  }
  if (disabled) {
    borderColor = colors.divider;
  }
  if (selected) {
    borderColor = colors.primary;
  }
  const iconColor = disabled ? colors.textDisabled : colors.primary;
  const iconBackground = disabled ? colors.actionHover : colors.infoLight;
  const titleColor = disabled ? colors.textDisabled : colors.textPrimary;
  const subtitleColor = disabled ? colors.textDisabled : colors.textSecondary;

  // Built-in validation icon, used when the consumer doesn't supply `renderNodeStatus`.
  let defaultStatusIcon: ReactNode = null;
  if (resolvedValidationStatus.hasErrors) {
    defaultStatusIcon = (
      <NodeValidationIcon
        titleAccess="Node has validation errors"
        sx={{ fontSize: `${iconSize.xs}px`, color: colors.error }}
      />
    );
  } else if (resolvedValidationStatus.hasWarnings) {
    defaultStatusIcon = (
      <WarningAmberIcon
        titleAccess="Node has validation warnings"
        sx={{
          fontSize: `${iconSize.sm}px`,
          color: tintOver(colors.textPrimary, STATUS_ICON_CONTRAST_PERCENT, colors.warning),
        }}
      />
    );
  }

  const handleBlur = () => {
    const finalLabel = labelValue.trim() === "" ? nodeConfig.name : labelValue;
    setLabelValue(finalLabel);
    onNodeLabelChange?.(nodeId, finalLabel);
    setIsEditing(false);
  };

  return (
    <FabricBox
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: `${spacing.sm}px`,
      }}
      data-testid={`node-${labelValue}`}
    >
      {mode === "edit" &&
        (renderNodeToolbar ? (
          renderNodeToolbar({
            nodeId,
            nodeConfig,
            hasBadge: !!badge,
            onNodeDelete,
            onNodeConfigure,
            onNodeLabelChange,
          })
        ) : (
          <FabricCanvasNodeToolbar
            nodeId={nodeId}
            nodeConfig={nodeConfig}
            hasBadge={!!badge}
            onNodeDelete={onNodeDelete}
            onNodeConfigure={onNodeConfigure}
          />
        ))}
      <FabricBox
        sx={{
          boxSizing: "border-box",
          width: `${shape === "square" ? NODE_SQUARE_WIDTH_PX : NODE_WIDTH_PX}px`,
          minHeight: `${shape === "square" ? NODE_SQUARE_MIN_HEIGHT_PX : NODE_MIN_HEIGHT_PX}px`,
          border: `${NODE_BORDER_WIDTH_PX}px solid ${borderColor}`,
          borderRadius: `${radii.lg}px`,
          background: colors.paper,
          padding: `${shape === "square" ? spacing.sm : spacing.md}px`,
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: `${spacing.xs}px`,
        }}
        onDoubleClick={() => onNodeConfigure?.(nodeId, nodeConfig)}
      >
        {badge && badgeColors && (
          <FabricChip
            size="small"
            label={badge.label}
            sx={{
              ...getCanvasChipSx(badgeColors.bg, getBadgeTextColor(badgeColors.text)),
              position: "absolute",
              // Centered on the border line so the chip interrupts the card's top edge.
              top: `${-NODE_BORDER_WIDTH_PX / 2}px`,
              left: "50%",
              transform: "translate(-50%, -50%)",
              maxWidth: `calc(100% - ${spacing.sm * 2}px)`,
              pointerEvents: "none",
            }}
          />
        )}
        {customNodeContent ?? (
          <FabricBox
            sx={{
              width: `${NODE_ICON_CIRCLE_PX}px`,
              height: `${NODE_ICON_CIRCLE_PX}px`,
              flexShrink: 0,
              borderRadius: "50%",
              background: iconBackground,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon
              sx={{
                fontSize: `${NODE_ICON_SIZE_PX}px`,
                color: iconColor,
              }}
            />
          </FabricBox>
        )}

        {isEditing ? (
          <FabricTextField
            autoFocus
            size="small"
            height={LABEL_EDITOR_HEIGHT_PX}
            value={labelValue}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              setLabelValue(event.target.value);
            }}
            onBlur={handleBlur}
            onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
              if (event.key === "Enter") {
                handleBlur();
              }
            }}
            sx={{
              textAlign: "center",
              width: "100%",
              "& .MuiInputBase-root": {
                height: LABEL_EDITOR_HEIGHT_PX,
              },
              "& .MuiInputBase-input": { color: colors.textPrimary },
              border: `${BORDER_WIDTH_PX.medium}px solid ${colors.primary}`,
              "& .MuiOutlinedInput-root": {
                "& fieldset": { border: "none" },
              },
            }}
          />
        ) : (
          <FabricText
            component="span"
            truncate
            onDoubleClick={(event) => {
              event.stopPropagation();
              setIsEditing(true);
            }}
            sx={{
              ...canvasLabelText,
              cursor: "pointer",
              maxWidth: "100%",
              // FABRIC_TOKEN_MISS: the design title is pure black; closest theme role is text.primary.
              color: titleColor,
            }}
          >
            {labelValue}
          </FabricText>
        )}

        {subtitle && (
          <FabricText
            component="span"
            textVariant="bodySm"
            size="xs"
            truncate
            sx={{
              maxWidth: "100%",
              // The design's subtitle grey (#A39B94) is 2.4:1 on white; text.secondary meets WCAG AA (4.5:1).
              color: subtitleColor,
              textAlign: "center",
            }}
          >
            {subtitle}
          </FabricText>
        )}

        {Object.entries(groupedHandles).map(([, positionHandles]) =>
          positionHandles.map((handle, index) => (
            <FabricCanvasHandle
              key={handle.id}
              handle={handle}
              nodeId={nodeId}
              edges={edges}
              index={index}
              totalHandles={positionHandles.length}
              nodeSelected={selected}
              nodeLabel={labelValue}
              activeColor={disabled && !selected ? colors.textDisabled : colors.primary}
              defaultColor={colors.divider}
              labelColor={disabled ? colors.textDisabled : undefined}
            />
          )),
        )}

        {(renderNodeStatus || defaultStatusIcon) && (
          <FabricBox
            sx={{
              position: "absolute",
              bottom: `${spacing.xs}px`,
              right: `${spacing.xs}px`,
              display: "flex",
              pointerEvents: renderNodeStatus ? "auto" : "none",
            }}
          >
            {renderNodeStatus
              ? renderNodeStatus({
                  nodeId,
                  validationStatus: resolvedValidationStatus,
                })
              : defaultStatusIcon}
          </FabricBox>
        )}
      </FabricBox>
    </FabricBox>
  );
};
