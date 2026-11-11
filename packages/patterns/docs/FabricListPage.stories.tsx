import { FabricButton, FabricToastProvider, useToast } from "@fabric-kit/components";
import Add from "@fabric-kit/icons/Add";
import Archive from "@fabric-kit/icons/Archive";
import Delete from "@fabric-kit/icons/Delete";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useMemo, useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { type FabricFilterValues, FabricListPage } from "../src";
import { INVOICE_COLUMNS, INVOICE_FILTERS, INVOICES, type Invoice } from "./invoices";

function useInvoiceList(initial: FabricFilterValues = {}, initialSearch = "") {
  const [rows, setRows] = useState(INVOICES);
  const [values, setValues] = useState<FabricFilterValues>(initial);
  const [search, setSearch] = useState(initialSearch);
  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const statuses = (values.status as string[] | undefined) ?? [];
    const owner = values.owner as string | undefined;
    return rows.filter(
      (r) =>
        (!q || r.customer.toLowerCase().includes(q) || r.id.toLowerCase().includes(q)) &&
        (statuses.length === 0 || statuses.includes(r.status)) &&
        (!owner || r.owner.toLowerCase().startsWith(owner)),
    );
  }, [rows, values, search]);
  return { rows, setRows, visible, values, setValues, search, setSearch };
}

type Args = Partial<React.ComponentProps<typeof FabricListPage<Invoice>>>;

function InvoicesPage(props: Args & { initial?: FabricFilterValues; initialSearch?: string }) {
  const { initial, initialSearch, ...rest } = props;
  const list = useInvoiceList(initial, initialSearch);
  const toast = useToast();
  return (
    <FabricListPage<Invoice>
      title="Invoices"
      description="Everything you've billed, newest first."
      primaryAction={
        <FabricButton variant="contained" startIcon={<Add />}>
          New invoice
        </FabricButton>
      }
      filterBar={{
        filters: INVOICE_FILTERS,
        values: list.values,
        onValuesChange: list.setValues,
        search: list.search,
        onSearchChange: list.setSearch,
        searchPlaceholder: "Search invoices",
      }}
      rows={list.visible}
      columns={INVOICE_COLUMNS}
      noun={["invoice", "invoices"]}
      exportable
      bulkActions={(ids, clear) => (
        <>
          <FabricButton
            variant="outlined"
            size="small"
            startIcon={<Archive />}
            onClick={() => {
              toast.success(`Archived ${ids.length} invoices`);
              clear();
            }}
          >
            Archive
          </FabricButton>
          <FabricButton
            variant="outlined"
            size="small"
            color="error"
            startIcon={<Delete />}
            onClick={() => {
              list.setRows((rows) => rows.filter((r) => !ids.includes(r.id)));
              toast.info(`Deleted ${ids.length} invoices`);
              clear();
            }}
          >
            Delete
          </FabricButton>
        </>
      )}
      gridProps={{
        initialState: { pagination: { paginationModel: { pageSize: 10 } } },
        pageSizeOptions: [10, 25],
      }}
      {...rest}
    />
  );
}

const meta = {
  title: "Patterns/List page",
  component: FabricListPage,
  tags: ["test"],
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <FabricToastProvider>
        <Story />
      </FabricToastProvider>
    ),
  ],
} satisfies Meta<typeof FabricListPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { title: "Invoices", rows: [], columns: [] },
  render: () => <InvoicesPage />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { level: 1, name: "Invoices" })).toBeVisible();
    await expect(canvas.getByText("28 results")).toBeVisible();

    // Search narrows the grid and the count.
    await userEvent.type(canvas.getByRole("textbox", { name: "Search invoices" }), "northwind");
    await waitFor(() => expect(canvas.getByText("4 results")).toBeVisible());

    // Selecting rows swaps the filter bar for the bulk action bar.
    const boxes = await canvas.findAllByRole("checkbox", { name: "Select row" });
    await userEvent.click(boxes[0]);
    await userEvent.click(boxes[1]);
    const bar = await canvas.findByRole("toolbar", { name: "Bulk actions" });
    await expect(within(bar).getByText("2 invoices selected")).toBeVisible();
    await userEvent.click(within(bar).getByRole("button", { name: "Delete" }));
    await waitFor(() => expect(canvas.getByText("2 results")).toBeVisible());
  },
};

export const NoResults: Story = {
  args: { title: "Invoices", rows: [], columns: [] },
  render: () => <InvoicesPage initialSearch="zzz" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: "No invoices match" })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Clear filters" }));
    await waitFor(() => expect(canvas.getByText("28 results")).toBeVisible());
  },
};

export const FirstRun: Story = {
  args: { title: "Invoices", rows: [], columns: [] },
  render: () => <InvoicesPage rows={[]} />,
};

export const Loading: Story = {
  args: { title: "Invoices", rows: [], columns: [] },
  render: () => <InvoicesPage loading rows={[]} />,
};

export const LoadError: Story = {
  args: { title: "Invoices", rows: [], columns: [] },
  render: () => (
    <InvoicesPage error="The invoices service didn't respond. Your data is safe." onRetry={() => {}} />
  ),
};
