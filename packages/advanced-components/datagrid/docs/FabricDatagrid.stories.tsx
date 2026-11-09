import { GridActionsCellItem } from "@mui/x-data-grid";
import type { GridActionsColDef, GridColDef } from "@mui/x-data-grid";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import DeleteIcon from "@fabric-kit/icons/Delete";
import EditIcon from "@fabric-kit/icons/Edit";
import { FabricDatagrid } from "../src";

const meta: Meta<typeof FabricDatagrid> = {
  title: "Advanced Components/FabricDatagrid",
  component: FabricDatagrid,
  parameters: { layout: "padded" },
};
export default meta;

type Story = StoryObj<typeof FabricDatagrid>;

// Sample data: a small product catalog with fixed values, so screenshots are stable.
const PRODUCTS: Array<[string, string, number, string]> = [
  ["Ergonomic office chair", "Furniture", 249, "Active"],
  ["Standing desk, oak", "Furniture", 529, "Active"],
  ["Noise-cancelling headphones", "Electronics", 199.99, "Active"],
  ["Merino crew sweater", "Clothing", 89, "Draft"],
  ["Cold brew coffee, 12-pack", "Food", 34.5, "Active"],
  ["27-inch 4K monitor", "Electronics", 379, "Active"],
  ["Linen shirt", "Clothing", 64, "Archived"],
  ["Bookshelf, walnut", "Furniture", 315, "Draft"],
  ["Mechanical keyboard", "Electronics", 149, "Active"],
  ["Organic granola", "Food", 7.25, "Active"],
  ["Rain jacket", "Clothing", 129, "Active"],
  ["Desk lamp, brass", "Furniture", 79, "Archived"],
  ["USB-C dock", "Electronics", 189, "Draft"],
  ["Dark chocolate bar", "Food", 4.5, "Active"],
  ["Wool socks, 3-pack", "Clothing", 24, "Active"],
  ["Filing cabinet", "Furniture", 210, "Active"],
  ["Wireless mouse", "Electronics", 49, "Archived"],
  ["Green tea, loose leaf", "Food", 12, "Draft"],
  ["Canvas tote", "Clothing", 29, "Active"],
  ["Lounge armchair", "Furniture", 640, "Active"],
];

const sampleRows = PRODUCTS.map(([name, category, price, status], i) => ({
  id: 1001 + i,
  name,
  category,
  price,
  status,
}));

const baseColumns: GridColDef[] = [
  { field: "id", headerName: "SKU", width: 80 },
  { field: "name", headerName: "Product", flex: 1, minWidth: 180 },
  { field: "category", headerName: "Category", width: 130 },
  {
    field: "price",
    headerName: "Price",
    width: 110,
    type: "number",
    valueFormatter: (value: number) => `$${value.toFixed(2)}`,
  },
  { field: "status", headerName: "Status", width: 110 },
];

const onRowAction = fn();

/**
 * Default usage with cell borders and standard header styling.
 */
export const Default: Story = {
  args: {
    rows: sampleRows,
    columns: baseColumns,
  },
};

// A 40px column with a ⋮ menu per row.
const moreCol: GridActionsColDef = {
  field: "more",
  type: "actions",
  headerName: "",
  width: 40,
  getActions: (params) => [
    <GridActionsCellItem
      key="duplicate"
      label="Duplicate"
      onClick={() => onRowAction("Duplicate", params.row.name)}
      showInMenu
    />,
    <GridActionsCellItem
      key="archive"
      label="Archive"
      onClick={() => onRowAction("Archive", params.row.name)}
      showInMenu
    />,
  ],
};

/**
 * Row actions with MUI X `GridActionsCellItem`: icon buttons inline, extra actions in a ⋮ menu.
 */
export const WithActions: Story = {
  render: () => {
    const actionsCol: GridActionsColDef = {
      field: "actions",
      type: "actions",
      headerName: "",
      width: 80,
      getActions: (params) => [
        <GridActionsCellItem
          key="edit"
          icon={<EditIcon fontSize="small" />}
          label="Edit"
          onClick={() => onRowAction("Edit", params.row.name)}
          showInMenu={false}
        />,
        <GridActionsCellItem
          key="delete"
          icon={<DeleteIcon fontSize="small" color="error" />}
          label="Delete"
          onClick={() => onRowAction("Delete", params.row.name)}
          showInMenu={false}
        />,
      ],
    };

    return (
      <FabricDatagrid
        rows={sampleRows.slice(0, 5)}
        columns={[...baseColumns, actionsCol, moreCol]}
      />
    );
  },
};

/**
 * The footer (row count and pagination) is shown by default. Hide it for short,
 * fixed-size tables. Keep it visible for anything over 100 rows: the free grid
 * paginates at 100 rows per page.
 */
export const WithoutFooter: Story = {
  name: "Without footer",
  args: {
    rows: sampleRows.slice(0, 5),
    columns: baseColumns,
    hideFooter: true,
  },
};

/**
 * Multiselect. By default Fabric shows row checkboxes only on hover or
 * when checked; this `sx` keeps them visible on every row and in the header.
 */
export const Multiselect: Story = {
  name: "Multi select grid",
  args: {
    rows: sampleRows,
    columns: [...baseColumns, moreCol],
    checkboxSelection: true,
    sx: {
      "& .MuiDataGrid-row .MuiCheckbox-root, & .MuiDataGrid-columnHeader .MuiCheckbox-root": {
        opacity: 1,
      },
    },
  },
};

/**
 * Compact configuration with custom row and header heights.
 */
export const Compact: Story = {
  args: {
    rows: sampleRows,
    columns: baseColumns,
    rowHeight: 36,
    columnHeaderHeight: 28,
    showCellBorders: false,
  },
};
