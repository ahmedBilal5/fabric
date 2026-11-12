import { FabricBarChart, FabricChartCard } from "@fabric-kit/charts";
import Box from "@mui/material/Box";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { months, newCustomers, quarters, ticketsByChannel, topAccounts, usd } from "./sampleData";

const meta = {
  title: "Charts/Bar chart",
  component: FabricBarChart,
  tags: ["test"],
  parameters: { layout: "padded" },
} satisfies Meta<typeof FabricBarChart>;
export default meta;
type Story = StoryObj;

const channels = Object.entries(ticketsByChannel).map(([label, data]) => ({ label, data }));

/** One series takes the brand color and needs no legend: the title names it. */
export const Default: Story = {
  render: () => (
    <FabricChartCard title="New customers" description="Per month, 2026">
      <FabricBarChart
        xAxis={[{ data: months }]}
        series={[{ label: "New customers", data: newCustomers }]}
      />
    </FabricChartCard>
  ),
};

/** Several series take the chart palette in order, with a legend. */
export const Grouped: Story = {
  render: () => (
    <FabricChartCard title="Support tickets by channel" description="Per quarter">
      <FabricBarChart xAxis={[{ data: quarters }]} series={channels} />
    </FabricChartCard>
  ),
};

/** Give series the same `stack` to show parts adding up to a total. */
export const Stacked: Story = {
  render: () => (
    <FabricChartCard title="Support tickets" description="Per quarter, by channel">
      <FabricBarChart
        xAxis={[{ data: quarters }]}
        series={channels.map((s) => ({ ...s, stack: "total" }))}
      />
    </FabricChartCard>
  ),
};

/** `layout="horizontal"` for long category names, such as account names. */
export const Horizontal: Story = {
  render: () => (
    <FabricChartCard title="Top accounts" description="Annual contract value">
      <FabricBarChart
        layout="horizontal"
        height={260}
        valueFormat={usd}
        yAxis={[{ data: topAccounts.map((a) => a.name), width: 130 }]}
        series={[{ label: "Contract value", data: topAccounts.map((a) => a.acv) }]}
      />
    </FabricChartCard>
  ),
};

/** No card: pass `title` so screen readers know what the chart shows. */
export const WithoutCard: Story = {
  render: () => (
    <Box sx={{ maxWidth: 560 }}>
      <FabricBarChart
        title="New customers per month"
        height={220}
        xAxis={[{ data: months.slice(0, 6) }]}
        series={[{ label: "New customers", data: newCustomers.slice(0, 6) }]}
      />
    </Box>
  ),
};

/** Loading with nothing to show yet, and no data. */
export const LoadingAndEmpty: Story = {
  render: () => (
    <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { md: "1fr 1fr" } }}>
      <FabricChartCard title="Revenue" tableToggle={false}>
        <FabricBarChart loading height={200} xAxis={[{ data: [] }]} series={[{ label: "Revenue", data: [] }]} />
      </FabricChartCard>
      <FabricChartCard title="Refunds" tableToggle={false}>
        <FabricBarChart height={200} xAxis={[{ data: [] }]} series={[{ label: "Refunds", data: [] }]} />
      </FabricChartCard>
    </Box>
  ),
};

/** The data is also a table for screen readers, named after the chart. */
export const ScreenReaderTable: Story = {
  render: () => (
    <FabricBarChart
      title="Support tickets by channel"
      xAxis={[{ data: quarters }]}
      series={channels}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("figure", { name: "Support tickets by channel" })).toBeInTheDocument();
    const table = canvas.getByRole("table");
    const heads = within(table).getAllByRole("columnheader").map((h) => h.textContent);
    await expect(heads).toEqual(["Category", "Email", "Chat", "Phone"]);
    await expect(within(table).getByRole("rowheader", { name: "Q4" })).toBeInTheDocument();
  },
};
