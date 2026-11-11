/** Shared sample data for the grid stories: fixed values, so screenshots are stable. */
import type { GridColDef } from "@mui/x-data-grid";

// Sample data: a small product catalog with fixed values, so screenshots are stable.
export const PRODUCTS: Array<[string, string, number, string]> = [
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

export const sampleRows = PRODUCTS.map(([name, category, price, status], i) => ({
  id: 1001 + i,
  name,
  category,
  price,
  status,
}));

export const baseColumns: GridColDef[] = [
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
