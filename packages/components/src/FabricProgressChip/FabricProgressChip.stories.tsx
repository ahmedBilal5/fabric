import SyncIcon from "@fabric-kit/icons/Sync";
import { Stack, Typography } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";

import { FabricProgressChip } from ".";

const meta = {
  title: "Components/FabricProgressChip",
  component: FabricProgressChip,
  tags: ["test"],
  parameters: {
    docs: {
      description: {
        component:
          "Sync-status chip with an animated fill effect. Four states — " +
          "`idle` / `loading` / `success` / `error` — each with a pastel " +
          "background, high-contrast text, a state-appropriate default icon, " +
          "and a per-instance scoped keyframe animation. Respects " +
          "`prefers-reduced-motion`. Renders a real `<Chip>` in every mode " +
          "(including icon-only).",
      },
    },
  },
  argTypes: {
    status: {
      control: "inline-radio",
      options: ["idle", "loading", "success", "error"],
    },
    label: { control: "text" },
    size: { control: "inline-radio", options: ["small", "medium"] },
  },
} as Meta<typeof FabricProgressChip>;

export default meta;
type Story = StoryObj<typeof FabricProgressChip>;

// ─── Basics ─────────────────────────────────────────────────────────────────

export const Default: Story = {
  args: { status: "success", label: "Saved" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Saved")).toBeInTheDocument();
  },
};

export const AllStates: Story = {
  render: () => (
    <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
      <FabricProgressChip status="idle" label="Idle" />
      <FabricProgressChip status="loading" label="Syncing..." />
      <FabricProgressChip status="success" label="Saved" />
      <FabricProgressChip status="error" label="Failed" />
    </Stack>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "The four states with their default icons. `loading` animates " +
          "infinitely; `idle` / `success` / `error` animate once on mount and " +
          "stop.",
      },
    },
  },
};

export const IconOnly: Story = {
  render: () => (
    <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
      <FabricProgressChip status="idle" />
      <FabricProgressChip status="loading" />
      <FabricProgressChip status="success" />
      <FabricProgressChip status="error" />
    </Stack>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Icon-only mode — pass no `label`, the chip collapses its label slot " +
          "and renders as a compact status icon with the same color and animation.",
      },
    },
  },
};

export const CustomIcon: Story = {
  render: () => (
    <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
      <FabricProgressChip status="loading" label="Syncing..." icon={<SyncIcon />} />
      <FabricProgressChip status="loading" label="Uploading" icon={<SyncIcon />} />
    </Stack>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "`icon` overrides the state default and keeps its own `sx`.",
      },
    },
  },
};

// ─── Consumer patterns ──────────────────────────────────────────────────────

export const AutoSaveStates: Story = {
  render: () => (
    <Stack spacing={2}>
      <Typography variant="body2" color="text.secondary">
        Auto-save chip in a document header
      </Typography>
      <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
        <Typography variant="body2">Draft:</Typography>
        <FabricProgressChip status="idle" label="Unsaved changes" />
      </Stack>
      <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
        <Typography variant="body2">Draft:</Typography>
        <FabricProgressChip status="loading" label="Saving..." />
      </Stack>
      <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
        <Typography variant="body2">Draft:</Typography>
        <FabricProgressChip status="success" label="Saved" />
      </Stack>
      <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
        <Typography variant="body2">Draft:</Typography>
        <FabricProgressChip status="error" label="Save failed" />
      </Stack>
    </Stack>
  ),
};

export const ManyOnPage: Story = {
  render: () => (
    <Stack spacing={1}>
      <Typography variant="body2" color="text.secondary">
        Multiple chips animate independently, each in its own state color.
      </Typography>
      {["idle", "loading", "success", "error", "loading", "success"].map((status, i) => (
        <FabricProgressChip key={i} status={status as any} label={`Item ${i + 1} — ${status}`} />
      ))}
    </Stack>
  ),
};
