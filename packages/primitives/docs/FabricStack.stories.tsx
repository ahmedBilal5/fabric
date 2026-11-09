import { useTheme } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type React from "react";
import { FabricFlex, FabricStack, FabricText } from "../src";

const useVars = () => {
  const t = useTheme();
  return (t.vars?.palette ?? t.palette) as typeof t.palette;
};

const Box = ({ children }: { children: React.ReactNode }) => {
  const p = useVars();
  return (
    <div
      style={{
        padding: "8px 16px",
        borderRadius: 6,
        backgroundColor: p.primary.main,
        color: p.primary.contrastText,
        fontSize: 13,
        fontWeight: 500,
      }}
    >
      {children}
    </div>
  );
};

const meta: Meta<typeof FabricStack> = {
  title: "Primitives/FabricStack",
  tags: ["autodocs"],
  component: FabricStack,
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof FabricStack>;

export const Default: Story = {
  render: () => (
    <FabricStack gap="md">
      <Box>First</Box>
      <Box>Second</Box>
      <Box>Third</Box>
    </FabricStack>
  ),
};

export const GapScale: Story = {
  name: "Gap scale",
  render: () => {
    const p = useVars();
    return (
      <FabricFlex gap="2xl" wrap>
        {(["xs", "sm", "md", "lg", "xl"] as const).map((g) => (
          <div key={g}>
            <code style={{ fontSize: 11, color: p.text.secondary }}>{`gap="${g}"`}</code>
            <FabricStack gap={g} sx={{ mt: 0.5 }}>
              <Box>A</Box>
              <Box>B</Box>
              <Box>C</Box>
            </FabricStack>
          </div>
        ))}
      </FabricFlex>
    );
  },
};

export const Alignment: Story = {
  render: () => {
    const p = useVars();
    return (
      <FabricFlex gap="2xl" wrap>
        {(["stretch", "flex-start", "center", "flex-end"] as const).map((a) => (
          <div key={a} style={{ width: 180 }}>
            <code style={{ fontSize: 11, color: p.text.secondary }}>{`align="${a}"`}</code>
            <FabricStack
              gap="sm"
              align={a}
              sx={{ border: `1px dashed ${p.divider}`, borderRadius: 2, p: 1, mt: 0.5 }}
            >
              <Box>Short</Box>
              <Box>A wider item</Box>
              <Box>Med</Box>
            </FabricStack>
          </div>
        ))}
      </FabricFlex>
    );
  },
};

export const ResponsiveGap: Story = {
  name: "Responsive gap",
  render: () => (
    <FabricStack gap="sm">
      <FabricText size="sm" sx={{ color: "text.secondary" }}>
        Tight gap on mobile, spacious on desktop. Resize viewport.
      </FabricText>
      <FabricStack gap={{ xs: "xs", md: "lg", xl: "2xl" }}>
        <Box>Step 1</Box>
        <Box>Step 2</Box>
        <Box>Step 3</Box>
      </FabricStack>
    </FabricStack>
  ),
};
