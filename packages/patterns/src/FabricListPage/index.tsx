/**
 * FabricListPage — a whole list page: page header, filter bar, data grid, bulk
 * actions, and the empty, no-results, loading and error states in between.
 *
 * It wires the pieces the way most admin lists need them: the filter bar shows the
 * result count, the bulk action bar appears on selection and resets when filters
 * change, "No results" offers to clear the filters, and Export downloads the
 * filtered rows as CSV (or calls your `onExport` for server-side exports).
 *
 * Data stays yours: pass the rows to show (already filtered, client- or server-side)
 * and handle the callbacks.
 *
 * @example
 * ```tsx
 * const filters = useFilterParams(FILTERS);
 * <FabricListPage
 *   title="Invoices"
 *   primaryAction={<FabricButton variant="contained">New invoice</FabricButton>}
 *   filterBar={{ filters: FILTERS, values: filters.values, onValuesChange: filters.setValues,
 *                search: filters.search, onSearchChange: filters.setSearch, onClearAll: filters.clear }}
 *   rows={visibleRows}
 *   columns={columns}
 *   noun={["invoice", "invoices"]}
 *   bulkActions={(ids) => <FabricButton onClick={() => archive(ids)}>Archive</FabricButton>}
 * />
 * ```
 */

import { FabricButton, FabricEmptyState, type FabricMenuItem } from "@fabric-kit/components";
import {
  emptySelection,
  FabricBulkActionBar,
  FabricDatagrid,
  type FabricDatagridProps,
  type GridColDef,
  type GridRowId,
  type GridRowSelectionModel,
  type GridValidRowModel,
  getSelectedCount,
  useGridApiRef,
} from "@fabric-kit/datagrid";
import { radii, spacing } from "@fabric-kit/design-tokens";
import Download from "@fabric-kit/icons/Download";
import { FabricPageHeader, type FabricPageHeaderProps } from "@fabric-kit/layout";
import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { FabricFilterBar, type FabricFilterBarProps } from "../FabricFilterBar";

export interface FabricListPageProps<R extends GridValidRowModel = GridValidRowModel> {
  /** Page title. */
  title: ReactNode;
  /** One line under the title. */
  description?: ReactNode;
  /** The main action, e.g. "New invoice". Shown in the header and in the first-run empty state. */
  primaryAction?: ReactNode;
  /** Any other `FabricPageHeader` props: breadcrumbs, tabs, more actions. */
  headerProps?: Omit<FabricPageHeaderProps, "title" | "description">;

  /** The filter bar. The page adds the result count. */
  filterBar?: Omit<FabricFilterBarProps, "resultCount">;

  /** Rows to show, already filtered. */
  rows: readonly R[];
  /** Grid columns. */
  columns: readonly GridColDef<R>[];
  /** All matching rows across pages, when the grid shows one page of a server-side result. */
  totalCount?: number;
  /** Shows the grid's loading state. */
  loading?: boolean;
  /** Any other `FabricDatagrid` props: paging, row height, `onRowClick`… */
  gridProps?: Omit<FabricDatagridProps, "rows" | "columns" | "loading" | "apiRef">;

  /** Words for one and several rows. @default ["item", "items"] */
  noun?: [singular: string, plural: string];
  /** Actions for selected rows. Adds checkboxes to the grid. */
  bulkActions?: (selectedIds: GridRowId[], clear: () => void) => ReactNode;
  /** Less common bulk actions, in a "More actions" menu. */
  bulkMoreActions?: (selectedIds: GridRowId[], clear: () => void) => FabricMenuItem[];
  /** Offer "Select all N" across pages. Your bulk actions then apply to the whole result. */
  onSelectAll?: () => void;

  /** Adds an Export button. `true` downloads the visible rows as CSV; a function handles it yourself. */
  exportable?: boolean | (() => void);
  /** CSV file name without the extension. @default the title, when it's a string */
  exportFileName?: string;

  /** Shown when there are no rows and no search or filter is active. */
  emptyState?: ReactNode;
  /** Replaces the default "No {items} match" state when filters leave nothing. */
  noResultsState?: ReactNode;
  /** Shows an error state instead of the grid. A string becomes the description. */
  error?: ReactNode;
  /** Adds "Try again" to the error state. */
  onRetry?: () => void;

  /** System styles on the root. */
  sx?: SxProps<Theme>;
}

