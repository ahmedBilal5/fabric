import {
  FabricAreaChart,
  FabricBarChart,
  FabricChartCard,
  FabricPieChart,
  FabricStatCard,
  useChartPalette,
} from "@fabric-kit/charts";
import Box from "@mui/material/Box";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { customersByPlan, months, mrrByPlan, mrrTotal, newCustomers, quarters, ticketsByChannel, usd } from "./sampleData";

const meta = {
  title: "Charts/Introduction",
  tags: ["test"],
  parameters: { layout: "padded" },
} satisfies Meta;
export default meta;
type Story = StoryObj;

/** Stat cards and chart cards together, as on a dashboard. */
export const Showcase: Story = {
  render: () => (
    <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: "repeat(12, minmax(0, 1fr))" }}>
      <Box sx={{ gridColumn: { xs: "span 12", sm: "span 4" } }}>
        <FabricStatCard
          label="Monthly recurring revenue"
          value={mrrTotal[11]}
          previousValue={mrrTotal[10]}
          comparisonLabel="vs last month"
          valueFormat={usd}
          trend={mrrTotal}
        />
      </Box>
      <Box sx={{ gridColumn: { xs: "span 12", sm: "span 4" } }}>
        <FabricStatCard
          label="New customers"
          value={newCustomers[11]}
          previousValue={newCustomers[10]}
          comparisonLabel="vs last month"
          trend={newCustomers}
          trendType="bar"
        />
      </Box>
      <Box sx={{ gridColumn: { xs: "span 12", sm: "span 4" } }}>
        <FabricStatCard label="Open tickets" value={38} change={0.12} goodDirection="down" comparisonLabel="vs last week" />
      </Box>
      <Box sx={{ gridColumn: { xs: "span 12", md: "span 8" } }}>
        <FabricChartCard title="MRR by plan" description="Stacked, USD">
          <FabricAreaChart
            stacked
            height={260}
            valueFormat={usd}
            xAxis={[{ data: months }]}
            series={Object.entries(mrrByPlan).map(([label, data]) => ({ label, data }))}
          />
        </FabricChartCard>
      </Box>
      <Box sx={{ gridColumn: { xs: "span 12", md: "span 4" } }}>
        <FabricChartCard title="Customers by plan">
          <FabricPieChart data={customersByPlan} centerLabel="Customers" height={220} />
        </FabricChartCard>
      </Box>
      <Box sx={{ gridColumn: "span 12" }}>
        <FabricChartCard title="Support tickets by channel" description="Per quarter">
          <FabricBarChart
            height={240}
            xAxis={[{ data: quarters }]}
            series={Object.entries(ticketsByChannel).map(([label, data]) => ({ label, data }))}
          />
        </FabricChartCard>
      </Box>
    </Box>
  ),
};

/** The series colors for the current color mode, in the order charts use them. */
export const Palette: Story = {
  render: function Render() {
    const { categorical, primary } = useChartPalette();
    const names = ["Blue", "Orange", "Aqua", "Yellow", "Pink", "Green", "Violet", "Red"];
    return (
      <Box sx={{ display: "grid", gap: 2 }}>
        <Box sx={{ display: "grid", gap: 1, gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))" }}>
          {categorical.map((c, i) => (
            <Box key={c} sx={{ display: "grid", gap: 0.5, fontSize: 13 }}>
              <Box sx={{ height: 40, borderRadius: 1, backgroundColor: c }} />
              <Box sx={{ color: "text.primary" }}>
                {i + 1}. {names[i] ?? `Slot ${i + 1}`}
              </Box>
              <Box sx={{ color: "text.secondary", fontFamily: "monospace" }}>{c}</Box>
            </Box>
          ))}
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, fontSize: 13, color: "text.secondary" }}>
          <Box sx={{ width: 24, height: 24, borderRadius: 1, backgroundColor: primary }} />
          Single-series charts and sparklines use the brand's primary color: {primary}
        </Box>
      </Box>
    );
  },
};
