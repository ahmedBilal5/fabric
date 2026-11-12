import { FabricSparkline } from "@fabric-kit/charts";
import Box from "@mui/material/Box";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { newCustomers, topAccounts, weeklyActive } from "./sampleData";

const meta = {
  title: "Charts/Sparkline",
  component: FabricSparkline,
  tags: ["test"],
  parameters: { layout: "padded" },
} satisfies Meta<typeof FabricSparkline>;
export default meta;
type Story = StoryObj;

/** A trend line in the brand color. */
export const Default: Story = {
  render: () => (
    <Box sx={{ width: 200 }}>
      <FabricSparkline data={weeklyActive} title="Weekly active users" />
    </Box>
  ),
};

/** One bar per value. */
export const Bars: Story = {
  render: () => (
    <Box sx={{ width: 200 }}>
      <FabricSparkline plotType="bar" data={newCustomers} title="New customers per month" />
    </Box>
  ),
};

/** In a table, a sparkline shows each row's trend at a glance. */
export const InATable: Story = {
  render: () => {
    const trends = [
      [6, 7, 7, 8, 9, 9, 10],
      [9, 9, 8, 8, 8, 8.5, 8.4],
      [4, 4.5, 5, 5.2, 5.6, 6, 6.1],
      [5.2, 5, 4.8, 4.9, 4.7, 4.9, 4.9],
      [2, 2.4, 2.6, 3, 3.1, 3.3, 3.3],
    ];
    return (
      <Box component="table" sx={{ borderCollapse: "collapse", fontSize: 14, "& td, & th": { py: 1, pr: 3, textAlign: "left" } }}>
        <thead>
          <tr>
            <th>Account</th>
            <th>Seats, last 7 months</th>
          </tr>
        </thead>
        <tbody>
          {topAccounts.map((a, i) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>
                <FabricSparkline data={trends[i]} width={120} height={28} title={`${a.name} seats`} />
              </td>
            </tr>
          ))}
        </tbody>
      </Box>
    );
  },
};

/** Screen readers hear the first and last values, the change and the range. */
export const ScreenReaderSummary: Story = {
  render: () => (
    <Box sx={{ width: 200 }}>
      <FabricSparkline data={[120, 98, 140, 134]} title="Signups" locale="en-US" />
    </Box>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("img", { name: "Signups: From 120 to 134, up 11.7%. Low 98, high 140." }),
    ).toBeInTheDocument();
  },
};
