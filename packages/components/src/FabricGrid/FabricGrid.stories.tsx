import { Box, Paper, Typography } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type React from "react";
import { expect, within } from "storybook/test";

import { FabricGrid } from ".";

const meta = {
  title: "Components/FabricGrid",
  component: FabricGrid,
  tags: ["test"],
  parameters: {
    docs: {
      description: {
        component:
          "Responsive 12-column grid. Extends MUI v9 `Grid` (the CSS Grid " +
          "successor to `Grid2`) with the full `GridProps` surface and the " +
          "`size` API. Every child of a `container` is automatically an item.",
      },
    },
  },
  argTypes: {
    container: { control: "boolean" },
    spacing: { control: { type: "number", min: 0, max: 10, step: 1 } },
    columns: { control: { type: "number", min: 1, max: 24, step: 1 } },
    direction: {
      control: "inline-radio",
      options: ["row", "row-reverse"],
    },
    wrap: {
      control: "inline-radio",
      options: ["nowrap", "wrap", "wrap-reverse"],
    },
  },
} as Meta<typeof FabricGrid>;

export default meta;
type Story = StoryObj<typeof FabricGrid>;

// Small helper so the stories read like layout, not styling.
const Cell = ({ children }: { children: React.ReactNode }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2,
      bgcolor: "primary.main",
      color: "primary.contrastText",
      textAlign: "center",
      borderRadius: 1,
    }}
  >
    {children}
  </Paper>
);

// ─── Basics ─────────────────────────────────────────────────────────────────

export const Default: Story = {
  render: () => (
    <FabricGrid container spacing={2}>
      <FabricGrid size={4}>
        <Cell>size=4</Cell>
      </FabricGrid>
      <FabricGrid size={4}>
        <Cell>size=4</Cell>
      </FabricGrid>
      <FabricGrid size={4}>
        <Cell>size=4</Cell>
      </FabricGrid>
    </FabricGrid>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Three columns rendered from three grid items with size=4.
    await expect(canvas.getAllByText("size=4")).toHaveLength(3);
  },
};

export const Responsive: Story = {
  render: () => (
    <FabricGrid container spacing={2}>
      <FabricGrid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <Cell>12 / 6 / 4 / 3</Cell>
      </FabricGrid>
      <FabricGrid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <Cell>12 / 6 / 4 / 3</Cell>
      </FabricGrid>
      <FabricGrid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <Cell>12 / 6 / 4 / 3</Cell>
      </FabricGrid>
      <FabricGrid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <Cell>12 / 6 / 4 / 3</Cell>
      </FabricGrid>
    </FabricGrid>
  ),
};

// ─── Variants ───────────────────────────────────────────────────────────────

export const AutoAndGrow: Story = {
  render: () => (
    <FabricGrid container spacing={2}>
      <FabricGrid size="auto">
        <Cell>auto (content-sized)</Cell>
      </FabricGrid>
      <FabricGrid size="grow">
        <Cell>grow (fills remaining)</Cell>
      </FabricGrid>
      <FabricGrid size="auto">
        <Cell>auto</Cell>
      </FabricGrid>
    </FabricGrid>
  ),
};

export const Offset: Story = {
  render: () => (
    <FabricGrid container spacing={2}>
      <FabricGrid size={4}>
        <Cell>size=4</Cell>
      </FabricGrid>
      <FabricGrid size={4} offset={4}>
        <Cell>size=4, offset=4</Cell>
      </FabricGrid>
    </FabricGrid>
  ),
};

export const CustomColumnCount: Story = {
  render: () => (
    <FabricGrid container spacing={2} columns={16}>
      <FabricGrid size={4}>
        <Cell>4/16</Cell>
      </FabricGrid>
      <FabricGrid size={4}>
        <Cell>4/16</Cell>
      </FabricGrid>
      <FabricGrid size={4}>
        <Cell>4/16</Cell>
      </FabricGrid>
      <FabricGrid size={4}>
        <Cell>4/16</Cell>
      </FabricGrid>
    </FabricGrid>
  ),
};

export const AsymmetricSpacing: Story = {
  render: () => (
    <FabricGrid container rowSpacing={4} columnSpacing={2}>
      <FabricGrid size={6}>
        <Cell>row-4 col-2</Cell>
      </FabricGrid>
      <FabricGrid size={6}>
        <Cell>row-4 col-2</Cell>
      </FabricGrid>
      <FabricGrid size={6}>
        <Cell>row-4 col-2</Cell>
      </FabricGrid>
      <FabricGrid size={6}>
        <Cell>row-4 col-2</Cell>
      </FabricGrid>
    </FabricGrid>
  ),
};

// ─── Consumer overrides ─────────────────────────────────────────────────────

export const NestedGrids: Story = {
  render: () => (
    <FabricGrid container spacing={2}>
      <FabricGrid size={6}>
        <Cell>outer 6</Cell>
      </FabricGrid>
      <FabricGrid size={6} container spacing={1}>
        <FabricGrid size={6}>
          <Cell>inner 6</Cell>
        </FabricGrid>
        <FabricGrid size={6}>
          <Cell>inner 6</Cell>
        </FabricGrid>
        <FabricGrid size={12}>
          <Cell>inner 12</Cell>
        </FabricGrid>
      </FabricGrid>
    </FabricGrid>
  ),
};

export const WithSxOverride: Story = {
  render: () => (
    <FabricGrid container spacing={2} sx={{ p: 2, bgcolor: "action.hover", borderRadius: 2 }}>
      <FabricGrid size={6}>
        <Cell>consumer sx wins</Cell>
      </FabricGrid>
      <FabricGrid size={6}>
        <Cell>consumer sx wins</Cell>
      </FabricGrid>
    </FabricGrid>
  ),
};

// ─── Kitchen sink ───────────────────────────────────────────────────────────

export const KitchenSink: Story = {
  render: () => (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <Box>
        <Typography variant="caption" sx={{ mb: 1, display: "block" }}>
          12-col responsive with mixed cells
        </Typography>
        <FabricGrid container spacing={2}>
          <FabricGrid size={{ xs: 12, md: 8 }}>
            <Cell>main (8 / 12)</Cell>
          </FabricGrid>
          <FabricGrid size={{ xs: 12, md: 4 }}>
            <Cell>side (4 / 12)</Cell>
          </FabricGrid>
          <FabricGrid size={{ xs: 6, md: 3 }}>
            <Cell>3</Cell>
          </FabricGrid>
          <FabricGrid size={{ xs: 6, md: 3 }}>
            <Cell>3</Cell>
          </FabricGrid>
          <FabricGrid size={{ xs: 6, md: 3 }}>
            <Cell>3</Cell>
          </FabricGrid>
          <FabricGrid size={{ xs: 6, md: 3 }}>
            <Cell>3</Cell>
          </FabricGrid>
        </FabricGrid>
      </Box>
    </Box>
  ),
};
