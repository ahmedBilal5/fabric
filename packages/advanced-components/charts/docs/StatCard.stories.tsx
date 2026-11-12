import { FabricStatCard } from "@fabric-kit/charts";
import PeopleIcon from "@fabric-kit/icons/PeopleOutlined";
import Box from "@mui/material/Box";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { churnRate, mrrTotal, newCustomers, usd } from "./sampleData";

const meta = {
  title: "Charts/Stat card",
  component: FabricStatCard,
  tags: ["test"],
  parameters: { layout: "padded" },
} satisfies Meta<typeof FabricStatCard>;
export default meta;
type Story = StoryObj;

const Row = ({ children }: { children: React.ReactNode }) => (
  <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
    {children}
  </Box>
);

/** The number, its change versus last period, and the trend. */
export const Default: Story = {
  render: () => (
    <Box sx={{ maxWidth: 300 }}>
      <FabricStatCard
        label="Monthly recurring revenue"
        value={mrrTotal[11]}
        previousValue={mrrTotal[10]}
        comparisonLabel="vs last month"
        valueFormat={usd}
        trend={mrrTotal}
      />
    </Box>
  ),
};

/** A row of stats. Churn falling is good news, so `goodDirection="down"` colors it green. */
export const Row4: Story = {
  name: "Row of stats",
  render: () => (
    <Row>
      <FabricStatCard
        label="Monthly recurring revenue"
        value={mrrTotal[11]}
        previousValue={mrrTotal[10]}
        comparisonLabel="vs last month"
        valueFormat={usd}
        trend={mrrTotal}
      />
      <FabricStatCard
        label="New customers"
        value={newCustomers[11]}
        previousValue={newCustomers[10]}
        comparisonLabel="vs last month"
        trend={newCustomers}
        trendType="bar"
      />
      <FabricStatCard
        label="Churn"
        value={churnRate[11]}
        previousValue={churnRate[10]}
        goodDirection="down"
        changeFormat="absolute"
        comparisonLabel="vs last month"
        valueFormat={{ style: "percent", maximumFractionDigits: 1 }}
        trend={churnRate}
      />
      <FabricStatCard
        label="Active seats"
        value={4_212}
        previousValue={4_212}
        comparisonLabel="vs last month"
        icon={<PeopleIcon />}
        caption="Across 1,094 workspaces"
      />
    </Row>
  ),
};

/** Without a trend, and with the change given as a ratio. */
export const Simple: Story = {
  render: () => (
    <Row>
      <FabricStatCard label="Open tickets" value={38} change={0.12} goodDirection="down" comparisonLabel="vs last week" />
      <FabricStatCard label="Average first reply" value="1h 42m" change={-0.08} goodDirection="down" comparisonLabel="vs last week" />
      <FabricStatCard label="Page views" value={182_340} change={0.034} goodDirection="neutral" comparisonLabel="vs last week" />
    </Row>
  ),
};

/** Placeholders while the number loads. */
export const Loading: Story = {
  render: () => (
    <Row>
      <FabricStatCard label="Monthly recurring revenue" value={null} loading />
      <FabricStatCard label="New customers" value={null} loading />
    </Row>
  ),
};

/** `href` or `onClick` makes the whole card a link to the full report. */
export const Clickable: Story = {
  render: () => (
    <Box sx={{ maxWidth: 300 }}>
      <FabricStatCard
        label="New customers"
        value={92}
        previousValue={77}
        comparisonLabel="vs last month"
        href="#new-customers"
        trend={newCustomers}
      />
    </Box>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole("link", { name: "New customers 92 19.5% vs last month, up" });
    await expect(link).toHaveAttribute("href", "#new-customers");
  },
};

/** The change is spoken as words, so color is never the only cue. */
export const ScreenReaderText: Story = {
  render: () => (
    <Box sx={{ maxWidth: 300 }}>
      <FabricStatCard label="Churn" value={0.018} previousValue={0.019} goodDirection="down" comparisonLabel="vs last month" valueFormat={{ style: "percent", maximumFractionDigits: 1 }} locale="en-US" />
    </Box>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole("group", { name: "Churn" });
    await expect(within(group).getByText("Down 5.3%")).toBeInTheDocument();
    await expect(within(group).getByText("1.8%")).toBeVisible();
  },
};
