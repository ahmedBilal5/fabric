import { useTheme } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type React from "react";
import { FabricFlex, FabricStack, FabricText } from "../src";

const useVars = () => {
  const t = useTheme();
  return (t.vars?.palette ?? t.palette) as typeof t.palette;
};

const Box = ({ children, wide }: { children: React.ReactNode; wide?: boolean }) => {
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
        whiteSpace: "nowrap",
        ...(wide ? { minWidth: 120, textAlign: "center" as const } : {}),
      }}
    >
      {children}
    </div>
  );
};

const meta: Meta<typeof FabricFlex> = {
  title: "Primitives/FabricFlex",
  tags: ["autodocs"],
  component: FabricFlex,
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof FabricFlex>;

export const Row: Story = {
  name: "Row (default)",
  render: () => (
    <FabricFlex gap="md" align="center">
      <Box>Item 1</Box>
      <Box>Item 2</Box>
      <Box>Item 3</Box>
    </FabricFlex>
  ),
};

export const Column: Story = {
  render: () => (
    <FabricFlex direction="column" gap="md">
      <Box>Row A</Box>
      <Box>Row B</Box>
      <Box>Row C</Box>
    </FabricFlex>
  ),
};

export const Wrapping: Story = {
  render: () => (
    <FabricFlex wrap gap="sm" sx={{ maxWidth: 300 }}>
      {["Alpha", "Beta", "Gamma", "Delta", "Epsilon", "Zeta"].map((s) => (
        <Box key={s}>{s}</Box>
      ))}
    </FabricFlex>
  ),
};

export const Alignment: Story = {
  render: () => {
    const p = useVars();
    return (
      <FabricStack gap="lg">
        {(["flex-start", "center", "flex-end", "stretch"] as const).map((a) => (
          <div key={a}>
            <code style={{ fontSize: 11, color: p.text.secondary }}>{`align="${a}"`}</code>
            <FabricFlex
              gap="sm"
              align={a}
              sx={{ height: 80, border: `1px dashed ${p.divider}`, borderRadius: 2, mt: 0.5 }}
            >
              <Box>Short</Box>
              <Box>Taller item with more content</Box>
              <Box>Med</Box>
            </FabricFlex>
          </div>
        ))}
      </FabricStack>
    );
  },
};

export const Justify: Story = {
  render: () => {
    const p = useVars();
    return (
      <FabricStack gap="lg">
        {(["flex-start", "center", "flex-end", "space-between", "space-around"] as const).map(
          (j) => (
            <div key={j}>
              <code style={{ fontSize: 11, color: p.text.secondary }}>{`justify="${j}"`}</code>
              <FabricFlex
                gap="sm"
                justify={j}
                sx={{ border: `1px dashed ${p.divider}`, borderRadius: 2, mt: 0.5, p: 1 }}
              >
                <Box>A</Box>
                <Box>B</Box>
                <Box>C</Box>
              </FabricFlex>
            </div>
          ),
        )}
      </FabricStack>
    );
  },
};

export const GapScale: Story = {
  name: "Gap scale",
  render: () => {
    const p = useVars();
    return (
      <FabricStack gap="lg">
        {(["none", "xs", "sm", "md", "lg", "xl", "2xl"] as const).map((g) => (
          <div key={g}>
            <code style={{ fontSize: 11, color: p.text.secondary }}>{`gap="${g}"`}</code>
            <FabricFlex gap={g} sx={{ mt: 0.5 }}>
              <Box>A</Box>
              <Box>B</Box>
              <Box>C</Box>
            </FabricFlex>
          </div>
        ))}
      </FabricStack>
    );
  },
};

export const ResponsiveDirection: Story = {
  name: "Responsive direction",
  render: () => (
    <FabricStack gap="sm">
      <FabricText size="sm" sx={{ color: "text.secondary" }}>
        Column on mobile, row on md+. Resize the viewport to see the change.
      </FabricText>
      <FabricFlex
        direction={{ xs: "column", md: "row" }}
        gap={{ xs: "sm", md: "lg" }}
        align="center"
      >
        <Box wide>Panel A</Box>
        <Box wide>Panel B</Box>
        <Box wide>Panel C</Box>
      </FabricFlex>
    </FabricStack>
  ),
};

export const ResponsiveGap: Story = {
  name: "Responsive gap",
  render: () => (
    <FabricStack gap="sm">
      <FabricText size="sm" sx={{ color: "text.secondary" }}>
        Tight gap on mobile, wide on desktop.
      </FabricText>
      <FabricFlex gap={{ xs: "xs", sm: "sm", md: "lg", xl: "2xl" }} wrap>
        <Box>Item 1</Box>
        <Box>Item 2</Box>
        <Box>Item 3</Box>
        <Box>Item 4</Box>
      </FabricFlex>
    </FabricStack>
  ),
};
