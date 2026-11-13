import {
  FabricActivityFeed,
  FabricButton,
  FabricEmptyState,
  FabricMeter,
  FabricStatus,
  type FabricStatusColor,
  parsePhone,
  useConfirm,
  useToast,
} from "@fabric-kit/components";
import { FabricDatagrid, type GridColDef } from "@fabric-kit/datagrid";
import { spacing } from "@fabric-kit/design-tokens";
import Edit from "@fabric-kit/icons/Edit";
import { FabricDetailPage } from "@fabric-kit/patterns";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import { useMemo } from "react";
import {
  type Customer,
  customerInvoices,
  customerMrr,
  fromDay,
  INDUSTRIES,
  type Invoice,
  type InvoiceStatus,
  PLANS,
  REGIONS,
  STATUSES,
  seededRandom,
} from "../data/customers";
import { useData } from "../data/store";
import { useRouter } from "../router";
import { href, routePath } from "../routes";
import { STATUS_COLORS } from "./CustomersPage";
import { NotFoundPage } from "./NotFoundPage";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
const day = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" });
const month = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" });

const INVOICE_STATUS: Record<InvoiceStatus, { label: string; color: FabricStatusColor }> = {
  paid: { label: "Paid", color: "success" },
  open: { label: "Open", color: "running" },
  overdue: { label: "Overdue", color: "error" },
};

const INVOICE_COLUMNS: GridColDef<Invoice>[] = [
  { field: "id", headerName: "Invoice", width: 150 },
  {
    field: "period",
    headerName: "Period",
    flex: 1,
    minWidth: 140,
    valueFormatter: (v: string) => month.format(fromDay(v)),
  },
  {
    field: "status",
    headerName: "Status",
    width: 120,
    renderCell: ({ row }) => (
      <FabricStatus
        status={INVOICE_STATUS[row.status].color}
        label={INVOICE_STATUS[row.status].label}
      />
    ),
  },
  {
    field: "amount",
    headerName: "Amount",
    type: "number",
    width: 120,
    valueFormatter: (v: number) => money.format(v),
  },
];

const tabs = ["invoices", "usage", "notes"] as const;

export function CustomerPage({ id }: { id: string }) {
  const { customers, ready, today, eventsFor, deleteCustomers } = useData();
  const { search, setSearch, navigate } = useRouter();
  const confirm = useConfirm();
  const toast = useToast();
  const customer = customers.find((c) => c.id === id);
  const invoices = useMemo(
    () => (customer ? customerInvoices(customer, today) : []),
    [customer, today],
  );

  if (ready && !customer)
    return (
      <NotFoundPage
        title="We couldn't find that customer"
        description="It may have been deleted, or the link has a typo."
        backTo={{ label: "Back to customers", path: routePath({ name: "customers" }) }}
      />
    );

  const tab = tabs.find((t) => t === search.get("tab")) ?? "invoices";
  const crumbs = [
    { label: "Customers", href: href(routePath({ name: "customers" })) },
    { label: customer?.name ?? id },
  ];

  if (!customer) return <FabricDetailPage title="Customer" breadcrumbs={crumbs} loading />;

  const remove = async () => {
    const ok = await confirm({
      title: `Delete ${customer.name}?`,
      description: "Their invoices and activity go too. You can't undo this.",
      confirmLabel: "Delete",
      danger: true,
    });
    if (!ok) return;
    await deleteCustomers([customer.id]);
    toast({ title: `Deleted ${customer.name}` });
    navigate(routePath({ name: "customers" }), { replace: true });
  };

  return (
    <FabricDetailPage
      title={customer.name}
      status={
        <FabricStatus
          status={STATUS_COLORS[customer.status]}
          label={STATUSES[customer.status].label}
        />
      }
      meta={`${PLANS[customer.plan].label} plan · ${customer.seats} seats · ${money.format(customerMrr(customer))} a month`}
      breadcrumbs={crumbs}
      actions={
        <FabricButton
          variant="outlined"
          startIcon={<Edit />}
          href={href(routePath({ name: "customer-edit", id: customer.id }))}
        >
          Edit
        </FabricButton>
      }
      moreActions={[{ label: "Delete customer", onClick: remove }]}
      summary={summaryFor(customer)}
      sections={[
        {
          value: "invoices",
          label: "Invoices",
          content:
            invoices.length === 0 ? (
              <FabricEmptyState
                size="sm"
                title="No invoices yet"
                description="Trials aren't billed. The first invoice comes when the trial converts."
              />
            ) : (
              <FabricDatagrid
                rows={invoices}
                columns={INVOICE_COLUMNS}
                hideFooter
                autoHeight
                disableRowSelectionOnClick
              />
            ),
        },
        { value: "usage", label: "Usage", content: <Usage customer={customer} /> },
        {
          value: "notes",
          label: "Notes",
          content: customer.notes ? (
            <Box component="p" sx={{ m: 0, whiteSpace: "pre-wrap" }}>
              {customer.notes}
            </Box>
          ) : (
            <FabricEmptyState
              size="sm"
              title="No notes"
              description="Add context for your team, like renewal plans or who to call."
              actions={
                <FabricButton
                  variant="outlined"
                  href={href(routePath({ name: "customer-edit", id: customer.id }))}
                >
                  Add a note
                </FabricButton>
              }
            />
          ),
        },
      ]}
      section={tab}
      onSectionChange={(value) => {
        const next = new URLSearchParams(search);
        if (value === "invoices") next.delete("tab");
        else next.set("tab", value);
        setSearch(next);
      }}
      aside={
        <FabricActivityFeed
          dense
          dayHeadingComponent="h3"
          items={eventsFor(customer.id).map((e) => ({
            id: e.id,
            actor: e.actor,
            action: e.action,
            target: e.target,
            date: e.date,
          }))}
        />
      }
    />
  );
}

