import {
  FabricButton,
  FabricStatus,
  type FabricStatusColor,
  useConfirm,
  useToast,
} from "@fabric-kit/components";
import type { GridColDef } from "@fabric-kit/datagrid";
import Add from "@fabric-kit/icons/Add";
import Delete from "@fabric-kit/icons/Delete";
import { type FabricFilterDef, FabricListPage, useFilterParams } from "@fabric-kit/patterns";
import { useMemo } from "react";
import {
  type Customer,
  type CustomerStatus,
  customerMrr,
  fromDay,
  OWNERS,
  options,
  PLANS,
  type Plan,
  STATUSES,
} from "../data/customers";
import { filterCustomers } from "../data/query";
import { useData } from "../data/store";
import { useRouter } from "../router";
import { href, routePath } from "../routes";

export const STATUS_COLORS: Record<CustomerStatus, FabricStatusColor> = {
  active: "success",
  trial: "running",
  past_due: "error",
  churned: "archived",
};

const FILTERS: FabricFilterDef[] = [
  { id: "status", label: "Status", multiple: true, options: options(STATUSES) },
  { id: "plan", label: "Plan", multiple: true, options: options(PLANS) },
  { id: "owner", label: "Owner", options: OWNERS.map((o) => ({ value: o, label: o })) },
];

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
const day = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

const COLUMNS: GridColDef<Customer>[] = [
  {
    field: "name",
    headerName: "Customer",
    flex: 1,
    minWidth: 200,
    renderCell: ({ row }) => (
      <a
        href={href(routePath({ name: "customer", id: row.id }))}
        style={{ color: "inherit", fontWeight: 500 }}
      >
        {row.name}
      </a>
    ),
  },
  {
    field: "status",
    headerName: "Status",
    width: 130,
    renderCell: ({ row }) => (
      <FabricStatus status={STATUS_COLORS[row.status]} label={STATUSES[row.status].label} />
    ),
  },
  {
    field: "plan",
    headerName: "Plan",
    width: 120,
    valueFormatter: (value: Plan) => PLANS[value].label,
  },
  { field: "seats", headerName: "Seats", type: "number", width: 90 },
  {
    field: "mrr",
    headerName: "MRR",
    type: "number",
    width: 110,
    valueGetter: (_value, row) => customerMrr(row),
    valueFormatter: (value: number) => money.format(value),
  },
  { field: "owner", headerName: "Owner", width: 130 },
  {
    field: "createdAt",
    headerName: "Customer since",
    width: 140,
    valueFormatter: (value: string) => day.format(fromDay(value)),
  },
];

export function CustomersPage() {
  const { customers, ready, deleteCustomers } = useData();
  const { search: params, setSearch: setParams } = useRouter();
  const confirm = useConfirm();
  const toast = useToast();

  // Search and filters live in the URL, so a filtered list can be shared or bookmarked.
  const adapter = useMemo(() => ({ params, setParams }), [params, setParams]);
  const filters = useFilterParams(FILTERS, { adapter });

  const rows = useMemo(
    () =>
      filterCustomers(customers, {
        search: filters.search,
        status: filters.values.status as CustomerStatus[] | undefined,
        plan: filters.values.plan as Plan[] | undefined,
        owner: filters.values.owner as string | undefined,
      }),
    [customers, filters.search, filters.values],
  );

  return (
    <FabricListPage<Customer>
      title="Customers"
      description="Every account in your workspace, newest first."
      primaryAction={
        <FabricButton
          variant="contained"
          startIcon={<Add />}
          href={href(routePath({ name: "customer-new" }))}
        >
          New customer
        </FabricButton>
      }
      filterBar={{
        filters: FILTERS,
        values: filters.values,
        onValuesChange: filters.setValues,
        search: filters.search,
        onSearchChange: filters.setSearch,
        onClearAll: filters.clear,
        searchPlaceholder: "Search customers",
      }}
      rows={rows}
      columns={COLUMNS}
      loading={!ready}
      noun={["customer", "customers"]}
      exportable
      bulkActions={(ids, clear) => (
        <FabricButton
          variant="outlined"
          size="small"
          color="error"
          startIcon={<Delete />}
          onClick={async () => {
            const ok = await confirm({
              title: `Delete ${ids.length} ${ids.length === 1 ? "customer" : "customers"}?`,
              description: "Their invoices and activity go too. You can't undo this.",
              confirmLabel: "Delete",
              danger: true,
            });
            if (!ok) return;
            await deleteCustomers(ids.map(String));
            clear();
            toast({
              title: `Deleted ${ids.length} ${ids.length === 1 ? "customer" : "customers"}`,
            });
          }}
        >
          Delete
        </FabricButton>
      )}
      gridProps={{
        initialState: { pagination: { paginationModel: { pageSize: 25 } } },
        pageSizeOptions: [10, 25, 50],
      }}
    />
  );
}