/** A whole list page: header, filters, grid, bulk actions and empty states. */
export function FabricListPage<R extends GridValidRowModel = GridValidRowModel>({
  title,
  description,
  primaryAction,
  headerProps,
  filterBar,
  rows,
  columns,
  totalCount,
  loading = false,
  gridProps,
  noun = ["item", "items"],
  bulkActions,
  bulkMoreActions,
  onSelectAll,
  exportable = false,
  exportFileName,
  emptyState,
  noResultsState,
  error,
  onRetry,
  sx,
}: Readonly<FabricListPageProps<R>>) {
  const apiRef = useGridApiRef();
  const [selection, setSelection] = useState<GridRowSelectionModel>(emptySelection);
  const [allSelected, setAllSelected] = useState(false);
  const clear = () => {
    setAllSelected(false);
    setSelection(emptySelection());
  };

  // A selection made under one filter shouldn't silently carry over to another.
  const filterKey = JSON.stringify([filterBar?.values, filterBar?.search]);
  const lastFilterKey = useRef(filterKey);
  useEffect(() => {
    if (lastFilterKey.current !== filterKey) {
      lastFilterKey.current = filterKey;
      setAllSelected(false);
      setSelection(emptySelection());
    }
  }, [filterKey]);

  const selectedIds = useMemo(() => {
    if (selection.type === "include") return [...selection.ids];
    return rows
      .map((r) => (gridProps?.getRowId ? gridProps.getRowId(r) : (r.id as GridRowId)))
      .filter((id) => !selection.ids.has(id));
  }, [selection, rows, gridProps]);
  const count = allSelected
    ? (totalCount ?? rows.length)
    : getSelectedCount(selection, rows.length);

  const filtering =
    !!filterBar &&
    (!!filterBar.search?.trim() ||
      Object.values(filterBar.values).some((v) => (Array.isArray(v) ? v.length > 0 : !!v)));
  const clearFilters = () => {
    if (!filterBar) return;
    if (filterBar.onClearAll) filterBar.onClearAll();
    else {
      filterBar.onValuesChange({});
      filterBar.onSearchChange?.("");
    }
  };

  const doExport = () => {
    if (typeof exportable === "function") return exportable();
    apiRef.current?.exportDataAsCsv({
      fileName: exportFileName ?? (typeof title === "string" ? title : "export"),
    });
  };

  const showEmpty = !loading && !error && rows.length === 0;
  let body: ReactNode;
  if (error) {
    body = (
      <FabricEmptyState
        variant="error"
        title="Couldn't load this list"
        description={typeof error === "string" ? error : error === true ? undefined : error}
        actions={
          onRetry && (
            <FabricButton variant="outlined" onClick={onRetry}>
              Try again
            </FabricButton>
          )
        }
      />
    );
  } else if (showEmpty && filtering) {
    body = noResultsState ?? (
      <FabricEmptyState
        variant="no-results"
        title={`No ${noun[1]} match`}
        description="Try a different search, or clear the filters."
        actions={
          <FabricButton variant="outlined" onClick={clearFilters}>
            Clear filters
          </FabricButton>
        }
      />
    );
  } else if (showEmpty) {
    body = emptyState ?? <FabricEmptyState title={`No ${noun[1]} yet`} actions={primaryAction} />;
  } else {
    body = (
      <FabricDatagrid
        {...gridProps}
        apiRef={apiRef}
        rows={rows}
        columns={columns}
        loading={loading}
        checkboxSelection={!!bulkActions || gridProps?.checkboxSelection}
        sx={[
          // Fabric hides row checkboxes until hover; with bulk actions they must be findable.
          !!bulkActions && {
            "& .MuiDataGrid-row .MuiCheckbox-root, & .MuiDataGrid-columnHeader .MuiCheckbox-root": {
              opacity: 1,
            },
          },
          ...(Array.isArray(gridProps?.sx) ? gridProps.sx : [gridProps?.sx]),
        ]}
        disableRowSelectionOnClick={gridProps?.disableRowSelectionOnClick ?? true}
        rowSelectionModel={selection}
        onRowSelectionModelChange={(m, details) => {
          setAllSelected(false);
          setSelection(m);
          gridProps?.onRowSelectionModelChange?.(m, details);
        }}
      />
    );
  }

  const exportButton = exportable && (
    <FabricButton
      variant="outlined"
      startIcon={<Download />}
      onClick={doExport}
      disabled={rows.length === 0}
    >
      Export
    </FabricButton>
  );

  return (
    <Box
      sx={[
        { display: "flex", flexDirection: "column", gap: `${spacing.lg}px`, minWidth: 0 },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <FabricPageHeader
        {...headerProps}
        title={title}
        description={description}
        actions={
          (exportButton || primaryAction || headerProps?.actions) && (
            <>
              {headerProps?.actions}
              {exportButton}
              {primaryAction}
            </>
          )
        }
      />
      {(filterBar || bulkActions) && (
        <Box
          sx={{ minHeight: 48, display: "flex", flexDirection: "column", justifyContent: "center" }}
        >
          {bulkActions && count > 0 ? (
            <FabricBulkActionBar
              selectedCount={count}
              totalCount={totalCount}
              onSelectAll={
                onSelectAll &&
                (() => {
                  setAllSelected(true);
                  onSelectAll();
                })
              }
              onClearSelection={clear}
              noun={noun}
              actions={bulkActions(selectedIds, clear)}
              moreActions={bulkMoreActions?.(selectedIds, clear)}
            />
          ) : (
            filterBar && (
              <FabricFilterBar
                {...filterBar}
                resultCount={loading || error ? undefined : (totalCount ?? rows.length)}
              />
            )
          )}
        </Box>
      )}
      <Box
        sx={
          showEmpty || error
            ? {
                py: `${spacing["3xl"]}px`,
                borderRadius: `${radii.lg}px`,
                border: "1px solid var(--mui-palette-divider)",
              }
            : { minWidth: 0 }
        }
      >
        {body}
      </Box>
    </Box>
  );
}
