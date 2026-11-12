import { FabricButton } from "@fabric-kit/components";
import { FabricBarChart, FabricChartCard, FabricLineChart } from "@fabric-kit/charts";
import Box from "@mui/material/Box";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { months, mrrTotal, newCustomers, usd } from "./sampleData";

const meta = {
  title: "Charts/Chart card",
  component: FabricChartCard,
  tags: ["test"],
  parameters: { layout: "padded" },
} satisfies Meta<typeof FabricChartCard>;
export default meta;
type Story = StoryObj;

/** A title, a description and the Chart/Table switch. */
export const Default: Story = {
  render: () => (
    <FabricChartCard title="Monthly recurring revenue" description="USD, 2026">
      <FabricLineChart
        valueFormat={usd}
        xAxis={[{ data: months }]}
        series={[{ label: "MRR", data: mrrTotal }]}
        area
      />
    </FabricChartCard>
  ),
};

/** An action at the top right, and a footer. */
export const WithActionAndFooter: Story = {
  render: () => (
    <FabricChartCard
      title="New customers"
      description="Per month"
      action={
        <FabricButton size="small" variant="text">
          View report
        </FabricButton>
      }
      footer="Trials that converted are counted in the month they converted."
    >
      <FabricBarChart xAxis={[{ data: months }]} series={[{ label: "New customers", data: newCustomers }]} />
    </FabricChartCard>
  ),
};

/** The switch shows the same numbers as a table, for exact values and screen readers. */
export const TableView: Story = {
  render: () => (
    <FabricChartCard title="New customers" description="First half">
      <FabricBarChart
        xAxis={[{ data: months.slice(0, 6) }]}
        series={[{ label: "New customers", data: newCustomers.slice(0, 6) }]}
      />
    </FabricChartCard>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", { name: "Chart" })).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(canvas.getByRole("button", { name: "Table" }));
    const region = canvas.getByRole("region", { name: "New customers table" });
    await expect(region).toBeVisible();
    await expect(within(region).getByRole("rowheader", { name: "Mar" })).toBeVisible();
    await expect(within(region).getByRole("cell", { name: "57" })).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Table" })).toHaveAttribute("aria-pressed", "true");
  },
};

/** While new data loads, the last chart stays on screen, dimmed, instead of flashing. */
export const Refreshing: Story = {
  render: function Render() {
    const [loading, setLoading] = useState(false);
    const [offset, setOffset] = useState(0);
    useEffect(() => {
      if (!loading) return;
      const t = setTimeout(() => {
        setOffset((o) => o + 1);
        setLoading(false);
      }, 1200);
      return () => clearTimeout(t);
    }, [loading]);
    return (
      <Box sx={{ display: "grid", gap: 1, justifyItems: "start" }}>
        <FabricButton size="small" variant="outlined" onClick={() => setLoading(true)} disabled={loading}>
          Reload
        </FabricButton>
        <Box sx={{ width: "100%" }}>
          <FabricChartCard title="New customers">
            <FabricBarChart
              loading={loading}
              xAxis={[{ data: months.slice(0, 6) }]}
              series={[
                {
                  label: "New customers",
                  data: newCustomers.slice(offset % 6, (offset % 6) + 6),
                },
              ]}
            />
          </FabricChartCard>
        </Box>
      </Box>
    );
  },
};
