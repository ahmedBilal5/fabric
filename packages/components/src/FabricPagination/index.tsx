/**
 * FabricPagination -- the design-system grid pagination toolbar.
 *
 * Wraps MUI `TablePagination` with a sliding-window page-number display, a
 * rows-per-page dropdown and a "from - to of count" label. Counts are
 * formatted for the user's locale (e.g. "1 - 25 of 5,000"). Colors come from
 * the theme's CSS variables, so it follows light and dark mode.
 *
 * @example
 * ```tsx
 * <FabricPagination
 *   count={Math.ceil(total / pageSize)}
 *   page={page}
 *   onChange={(_, p) => setPage(p)}
 *   color="primary"
 * />
 * ```
 */

import KeyboardArrowLeft from "@fabric-kit/icons/KeyboardArrowLeft";
import KeyboardArrowRight from "@fabric-kit/icons/KeyboardArrowRight";
import IconButton from "@mui/material/IconButton";
import type { SxProps, Theme } from "@mui/material/styles";
import TablePagination from "@mui/material/TablePagination";
import Typography from "@mui/material/Typography";
import type React from "react";
import { forwardRef, memo, useCallback } from "react";

// -- Types --

export interface FabricPaginationProps {
  /** Total number of records. */
  count: number;
  /** Current zero-based page index. */
  page: number;
  /** Number of rows per page. */
  rowsPerPage: number;
  /** Called when the page changes. Receives the new zero-based page index. */
  onPageChange: (page: number) => void;
  /** Called when rows-per-page changes. Receives the new rows-per-page value. */
  onRowsPerPageChange: (rowsPerPage: number) => void;
  /** Dropdown options for rows per page. Defaults to `[10, 25, 50, 100]`. */
  rowsPerPageOptions?: number[];
  /** Hide the sliding-window page number buttons (show only a current-page indicator). */
  hidePageNumbers?: boolean;
  /** Sx overrides for the root `TablePagination`. */
  sx?: SxProps<Theme>;
}

// -- Constants --

const MAX_PAGE_BUTTONS = 3;

const ROOT_SX: SxProps<Theme> = {
  width: "100%",
  ".MuiInputBase-root": {
    border: "1px solid var(--mui-palette-divider)",
    borderRadius: "10px",
    width: "60px",
    justifyContent: "flex-start",
  },
  ".MuiTablePagination-spacer": { display: "none", width: "0%" },
  ".MuiTablePagination-selectLabel": { display: "none", width: "0%" },
  ".MuiTablePagination-displayedRows": { width: "60%", textAlign: "center" },
  ".MuiTablePagination-actions": { width: "8%" },
  ".MuiTablePagination-toolbar": {
    width: "100%",
    height: "35px",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
};

const PAGE_BUTTON_SX = {
  border: 1,
  borderRadius: "5px",
  width: "30px",
  fontSize: "small",
  borderColor: "var(--mui-palette-divider)",
  marginLeft: "4px",
  marginRight: "4px",
};

const CURRENT_PAGE_SX = {
  ...PAGE_BUTTON_SX,
  fontWeight: "bold",
  backgroundColor: "var(--mui-palette-primary-main)",
  color: "var(--mui-palette-primary-contrastText)",
  "&.Mui-disabled": {
    backgroundColor: "var(--mui-palette-primary-main)",
    color: "var(--mui-palette-primary-contrastText)",
    fontWeight: "bold",
  },
};

const OTHER_PAGE_SX = {
  ...PAGE_BUTTON_SX,
  color: "var(--mui-palette-text-primary)",
  ":hover": { color: "var(--mui-palette-text-primary)" },
};

// -- Sub-components --

function LabelDisplayedRows({ from, to, count }: { from: number; to: number; count: number }) {
  const format = (n: number) => n.toLocaleString();
  const label =
    count <= 1 ? `${count} of ${count}` : `${format(from)} - ${format(to)} of ${format(count)}`;
  return (
    <Typography
      variant="body2"
      component="span"
      sx={{ color: "var(--mui-palette-text-secondary)" }}
    >
      {label}
    </Typography>
  );
}

interface PageActionsProps {
  count: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (event: React.MouseEvent<HTMLButtonElement> | null, page: number) => void;
  hidePageNumbers: boolean;
}

function PageActions({
  count,
  page,
  rowsPerPage,
  onPageChange,
  hidePageNumbers,
}: PageActionsProps) {
  const totalPages = Math.ceil(count / rowsPerPage);
  const half = Math.floor(MAX_PAGE_BUTTONS / 2);

  let start: number;
  let end: number;
  if (totalPages <= MAX_PAGE_BUTTONS) {
    start = 0;
    end = totalPages;
  } else if (page <= half) {
    start = 0;
    end = MAX_PAGE_BUTTONS;
  } else if (page >= totalPages - half) {
    start = totalPages - MAX_PAGE_BUTTONS;
    end = totalPages;
  } else {
    start = page - half;
    end = page + half + 1;
  }

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <IconButton
        size="small"
        onClick={(e) => onPageChange(e, page - 1)}
        disabled={page === 0}
        aria-label="previous page"
      >
        <KeyboardArrowLeft />
      </IconButton>

      {hidePageNumbers ? (
        <Typography
          variant="body2"
          aria-label={`page ${page + 1}`}
          sx={CURRENT_PAGE_SX}
          component="span"
        >
          {page + 1}
        </Typography>
      ) : (
        Array.from({ length: end - start }, (_, i) => {
          const pageNum = start + i + 1;
          const isCurrent = page === pageNum - 1;
          return (
            <IconButton
              key={pageNum}
              size="small"
              onClick={(e) => onPageChange(e, pageNum - 1)}
              disabled={isCurrent}
              aria-label={`page ${pageNum}`}
              sx={isCurrent ? CURRENT_PAGE_SX : OTHER_PAGE_SX}
            >
              {pageNum}
            </IconButton>
          );
        })
      )}

      <IconButton
        size="small"
        onClick={(e) => onPageChange(e, page + 1)}
        disabled={page >= totalPages - 1}
        aria-label="next page"
      >
        <KeyboardArrowRight />
      </IconButton>
    </div>
  );
}

// -- Main component --

const FabricPaginationImpl = forwardRef<HTMLDivElement, FabricPaginationProps>(
  function FabricPagination(
    {
      count,
      page,
      rowsPerPage,
      onPageChange,
      onRowsPerPageChange,
      rowsPerPageOptions = [10, 25, 50, 100],
      hidePageNumbers = false,
      sx,
    },
    ref,
  ) {
    const handlePageChange = useCallback(
      (_event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
        onPageChange(newPage);
      },
      [onPageChange],
    );

    const handleRowsPerPageChange = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const newSize = parseInt(event.target.value, 10);
        const firstItemIndex = page * rowsPerPage;
        const newPage = Math.floor(firstItemIndex / newSize);
        onRowsPerPageChange(newSize);
        onPageChange(newPage);
      },
      [page, rowsPerPage, onRowsPerPageChange, onPageChange],
    );

    return (
      <TablePagination
        ref={ref}
        component="div"
        count={count}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={rowsPerPageOptions}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        labelRowsPerPage=""
        labelDisplayedRows={LabelDisplayedRows}
        ActionsComponent={(subProps) => (
          <PageActions {...subProps} hidePageNumbers={hidePageNumbers} />
        )}
        sx={[ROOT_SX, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}
      />
    );
  },
);

FabricPaginationImpl.displayName = "FabricPagination";

export const FabricPagination = memo(FabricPaginationImpl);
