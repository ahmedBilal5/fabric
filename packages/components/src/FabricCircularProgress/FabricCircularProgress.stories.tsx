import { Box, Button, Stack, Typography } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";

import { FabricCircularProgress } from ".";

const meta = {
  title: "Components/FabricCircularProgress",
  component: FabricCircularProgress,
  tags: ["test"],
  parameters: {
    docs: {
      description: {
        component:
          "Design-system loading spinner. Extends MUI `CircularProgress`; the one " +
          "change is that `size` defaults to `24` (MUI's default is `40`), which suits " +
          "buttons, rows and dense layouts. All MUI props are typed and pass through.",
      },
    },
  },
  argTypes: {
    size: { control: { type: "number", min: 8, max: 128, step: 2 } },
    thickness: { control: { type: "number", min: 1, max: 10, step: 0.5 } },
    variant: { control: "inline-radio", options: ["indeterminate", "determinate"] },
    value: { control: { type: "number", min: 0, max: 100, step: 5 } },
    color: {
      control: "select",
      options: ["primary", "secondary", "error", "info", "success", "warning", "inherit"],
    },
    disableShrink: { control: "boolean" },
  },
} as Meta<typeof FabricCircularProgress>;

export default meta;
type Story = StoryObj<typeof FabricCircularProgress>;

// ─── Basics ─────────────────────────────────────────────────────────────────

export const Default: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("progressbar")).toBeInTheDocument();
  },
};

export const AllSizes: Story = {
  render: () => (
    <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
      <FabricCircularProgress size={14} />
      <FabricCircularProgress size={16} />
      <FabricCircularProgress size={20} />
      <FabricCircularProgress size={24} />
      <FabricCircularProgress size={32} />
      <FabricCircularProgress size={40} />
      <FabricCircularProgress size={56} />
    </Stack>
  ),
};

export const StringSize: Story = {
  render: () => (
    <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
      <FabricCircularProgress size="1rem" />
      <FabricCircularProgress size="1.5rem" />
      <FabricCircularProgress size="2rem" />
      <FabricCircularProgress size="3rem" />
    </Stack>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "`size` accepts a `number` (px) or a `string` (any CSS length).",
      },
    },
  },
};

export const AllColors: Story = {
  render: () => (
    <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
      <FabricCircularProgress color="primary" />
      <FabricCircularProgress color="secondary" />
      <FabricCircularProgress color="success" />
      <FabricCircularProgress color="info" />
      <FabricCircularProgress color="warning" />
      <FabricCircularProgress color="error" />
    </Stack>
  ),
};

export const Thickness: Story = {
  render: () => (
    <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
      <FabricCircularProgress thickness={2} />
      <FabricCircularProgress thickness={3.6} />
      <FabricCircularProgress thickness={5} />
      <FabricCircularProgress thickness={7} />
    </Stack>
  ),
};

// ─── Variants ───────────────────────────────────────────────────────────────

export const Indeterminate: Story = {
  args: { variant: "indeterminate" },
};

export const Determinate: Story = {
  args: { variant: "determinate", value: 65 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // In determinate mode MUI reflects the value via aria-valuenow.
    await expect(canvas.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "65");
  },
};

export const DeterminateProgression: Story = {
  render: () => (
    <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
      <FabricCircularProgress variant="determinate" value={10} />
      <FabricCircularProgress variant="determinate" value={30} />
      <FabricCircularProgress variant="determinate" value={50} />
      <FabricCircularProgress variant="determinate" value={75} />
      <FabricCircularProgress variant="determinate" value={100} />
    </Stack>
  ),
};

export const DeterminateWithLabel: Story = {
  render: () => {
    const value = 72;
    return (
      <Box sx={{ position: "relative", display: "inline-flex" }}>
        <FabricCircularProgress variant="determinate" value={value} size={56} />
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: "absolute",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography variant="caption" component="div" color="text.secondary">
            {`${value}%`}
          </Typography>
        </Box>
      </Box>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "A percentage label overlay is the most common composition — wrap the " +
          "spinner in a positioned `Box` and drop a `Typography` on top.",
      },
    },
  },
};

// ─── Common patterns ───────────────────────────────────────────────

export const InsideButton: Story = {
  render: () => (
    <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
      <Button variant="contained" disabled>
        <FabricCircularProgress size={16} color="inherit" sx={{ marginRight: 1 }} />
        Saving…
      </Button>
      <Button variant="outlined" disabled>
        <FabricCircularProgress size={16} color="inherit" sx={{ marginRight: 1 }} />
        Loading…
      </Button>
    </Stack>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'A spinner inside a disabled button: `size={16}` with `color="inherit"` so it ' +
          "matches the label. `FabricButton` has a built-in `loading` prop that does this for you.",
      },
    },
  },
};

export const InsideTableRow: Story = {
  render: () => (
    <Stack spacing={1}>
      <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
        <Typography variant="body2">Row loading…</Typography>
        <FabricCircularProgress size={14} thickness={5} />
      </Stack>
      <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
        <Typography variant="body2">Row loading…</Typography>
        <FabricCircularProgress size={20} />
      </Stack>
    </Stack>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Inline spinners inside dense table rows / tree items typically use " +
          "`size={14–20}` and a heavier `thickness={5}` to stay visible at small " +
          "sizes.",
      },
    },
  },
};
