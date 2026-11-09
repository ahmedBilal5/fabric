import { useTheme } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type React from "react";
import { FabricGrid, FabricStack, FabricText } from "../src";

const useVars = () => {
  const t = useTheme();
  return (t.vars?.palette ?? t.palette) as typeof t.palette;
};

const Cell = ({ children }: { children: React.ReactNode }) => {
  const p = useVars();
  return (
    <div
      style={{
        padding: 12,
        borderRadius: 6,
        textAlign: "center",
        backgroundColor: p.action.selected,
        color: p.text.primary,
        fontSize: 13,
        fontWeight: 600,
      }}
    >
      {children}
    </div>
  );
};

const meta: Meta<typeof FabricGrid> = {
  title: "Primitives/FabricGrid",
  tags: ["autodocs"],
  component: FabricGrid,
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof FabricGrid>;

export const ThreeColumn: Story = {
  name: "3-column grid",
  render: () => (
    <FabricGrid columns="repeat(3, 1fr)" gap="sm">
      {[1, 2, 3, 4, 5, 6].map((n) => (
        <Cell key={n}>Cell {n}</Cell>
      ))}
    </FabricGrid>
  ),
};

export const TwoColumn: Story = {
  name: "2-column grid",
  render: () => (
    <FabricGrid columns="1fr 1fr" gap="md">
      {[1, 2, 3, 4].map((n) => (
        <Cell key={n}>Cell {n}</Cell>
      ))}
    </FabricGrid>
  ),
};

export const MixedColumns: Story = {
  name: "Mixed column widths",
  render: () => (
    <FabricGrid columns="200px 1fr 1fr" gap="md">
      <Cell>Sidebar (200px)</Cell>
      <Cell>Content</Cell>
      <Cell>Content</Cell>
    </FabricGrid>
  ),
};

export const GapScale: Story = {
  name: "Gap scale",
  render: () => {
    const p = useVars();
    return (
      <FabricStack gap="xl">
        {(["xs", "sm", "md", "lg", "xl"] as const).map((g) => (
          <div key={g}>
            <code style={{ fontSize: 11, color: p.text.secondary }}>{`gap="${g}"`}</code>
            <FabricGrid columns="repeat(3, 1fr)" gap={g} sx={{ mt: 0.5 }}>
              <Cell>A</Cell>
              <Cell>B</Cell>
              <Cell>C</Cell>
            </FabricGrid>
          </div>
        ))}
      </FabricStack>
    );
  },
};

export const RowsAndColumns: Story = {
  name: "Rows and columns",
  render: () => (
    <FabricGrid columns="1fr 1fr" rows="100px 60px" gap="sm">
      <Cell>Tall row</Cell>
      <Cell>Tall row</Cell>
      <Cell>Short row</Cell>
      <Cell>Short row</Cell>
    </FabricGrid>
  ),
};

export const ResponsiveColumns: Story = {
  name: "Responsive columns",
  render: () => (
    <FabricStack gap="sm">
      <FabricText size="sm" sx={{ color: "text.secondary" }}>
        1 column on mobile, 2 on tablet, 3 on desktop. Resize viewport.
      </FabricText>
      <FabricGrid
        columns={{ xs: "1fr", md: "1fr 1fr", lg: "1fr 1fr 1fr" }}
        gap={{ xs: "sm", md: "lg" }}
      >
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <Cell key={n}>Card {n}</Cell>
        ))}
      </FabricGrid>
    </FabricStack>
  ),
};

export const ResponsiveGap: Story = {
  name: "Responsive gap",
  render: () => (
    <FabricStack gap="sm">
      <FabricText size="sm" sx={{ color: "text.secondary" }}>
        Tight gap on mobile, wider on desktop.
      </FabricText>
      <FabricGrid columns="repeat(3, 1fr)" gap={{ xs: "xs", sm: "sm", md: "lg", xl: "2xl" }}>
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <Cell key={n}>{n}</Cell>
        ))}
      </FabricGrid>
    </FabricStack>
  ),
};

export const DashboardLayout: Story = {
  name: "Dashboard layout pattern",
  render: () => {
    const p = useVars();
    const Card = ({ title, span }: { title: string; span?: string }) => (
      <div
        style={{
          padding: 20,
          borderRadius: 10,
          gridColumn: span,
          border: `1px solid ${p.divider}`,
          backgroundColor: p.background.paper,
        }}
      >
        <div style={{ fontWeight: 600, fontSize: 14, color: p.text.primary }}>{title}</div>
        <div style={{ fontSize: 12, color: p.text.secondary, marginTop: 4 }}>Content area</div>
      </div>
    );
    return (
      <FabricStack gap="sm">
        <FabricText size="sm" sx={{ color: "text.secondary" }}>
          Full-width hero on mobile, sidebar layout on desktop.
        </FabricText>
        <FabricGrid
          columns={{ xs: "1fr", md: "1fr 1fr", lg: "2fr 1fr" }}
          gap={{ xs: "sm", md: "md" }}
        >
          <Card title="Main Chart" span="1 / -1" />
          <Card title="Widget A" />
          <Card title="Widget B" />
          <Card title="Widget C" />
          <Card title="Widget D" />
        </FabricGrid>
      </FabricStack>
    );
  },
};
