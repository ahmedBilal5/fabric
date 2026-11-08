import { useTheme } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type React from "react";
import { FabricInline, FabricStack, FabricText } from "../src";

const useVars = () => {
  const t = useTheme();
  return (t.vars?.palette ?? t.palette) as typeof t.palette;
};

const Tag = ({ children }: { children: React.ReactNode }) => {
  const p = useVars();
  return (
    <div
      style={{
        padding: "4px 12px",
        borderRadius: 16,
        fontSize: 13,
        border: `1px solid ${p.divider}`,
        backgroundColor: p.background.default,
        color: p.text.primary,
      }}
    >
      {children}
    </div>
  );
};

const meta: Meta<typeof FabricInline> = {
  title: "Primitives/FabricInline",
  component: FabricInline,
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof FabricInline>;

const tags = ["React", "TypeScript", "MUI", "Storybook", "Design System", "Tokens", "Fabric"];

export const Default: Story = {
  render: () => (
    <FabricInline gap="sm">
      {tags.map((t) => (
        <Tag key={t}>{t}</Tag>
      ))}
    </FabricInline>
  ),
};

export const Wrapping: Story = {
  render: () => (
    <FabricStack gap="sm">
      <FabricText size="sm" sx={{ color: "text.secondary" }}>
        Constrained to 320px — items wrap automatically.
      </FabricText>
      <FabricInline gap="sm" sx={{ maxWidth: 320 }}>
        {tags.map((t) => (
          <Tag key={t}>{t}</Tag>
        ))}
      </FabricInline>
    </FabricStack>
  ),
};

export const GapScale: Story = {
  name: "Gap scale",
  render: () => {
    const p = useVars();
    return (
      <FabricStack gap="lg">
        {(["xs", "sm", "md", "lg", "xl"] as const).map((g) => (
          <div key={g}>
            <code style={{ fontSize: 11, color: p.text.secondary }}>{`gap="${g}"`}</code>
            <FabricInline gap={g} sx={{ mt: 0.5 }}>
              <Tag>A</Tag>
              <Tag>B</Tag>
              <Tag>C</Tag>
              <Tag>D</Tag>
            </FabricInline>
          </div>
        ))}
      </FabricStack>
    );
  },
};

export const VerticalAlignment: Story = {
  name: "Vertical alignment",
  render: () => {
    const p = useVars();
    return (
      <FabricStack gap="lg">
        {(["flex-start", "center", "flex-end", "stretch"] as const).map((a) => (
          <div key={a}>
            <code style={{ fontSize: 11, color: p.text.secondary }}>{`align="${a}"`}</code>
            <FabricInline
              gap="sm"
              align={a}
              sx={{ height: 64, border: `1px dashed ${p.divider}`, borderRadius: 2, mt: 0.5 }}
            >
              <Tag>Short</Tag>
              <div
                style={{
                  padding: "12px 16px",
                  borderRadius: 6,
                  fontSize: 13,
                  backgroundColor: p.primary.main,
                  color: p.primary.contrastText,
                }}
              >
                Tall item
              </div>
              <Tag>Med</Tag>
            </FabricInline>
          </div>
        ))}
      </FabricStack>
    );
  },
};

export const ResponsiveGap: Story = {
  name: "Responsive gap",
  render: () => (
    <FabricStack gap="sm">
      <FabricText size="sm" sx={{ color: "text.secondary" }}>
        Tight on mobile, spacious on desktop.
      </FabricText>
      <FabricInline gap={{ xs: "xs", md: "md", xl: "xl" }}>
        {tags.slice(0, 5).map((t) => (
          <Tag key={t}>{t}</Tag>
        ))}
      </FabricInline>
    </FabricStack>
  ),
};
