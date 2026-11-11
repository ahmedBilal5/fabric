import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { CardContent } from "@mui/material";
import { FabricCard } from "../FabricCard";
import { FabricCardHeader } from "../FabricCard/FabricCardHeader";
import { FabricRelativeTime } from "../FabricRelativeTime";
import { FabricStatus } from "../FabricStatus";
import { type FabricKeyValueItem, FabricKeyValueList } from ".";

const invoice: FabricKeyValueItem[] = [
  { label: "Customer", value: "Northwind Traders" },
  { label: "Status", value: <FabricStatus status="success" label="Paid" /> },
  { label: "Invoice ID", value: "INV-2041", copyable: true },
  { label: "Amount", value: "$12,480.00" },
  { label: "Issued", value: "12 Mar 2026" },
  {
    label: "Due",
    value: "11 Apr 2026",
    hint: "Net 30",
  },
  { label: "Purchase order", value: null },
  {
    label: "Updated",
    value: <FabricRelativeTime date={Date.now() - 2 * 3600_000} />,
  },
];

const meta = {
  title: "Components/FabricKeyValueList",
  component: FabricKeyValueList,
  tags: ["test"],
  args: { items: invoice, layout: "horizontal", columns: 1, dense: false, dividers: false },
  argTypes: {
    layout: { control: "radio", options: ["horizontal", "stacked"] },
    columns: { control: "radio", options: [1, 2] },
    items: { control: false },
  },
  decorators: [(Story) => <div style={{ maxWidth: 720 }}>{Story()}</div>],
} satisfies Meta<typeof FabricKeyValueList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const terms = canvasElement.querySelectorAll("dt");
    await expect(terms).toHaveLength(invoice.length);
    // Empty values show the placeholder.
    await expect(canvas.getByText("—")).toBeVisible();
    // Copy button. Headless browsers block the real clipboard, so stub it.
    const writeText = fn(async () => {});
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    await userEvent.click(canvas.getByRole("button", { name: "Copy Invoice ID" }));
    await waitFor(() =>
      expect(canvas.getByRole("button", { name: "Invoice ID copied" })).toBeInTheDocument(),
    );
    await expect(writeText).toHaveBeenCalledWith("INV-2041");
  },
};

export const TwoColumns: Story = {
  args: {
    columns: 2,
    items: [
      ...invoice,
      {
        label: "Notes",
        value:
          "Deliver to the loading dock at the rear of the building. Call ahead on 555-0142 if the gate is closed.",
        fullWidth: true,
      },
    ],
  },
};

export const Stacked: Story = { args: { layout: "stacked", columns: 2 } };

export const WithDividers: Story = { args: { dividers: true } };

/** `dense` for side panels and cards. */
export const InACard: Story = {
  args: { dense: true, items: invoice.slice(0, 5), labelWidth: 112 },
  render: (args) => (
    <div style={{ maxWidth: 360 }}>
      <FabricCard>
        <FabricCardHeader title="Summary" />
        <CardContent>
          <FabricKeyValueList {...args} />
        </CardContent>
      </FabricCard>
    </div>
  ),
};

export const LongValues: Story = {
  args: {
    items: [
      {
        label: "API key",
        value: "example-key-0000-aaaa-bbbb-cccc-dddd-eeee-ffff-1111-2222-3333",
        copyable: true,
      },
      {
        label: "A label that is long enough to wrap onto a second line",
        value: "https://example.com/a/very/long/path/that/keeps/going/and/going?with=query&params=1",
      },
    ],
  },
};
