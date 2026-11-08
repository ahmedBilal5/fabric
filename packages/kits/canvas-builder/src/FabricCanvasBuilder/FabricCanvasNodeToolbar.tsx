import {
  FabricBox,
  FabricIconButton,
  Popover as FabricPopover,
  FabricTooltip,
} from "@fabric-kit/components";
import { fontSize, iconSize, radii, spacing } from "@fabric-kit/design-tokens";
import CloseIcon from "@fabric-kit/icons/Close";
import DoneIcon from "@fabric-kit/icons/Done";
import { FabricText } from "@fabric-kit/primitives";
import { NodeToolbar, Position } from "@xyflow/react";
import { type MouseEvent, type ReactNode, useState } from "react";
import { NodeDeleteIcon as DeleteIcon, NodeSettingsIcon as SettingsIcon } from "../icons/NodeIcons";
import type { CanvasNodeConfig } from "../types";
import { BADGE_OVERHANG_PX, BORDER_WIDTH_PX } from "../utils/geometry";

/** Public props for `FabricCanvasNodeToolbar`. */
export type FabricCanvasNodeToolbarProps<NodeConfig = unknown> = {
  nodeId: string;
  nodeConfig: CanvasNodeConfig<NodeConfig>;
  hasBadge?: boolean;
  onNodeDelete?: (nodeId: string) => void;
  onNodeConfigure?: (nodeId: string, nodeConfig: CanvasNodeConfig<NodeConfig>) => void;
  configureIcon?: ReactNode;
  deleteIcon?: ReactNode;
  confirmIcon?: ReactNode;
  cancelIcon?: ReactNode;
  /** Extra actions rendered between configure and delete. */
  extraActions?: ReactNode;
};

// Buttons use the 24px `iconSize.xl` token so each action is a comfortable touch target;
// the glyphs stay at 12px as in the design.
const TOOLBAR_BUTTON_PX = iconSize.xl;
const TOOLBAR_ICON_PX = iconSize.xs;

const iconButtonSx = {
  minWidth: "auto",
  padding: `${spacing.xs}px`,
  borderRadius: `${radii.md + spacing.xs / 2}px`,
  color: "var(--mui-palette-text-primary)",
  "&:hover": {
    backgroundColor: "var(--mui-palette-action-hover)",
  },
} as const;

const getToolbarButtonSx = (color: string) =>
  ({
    minWidth: "auto",
    width: `${TOOLBAR_BUTTON_PX}px`,
    height: `${TOOLBAR_BUTTON_PX}px`,
    padding: 0,
    borderRadius: `${radii.sm}px`,
    color,
    "& .MuiSvgIcon-root": { fontSize: `${TOOLBAR_ICON_PX}px` },
    "&:hover": {
      backgroundColor: "var(--mui-palette-action-hover)",
    },
  }) as const;

/** Toolbar renderer for node configure/delete actions. */
export const FabricCanvasNodeToolbar = <NodeConfig,>({
  nodeId,
  nodeConfig,
  hasBadge = false,
  onNodeDelete,
  onNodeConfigure,
  configureIcon,
  deleteIcon,
  confirmIcon,
  cancelIcon,
  extraActions,
}: FabricCanvasNodeToolbarProps<NodeConfig>) => {
  const resolvedConfigureIcon = configureIcon ?? <SettingsIcon />;
  const resolvedDeleteIcon = deleteIcon ?? <DeleteIcon />;
  const resolvedConfirmIcon = confirmIcon ?? <DoneIcon fontSize="small" />;
  const resolvedCancelIcon = cancelIcon ?? <CloseIcon fontSize="small" />;

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const open = Boolean(anchorEl);

  const handleDeleteClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleConfirmDelete = () => {
    onNodeDelete?.(nodeId);
    handleClose();
  };

  return (
    <NodeToolbar
      position={Position.Top}
      align="center"
      offset={spacing.sm + (hasBadge ? BADGE_OVERHANG_PX : 0)}
    >
      <FabricBox
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0,
          padding: 0,
          border: `${BORDER_WIDTH_PX.thin}px solid var(--mui-palette-divider)`,
          borderRadius: `${radii.sm}px`,
          backgroundColor: "var(--mui-palette-background-paper)",
        }}
      >
        <FabricTooltip title="Configure node">
          <FabricIconButton
            size="small"
            sx={getToolbarButtonSx("var(--mui-palette-primary-main)")}
            aria-label="Configure node"
            onClick={() => onNodeConfigure?.(nodeId, nodeConfig)}
          >
            {resolvedConfigureIcon}
          </FabricIconButton>
        </FabricTooltip>

        {extraActions}

        <FabricTooltip title="Delete node">
          <FabricIconButton
            size="small"
            sx={getToolbarButtonSx("var(--mui-palette-error-main)")}
            aria-label="Delete node"
            onClick={handleDeleteClick}
          >
            {resolvedDeleteIcon}
          </FabricIconButton>
        </FabricTooltip>
      </FabricBox>

      {open && (
        <FabricPopover
          id={nodeId}
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
        >
          <FabricBox
            sx={{
              padding: `${spacing.md}px`,
              borderRadius: `${radii.lg}px`,
              display: "flex",
              gap: `${spacing.sm}px`,
              alignItems: "center",
            }}
          >
            <FabricText component="span" sx={{ fontSize: fontSize.sm }}>
              Are you sure you want to delete?
            </FabricText>
            <FabricTooltip title="Confirm delete">
              <FabricIconButton
                size="small"
                sx={iconButtonSx}
                aria-label="Confirm delete"
                onClick={handleConfirmDelete}
              >
                {resolvedConfirmIcon}
              </FabricIconButton>
            </FabricTooltip>
            <FabricTooltip title="Cancel">
              <FabricIconButton
                size="small"
                sx={iconButtonSx}
                aria-label="Cancel delete"
                onClick={handleClose}
              >
                {resolvedCancelIcon}
              </FabricIconButton>
            </FabricTooltip>
          </FabricBox>
        </FabricPopover>
      )}
    </NodeToolbar>
  );
};
