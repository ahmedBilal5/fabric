import { FabricButton } from "@fabric-kit/components";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { FabricSystemPage } from "../src/FabricSystemPage";

const meta = {
  title: "Patterns/System pages",
  component: FabricSystemPage,
  tags: ["test"],
  parameters: { layout: "fullscreen" },
  args: { kind: "not-found", fullHeight: true, homeHref: "#" },
  argTypes: {
    kind: {
      control: "radio",
      options: ["not-found", "forbidden", "no-access", "server-error", "maintenance"],
    },
    title: { control: "text" },
    description: { control: "text" },
    reference: { control: "text" },
    meta: { control: "text" },
    actions: { control: false },
    illustration: { control: false },
  },
} satisfies Meta<typeof FabricSystemPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NotFound: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { level: 1, name: "Page not found" })).toBeVisible();
    await expect(canvas.getByRole("link", { name: "Go to home" })).toHaveAttribute("href", "#");
  },
};

export const Forbidden: Story = { args: { kind: "forbidden" } };

const requestAccess = fn();

export const NoAccess: Story = {
  args: {
    kind: "no-access",
    title: "You don't have access to Northwind Finance",
    onRequestAccess: requestAccess,
  },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Request access" }));
    await expect(requestAccess).toHaveBeenCalled();
  },
};

const retry = fn();

export const ServerError: Story = {
  args: { kind: "server-error", onRetry: retry, reference: "req_8f3a2c19" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Reference: req_8f3a2c19")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Try again" }));
    await expect(retry).toHaveBeenCalled();
  },
};

export const Maintenance: Story = {
  args: {
    kind: "maintenance",
    meta: "We expect to be back by 14:00 UTC.",
    actions: (
      <FabricButton variant="outlined" href="#">
        Check the status page
      </FabricButton>
    ),
  },
};

/** Inside an app's content area: drop `fullHeight` and it centers in its container. */
export const InsideContent: Story = {
  args: { kind: "forbidden", fullHeight: false },
  render: (args) => (
    <div style={{ height: 520, border: "1px dashed var(--mui-palette-divider)" }}>
      <FabricSystemPage {...args} />
    </div>
  ),
};

export const CustomCopy: Story = {
  args: {
    kind: "not-found",
    title: "We couldn't find invoice INV-9999",
    description: "It may have been deleted, or the link may be out of date.",
    actions: <FabricButton variant="contained">Back to invoices</FabricButton>,
  },
};
