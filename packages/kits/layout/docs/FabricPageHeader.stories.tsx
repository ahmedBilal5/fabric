import {
  FabricAvatar,
  FabricButton,
  FabricProgressChip,
  FabricTag,
} from "@fabric-kit/components";
import Add from "@fabric-kit/icons/Add";
import Download from "@fabric-kit/icons/Download";
import Edit from "@fabric-kit/icons/Edit";
import { FabricStack, FabricText } from "@fabric-kit/primitives";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, screen, userEvent, within } from "storybook/test";
import { FabricPageHeader } from "../src/FabricPageHeader";

const meta = {
  title: "Kits/Layout/FabricPageHeader",
  component: FabricPageHeader,
  tags: ["test"],
  parameters: { layout: "padded" },
  args: {
    title: "Invoices",
    description: "Every invoice sent from Acme Workspace.",
  },
  argTypes: {
    title: { control: "text" },
    description: { control: "text" },
    meta: { control: "text" },
    divider: { control: "boolean" },
    sticky: { control: "boolean" },
    breadcrumbs: { control: false },
    actions: { control: false },
    moreActions: { control: false },
    tabs: { control: false },
    status: { control: false },
    icon: { control: false },
  },
} satisfies Meta<typeof FabricPageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A list page: title, description and the page's main actions. */
export const ListPage: Story = {
  args: {
    divider: true,
    actions: (
      <>
        <FabricButton variant="outlined" startIcon={<Download />}>
          Export
        </FabricButton>
        <FabricButton variant="contained" startIcon={<Add />}>
          New invoice
        </FabricButton>
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { level: 1, name: "Invoices" })).toBeVisible();
    await expect(canvas.getByRole("banner")).toBeInTheDocument();
  },
};

const duplicate = fn();

/** A record page: breadcrumbs, status, a meta line, actions and an overflow menu. */
export const DetailPage: Story = {
  args: {
    breadcrumbs: [
      { label: "Invoices", href: "#" },
      { label: "Acme", href: "#" },
      { label: "INV-1042", current: true },
    ],
    title: "INV-1042",
    description: undefined,
    status: <FabricTag variant="color" color="warning" label="Overdue" />,
    meta: "Acme · $12,400.00 · Due 12 March 2026 · Owner Priya Raman",
    actions: (
      <>
        <FabricButton variant="outlined" startIcon={<Edit />}>
          Edit
        </FabricButton>
        <FabricButton variant="contained">Record payment</FabricButton>
      </>
    ),
    moreActions: [
      { label: "Duplicate", onClick: duplicate },
      { label: "Download PDF", divideAfter: true },
      { label: "Void invoice" },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "More actions" }));
    await userEvent.click(await screen.findByRole("menuitem", { name: "Duplicate" }));
    await expect(duplicate).toHaveBeenCalled();
  },
};

/** Tabs split a record into sections. */
export const WithTabs: Story = {
  render: function Render(args) {
    const [tab, setTab] = useState("overview");
    return (
      <FabricStack gap="lg">
        <FabricPageHeader
          {...args}
          tabs={{
            value: tab,
            onChange: (_e, v) => setTab(v),
            items: [
              { value: "overview", label: "Overview" },
              { value: "invoices", label: "Invoices" },
              { value: "activity", label: "Activity" },
              { value: "settings", label: "Settings" },
            ],
          }}
        />
        <FabricText variant="body2" color="text.secondary">
          Showing the {tab} section.
        </FabricText>
      </FabricStack>
    );
  },
  args: {
    breadcrumbs: [{ label: "Customers", href: "#" }, { label: "Northwind Traders" }],
    title: "Northwind Traders",
    description: undefined,
    icon: <FabricAvatar name="Northwind Traders" />,
    status: <FabricProgressChip status="success" label="Active" />,
    meta: "Customer since 2021 · 214 invoices",
    actions: <FabricButton variant="contained">New invoice</FabricButton>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("tab", { name: "Activity" }));
    await expect(canvas.getByText("Showing the activity section.")).toBeVisible();
  },
};

const back = fn();

/** A back button instead of breadcrumbs, for a flow with one way back. */
export const WithBackButton: Story = {
  args: {
    onBack: back,
    title: "New invoice",
    description: "Draft · not sent yet",
    actions: (
      <>
        <FabricButton variant="outlined">Save draft</FabricButton>
        <FabricButton variant="contained">Send</FabricButton>
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Back" }));
    await expect(back).toHaveBeenCalled();
  },
};

export const TitleOnly: Story = {
  args: { description: undefined },
};

/** Long titles wrap, and the actions move under the title on narrow screens. */
export const LongContent: Story = {
  args: {
    title:
      "Quarterly reconciliation for Northwind Traders, Contoso Pharmaceuticals and Globex International",
    status: <FabricTag variant="color" color="running" label="In review" />,
    description:
      "Compare each customer's statements with the ledger, flag mismatches and send the summary to finance before the close on 31 March.",
    actions: (
      <>
        <FabricButton variant="outlined">Assign</FabricButton>
        <FabricButton variant="contained">Approve all</FabricButton>
      </>
    ),
    moreActions: [{ label: "Export" }, { label: "Archive" }],
  },
};

export const Mobile: Story = {
  ...DetailPage,
  globals: { viewport: { value: "fabricMobile" } },
  play: undefined,
};
