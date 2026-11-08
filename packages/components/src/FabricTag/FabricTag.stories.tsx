import { Stack } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, within } from "storybook/test";

import { FabricTag, type FabricTagColor } from ".";

const statusColors: Exclude<FabricTagColor, "primary">[] = [
  "queued",
  "running",
  "success",
  "warning",
  "cancelled",
  "error",
  "suspended",
  "archived",
  "unknown",
];

const meta = {
  title: "Components/FabricTag",
  component: FabricTag,
  tags: ["test"],
  argTypes: {
    variant: { control: "inline-radio", options: ["standard", "color", "indicator", "outlined"] },
    color: { control: "select", options: [...statusColors, "primary"] },
    active: { control: "boolean" },
    disabled: { control: "boolean" },
  },
} as Meta<typeof FabricTag>;

export default meta;
type Story = StoryObj<typeof FabricTag>;

export const Default: Story = {
  args: { label: "Tag" },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("Tag")).toBeInTheDocument();
  },
};

export const StandardStates: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Default, active, disabled and deletable. Hover and pressed " +
          "states show when the tag is clickable.",
      },
    },
  },
  render: () => {
    const [active, setActive] = useState(false);
    return (
      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
        <FabricTag label="Default" />
        <FabricTag label="Clickable" active={active} onClick={() => setActive((a) => !a)} />
        <FabricTag label="Active" active />
        <FabricTag label="Disabled" disabled />
        <FabricTag label="Deletable" onDelete={() => undefined} />
      </Stack>
    );
  },
};

export const Colors: Story = {
  parameters: {
    docs: { description: { story: "Solid status fill with inverse text." } },
  },
  render: () => (
    <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
      {statusColors.map((color) => (
        <FabricTag key={color} label={color} variant="color" color={color} />
      ))}
    </Stack>
  ),
};

export const Indicators: Story = {
  parameters: {
    docs: {
      description: { story: "Tinted fill with a status dot." },
    },
  },
  render: () => (
    <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
      {statusColors.map((color) => (
        <FabricTag key={color} label={color} variant="indicator" color={color} />
      ))}
    </Stack>
  ),
};

export const Version: Story = {
  parameters: {
    docs: {
      description: {
        story: "For versions: outlined, with an optional muted second segment.",
      },
    },
  },
  render: () => (
    <Stack spacing={2} sx={{ alignItems: "flex-start" }}>
      <FabricTag label="Version: 1.2" variant="outlined" />
      <FabricTag label="Version: 1.2" secondaryLabel="Level: AAA" variant="outlined" />
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Level: AAA")).toBeInTheDocument();
  },
};

export const Dual: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Two segments. Fill uses `variant=\"color\"` with " +
          '`color="primary"`; outline uses `variant="outlined"`.',
      },
    },
  },
  render: () => (
    <Stack spacing={2} sx={{ alignItems: "flex-start" }}>
      <FabricTag label="Main" secondaryLabel="Sub" variant="color" color="primary" />
      <FabricTag label="Main" secondaryLabel="Sub" variant="outlined" />
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByText("Main")).toHaveLength(2);
    await expect(canvas.getAllByText("Sub")).toHaveLength(2);
  },
};

export const Deletable: Story = {
  args: { label: "Removable", onDelete: fn() },
  play: async ({ args, canvasElement }) => {
    const deleteIcon = canvasElement.querySelector<HTMLElement>(".MuiChip-deleteIcon");
    await expect(deleteIcon).not.toBeNull();
    if (deleteIcon) await userEvent.click(deleteIcon);
    await expect(args.onDelete).toHaveBeenCalledTimes(1);
  },
};

export const Disabled: Story = {
  args: { label: "Disabled", disabled: true, onClick: fn() },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button")).toHaveAttribute("aria-disabled", "true");
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};
