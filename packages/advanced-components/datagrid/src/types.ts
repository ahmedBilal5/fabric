import type { DataGridProps } from "@mui/x-data-grid";

/**
 * Props for the {@link FabricDatagrid} component.
 *
 * Extends `DataGridProps` with opinionated defaults and styling conveniences
 * while remaining fully compatible with the MUI X `DataGrid`.
 *
 * @example
 * ```tsx
 * <FabricDatagrid
 *   rows={rows}
 *   columns={columns}
 *   showCellBorders
 *   checkboxSelection
 * />
 * ```
 */
export interface FabricDatagridProps extends DataGridProps {
  /**
   * Show vertical borders between cells.
   * @default true
   */
  showCellBorders?: boolean;
  /**
   * Column header background color. Accepts any CSS color value.
   * Defaults to `var(--mui-palette-datagrid-headerBg)` for automatic dark mode support.
   */
  headerColor?: string;
  /**
   * Automatically reduce row/header height below the `sm` breakpoint (600px).
   * @default true
   */
  responsiveDensity?: boolean;
}
