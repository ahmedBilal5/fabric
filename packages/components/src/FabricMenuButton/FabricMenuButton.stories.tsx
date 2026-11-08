import ArchiveIcon from "@fabric-kit/icons/Archive";
import ContentCopyIcon from "@fabric-kit/icons/ContentCopy";
import DeleteIcon from "@fabric-kit/icons/Delete";
import EditIcon from "@fabric-kit/icons/Edit";
import MoreHorizIcon from "@fabric-kit/icons/MoreHoriz";
import SettingsIcon from "@fabric-kit/icons/Settings";
import { Box, Chip, MenuItem, Stack } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { expect, screen, userEvent, within } from "storybook/test";
import { FabricMenuButton } from ".";

const meta = {
  title: "Components/FabricMenuButton",
  component: FabricMenuButton,
  tags: ["test"],
  parameters: {
    docs: {
      description: {
        component:
          "**Compound**: trigger + FabricMenu. An IconButton (or custom `trigger`) inside an optional Tooltip, " +
          "opening a FabricMenu on click. Manages `anchorEl` internally by default; pass " +
          "`open` + `onClose` to control externally. Items are declared via `items` or " +
          "arbitrary `children`. If you already own the trigger, use `FabricMenu` directly.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

// ─── Basics ─────────────────────────────────────────────────────────────────

export const Default: Story = {
  name: "Default — MoreVert icon",
  args: {
    tooltip: "More actions",
    items: [
      { label: "Edit", icon: <EditIcon fontSize="small" /> },
      { label: "Duplicate", icon: <ContentCopyIcon fontSize="small" /> },
      { label: "Delete", icon: <DeleteIcon fontSize="small" /> },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The default trigger is a bare IconButton (no aria-label) — the only button in the canvas.
    await userEvent.click(canvas.getByRole("button"));
    await expect(await screen.findByRole("menuitem", { name: /edit/i })).toBeInTheDocument();
  },
};

export const CustomIcon: Story = {
  name: "Custom trigger icon",
  args: {
    tooltip: "Settings",
    icon: <SettingsIcon />,
    items: [
      { label: "Preferences" },
      { label: "Account" },
      { label: "Sign out", divideAfter: false },
    ],
  },
};

export const NoTooltip: Story = {
  name: "No tooltip",
  args: {
    icon: <MoreHorizIcon />,
    items: [{ label: "Option A" }, { label: "Option B" }],
  },
};

// ─── Item variations ────────────────────────────────────────────────────────

export const WithDividers: Story = {
  name: "Items with dividers",
  args: {
    tooltip: "Actions",
    items: [
      { label: "Edit", icon: <EditIcon fontSize="small" /> },
      { label: "Duplicate", icon: <ContentCopyIcon fontSize="small" />, divideAfter: true },
      { label: "Archive", icon: <ArchiveIcon fontSize="small" />, disabled: true },
      { label: "Delete", icon: <DeleteIcon fontSize="small" /> },
    ],
  },
};

export const CustomChildren: Story = {
  name: "Custom children (advanced)",
  parameters: {
    docs: {
      description: {
        story:
          "When the item list is too dynamic for `items`, pass arbitrary `children`. " +
          "`items` and `children` are mutually exclusive — if both are set, `children` is ignored.",
      },
    },
  },
  render: () => (
    <FabricMenuButton tooltip="Advanced">
      <MenuItem>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <EditIcon fontSize="small" />
          <span>Edit</span>
          <Chip size="small" label="Ctrl+E" variant="outlined" />
        </Stack>
      </MenuItem>
      <MenuItem>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <DeleteIcon fontSize="small" />
          <span>Delete</span>
          <Chip size="small" label="Del" variant="outlined" color="error" />
        </Stack>
      </MenuItem>
    </FabricMenuButton>
  ),
};

// ─── Controlled ─────────────────────────────────────────────────────────────

export const Controlled: Story = {
  name: "Controlled open state",
  render: () => {
    const [open, setOpen] = React.useState(false);
    return (
      <Stack spacing={2} direction="row" sx={{ alignItems: "center" }}>
        <FabricMenuButton
          tooltip="Controlled"
          open={open}
          onClose={() => setOpen(false)}
          onOpen={() => setOpen(true)}
          items={[
            { label: "Edit", onClick: () => setOpen(false) },
            { label: "Delete", onClick: () => setOpen(false) },
          ]}
        />
        <span>Open: {String(open)}</span>
      </Stack>
    );
  },
};

// ─── Custom trigger ─────────────────────────────────────────────────────────

export const CustomTrigger: Story = {
  name: "Custom trigger (not IconButton)",
  args: {
    trigger: <Box sx={{ px: 2, py: 1, bgcolor: "action.selected", borderRadius: 1 }}>Click me</Box>,
    items: [{ label: "Item A" }, { label: "Item B" }],
  },
};

// ─── Kitchen sink ───────────────────────────────────────────────────────────

export const KitchenSink: Story = {
  name: "Kitchen sink",
  args: {
    tooltip: "Row actions",
    testId: "row-actions",
    items: [
      { label: "Edit", icon: <EditIcon fontSize="small" />, testId: "edit" },
      {
        label: "Duplicate",
        icon: <ContentCopyIcon fontSize="small" />,
        testId: "dup",
        divideAfter: true,
      },
      { label: "Archive", icon: <ArchiveIcon fontSize="small" />, testId: "arc", disabled: true },
      { label: "Delete", icon: <DeleteIcon fontSize="small" />, testId: "del" },
    ],
    anchorOrigin: { vertical: "bottom", horizontal: "right" },
    transformOrigin: { vertical: "top", horizontal: "right" },
  },
};
