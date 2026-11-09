import { useTheme } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type React from "react";
import { FabricFlex, FabricStack, FabricText, Hide, Show } from "../src";

const useVars = () => {
  const t = useTheme();
  return (t.vars?.palette ?? t.palette) as typeof t.palette;
};

const Tag = ({ children, color }: { children: React.ReactNode; color: string }) => (
  <div
    style={{
      padding: "8px 16px",
      borderRadius: 6,
      backgroundColor: color,
      color: "#fff",
      fontSize: 13,
      fontWeight: 600,
      textAlign: "center",
    }}
  >
    {children}
  </div>
);

const meta: Meta = {
  title: "Primitives/FabricVisibility",
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj;

export const ShowAbove: Story = {
  name: "Show above",
  render: () => {
    const _p = useVars();
    return (
      <FabricStack gap="md">
        <FabricText size="sm" sx={{ color: "text.secondary" }}>
          Each item only appears at or above its breakpoint. Resize viewport.
        </FabricText>
        <FabricStack gap="sm">
          <Show above="xs">
            <Tag color="#1976d2">Visible xs+</Tag>
          </Show>
          <Show above="sm">
            <Tag color="#2e7d32">Visible sm+ (600px+)</Tag>
          </Show>
          <Show above="md">
            <Tag color="#B45309">Visible md+ (900px+)</Tag>
          </Show>
          <Show above="lg">
            <Tag color="#9c27b0">Visible lg+ (1200px+)</Tag>
          </Show>
          <Show above="xl">
            <Tag color="#d32f2f">Visible xl+ (1440px+)</Tag>
          </Show>
        </FabricStack>
      </FabricStack>
    );
  },
};

export const ShowBelow: Story = {
  name: "Show below",
  render: () => (
    <FabricStack gap="md">
      <FabricText size="sm" sx={{ color: "text.secondary" }}>
        Each item only appears below its breakpoint. Resize viewport.
      </FabricText>
      <FabricStack gap="sm">
        <Show below="sm">
          <Tag color="#1976d2">Visible below sm (&lt;600px)</Tag>
        </Show>
        <Show below="md">
          <Tag color="#2e7d32">Visible below md (&lt;900px)</Tag>
        </Show>
        <Show below="lg">
          <Tag color="#B45309">Visible below lg (&lt;1200px)</Tag>
        </Show>
        <Show below="xl">
          <Tag color="#9c27b0">Visible below xl (&lt;1440px)</Tag>
        </Show>
      </FabricStack>
    </FabricStack>
  ),
};

export const HideAbove: Story = {
  name: "Hide above",
  render: () => (
    <FabricStack gap="md">
      <FabricText size="sm" sx={{ color: "text.secondary" }}>
        Items are hidden at or above the specified breakpoint.
      </FabricText>
      <FabricStack gap="sm">
        <Hide above="md">
          <Tag color="#B45309">Hidden md+ (≥900px)</Tag>
        </Hide>
        <Hide above="lg">
          <Tag color="#9c27b0">Hidden lg+ (≥1200px)</Tag>
        </Hide>
        <Hide above="xl">
          <Tag color="#d32f2f">Hidden xl+ (≥1440px)</Tag>
        </Hide>
      </FabricStack>
    </FabricStack>
  ),
};

export const HideBelow: Story = {
  name: "Hide below",
  render: () => (
    <FabricStack gap="md">
      <FabricText size="sm" sx={{ color: "text.secondary" }}>
        Items are hidden below the specified breakpoint.
      </FabricText>
      <FabricStack gap="sm">
        <Hide below="sm">
          <Tag color="#1976d2">Hidden below sm (&lt;600px)</Tag>
        </Hide>
        <Hide below="md">
          <Tag color="#2e7d32">Hidden below md (&lt;900px)</Tag>
        </Hide>
        <Hide below="lg">
          <Tag color="#B45309">Hidden below lg (&lt;1200px)</Tag>
        </Hide>
      </FabricStack>
    </FabricStack>
  ),
};

export const MobileDesktopSwap: Story = {
  name: "Mobile ↔ Desktop swap",
  render: () => (
    <FabricStack gap="md">
      <FabricText size="sm" sx={{ color: "text.secondary" }}>
        Different content on mobile vs desktop — pure CSS, no JS.
      </FabricText>
      <Show below="md">
        <Tag color="#1976d2">📱 Mobile navigation (hamburger)</Tag>
      </Show>
      <Show above="md">
        <Tag color="#2e7d32">🖥️ Desktop navigation (full sidebar)</Tag>
      </Show>
    </FabricStack>
  ),
};

export const CombinedRange: Story = {
  name: "Combined range (above + below)",
  render: () => (
    <FabricStack gap="md">
      <FabricText size="sm" sx={{ color: "text.secondary" }}>
        Visible only between sm and lg (600px–1200px). Resize to see it appear/disappear.
      </FabricText>
      <Show above="sm" below="lg">
        <Tag color="#B45309">Visible only sm–lg (600px to 1200px)</Tag>
      </Show>
    </FabricStack>
  ),
};

export const RealWorldPattern: Story = {
  name: "Real-world layout pattern",
  render: () => {
    const p = useVars();
    const Sidebar = () => (
      <div
        style={{
          width: 200,
          padding: 16,
          borderRadius: 8,
          backgroundColor: p.action.selected,
          color: p.text.primary,
        }}
      >
        <FabricText size="sm" sx={{ fontWeight: 600 }}>
          Sidebar
        </FabricText>
        <FabricText size="xs" sx={{ color: "text.secondary", mt: 1 }}>
          Navigation links…
        </FabricText>
      </div>
    );
    const Drawer = () => (
      <div
        style={{
          padding: 12,
          borderRadius: 8,
          backgroundColor: p.primary.main,
          color: p.primary.contrastText,
        }}
      >
        <FabricText size="sm" sx={{ fontWeight: 600 }}>
          ☰ Menu (mobile drawer trigger)
        </FabricText>
      </div>
    );
    return (
      <FabricStack gap="md">
        <FabricText size="sm" sx={{ color: "text.secondary" }}>
          Shows sidebar on desktop, hamburger trigger on mobile.
        </FabricText>
        <FabricFlex gap="md">
          <Show above="md">
            <Sidebar />
          </Show>
          <FabricStack gap="sm" sx={{ flex: 1 }}>
            <Show below="md">
              <Drawer />
            </Show>
            <div
              style={{
                padding: 24,
                borderRadius: 8,
                border: `1px solid ${p.divider}`,
              }}
            >
              <FabricText size="md">Main content area</FabricText>
            </div>
          </FabricStack>
        </FabricFlex>
      </FabricStack>
    );
  },
};
