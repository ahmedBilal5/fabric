import {
  FabricActivityFeed,
  type FabricActivityItem,
  FabricButton,
  FabricEmptyState,
  FabricStatus,
} from "@fabric-kit/components";
import { FabricDatagrid } from "@fabric-kit/datagrid";
import Edit from "@fabric-kit/icons/Edit";
import Send from "@fabric-kit/icons/Send";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { FabricDetailPage } from "../src";
import { formatDay, formatMoney, INVOICES, STATUS_META } from "./invoices";

const invoice = INVOICES[0];
const MIN = 60_000;
const now = Date.now();

const events: FabricActivityItem[] = [
  {
    id: 1,
    actor: "Jane Doe",
    action: "changed the status to",
    target: <FabricStatus status="success" label="Paid" />,
    date: now - 12 * MIN,
  },
  { id: 2, actor: "Sam Lee", icon: <Send />, action: "sent a reminder to", target: "Northwind", date: now - 3 * 60 * MIN },
  { id: 3, actor: "Priya Patel", icon: <Edit />, action: "changed the due date", date: now - 30 * 60 * MIN },
  { id: 4, actor: "Priya Patel", action: "created", target: invoice.id, date: now - 5 * 24 * 60 * MIN },
];

const lineItems = [
  { id: 1, item: "Consulting, March", qty: 32, price: 240 },
  { id: 2, item: "Support plan", qty: 1, price: 1800 },
  { id: 3, item: "Travel", qty: 1, price: 2000 },
];

const summary = [
  { label: "Customer", value: invoice.customer },
  { label: "Amount", value: formatMoney(12480) },
  { label: "Invoice ID", value: invoice.id, copyable: true },
  { label: "Owner", value: invoice.owner },
  { label: "Issued", value: formatDay(invoice.issued) },
  { label: "Due", value: formatDay(invoice.due), hint: "Net 30" },
  { label: "Purchase order", value: null },
  { label: "Billing email", value: "billing@northwind.example.com", copyable: true },
];

const sections = [
  {
    value: "items",
    label: "Line items",
    content: (
      <FabricDatagrid
        rows={lineItems}
        hideFooter
        autoHeight
        columns={[
          { field: "item", headerName: "Item", flex: 1 },
          { field: "qty", headerName: "Qty", type: "number", width: 80 },
          {
            field: "price",
            headerName: "Price",
            type: "number",
            width: 120,
            valueFormatter: (v: number) => formatMoney(v),
          },
        ]}
      />
    ),
  },
  {
    value: "payments",
    label: "Payments",
    content: (
      <FabricEmptyState size="sm" title="No payments yet" description="Payments recorded against this invoice show up here." />
    ),
  },
  { value: "files", label: "Files", content: <p>Attachments go here.</p> },
];

const meta = {
  title: "Patterns/Detail page",
  component: FabricDetailPage,
  tags: ["test"],
  parameters: { layout: "padded" },
  args: {
    title: invoice.id,
    status: <FabricStatus status={STATUS_META.paid.color} label="Paid" />,
    meta: `${invoice.customer} · ${formatMoney(12480)}`,
    breadcrumbs: [{ label: "Invoices", href: "#" }, { label: invoice.id }],
    actions: (
      <>
        <FabricButton variant="outlined">Download PDF</FabricButton>
        <FabricButton variant="contained">Send reminder</FabricButton>
      </>
    ),
    moreActions: [{ label: "Duplicate" }, { label: "Void invoice" }],
    summary,
    sections,
    aside: <FabricActivityFeed items={events} dense />,
  },
  argTypes: {
    status: { control: false },
    actions: { control: false },
    aside: { control: false },
    sections: { control: false },
    summary: { control: false },
  },
} satisfies Meta<typeof FabricDetailPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { level: 1, name: invoice.id })).toBeVisible();
    await expect(canvas.getByRole("region", { name: "Summary" })).toBeVisible();
    await expect(canvas.getByRole("complementary", { name: "Activity" })).toBeVisible();

    const panel = canvas.getByRole("tabpanel");
    await expect(panel).toHaveAccessibleName("Line items");
    await userEvent.click(canvas.getByRole("tab", { name: "Payments" }));
    await expect(canvas.getByRole("tabpanel")).toHaveAccessibleName("Payments");
    await expect(canvas.getByRole("heading", { name: "No payments yet" })).toBeVisible();
  },
};

export const Loading: Story = { args: { loading: true } };

/** Without tabs: pass `children` for a single body. */
export const WithoutSections: Story = {
  args: {
    sections: undefined,
    children: (
      <div style={{ color: "var(--mui-palette-text-secondary)" }}>
        Notes and other content for a simple record go here.
      </div>
    ),
  },
};

export const WithoutSidePanel: Story = { args: { aside: undefined } };

/** On phones the side panel moves under the main content. */
export const Mobile: Story = {
  globals: { viewport: { value: "mobile1" } },
  parameters: { viewport: { defaultViewport: "mobile1" } },
};
