import { FabricButton } from "@fabric-kit/components";
import Archive from "@fabric-kit/icons/Archive";
import Delete from "@fabric-kit/icons/Delete";
import Download from "@fabric-kit/icons/Download";
import type { GridRowSelectionModel } from "@mui/x-data-grid";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import {
  emptySelection,
  FabricBulkActionBar,
  FabricDatagrid,
  getSelectedCount,
} from "../src";
import { baseColumns, sampleRows } from "./sampleData";

const actions = (
  <>
    <FabricButton variant="outlined" size="small" startIcon={<Download />}>
      Export
    </FabricButton>
    <FabricButton variant="outlined" size="small" startIcon={<Archive />}>
      Archive
    </FabricButton>
    <FabricButton variant="outlined" size="small" color="error" startIcon={<Delete />}>
      Delete
    </FabricButton>
  </>
);

const meta = {
  title: "Advanced Components/FabricBulkActionBar",
  component: FabricBulkActionBar,
  tags: ["test"],
  parameters: { layout: "padded" },
  args: {
    selectedCount: 3,
    noun: ["product", "products"],
    onClearSelection: fn(),
    actions,
    variant: "inline",
  },
  argTypes: {
    variant: { control: "radio", options: ["inline", "floating"] },
    actions: { control: false },
    moreActions: { control: false },
  },
} satisfies Meta<typeof FabricBulkActionBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const bar = canvas.getByRole("toolbar", { name: "Bulk actions" });
    await expect(within(bar).getByText("3 products selected")).toBeVisible();
    await userEvent.click(within(bar).getByRole("button", { name: "Clear selection" }));
    await expect(args.onClearSelection).toHaveBeenCalledTimes(1);
    // Escape inside the bar clears too.
    within(bar).getByRole("button", { name: "Export" }).focus();
    await userEvent.keyboard("{Escape}");
    await expect(args.onClearSelection).toHaveBeenCalledTimes(2);
  },
};

/** Offer "Select all N" when the grid shows one page of a larger result. */
export const SelectAllAcrossPages: Story = {
  args: { selectedCount: 25, totalCount: 1284, onSelectAll: fn() },
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Select all 1,284" }));
    await expect(args.onSelectAll).toHaveBeenCalled();
  },
};

export const WithMoreActions: Story = {
  args: {
    actions: (
      <FabricButton variant="outlined" size="small" startIcon={<Download />}>
        Export
      </FabricButton>
    ),
    moreActions: [{ label: "Change category" }, { label: "Duplicate" }, { label: "Archive" }],
  },
};

/** Narrow containers: the actions wrap under the count. */
export const Narrow: Story = {
  decorators: [(Story) => <div style={{ maxWidth: 360 }}>{Story()}</div>],
};

/** Hovers at the bottom of the viewport, for long pages. */
export const Floating: Story = {
  args: { variant: "floating" },
  parameters: { layout: "fullscreen" },
  render: (args) => (
    <div style={{ height: 400, padding: 24 }}>
      <p style={{ color: "var(--mui-palette-text-secondary)" }}>Page content scrolls under the bar.</p>
      <FabricBulkActionBar {...args} />
    </div>
  ),
};

/** Wired to a grid: select rows to show the bar, clear it with × or Escape. */
export const WithGrid: Story = {
  args: { selectedCount: 0 },
  render: function Render(args) {
    const [selection, setSelection] = useState<GridRowSelectionModel>(emptySelection);
    const [all, setAll] = useState(false);
    const count = getSelectedCount(selection, sampleRows.length);
    const clear = () => {
      setAll(false);
      setSelection(emptySelection());
    };
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ minHeight: 48 }}>
          <FabricBulkActionBar
            {...args}
            selectedCount={all ? 1284 : count}
            totalCount={1284}
            onSelectAll={() => setAll(true)}
            onClearSelection={clear}
          />
        </div>
        <FabricDatagrid
          rows={sampleRows.slice(0, 8)}
          columns={baseColumns}
          checkboxSelection
          disableRowSelectionOnClick
          hideFooter
          rowSelectionModel={selection}
          onRowSelectionModelChange={(m) => {
            setAll(false);
            setSelection(m);
          }}
        />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole("toolbar", { name: "Bulk actions" })).toBeNull();
    const boxes = await canvas.findAllByRole("checkbox", { name: "Select row" });
    await userEvent.click(boxes[0]);
    await userEvent.click(boxes[1]);
    const bar = await canvas.findByRole("toolbar", { name: "Bulk actions" });
    await expect(within(bar).getByText("2 products selected")).toBeVisible();
    await userEvent.click(within(bar).getByRole("button", { name: "Select all 1,284" }));
    await expect(within(bar).getByText("1,284 products selected")).toBeVisible();
    await userEvent.click(within(bar).getByRole("button", { name: "Clear selection" }));
    await waitFor(() => expect(canvas.queryByRole("toolbar")).toBeNull());
  },
};
