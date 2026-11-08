import { GridActionsCellItem } from "@mui/x-data-grid";
import type { GridActionsColDef, GridColDef } from "@mui/x-data-grid";
import type { Meta, StoryObj } from "@storybook/react-vite";
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

// Sample data
const sampleRows = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  name: `Item ${i + 1}`,
  category: ["Electronics", "Clothing", "Food", "Furniture"][i % 4],
  price: Math.round(Math.random() * 500 * 100) / 100,
  status: ["Active", "Draft", "Archived"][i % 3],
}));

const baseColumns: GridColDef[] = [
  { field: "id", headerName: "ID", width: 70 },
  { field: "name", headerName: "Name", flex: 1 },
  { field: "category", headerName: "Category", width: 140 },
  { field: "price", headerName: "Price", width: 100, type: "number" },
  { field: "status", headerName: "Status", width: 100 },
];

/**
 * Default usage with cell borders and standard header styling.
 */
export const Default: Story = {
  args: {
    rows: sampleRows,
    columns: baseColumns,
  },
};

// The design "Column - more action": a 40px column with a ⋮ menu per row.
const moreCol: GridActionsColDef = {
  field: "more",
  type: "actions",
  headerName: "",
  width: 40,
  getActions: (params) => [
    <GridActionsCellItem
      key="duplicate"
      label="Duplicate"
      onClick={() => alert(`Duplicate ${params.row.name}`)}
      showInMenu
    />,
    <GridActionsCellItem
      key="archive"
      label="Archive"
      onClick={() => alert(`Archive ${params.row.name}`)}
      showInMenu
    />,
  ],
};

/**
 * Action column using the `FabricActionColDef` pattern.
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
          onClick={() => alert(`Edit ${params.row.name}`)}
          showInMenu={false}
        />,
        <GridActionsCellItem
          key="delete"
          icon={<DeleteIcon fontSize="small" color="error" />}
          label="Delete"
          onClick={() => alert(`Delete ${params.row.name}`)}
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
