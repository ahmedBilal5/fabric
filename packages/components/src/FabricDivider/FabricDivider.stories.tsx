import { Box, Stack, Typography } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { expect, within } from "storybook/test";

import { FabricDivider } from ".";

const meta = {
  title: "Components/FabricDivider",
  component: FabricDivider,
  tags: ["test"],
  parameters: {
    docs: {
      description: {
        component:
          "Section separator. Extends MUI `Divider` verbatim — every prop, " +
          "every variant, every orientation passes through unchanged.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["fullWidth", "inset", "middle"],
    },
    orientation: {
      control: "inline-radio",
      options: ["horizontal", "vertical"],
    },
    textAlign: {
      control: "inline-radio",
      options: ["left", "center", "right"],
    },
    flexItem: { control: "boolean" },
  },
} as Meta<typeof FabricDivider>;

export default meta;
type Story = StoryObj<typeof FabricDivider>;

// ─── Basics ─────────────────────────────────────────────────────────────────

export const Default: Story = {
  render: () => (
    <Box sx={{ width: 400 }}>
      <Typography>Section one</Typography>
      <FabricDivider />
      <Typography>Section two</Typography>
    </Box>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Section one")).toBeInTheDocument();
    await expect(canvas.getByText("Section two")).toBeInTheDocument();
  },
};

export const AllVariants: Story = {
  render: () => (
    <Stack spacing={2} sx={{ width: 400 }}>
      <Box>
        <Typography variant="caption">fullWidth (default)</Typography>
        <FabricDivider variant="fullWidth" />
      </Box>
      <Box>
        <Typography variant="caption">inset</Typography>
        <FabricDivider variant="inset" />
      </Box>
      <Box>
        <Typography variant="caption">middle</Typography>
        <FabricDivider variant="middle" />
      </Box>
    </Stack>
  ),
};

export const WithText: Story = {
  render: () => (
    <Stack spacing={2} sx={{ width: 400 }}>
      <FabricDivider>OR</FabricDivider>
      <FabricDivider textAlign="left">Section A</FabricDivider>
      <FabricDivider textAlign="center">Section B</FabricDivider>
      <FabricDivider textAlign="right">Section C</FabricDivider>
    </Stack>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Children render inline with the divider line — useful for "OR" separators in login flows or labeled section breaks.',
      },
    },
  },
};

export const Vertical: Story = {
  render: () => (
    <Stack direction="row" spacing={2} sx={{ height: 60, alignItems: "center" }}>
      <Typography>Left</Typography>
      <FabricDivider orientation="vertical" flexItem />
      <Typography>Middle</Typography>
      <FabricDivider orientation="vertical" flexItem />
      <Typography>Right</Typography>
    </Stack>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '`orientation="vertical"` needs `flexItem` to stretch to the parent flex container height. Same as raw MUI.',
      },
    },
  },
};

// ─── Consumer patterns ──────────────────────────────────────────────────────

export const ListItemSeparator: Story = {
  render: () => {
    const items = ["Product A", "Product B", "Product C", "Product D"];
    return (
      <Box sx={{ width: 300 }}>
        {items.map((item, index) => (
          <React.Fragment key={item}>
            <Box sx={{ py: 1.5 }}>
              <Typography>{item}</Typography>
            </Box>
            {index < items.length - 1 && <FabricDivider />}
          </React.Fragment>
        ))}
      </Box>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "The cart pattern: a divider between items but not after the last one.",
      },
    },
  },
};

export const SpacingPattern: Story = {
  render: () => (
    <Box sx={{ width: 400 }}>
      <Typography>Above</Typography>
      <FabricDivider sx={{ my: 1 }} />
      <Typography>Between</Typography>
      <FabricDivider sx={{ my: 2 }} />
      <Typography>Below</Typography>
    </Box>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "The Workflow settings pattern — vertical spacing controlled via `sx={{ my: 1 }}` / `my: 2`. Common in approval / webhook settings panels.",
      },
    },
  },
};