/** "+44 2079460123": the country code apart, so the number reads at a glance. */
function formatPhone(e164: string): string {
  const { country, national } = parsePhone(e164);
  return country ? `+${country.dial} ${national}` : e164;
}

function summaryFor(c: Customer) {
  return [
    { label: "Primary contact", value: c.contact.name },
    { label: "Email", value: c.contact.email, copyable: true },
    {
      label: "Phone",
      value: formatPhone(c.contact.phone) || null,
      copyable: c.contact.phone || undefined,
    },
    {
      label: "Website",
      value: c.website ? (
        <Link href={c.website} target="_blank" rel="noreferrer">
          {c.website.replace(/^https?:\/\//, "")}
        </Link>
      ) : null,
    },
    { label: "Industry", value: INDUSTRIES[c.industry].label },
    { label: "Region", value: REGIONS[c.region].label },
    { label: "Account owner", value: c.owner },
    {
      label: "Customer since",
      value: day.format(fromDay(c.createdAt)),
      hint: c.churnedAt ? `Cancelled ${day.format(fromDay(c.churnedAt))}` : undefined,
    },
    { label: "Customer ID", value: c.id, copyable: true },
  ];
}

/** Seats and API calls this month. Made-up but stable numbers for each customer. */
function Usage({ customer }: { customer: Customer }) {
  const rand = seededRandom(Number(customer.id.slice(2)));
  const seatsUsed = Math.min(
    customer.seats + 2,
    Math.round(customer.seats * (0.55 + rand() * 0.55)),
  );
  const apiLimit = { starter: 50_000, growth: 250_000, enterprise: 2_000_000 }[customer.plan];
  const apiUsed = Math.round(apiLimit * (0.2 + rand() * 0.75));
  return (
    <Box sx={{ display: "grid", gap: `${spacing.xl}px`, maxWidth: 560 }}>
      <FabricMeter
        label="Seats in use"
        value={seatsUsed}
        max={customer.seats}
        unit="seats"
        helperText="People who signed in this month."
      />
      <FabricMeter
        label="API calls this month"
        value={apiUsed}
        max={apiLimit}
        format="percent"
        helperText={`${PLANS[customer.plan].label} includes ${apiLimit.toLocaleString("en-US")} calls. Resets on the 1st.`}
      />
    </Box>
  );
}
