import type { Meta, StoryObj } from "@storybook/react-vite";
import DeleteIcon from "@fabric-kit/icons/Delete";
import EditIcon from "@fabric-kit/icons/Edit";
import { expect, fn, userEvent, within } from "storybook/test";
import { Stack } from "@mui/material";

import { FabricIconButton } from ".";

const meta = {
  title: "Components/FabricIconButton",
  component: FabricIconButton,
  tags: ["test"],
  parameters: {
    docs: {
      description: {
        component:
          "Icon-only button: a fixed 26px square with the same `variant` " +
          '(`text`, `outlined`, `contained`) and `shape` (`standard` 4px, `round` 24px) as `FabricButton`. ' +
          "Extends MUI `IconButton`. `aria-label` is required because there is no visible label.",
      },
    },
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["text", "outlined", "contained"] },
    shape: { control: "inline-radio", options: ["standard", "round"] },
    color: { control: "select", options: ["primary", "error", "info", "success", "warning"] },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof FabricIconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { "aria-label": "Edit", children: <EditIcon />, onClick: fn() },
  play: async ({ args, canvasElement }) => {
    const button = within(canvasElement).getByRole("button", { name: "Edit" });
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
    await expect(button.getBoundingClientRect().width).toBe(26);
    await expect(button.getBoundingClientRect().height).toBe(26);
  },
};

export const Keyboard: Story = {
  args: { "aria-label": "Edit", children: <EditIcon />, onClick: fn() },
  play: async ({ args, canvasElement }) => {
    const button = within(canvasElement).getByRole("button", { name: "Edit" });
    await userEvent.tab();
    await expect(button).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard(" ");
    await expect(args.onClick).toHaveBeenCalledTimes(2);
  },
};

export const Variants: Story = {
  args: { "aria-label": "Delete" },
  render: (args) => (
    <Stack direction="row" spacing={2}>
      {(["text", "outlined", "contained"] as const).map((variant) => (
        <FabricIconButton key={variant} {...args} variant={variant}>
          <DeleteIcon />
        </FabricIconButton>
      ))}
    </Stack>
  ),
};

export const Shapes: Story = {
  args: { "aria-label": "Edit", variant: "contained" },
  render: (args) => (
    <Stack direction="row" spacing={2}>
      <FabricIconButton {...args} shape="standard">
        <EditIcon />
      </FabricIconButton>
      <FabricIconButton {...args} shape="round">
        <EditIcon />
      </FabricIconButton>
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    const [standard, round] = within(canvasElement).getAllByRole("button", { name: "Edit" });
    await expect(getComputedStyle(standard).borderRadius).toBe("4px");
    await expect(getComputedStyle(round).borderRadius).toBe("24px");
  },
};

export const Colors: Story = {
  args: { "aria-label": "Delete" },
  render: (args) => (
    <Stack spacing={2}>
      {(["primary", "error", "info", "success", "warning"] as const).map((color) => (
        <Stack key={color} direction="row" spacing={2}>
          {(["text", "outlined", "contained"] as const).map((variant) => (
            <FabricIconButton key={variant} {...args} color={color} variant={variant}>
              <DeleteIcon />
            </FabricIconButton>
          ))}
        </Stack>
      ))}
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    // Rows are primary, error, info, success, warning; columns are text, outlined, contained.
    const buttons = within(canvasElement).getAllByRole("button", { name: "Delete" });
    await expect(buttons).toHaveLength(15);
    const color = (i: number) => getComputedStyle(buttons[i]).color;
    // Primary text and error text must differ; every semantic color differs from primary.
    for (const row of [1, 2, 3, 4]) {
      await expect(color(row * 3)).not.toBe(color(0));
    }
  },
};

export const Disabled: Story = {
  args: {
    "aria-label": "Delete",
    disabled: true,
    variant: "outlined",
    children: <DeleteIcon />,
    onClick: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const button = within(canvasElement).getByRole("button", { name: "Delete" });
    await expect(button).toBeDisabled();
    await userEvent.click(button, { pointerEventsCheck: 0 });
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const DarkMode: Story = {
  args: { "aria-label": "Edit", variant: "contained", children: <EditIcon /> },
  render: (args) => (
    <Stack direction="row" spacing={2}>
      <FabricIconButton {...args} />
      <div className="dark">
        <FabricIconButton {...args} />
      </div>
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    const [light, night] = within(canvasElement).getAllByRole("button", { name: "Edit" });
    // Each button takes the primary color of its own scheme, whatever the theme's brand.
    const fill = (el: HTMLElement) => getComputedStyle(el).backgroundColor;
    await expect(fill(light)).not.toBe("rgba(0, 0, 0, 0)");
    await expect(fill(night)).not.toBe("rgba(0, 0, 0, 0)");
    await expect(fill(light)).not.toBe(fill(night));
  },
};
