import { FabricAreaChart, FabricChartCard, FabricLineChart } from "@fabric-kit/charts";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { churnRate, months, mrrByPlan, newCustomers, usd, weeklyActive, weeks } from "./sampleData";

const meta = {
  title: "Charts/Line and area charts",
  component: FabricLineChart,
  tags: ["test"],
  parameters: { layout: "padded" },
} satisfies Meta<typeof FabricLineChart>;
export default meta;
type Story = StoryObj;

const plans = Object.entries(mrrByPlan).map(([label, data]) => ({ label, data }));
const weekLabel = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

/** Dates on the x axis get a time scale. Hover shows the value at each point. */
export const Default: Story = {
  render: () => (
    <FabricChartCard title="Weekly active users" description="Last 12 weeks">
      <FabricLineChart
        xAxis={[{ data: weeks, valueFormatter: weekLabel }]}
        series={[{ label: "Active users", data: weeklyActive }]}
      />
    </FabricChartCard>
  ),
};

/** Several lines take the chart palette in order, with a legend. */
export const MultipleSeries: Story = {
  render: () => (
    <FabricChartCard title="MRR by plan" description="USD">
      <FabricLineChart valueFormat={usd} xAxis={[{ data: months }]} series={plans} />
    </FabricChartCard>
  ),
};

/** `FabricAreaChart` fills under the line with a light wash. */
export const Area: Story = {
  render: () => (
    <FabricChartCard title="New customers" description="Per month">
      <FabricAreaChart xAxis={[{ data: months }]} series={[{ label: "New customers", data: newCustomers }]} />
    </FabricChartCard>
  ),
};

/** `stacked` shows parts adding up to the total. */
export const StackedArea: Story = {
  render: () => (
    <FabricChartCard title="MRR by plan" description="Stacked, USD">
      <FabricAreaChart stacked valueFormat={usd} xAxis={[{ data: months }]} series={plans} />
    </FabricChartCard>
  ),
};

/** `valueFormat` sets tooltips, the table and the axis, here as percentages. */
export const Percentages: Story = {
  render: () => (
    <FabricChartCard title="Monthly churn" description="Share of customers who cancelled">
      <FabricLineChart
        showMarks
        valueFormat={{ style: "percent", maximumFractionDigits: 1 }}
        xAxis={[{ data: months }]}
        series={[{ label: "Churn", data: churnRate }]}
      />
    </FabricChartCard>
  ),
};

/** Value-axis ticks go compact ("20K") once the axis reaches 10,000. */
export const CompactTicks: Story = {
  render: () => (
    <FabricLineChart
      title="MRR, Growth plan"
      valueFormat={usd}
      xAxis={[{ data: months }]}
      series={[{ label: "Growth", data: mrrByPlan.Growth }]}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText("$40K")).toBeInTheDocument();
    const table = canvas.getByRole("table");
    await expect(within(table).getByRole("cell", { name: "$36,900" })).toBeInTheDocument();
  },
};
