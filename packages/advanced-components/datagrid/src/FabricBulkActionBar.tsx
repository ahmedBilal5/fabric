import {
  FabricButton,
  FabricIconButton,
  FabricMenuButton,
  type FabricMenuItem,
} from "@fabric-kit/components";
import { fontWeight, radii, shadows, spacing, zIndex } from "@fabric-kit/design-tokens";
import Close from "@fabric-kit/icons/Close";
import MoreHoriz from "@fabric-kit/icons/MoreHoriz";
import Box from "@mui/material/Box";
import Slide from "@mui/material/Slide";
import type { SxProps, Theme } from "@mui/material/styles";
import type { GridRowSelectionModel } from "@mui/x-data-grid";
import { type KeyboardEvent, type ReactNode, useId } from "react";

/**
 * How many rows a data grid selection covers. MUI X stores "select all" as an
 * `exclude` model (every row except these), so the count needs the row total.
 *
 * @example
 * ```tsx
 * const count = getSelectedCount(selectionModel, rows.length);
 * ```
 */
export function getSelectedCount(model: GridRowSelectionModel, rowCount: number): number {
  return model.type === "include" ? model.ids.size : Math.max(0, rowCount - model.ids.size);
}

/** An empty selection, for clearing a controlled `rowSelectionModel`. */
export const emptySelection = (): GridRowSelectionModel => ({ type: "include", ids: new Set() });

export interface FabricBulkActionBarProps {
  /** How many rows are selected. The bar shows when this is above 0. */
  selectedCount: number;
  /** All rows that match, across pages. Enables "Select all" when larger than `selectedCount`. */
  totalCount?: number;
  /** Clears the selection: the close button and the Escape key. */
  onClearSelection: () => void;
  /** Selects every matching row, across pages. Shows "Select all {totalCount}". */
  onSelectAll?: () => void;
  /** Buttons for the selection, e.g. Export, Archive, Delete. Put the most used first. */
  actions?: ReactNode;
  /** Less common actions, in a "More actions" menu after `actions`. */
  moreActions?: FabricMenuItem[];
  /** Words for one and several rows. @default ["item", "items"] */
  noun?: [singular: string, plural: string];
  /** Replaces the "3 items selected" text. */
  formatCount?: (count: number) => ReactNode;
  /** BCP 47 locale for numbers. Defaults to the browser's. */
  locale?: string;
  /**
   * `inline` sits above the grid, in place of its toolbar. `floating` hovers at the
   * bottom of the viewport, for long pages where the grid's top scrolls away.
   * @default "inline"
   */
  variant?: "inline" | "floating";
  /** Accessible name of the toolbar. @default "Bulk actions" */
  "aria-label"?: string;
  /** Class on the root. */
  className?: string;
  /** System styles on the root. */
  sx?: SxProps<Theme>;
}

/**
 * FabricBulkActionBar — the bar that appears when rows are selected, with a count,
 * actions for the selection, "Select all N" and a way to clear it.
 *
 * It doesn't read the grid itself: pass the count and handlers, so it works with
 * client-side and server-side data alike. `getSelectedCount` turns a MUI X
 * selection model into a count.
 *
 * @example
 * ```tsx
 * const [selection, setSelection] = useState(emptySelection);
 * const count = getSelectedCount(selection, rows.length);
 *
 * <FabricBulkActionBar
 *   selectedCount={count}
 *   noun={["invoice", "invoices"]}
 *   onClearSelection={() => setSelection(emptySelection())}
 *   actions={<FabricButton startIcon={<Archive />}>Archive</FabricButton>}
 * />
 * <FabricDatagrid checkboxSelection rowSelectionModel={selection} onRowSelectionModelChange={setSelection} … />
 * ```
 */
export function FabricBulkActionBar({
  selectedCount,
  totalCount,
  onClearSelection,
  onSelectAll,
  actions,
  moreActions,
  noun = ["item", "items"],
  formatCount,
  locale,
  variant = "inline",
  "aria-label": ariaLabel = "Bulk actions",
  className,
  sx,
}: Readonly<FabricBulkActionBarProps>) {
  const countId = useId();
  const open = selectedCount > 0;
  const fmt = (n: number) => n.toLocaleString(locale);
  const countText =
    formatCount?.(selectedCount) ??
    `${fmt(selectedCount)} ${selectedCount === 1 ? noun[0] : noun[1]} selected`;
  const canSelectAll = onSelectAll && totalCount != null && totalCount > selectedCount;
  const floating = variant === "floating";

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape" && !e.defaultPrevented) {
      e.stopPropagation();
      onClearSelection();
    }
  };

  const bar = (
    <Box
      role="toolbar"
      aria-label={ariaLabel}
      aria-describedby={countId}
      onKeyDown={onKeyDown}
      className={className}
      sx={[
        {
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: `${spacing.sm}px`,
          minHeight: 48,
          boxSizing: "border-box",
          px: `${spacing.md}px`,
          py: `${spacing.xs}px`,
          borderRadius: `${radii.lg}px`,
          backgroundColor: "rgba(var(--mui-palette-primary-mainChannel) / 0.08)",
          boxShadow: "inset 0 0 0 1px rgba(var(--mui-palette-primary-mainChannel) / 0.24)",
        },
        floating && {
          width: "max-content",
          pointerEvents: "auto",
          maxWidth: `calc(100vw - ${spacing.lg * 2}px)`,
          backgroundColor: "var(--mui-palette-background-paper)",
          boxShadow: `${shadows.xl}, inset 0 0 0 1px var(--mui-palette-divider)`,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Box
        id={countId}
        component="span"
        sx={{
          fontWeight: fontWeight.semiBold,
          fontSize: "0.875rem",
          color: "var(--mui-palette-text-primary)",
          mr: `${spacing.xs}px`,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {countText}
      </Box>
      {canSelectAll && (
        <FabricButton variant="text" size="small" onClick={onSelectAll}>
          Select all {fmt(totalCount)}
        </FabricButton>
      )}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: `${spacing.sm}px`,
          ml: floating ? `${spacing.sm}px` : "auto",
        }}
      >
        {actions}
        {moreActions && moreActions.length > 0 && (
          <FabricMenuButton
            items={moreActions}
            icon={<MoreHoriz />}
            tooltip="More actions"
            triggerButtonProps={{ "aria-label": "More actions" }}
          />
        )}
        <FabricIconButton aria-label="Clear selection" onClick={onClearSelection}>
          <Close />
        </FabricIconButton>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Mounted before any selection, so screen readers hear the count change. */}
      <Box
        component="span"
        aria-live="polite"
        sx={{
          position: "absolute",
          width: "1px",
          height: "1px",
          overflow: "hidden",
          clip: "rect(0 0 0 0)",
          whiteSpace: "nowrap",
        }}
      >
        {open ? countText : ""}
      </Box>
      {floating ? (
        <Slide direction="up" in={open} mountOnEnter unmountOnExit>
          {/* Slide needs an element that takes a ref and a style. */}
          <Box
            sx={{
              position: "fixed",
              insetInline: 0,
              bottom: 0,
              zIndex: zIndex.appBar,
              display: "flex",
              justifyContent: "center",
              pb: `${spacing.xl}px`,
              // The strip spans the viewport; only the bar takes clicks.
              pointerEvents: "none",
            }}
          >
            {bar}
          </Box>
        </Slide>
      ) : (
        open && bar
      )}
    </>
  );
}
