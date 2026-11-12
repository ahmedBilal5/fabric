import {
  FabricConfirmProvider,
  FabricKeyValueList,
  FabricTag,
  FabricToastProvider,
  useToast,
} from "@fabric-kit/components";
import { radii, spacing } from "@fabric-kit/design-tokens";
import { formatCurrency, formatDate } from "@fabric-kit/hooks";
import Box from "@mui/material/Box";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useForm } from "react-hook-form";
import { expect, userEvent, waitFor, within } from "storybook/test";
import {
  CustomerFields,
  type Customer,
  type CustomerInput,
  customerSchema,
  emptyCustomer,
  industries,
  northwind,
  plans,
} from "../../forms/docs/showcase";
import { zodResolver } from "@fabric-kit/forms";
import { FabricFormPage } from "../src";

const meta = {
  title: "Patterns/Form page",
  component: FabricFormPage,
  tags: ["test"],
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <FabricConfirmProvider>
        <FabricToastProvider>
          <Story />
        </FabricToastProvider>
      </FabricConfirmProvider>
    ),
  ],
} satisfies Meta<typeof FabricFormPage>;
export default meta;
type Story = StoryObj;

function CustomerView({ c }: { c: CustomerInput }) {
  const label = (list: { value: string; label: string }[], v: string) => list.find((o) => o.value === v)?.label ?? v;
  return (
    <FabricKeyValueList
      columns={2}
      dividers
      items={[
        { label: "Company", value: c.company.name },
        { label: "Website", value: c.company.website || null },
        { label: "Industry", value: label(industries, c.company.industry) },
        { label: "Tags", value: c.company.tags.join(", ") || null },
        { label: "Primary contact", value: `${c.contact.firstName} ${c.contact.lastName}` },
        { label: "Email", value: c.contact.email, copyable: true },
        { label: "Phone", value: c.contact.phone || null },
        { label: "Plan", value: label(plans, c.billing.plan).split(" · ")[0] },
        { label: "Seats", value: c.billing.seats },
        {
          label: "Monthly budget",
          value: c.billing.budget == null ? null : formatCurrency(c.billing.budget, "USD"),
        },
        {
          label: "Contract",
          value:
            c.billing.contract.start && c.billing.contract.end
              ? `${formatDate(c.billing.contract.start)} – ${formatDate(c.billing.contract.end)}`
              : null,
          fullWidth: true,
        },
      ]}
    />
  );
}

function EditCustomer({ startEditing = false, failSave = false }: { startEditing?: boolean; failSave?: boolean }) {
  const toast = useToast();
  const form = useForm<CustomerInput, unknown, Customer>({
    resolver: zodResolver(customerSchema),
    defaultValues: northwind,
    mode: "onTouched",
  });
  const values = form.watch();
  return (
    <FabricFormPage
      title={values.company.name || "Customer"}
      status={<FabricTag label="Active" variant="indicator" color="success" />}
      breadcrumbs={[{ label: "Customers", href: "#" }, { label: values.company.name || "Customer" }]}
      meta="Customer since March 2024 · ID CUS-2041"
      form={form}
      mode={startEditing ? "edit" : undefined}
      view={
        <Box
          sx={{
            p: `${spacing.xl}px`,
            borderRadius: `${radii.xl}px`,
            border: "1px solid var(--mui-palette-divider)",
            backgroundColor: "var(--mui-palette-background-paper)",
          }}
        >
          <CustomerView c={form.getValues()} />
        </Box>
      }
      onSubmit={async () => {
        await new Promise((r) => setTimeout(r, 500));
        if (failSave) throw new Error("Someone else changed this customer while you were editing. Reload to see their changes.");
      }}
      onSaved={(v) => toast({ title: `${v.company.name} saved` })}
      errorLabels={{ "company.name": "Company name" }}
    >
      <CustomerFields />
    </FabricFormPage>
  );
}

/** Opens read-only with an Edit button; Save or Cancel goes back to the view. */
export const ViewAndEdit: Story = {
  render: () => <EditCustomer />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Edit" }));
    const name = await canvas.findByRole("textbox", { name: "Company name" });
    await userEvent.clear(name);
    await userEvent.type(name, "Northwind Logistics");
    await expect(await canvas.findByText("Unsaved changes")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Save changes" }));
    await waitFor(() => expect(canvas.getByRole("button", { name: "Edit" })).toBeVisible(), { timeout: 3000 });
    await expect(canvas.getByRole("heading", { level: 1 })).toHaveTextContent("Northwind Logistics");
  },
};

/** Cancel with unsaved changes asks first. */
export const DiscardChanges: Story = {
  render: () => <EditCustomer startEditing />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole("textbox", { name: "Company name" }), " Ltd");
    await userEvent.click(canvas.getByRole("button", { name: "Cancel" }));
    const dialog = await within(document.body).findByRole("alertdialog");
    await expect(dialog).toHaveTextContent("Discard unsaved changes?");
    await userEvent.click(within(dialog).getByRole("button", { name: "Keep editing" }));
    // The page is hidden from assistive tech until the dialog finishes closing.
    await waitFor(() =>
      expect(canvas.getByRole("textbox", { name: "Company name" })).toHaveValue("Northwind Traders Ltd"),
    );
  },
};

/** A create page: always editable, with a help panel beside the form on wide screens. */
export const Create: Story = {
  render: () => <CreateCustomer />,
};

function CreateCustomer() {
  const toast = useToast();
  const form = useForm<CustomerInput, unknown, Customer>({
    resolver: zodResolver(customerSchema),
    defaultValues: emptyCustomer,
    mode: "onTouched",
  });
  return (
    <FabricFormPage
      title="New customer"
      description="Add a company and its primary contact. You can invite more people later."
      breadcrumbs={[{ label: "Customers", href: "#" }, { label: "New customer" }]}
      form={form}
      submitLabel="Add customer"
      onCancel={() => toast({ title: "Cancelled", severity: "info" })}
      onSubmit={() => new Promise((r) => setTimeout(r, 500))}
      onSaved={(v) => toast({ title: `${v.company.name} added` })}
      aside={
        <Box
          sx={{
            p: `${spacing.xlsm}px`,
            borderRadius: `${radii.xl}px`,
            backgroundColor: "rgba(var(--mui-palette-primary-mainChannel) / 0.06)",
            fontSize: "0.875rem",
            lineHeight: 1.6,
          }}
        >
          <strong>Before you start</strong>
          <Box component="p" sx={{ m: 0, mt: `${spacing.sm}px` }}>
            Have the signed order form ready. The plan and seats come from it, and we attach it to the first invoice.
          </Box>
        </Box>
      }
    >
      <CustomerFields />
    </FabricFormPage>
  );
}

/** A failed save keeps the edits and explains what happened. */
export const SaveError: Story = {
  render: () => <EditCustomer startEditing failSave />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Save changes" }));
    await expect(
      await canvas.findByText(/Someone else changed this customer/, {}, { timeout: 3000 }),
    ).toBeVisible();
  },
};

/** Placeholders while the record loads. */
export const Loading: Story = {
  render: function Render() {
    const form = useForm({ defaultValues: emptyCustomer });
    return (
      <FabricFormPage title="Northwind Traders" breadcrumbs={[{ label: "Customers", href: "#" }, { label: "…" }]} form={form} onSubmit={() => undefined} loading>
        <CustomerFields />
      </FabricFormPage>
    );
  },
};

/** On phones the side panel moves below and the Save bar spans the width. */
export const Mobile: Story = {
  render: () => <EditCustomer startEditing />,
  globals: { viewport: { value: "mobile1", isRotated: false } },
};

