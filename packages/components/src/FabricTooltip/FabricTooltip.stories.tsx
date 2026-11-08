import DeleteIcon from "@fabric-kit/icons/Delete";
import InfoOutlinedIcon from "@fabric-kit/icons/InfoOutlined";
import KeyboardIcon from "@fabric-kit/icons/Keyboard";
import { Box, Button, IconButton, Stack, Typography } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, screen, userEvent, within } from "storybook/test";

import { FabricTooltip } from ".";

const meta = {
  title: "Components/FabricTooltip",
  component: FabricTooltip,
  tags: ["test"],
  parameters: {
    docs: {
      description: {
        component:
          "Extends MUI `Tooltip` (the full `TooltipProps` surface) " +
          "with Fabric's tooltip look: navy `dark` variant by default, white `light` " +
          "variant via `variant`. Typography, padding, radius and shadow " +
          "come from `@fabric-kit/design-tokens`. `title` accepts any `ReactNode` " +
          "(icons + text, formatted labels, keyboard shortcuts). Defaults `arrow={true}`. " +
          "Override the look with `slotProps.tooltip.sx` and `slotProps.arrow.sx`; " +
          "your values win on any key you set.",
      },
    },
  },
  argTypes: {
    placement: {
      control: "select",
      options: [
        "top",
        "top-start",
        "top-end",
        "bottom",
        "bottom-start",
        "bottom-end",
        "left",
        "left-start",
        "left-end",
        "right",
        "right-start",
        "right-end",
      ],
    },
    arrow: { control: "boolean" },
    variant: { control: "inline-radio", options: ["dark", "light"] },
    disableHoverListener: { control: "boolean" },
    disableFocusListener: { control: "boolean" },
    followCursor: { control: "boolean" },
    enterDelay: { control: "number" },
    leaveDelay: { control: "number" },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

// ─── Basics ─────────────────────────────────────────────────────────────────

export const Default: Story = {
  args: {
    title: "Save your changes",
    children: <Button variant="outlined">Save</Button>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.hover(canvas.getByRole("button", { name: /save/i }));
    // Tooltip renders in a Portal.
    await expect(await screen.findByRole("tooltip")).toHaveTextContent(/save your changes/i);
  },
};

export const AllPlacements: Story = {
  name: "All placements",
  render: () => (
    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 4, p: 6 }}>
      {(
        [
          "top",
          "top-start",
          "top-end",
          "left",
          "right",
          "left-start",
          "right-start",
          "left-end",
          "right-end",
          "bottom",
          "bottom-start",
          "bottom-end",
        ] as const
      ).map((placement) => (
        <FabricTooltip key={placement} title={placement} placement={placement}>
          <Button variant="outlined" size="small">
            {placement}
          </Button>
        </FabricTooltip>
      ))}
    </Box>
  ),
};

export const Variants: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "`dark` (navy, default) and `light` (white). " +
          "Both are forced open here so they can be compared. Switch the theme to dark to see the " +
          "dark counterparts: `dark` becomes a light navy tooltip, `light` becomes a navy surface.",
      },
    },
  },
  render: () => (
    <Stack direction="row" spacing={8} sx={{ p: 8 }}>
      <FabricTooltip open title="Tooltip goes here" placement="top" variant="dark">
        <Button variant="outlined">Dark</Button>
      </FabricTooltip>
      <FabricTooltip open title="Tooltip goes here" placement="top" variant="light">
        <Button variant="outlined">Light</Button>
      </FabricTooltip>
    </Stack>
  ),
};

export const WithoutArrow: Story = {
  name: "Without arrow",
  args: {
    title: "No arrow",
    arrow: false,
    children: <Button variant="outlined">Hover me</Button>,
  },
};

// ─── Rich content ───────────────────────────────────────────────────────────

