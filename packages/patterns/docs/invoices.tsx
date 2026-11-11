/** Sample invoices shared by the list and detail page stories. Fixed values, so screenshots are stable. */
import { FabricStatus, type FabricStatusColor } from "@fabric-kit/components";
import type { GridColDef } from "@fabric-kit/datagrid";
import type { FabricFilterDef } from "../src";

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue";

export interface Invoice {
  id: string;
  customer: string;
  owner: string;
  status: InvoiceStatus;
  amount: number;
  issued: string;
  due: string;
}

const CUSTOMERS = [
  "Northwind Traders",
  "Acme Corporation",
  "Globex",
  "Initech",
  "Umbrella Supplies",
  "Stark Logistics",
  "Wayne Hardware",
  "Contoso Ltd",
];
const OWNERS = ["Jane Doe", "Sam Lee", "Priya Patel"];
const STATUSES: InvoiceStatus[] = ["paid", "sent", "overdue", "draft", "paid", "sent"];

export const INVOICES: Invoice[] = Array.from({ length: 28 }, (_, i) => {
  const day = 1 + ((i * 7) % 27);
  const month = 1 + (i % 3);
  return {
    id: `INV-${2041 - i}`,
    customer: CUSTOMERS[i % CUSTOMERS.length],
    owner: OWNERS[i % OWNERS.length],
    status: STATUSES[i % STATUSES.length],
    amount: Math.round(((i * 7919) % 24000) + 480) + (i % 4) * 0.25,
    issued: `2026-0${month}-${String(day).padStart(2, "0")}`,
    due: `2026-0${month + 1}-${String(day).padStart(2, "0")}`,
  };
});

export const STATUS_META: Record<InvoiceStatus, { label: string; color: FabricStatusColor }> = {
  draft: { label: "Draft", color: "unknown" },
  sent: { label: "Sent", color: "running" },
  paid: { label: "Paid", color: "success" },
  overdue: { label: "Overdue", color: "error" },
};

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const date = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});
export const formatMoney = (n: number) => money.format(n);
export const formatDay = (iso: string) => date.format(new Date(`${iso}T00:00:00Z`));

export const INVOICE_COLUMNS: GridColDef<Invoice>[] = [
  { field: "id", headerName: "Invoice", width: 110 },
  { field: "customer", headerName: "Customer", flex: 1, minWidth: 180 },
  {
    field: "status",
    headerName: "Status",
    width: 120,
    renderCell: ({ value }) => (
      <FabricStatus
        status={STATUS_META[value as InvoiceStatus].color}
        label={STATUS_META[value as InvoiceStatus].label}
      />
    ),
  },
  { field: "owner", headerName: "Owner", width: 130 },
  {
    field: "amount",
    headerName: "Amount",
    type: "number",
    width: 130,
    valueFormatter: (value: number) => formatMoney(value),
  },
  {
    field: "due",
    headerName: "Due",
    width: 130,
    valueFormatter: (value: string) => formatDay(value),
  },
];

export const INVOICE_FILTERS: FabricFilterDef[] = [
  {
    id: "status",
    label: "Status",
    multiple: true,
    options: (Object.keys(STATUS_META) as InvoiceStatus[]).map((s) => ({
      value: s,
      label: STATUS_META[s].label,
    })),
  },
  {
    id: "owner",
    label: "Owner",
    options: OWNERS.map((o) => ({ value: o.split(" ")[0].toLowerCase(), label: o })),
  },
];
