import { Stack } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { FabricButton } from "../FabricButton";
import { FabricInformationBar, type FabricInformationBarProps } from ".";

const meta: Meta<FabricInformationBarProps> = {
  title: "Components/FabricInformationBar",
  component: FabricInformationBar,
  tags: ["test", "autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "information", "success", "warning", "cancelled", "urgent"],
    },
  },
  args: {
    variant: "default",
    children: "Details and updates about system-related activities are displayed here.",
  },
  parameters: {
    docs: {
      description: {
        component:
          "Thin single-line status bar: an icon, " +
          "one line of text, an optional `action`, and a close button when `onClose` is passed. " +
          "Use it for passive page-level notices; use `FabricAlert` for a bordered card with a title.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<FabricInformationBarProps>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("status")).toHaveTextContent(/system-related activities/i);
  },
};

const VARIANTS = ["default", "information", "success", "warning", "cancelled", "urgent"] as const;

export const AllStates: Story = {
  name: "All states",
  parameters: { layout: "padded" },
  render: () => (
    <Stack spacing={1} sx={{ maxWidth: 920 }}>
      {VARIANTS.map((variant) => (
        <FabricInformationBar key={variant} variant={variant} onClose={() => {}}>
          Details and updates about system-related activities are displayed here for user
          awareness.
        </FabricInformationBar>
      ))}
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // `urgent` is announced assertively; the other five politely.
    await expect(canvas.getAllByRole("alert")).toHaveLength(1);
    await expect(canvas.getAllByRole("status")).toHaveLength(5);
  },
};

export const WithAction: Story = {
  name: "With action",
  render: (args) => (
    <FabricInformationBar {...args} variant="information" action={<FabricButton size="small">Action</FabricButton>}>
      A new version of this page is available.
    </FabricInformationBar>
  ),
};

export const Dismissible: Story = {
  args: { variant: "warning", onClose: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /close/i }));
    await expect(args.onClose).toHaveBeenCalledOnce();
  },
};

export const LongText: Story = {
  name: "Long text wraps",
  args: {
    variant: "information",
    onClose: fn(),
    children:
      "Details and updates about system-related activities are displayed here for user awareness. ".repeat(
        4,
      ),
  },
};

export const NoIcon: Story = {
  name: "Suppress icon",
  args: { variant: "success", icon: false },
};