export const RichContent: Story = {
  name: "Rich content — icon + text",
  parameters: {
    docs: {
      description: {
        story:
          "`title` is a `ReactNode`, so you can compose icons, formatted text, keyboard hints, or " +
          "multi-line content.",
      },
    },
  },
  render: () => (
    <Stack direction="row" spacing={4}>
      <FabricTooltip
        title={
          <Stack direction="row" sx={{ alignItems: "center" }} spacing={1}>
            <InfoOutlinedIcon fontSize="small" />
            <span>Icon + label composed inline</span>
          </Stack>
        }
      >
        <IconButton size="small">
          <InfoOutlinedIcon />
        </IconButton>
      </FabricTooltip>

      <FabricTooltip
        title={
          <Stack spacing={0.5}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>
              Delete selected rows
            </Typography>
            <Typography variant="caption">Permanent — cannot be undone</Typography>
          </Stack>
        }
      >
        <IconButton size="small">
          <DeleteIcon />
        </IconButton>
      </FabricTooltip>

      <FabricTooltip
        title={
          <Stack direction="row" sx={{ alignItems: "center" }} spacing={1}>
            <KeyboardIcon fontSize="small" />
            <span>Save</span>
            <Box
              component="kbd"
              sx={{
                border: "1px solid rgba(255,255,255,0.4)",
                borderRadius: 0.5,
                px: 0.5,
                fontSize: 10,
                fontFamily: "monospace",
              }}
            >
              Ctrl+S
            </Box>
          </Stack>
        }
      >
        <Button variant="outlined" size="small">
          Save
        </Button>
      </FabricTooltip>
    </Stack>
  ),
};

// ─── Timing & behavior ──────────────────────────────────────────────────────

export const Delayed: Story = {
  name: "With enter/leave delays",
  args: {
    title: "Waited 500ms before showing, 200ms after leaving",
    enterDelay: 500,
    leaveDelay: 200,
    children: <Button variant="outlined">Hover slowly</Button>,
  },
};

export const FollowCursor: Story = {
  name: "Follows the cursor",
  args: {
    title: "This tooltip follows the mouse",
    followCursor: true,
    children: (
      <Box
        sx={{
          width: 300,
          height: 120,
          border: "1px dashed",
          borderColor: "divider",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Move the cursor around inside this box
      </Box>
    ),
  },
};

// ─── Consumer overrides ─────────────────────────────────────────────────────

export const ConsumerSxOverride: Story = {
  name: "Consumer sx wins",
  parameters: {
    docs: {
      description: {
        story:
          "Consumer overrides via `slotProps.tooltip.sx` merge with the DS defaults — " +
          "the consumer's explicit keys win. Here the background is switched to `error.main` " +
          "while padding + border-radius inherit from the DS.",
      },
    },
  },
  args: {
    title: "Consumer-styled destructive warning",
    slotProps: {
      tooltip: { sx: { backgroundColor: "error.main" } },
      arrow: { sx: { color: "error.main" } },
    },
    children: (
      <IconButton size="small">
        <DeleteIcon color="error" />
      </IconButton>
    ),
  },
};

// ─── Kitchen sink ───────────────────────────────────────────────────────────

export const KitchenSink: Story = {
  render: () => (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Typography variant="overline">Basic + placement</Typography>
        <Stack direction="row" spacing={2}>
          <FabricTooltip title="Top" placement="top">
            <Button variant="outlined" size="small">
              Top
            </Button>
          </FabricTooltip>
          <FabricTooltip title="Left" placement="left">
            <Button variant="outlined" size="small">
              Left
            </Button>
          </FabricTooltip>
          <FabricTooltip title="Right" placement="right">
            <Button variant="outlined" size="small">
              Right
            </Button>
          </FabricTooltip>
          <FabricTooltip title="Bottom" placement="bottom">
            <Button variant="outlined" size="small">
              Bottom
            </Button>
          </FabricTooltip>
        </Stack>
      </Stack>

      <Stack spacing={1}>
        <Typography variant="overline">Icon-anchored</Typography>
        <Stack direction="row" spacing={1}>
          <FabricTooltip title="Info">
            <IconButton size="small">
              <InfoOutlinedIcon />
            </IconButton>
          </FabricTooltip>
          <FabricTooltip title="Keyboard shortcut">
            <IconButton size="small">
              <KeyboardIcon />
            </IconButton>
          </FabricTooltip>
          <FabricTooltip title="Delete permanently" placement="top">
            <IconButton size="small">
              <DeleteIcon />
            </IconButton>
          </FabricTooltip>
        </Stack>
      </Stack>

      <Stack spacing={1}>
        <Typography variant="overline">Arrow vs no arrow</Typography>
        <Stack direction="row" spacing={2}>
          <FabricTooltip title="With arrow (default)">
            <Button variant="outlined" size="small">
              Arrow
            </Button>
          </FabricTooltip>
          <FabricTooltip title="Without arrow" arrow={false}>
            <Button variant="outlined" size="small">
              No arrow
            </Button>
          </FabricTooltip>
        </Stack>
      </Stack>
    </Stack>
  ),
};
