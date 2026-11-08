import { fontSize, fontWeight, spacing } from "@fabric-kit/design-tokens";
import type { SxProps, Theme } from "@mui/material";

const cellFont: SxProps<Theme> = {
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  fontSize: fontSize.sm,
  fontWeight: fontWeight.regular,
};

/** Base grid styles with token-driven typography and CSS-variable colors. */

export const fabricGridStyles: SxProps<Theme> = {
  border: 0,
  backgroundColor: "var(--mui-palette-background-paper)",
  // The design row separator; MUI's default is almost white in light mode.
  "--DataGrid-rowBorderColor": "var(--mui-palette-datagrid-rowLine)",

  "& .MuiDataGrid-cellContent": cellFont,
  "& .MuiDataGrid-cell--textLeft": cellFont,
  "& .MuiDataGrid-treeDataGroupingCell": { ...cellFont, height: "100%" },

  "& .MuiDataGrid-cell:focus": { outline: "none" },
  "& .MuiDataGrid-cell:focus-within": {
    outline: "2px solid var(--mui-palette-primary-main)",
    outlineOffset: -2,
  },

  "& .MuiDataGrid-overlayWrapper": { position: "initial" },

  "& .MuiDataGrid-columnHeader .MuiDataGrid-sortButton": {
    backgroundColor: "transparent",
  },
  "& .MuiDataGrid-columnHeaders:hover button": { opacity: 1 },
  "& .MuiDataGrid-columnHeader:focus-within": {
    outline: "2px solid var(--mui-palette-primary-main)",
    outlineOffset: -2,
  },

  "& .MuiDataGrid-columnHeader": {
    color: "var(--mui-palette-text-primary) !important",
    backgroundColor: "var(--mui-palette-action-hover)",
    "& .MuiDataGrid-columnHeaderTitle": {
      color: "var(--mui-palette-text-primary) !important",
      fontSize: fontSize.sm,
      fontWeight: fontWeight.bold,
    },
    "& .MuiDataGrid-columnSeparator": {
      color: "var(--mui-palette-background-paper)",
    },
    // Sort and column-menu (⋮) icons; the separator keeps its own color.
    "& .MuiIconButton-root .MuiSvgIcon-root": {
      color: "var(--mui-palette-text-primary)",
    },
  },

  // The design Pagination_lazyload: top line, 8/16 padding, "Total Rows" on the right (12px, like the cells).
  // Only shown when the consumer passes `hideFooter={false}`.
  "& .MuiDataGrid-footerContainer": {
    minHeight: "auto",
    justifyContent: "flex-end",
    padding: `${spacing.sm}px ${spacing.lg}px`,
    borderTop: "1px solid var(--mui-palette-datagrid-footerLine)",
  },
  // With a footer, its top line closes the grid; drop the last row's bottom line so it isn't doubled.
  "&:has(.MuiDataGrid-footerContainer) .MuiDataGrid-row:last-child .MuiDataGrid-cell": {
    borderBottom: "none",
  },
  "& .MuiDataGrid-rowCount": {
    margin: 0,
    fontSize: fontSize.sm,
    color: "var(--mui-palette-text-primary)",
  },

  // Pinned columns get stale bg from inline style; !important required.
  "& .MuiDataGrid-pinnedColumns, & .MuiDataGrid-pinnedColumnHeaders, & .MuiDataGrid-cell--pinnedLeft, & .MuiDataGrid-cell--pinnedRight":
    {
      backgroundColor: "var(--mui-palette-background-paper) !important",
    },

  // Overlay ("No results found", loading, error)
  "& .MuiDataGrid-overlay": {
    backgroundColor: "var(--mui-palette-background-default)",
    color: "var(--mui-palette-text-secondary)",
  },

  "& .MuiDataGrid-row, & .MuiDataGrid-columnHeader": {
    "& .MuiCheckbox-root": {
      transform: "scale(0.75)",
      opacity: 0,
      "&.Mui-checked": { opacity: 1 },
    },
    "&:hover .MuiCheckbox-root": { opacity: 1 },
  },
};

/** Cell border styles applied when `showCellBorders` is true. */
export const cellBorderStyles: SxProps<Theme> = {
  "& .MuiDataGrid-cell": {
    borderRight: "1px solid var(--mui-palette-divider)",
  },
  "& .MuiDataGrid-cell:last-child": {
    borderRight: "none",
  },
  "& .MuiDataGrid-row:last-child .MuiDataGrid-cell": {
    borderBottom: "1px solid var(--mui-palette-divider)",
  },
  "& .MuiDataGrid-columnHeader:not(:last-child)": {
    borderRight: "1px solid var(--mui-palette-background-paper)",
  },
};

/** Styles applied to action cell items. */
export const actionCellItemStyles: SxProps<Theme> = {
  fontSize: fontSize.sm,
  "& .MuiListItemText-primary": {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
  },
  "& .MuiListItemIcon-root": { minWidth: 24 },
  "& .MuiListItemIcon-root img": { width: 16, height: 16 },
  "& .MuiListItemIcon-root svg": { fontSize: 16 },
};
