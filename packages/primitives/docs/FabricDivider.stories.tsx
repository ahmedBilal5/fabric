import type { Meta, StoryObj } from "@storybook/react-vite";
import { FabricDivider, FabricStack, FabricText } from "../src";

const meta: Meta<typeof FabricDivider> = {
  title: "Primitives/FabricDivider",
  tags: ["autodocs"],
  component: FabricDivider,
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof FabricDivider>;

export const Default: Story = {
  render: () => (
    <FabricStack>
      <FabricText size="sm">Content above</FabricText>
      <FabricDivider />
      <FabricText size="sm">Content below</FabricText>
    </FabricStack>
  ),
};

export const SpacingScale: Story = {
  name: "Spacing scale",
  render: () => (
    <FabricStack gap="lg">
      {(["none", "xs", "sm", "md", "lg", "xl", "2xl"] as const).map((s) => (
        <div
          key={s}
          style={{ border: "1px dashed var(--mui-palette-divider)", borderRadius: 8, padding: 12 }}
        >
          <code style={{ fontSize: 11, color: "var(--mui-palette-text-secondary)" }}>
            spacing="{s}"
          </code>
          <FabricText size="sm">Above</FabricText>
          <FabricDivider spacing={s} />
          <FabricText size="sm">Below</FabricText>
        </div>
      ))}
    </FabricStack>
  ),
};
