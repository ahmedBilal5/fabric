import type { SxProps, Theme } from "@mui/material";

// MUI shadow-4 CSS variable — flips with the active mode. The rgba fallback
// applies when the variable is unresolved.
const HOVER_SHADOW = "var(--mui-shadows-4, 0px 8px 20px -3px rgba(0,0,0,0.1))";

/** Name column — flex:1, absorbs the row's depth indentation. */
export const nameCellSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1,
  flex: 1,
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

/** A fixed-width trailing data column cell — position is depth-independent. */
export function columnCellSx(width: number): SxProps<Theme> {
  return {
    flexShrink: 0,
    width,
    paddingLeft: 1.5,
    borderLeft: "1px solid",
    borderColor: "divider",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    color: "text.secondary",
  };
}

/** Header row sibling to the tree — mirrors the Name + column cell layout. */
export const columnHeaderRowSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  height: 36,
  paddingLeft: 1,
  backgroundColor: "action.hover",
  fontWeight: 600,
};

/**
 * Ready-made sx presets for {@link FabricTreeView}.
 *
 * Usage:
 * ```tsx
 * import { fabricTreeViewStyles } from '@fabric-kit/tree-view';
 * <FabricTreeView sx={fabricTreeViewStyles.rowList} nodes={nodes} />
 * ```
 *
 * Mix with your own overrides:
 * ```tsx
 * <FabricTreeView sx={{ ...fabricTreeViewStyles.rowList, width: 280 }} />
 * ```
 *
 * All values are plain SxProps objects — no styles are applied by the
 * component itself, so consumers have full control.
 */
export const fabricTreeViewStyles = {
  /**
   * Row-list — each item looks like a table row.
   * 48px height, bottom divider, hover shadow, selected background.
   * Matches the DataManager left-panel design.
   */
  rowList: {
    width: "100%",
    "& .MuiTreeItem-content": {
      height: 48,
      borderBottom: "1px solid",
      borderColor: "divider",
      boxSizing: "border-box",
      // Leave paddingInlineStart to MUI so nested items keep their
      // depth-based indentation (--TreeView-itemChildrenIndentation).
      paddingRight: 1,
      borderRadius: 0,
      "&:hover": {
        boxShadow: HOVER_SHADOW,
        zIndex: 2,
        backgroundColor: "transparent",
      },
      "&.Mui-selected": {
        backgroundColor: "action.selected",
      },
      "&.Mui-selected:hover": {
        backgroundColor: "action.focus",
        boxShadow: HOVER_SHADOW,
      },
      "&.Mui-focused": {
        backgroundColor: "transparent",
      },
      "&.Mui-focused.Mui-selected": {
        backgroundColor: "action.selected",
      },
    },
    "& .MuiTreeItem-iconContainer": {
      flexShrink: 0,
    },
  } satisfies SxProps<Theme>,

  /** Compact — tighter 32px rows, suitable for sidebars. */
  compact: {
    width: "100%",
    "& .MuiTreeItem-content": {
      height: 32,
      paddingRight: 1,
      borderRadius: 0,
      "&:hover": { backgroundColor: "action.hover" },
      "&.Mui-selected": { backgroundColor: "action.selected" },
      "&.Mui-focused": { backgroundColor: "transparent" },
    },
  } satisfies SxProps<Theme>,

  /**
   * Unstyled — strips all MUI TreeItem chrome.
   * Starting point when you want to own every pixel.
   */
  unstyled: {
    "& .MuiTreeItem-content": {
      padding: 0,
      borderRadius: 0,
      backgroundColor: "transparent",
      "&:hover, &.Mui-selected, &.Mui-selected:hover, &.Mui-focused, &.Mui-focused.Mui-selected": {
        backgroundColor: "transparent",
        boxShadow: "none",
      },
    },
    "& .MuiTreeItem-iconContainer": {
      width: "auto",
      marginRight: 0,
    },
  } satisfies SxProps<Theme>,
} as const;
