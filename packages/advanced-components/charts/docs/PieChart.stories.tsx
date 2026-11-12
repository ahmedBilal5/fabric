import { FabricChartCard, FabricPieChart } from "@fabric-kit/charts";
import Box from "@mui/material/Box";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { customersByPlan, revenueByRegion, usd } from "./sampleData";

const meta = {
  title: "Charts/Pie chart",
  component: FabricPieChart,
  tags: ["test"],
  parameters: { layout: "padded" },
} satisfies Meta<typeof FabricPieChart>;
export default meta;
type Story = StoryObj;

/** A donut with the total in the middle. */
export const Default: Story = {
  render: () => (
    <Box sx={{ maxWidth: 480 }}>
      <FabricChartCard title="Customers by plan">
        <FabricPieChart data={customersByPlan} centerLabel="Customers" />
      </FabricChartCard>
    </Box>
  ),
};

/** `variant="pie"` for a full pie. */
export const Pie: Story = {
  render: () => (
    <Box sx={{ maxWidth: 480 }}>
      <FabricChartCard title="Customers by plan">
        <FabricPieChart variant="pie" data={customersByPlan} />
      </FabricChartCard>
    </Box>
  ),
};

/** Past six slices, the smallest fold into "Other". The table shows each share. */
export const FoldedSlices: Story = {
  render: () => (
    <Box sx={{ maxWidth: 520 }}>
      <FabricChartCard title="Revenue by region" description="This year, USD">
        <FabricPieChart data={revenueByRegion} valueFormat={usd} centerLabel="Revenue" categoryLabel="Region" />
      </FabricChartCard>
    </Box>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const table = canvas.getByRole("table");
    await expect(within(table).getByRole("rowheader", { name: "Other" })).toBeInTheDocument();
    await expect(within(table).queryByRole("rowheader", { name: "Oceania" })).not.toBeInTheDocument();
    await expect(within(table).getAllByRole("row")).toHaveLength(7);
    await expect(within(table).getByRole("cell", { name: "$16,500" })).toBeInTheDocument();
  },
};
