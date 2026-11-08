import type { SxProps, Theme } from "@mui/material";
import { useMediaQuery, useTheme } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { cellBorderStyles, fabricGridStyles } from "./styles";
import type { FabricDatagridProps } from "./types";

const DEFAULT_HEADER_COLOR = "var(--mui-palette-datagrid-headerBg)";
const ROW_HEIGHT = 40;
const ROW_HEIGHT_COMPACT = 36;
const HEADER_HEIGHT = 36;
const HEADER_HEIGHT_COMPACT = 32;

/**
 * A pre-styled, token-driven wrapper around the MIT-licensed MUI X `DataGrid`.
 *
 * Provides opinionated defaults (row height, header height, cell borders,
 * responsive density) while forwarding every `DataGridProps` prop.
 * Colors use MUI CSS variables, so dark mode works automatically.
 *
 * @example
 * ```tsx
 * import { FabricDatagrid } from '@fabric-kit/datagrid';
 *
 * <FabricDatagrid
 *   rows={data}
 *   columns={[
 *     { field: 'name', headerName: 'Name', flex: 1 },
 *     { field: 'status', headerName: 'Status', width: 120 },
 *   ]}
 *   checkboxSelection
 *   onRowClick={(params) => navigate(params.row.id)}
 * />
 * ```
 */
export function FabricDatagrid({
  showCellBorders = true,
  headerColor = DEFAULT_HEADER_COLOR,
  responsiveDensity = true,
  rowHeight: rowHeightProp,
  columnHeaderHeight: headerHeightProp,
  sx,
  ...otherProps
}: Readonly<FabricDatagridProps>) {
  const muiTheme = useTheme();
  const isCompact = useMediaQuery(muiTheme.breakpoints.down("sm"), { noSsr: true });
  const rowHeight =
    rowHeightProp ?? (responsiveDensity && isCompact ? ROW_HEIGHT_COMPACT : ROW_HEIGHT);
  const headerHeight =
    headerHeightProp ?? (responsiveDensity && isCompact ? HEADER_HEIGHT_COMPACT : HEADER_HEIGHT);

  const mergedSx: SxProps<Theme> = [
    fabricGridStyles,
    ...(showCellBorders ? [cellBorderStyles] : []),
    {
      "& .MuiDataGrid-columnHeader": {
        backgroundColor: headerColor,
      },
    },
    ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
  ];

  return (
    <DataGrid
      sx={mergedSx}
      rowHeight={rowHeight}
      columnHeaderHeight={headerHeight}
      {...otherProps}
    />
  );
}
