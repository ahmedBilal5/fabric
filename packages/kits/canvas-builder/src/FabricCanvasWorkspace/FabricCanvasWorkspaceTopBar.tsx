import {
  FabricBox,
  FabricButton,
  FabricChip,
  FabricCircularProgress,
} from "@fabric-kit/components";
import ArrowBack from "@fabric-kit/icons/ArrowBack";
import { FabricText } from "@fabric-kit/primitives";
import { useTheme } from "@mui/material/styles";

import type {
  CanvasTopBarAction,
  CanvasTopBarActionSlot,
  FabricCanvasWorkspaceTopBarProps,
} from "../types";
import { getCanvasThemeColors } from "../utils/themeColors";

const SLOT_ORDER: CanvasTopBarActionSlot[] = [
  "validation",
  "runNow",
  "modeToggle",
  "settings",
  "publish",
  "versionHistory",
  "custom",
];

const DEFAULT_MODE_LABELS = {
  edit: "Edit Mode",
  view: "Read Only",
};

export const FabricCanvasWorkspaceTopBar = ({
  title,
  mode,
  onBack,
  backLabel = "Back",
  backIcon,
  titleSlot,
  titleIcon,
  leftSlot,
  rightSlot,
  readOnly = false,
  readOnlyLabel = "Read Only",
  modeLabels = DEFAULT_MODE_LABELS,
  showModeChip = true,
  statusSlot,
  actions = [],
  ...boxProps
}: FabricCanvasWorkspaceTopBarProps) => {
  const theme = useTheme();
  const colors = getCanvasThemeColors(theme);
  const orderedActions = getOrderedActions(actions);

  return (
    <FabricBox
      {...boxProps}
      sx={{
        display: "flex",
        width: "100%",
        alignItems: "center",
        justifyContent: "space-between",
        height: "48px",
        minHeight: "48px",
        px: "14px",
        py: "10px",
        borderBottom: "1px solid",
        borderColor: "var(--mui-palette-divider)",
        backgroundColor: "var(--mui-palette-background-paper)",
        ...boxProps.sx,
      }}
    >
      <FabricBox sx={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
        <FabricBox sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {onBack && (
            <FabricButton
              variant="text"
              size="small"
              onClick={onBack}
              startIcon={
                backIcon ?? (
                  <ArrowBack
                    sx={{ color: "var(--mui-palette-text-primary)", width: "16px", height: "16px" }}
                  />
                )
              }
              sx={{
                minWidth: "auto",
                height: "24px",
                px: "20px",
                py: "10px",
                color: "var(--mui-palette-text-primary)",
                textTransform: "none",
                fontSize: "10px",
                fontWeight: 500,
                lineHeight: 1.6,
                borderRadius: 0,
                "&:hover": {
                  borderRadius: 0,
                  backgroundColor: colors.actionHover,
                },
                "& .MuiButton-startIcon": {
                  ml: 0,
                  mr: "8px",
                },
              }}
            >
              {backLabel}
            </FabricButton>
          )}
          {titleSlot ?? (
            <FabricBox sx={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
              {titleIcon}
              <FabricText
                sx={{
                  color: "var(--mui-palette-text-primary)",
                  fontSize: "18px",
                  lineHeight: 1.4,
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {title}
              </FabricText>
            </FabricBox>
          )}
        </FabricBox>

        <FabricBox sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {leftSlot}
          {statusSlot}
        </FabricBox>
      </FabricBox>

      <FabricBox sx={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
        {rightSlot}
        {showModeChip && (
          <>
            {readOnly && (
              <FabricChip
                size="small"
                label={readOnlyLabel}
                sx={{
                  order: -1,
                  // Semantic text-on-tint pairs from the theme meet contrast in both modes.
                  background: "var(--mui-palette-semantic-running-bg)",
                  color: "var(--mui-palette-semantic-running-text)",
                  width: "100px",
                  textTransform: "capitalize",
                  lineHeight: "16px",
                  fontSize: "11px",
                }}
              />
            )}
            <FabricChip
              size="small"
              label={mode === "edit" ? modeLabels.edit : modeLabels.view}
              sx={{
                order: -1,
                background: `var(--mui-palette-semantic-${mode === "edit" ? "warning" : "success"}-bg)`,
                color: `var(--mui-palette-semantic-${mode === "edit" ? "warning" : "success"}-text)`,
                width: "100px",
                textTransform: "capitalize",
                lineHeight: "16px",
                fontSize: "11px",
                fontWeight: 500,
              }}
            />
          </>
        )}

        {orderedActions.map((action) => {
          if (action.content) {
            return (
              <FabricBox key={action.id} data-testid={action.testId}>
                {action.content}
              </FabricBox>
            );
          }

          return (
            <FabricButton
              key={action.id}
              data-testid={action.testId}
              variant="text"
              size="small"
              disabled={action.disabled || action.loading}
              onClick={action.onClick}
              sx={{
                color: "var(--mui-palette-text-primary)",
                height: "24px",
                minWidth: "auto",
                px: "20px",
                py: "10px",
                textTransform: "none",
                fontSize: "10px",
                fontWeight: 500,
                lineHeight: 1.6,
                borderRadius: 0,
                "&:hover": {
                  borderRadius: 0,
                  backgroundColor: colors.actionHover,
                },
                "& .MuiButton-startIcon": {
                  ml: 0,
                  mr: "8px",
                },
                "& .MuiButton-startIcon .MuiSvgIcon-root": {
                  width: "16px",
                  height: "16px",
                },
                "& .MuiButton-startIcon svg": {
                  width: "16px",
                  height: "16px",
                },
                "& .MuiButton-startIcon img": {
                  width: "16px",
                  height: "16px",
                },
              }}
              startIcon={action.loading ? <FabricCircularProgress size={14} /> : action.icon}
            >
              {action.label}
            </FabricButton>
          );
        })}
      </FabricBox>
    </FabricBox>
  );
};

const getOrderedActions = (actions: CanvasTopBarAction[]) => {
  return actions
    .map((action, index) => ({ action, index }))
    .filter(({ action }) => action.visible !== false)
    .sort((left, right) => {
      const leftRank = SLOT_ORDER.indexOf(left.action.slot ?? "custom");
      const rightRank = SLOT_ORDER.indexOf(right.action.slot ?? "custom");
      if (leftRank !== rightRank) {
        return leftRank - rightRank;
      }
      return left.index - right.index;
    })
    .map(({ action }) => action);
};
