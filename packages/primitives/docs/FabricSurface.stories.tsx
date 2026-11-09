import type { Meta, StoryObj } from "@storybook/react-vite";
import { FabricFlex, FabricStack, FabricSurface, FabricText } from "../src";

const meta: Meta<typeof FabricSurface> = {
  title: "Primitives/FabricSurface",
  tags: ["autodocs"],
  component: FabricSurface,
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof FabricSurface>;

export const Variants: Story = {
  render: () => (
    <FabricFlex gap="md" wrap>
      {(["primary", "secondary", "outlined"] as const).map((v) => (
        <FabricSurface key={v} variant={v} sx={{ p: 2.5, width: 200, borderRadius: "10px" }}>
          <code style={{ fontSize: 11, color: "var(--mui-palette-text-secondary)" }}>
            variant="{v}"
          </code>
          <FabricText size="sm" sx={{ mt: 0.5 }}>
            Content inside a {v} surface
          </FabricText>
        </FabricSurface>
      ))}
    </FabricFlex>
  ),
};

export const Elevation: Story = {
  render: () => (
    <FabricStack gap="sm">
      <FabricText size="sm" sx={{ color: "text.secondary" }}>
        Elevation levels on primary variant (outlined ignores elevation).
      </FabricText>
      <FabricFlex gap="md" wrap>
        {[0, 1, 2, 4, 8, 12].map((e) => (
          <FabricSurface
            key={e}
            elevation={e}
            sx={{ p: 2, width: 120, borderRadius: "8px", textAlign: "center" }}
          >
            <FabricText size="sm">elevation={e}</FabricText>
          </FabricSurface>
        ))}
      </FabricFlex>
    </FabricStack>
  ),
};

export const CardPattern: Story = {
  name: "Card pattern",
  render: () => (
    <FabricFlex gap="md" wrap>
      {[
        { title: "Revenue", value: "$12,340", trend: "+5.2%" },
        { title: "Orders", value: "1,284", trend: "+12.1%" },
        { title: "Customers", value: "932", trend: "-2.3%" },
      ].map((card) => (
        <FabricSurface
          key={card.title}
          variant="outlined"
          sx={{ p: 2.5, width: 200, borderRadius: "10px" }}
        >
          <FabricText size="sm" sx={{ color: "text.secondary" }}>
            {card.title}
          </FabricText>
          <FabricText size="2xl" sx={{ fontWeight: 700, mt: 0.5 }}>
            {card.value}
          </FabricText>
          <FabricText
            size="xs"
            sx={{ color: card.trend.startsWith("+") ? "success.main" : "error.main", mt: 0.5 }}
          >
            {card.trend}
          </FabricText>
        </FabricSurface>
      ))}
    </FabricFlex>
  ),
};
