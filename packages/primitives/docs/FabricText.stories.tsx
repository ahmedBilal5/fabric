import { useTheme } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { FabricFlex, FabricStack, FabricText } from "../src";

const useVars = () => {
  const t = useTheme();
  return (t.vars?.palette ?? t.palette) as typeof t.palette;
};

const meta: Meta<typeof FabricText> = {
  title: "Primitives/FabricText",
  component: FabricText,
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof FabricText>;

export const SizeScale: Story = {
  name: "Size scale",
  render: () => {
    const p = useVars();
    return (
      <FabricStack gap="xs">
        {(["xs", "sm", "md", "lg", "xl", "2xl", "3xl", "4xl"] as const).map((s) => (
          <FabricFlex key={s} gap="sm" align="baseline">
            <code style={{ width: 36, fontSize: 11, color: p.primary.main, fontWeight: 600 }}>
              {s}
            </code>
            <FabricText size={s}>The quick brown fox</FabricText>
          </FabricFlex>
        ))}
      </FabricStack>
    );
  },
};

export const TextVariants: Story = {
  name: "Text variants",
  render: () => {
    const p = useVars();
    return (
      <FabricStack gap="xs">
        {(
          [
            "headingLg",
            "headingMd",
            "headingSm",
            "bodyLg",
            "bodyMd",
            "bodySm",
            "uiLg",
            "uiMd",
          ] as const
        ).map((v) => (
          <FabricFlex key={v} gap="sm" align="baseline">
            <code style={{ width: 90, fontSize: 11, color: p.primary.main, fontWeight: 600 }}>
              {v}
            </code>
            <FabricText textVariant={v}>The quick brown fox</FabricText>
          </FabricFlex>
        ))}
      </FabricStack>
    );
  },
};

export const Truncate: Story = {
  render: () => (
    <FabricStack gap="md">
      <FabricText size="sm" sx={{ color: "text.secondary" }}>
        Text is truncated with ellipsis when it overflows the container.
      </FabricText>
      <div style={{ maxWidth: 240 }}>
        <FabricText truncate>
          This text will be truncated with an ellipsis when it overflows the container width
        </FabricText>
      </div>
      <div style={{ maxWidth: 300 }}>
        <FabricText size="lg" truncate>
          A longer heading that also gets truncated at a different width
        </FabricText>
      </div>
    </FabricStack>
  ),
};

export const ResponsiveSize: Story = {
  name: "Responsive size",
  render: () => (
    <FabricStack gap="md">
      <FabricText size="sm" sx={{ color: "text.secondary" }}>
        Text size changes at breakpoints. Resize the viewport.
      </FabricText>
      <FabricText size={{ xs: "md", sm: "lg", md: "xl", lg: "2xl", xl: "4xl" }}>
        Responsive heading
      </FabricText>
      <FabricText size={{ xs: "sm", md: "md", lg: "lg" }}>
        Responsive body text — smaller on mobile, larger on desktop.
      </FabricText>
    </FabricStack>
  ),
};

export const WithMUIProps: Story = {
  name: "MUI Typography props",
  render: () => (
    <FabricStack gap="sm">
      <FabricText component="span" sx={{ color: "primary.main", fontWeight: 600 }}>
        Rendered as span with custom color
      </FabricText>
      <FabricText variant="h4">Using MUI variant="h4"</FabricText>
      <FabricText sx={{ fontStyle: "italic", color: "text.secondary" }}>
        Italic via sx prop
      </FabricText>
    </FabricStack>
  ),
};
