import {
  FabricAreaChart,
  FabricBarChart,
  FabricChartCard,
  FabricPieChart,
  FabricStatCard,
} from "@fabric-kit/charts";
import { FabricButton, FabricMeter, FabricSelect } from "@fabric-kit/components";
import type { FabricDateRange } from "@fabric-kit/date-picker";
import {
  FabricDashboardGrid,
  FabricDashboardItem,
  FabricDashboardPage,
  type FabricDashboardPageProps,
} from "@fabric-kit/patterns";
import Box from "@mui/material/Box";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useMemo, useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { bucket, channelMix, planMix, summarise } from "./dashboard";

const today = new Date(2026, 10, 12);
const last30 = { start: new Date(2026, 9, 14), end: today };
const usd = { style: "currency", currency: "USD", maximumFractionDigits: 0 } as const;
const shortDate = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

const meta = {
  title: "Patterns/Dashboard page",
  component: FabricDashboardPage,
  tags: ["test"],
  parameters: { layout: "padded" },
} satisfies Meta<typeof FabricDashboardPage>;
export default meta;
type Story = StoryObj;

function SalesDashboard({
  initialRange = last30,
  loading = false,
  ...props
}: Partial<FabricDashboardPageProps> & { initialRange?: FabricDateRange; loading?: boolean }) {
  const [range, setRange] = useState<FabricDateRange>(initialRange);
  const [region, setRegion] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const [updated, setUpdated] = useState(() => new Date(Date.now() - 4 * 60_000));

  useEffect(() => {
    if (!refreshing) return;
    const t = setTimeout(() => {
      setRefreshing(false);
      setUpdated(new Date());
    }, 900);
    return () => clearTimeout(t);
  }, [refreshing]);

  const data = useMemo(
    () => (range.start && range.end ? summarise(range.start, range.end) : null),
    [range.start, range.end],
  );
  const points = data ? bucket(data.current) : [];
  const busy = loading || refreshing;

  return (
    <FabricDashboardPage
      title="Sales overview"
      description="Signups, revenue and support for all workspaces."
      actions={<FabricButton variant="outlined">Export</FabricButton>}
      dateRange={range}
      onDateRangeChange={setRange}
      today={today}
      filters={
        <FabricSelect
          label="Region"
          value={region}
          onChange={(e) => setRegion(String(e.target.value))}
          options={[
            { value: "all", label: "All regions" },
            { value: "na", label: "North America" },
            { value: "eu", label: "Europe" },
            { value: "apac", label: "Asia Pacific" },
          ]}
          sx={{ minWidth: 180 }}
        />
      }
      lastUpdated={updated}
      onRefresh={() => setRefreshing(true)}
      refreshing={refreshing}
      {...props}
    >
      <FabricDashboardGrid>
        <FabricDashboardItem size="third">
          <FabricStatCard
            label="Revenue"
            value={data?.revenue.value ?? null}
            previousValue={data?.revenue.previous}
            comparisonLabel="vs previous period"
            valueFormat={usd}
            trend={points.map((p) => p.revenue)}
            loading={loading}
          />
        </FabricDashboardItem>
        <FabricDashboardItem size="third">
          <FabricStatCard
            label="Signups"
            value={data?.signups.value ?? null}
            previousValue={data?.signups.previous}
            comparisonLabel="vs previous period"
            trend={points.map((p) => p.signups)}
            trendType="bar"
            loading={loading}
          />
        </FabricDashboardItem>
        <FabricDashboardItem size="third">
          <FabricStatCard
            label="Support tickets"
            value={data?.tickets.value ?? null}
            previousValue={data?.tickets.previous}
            goodDirection="down"
            comparisonLabel="vs previous period"
            loading={loading}
            caption="Median first reply: 1h 42m"
          />
        </FabricDashboardItem>

        <FabricDashboardItem size="twoThirds">
          <FabricChartCard
            headingLevel="h2"
            title="Revenue"
            description={points.length > 31 ? "Per week, USD" : "Per day, USD"}
          >
            <FabricAreaChart
              loading={busy}
              height={260}
              valueFormat={usd}
              xAxis={[{ data: points.map((p) => p.label), valueFormatter: shortDate }]}
              series={[{ label: "Revenue", data: points.map((p) => p.revenue) }]}
            />
          </FabricChartCard>
        </FabricDashboardItem>
        <FabricDashboardItem size="third">
          <FabricChartCard headingLevel="h2" title="Customers by plan">
            <FabricPieChart loading={busy} data={planMix} centerLabel="Customers" height={220} />
          </FabricChartCard>
        </FabricDashboardItem>

        <FabricDashboardItem size="half">
          <FabricChartCard headingLevel="h2" title="Tickets by channel" description="This quarter">
            <FabricBarChart
              loading={busy}
              layout="horizontal"
              height={200}
              yAxis={[{ data: channelMix.map((c) => c.label), width: 60 }]}
              series={[{ label: "Tickets", data: channelMix.map((c) => c.value) }]}
            />
          </FabricChartCard>
        </FabricDashboardItem>
        <FabricDashboardItem size="half">
          <FabricChartCard headingLevel="h2" title="Plan usage" description="Your Acme workspace" tableToggle={false}>
            <Box sx={{ display: "grid", gap: 2.5, pt: 1 }}>
              <FabricMeter label="Seats" value={42} max={50} unit="seats" />
              <FabricMeter label="Storage" value={61} max={100} valueText="61 GB of 100 GB" />
              <FabricMeter label="API calls" value={182_400} max={250_000} format="percent" helperText="Resets on 1 December." />
            </Box>
          </FabricChartCard>
        </FabricDashboardItem>
      </FabricDashboardGrid>
    </FabricDashboardPage>
  );
}

/** A header, one filter row that scopes every widget, and a grid of stats and charts. */
export const Default: Story = { render: () => <SalesDashboard /> };

/** Widgets show placeholders on the first load. */
export const Loading: Story = { render: () => <SalesDashboard loading /> };

/** On phones every widget takes the full width, and the filters wrap. */
export const Mobile: Story = {
  render: () => <SalesDashboard />,
  globals: { viewport: { value: "mobile2", isRotated: false } },
};

/** Picking a quick range updates every widget. */
export const ChangingTheRange: Story = {
  render: () => <SalesDashboard />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const revenue = canvas.getByRole("group", { name: "Revenue" });
    const before = revenue.textContent;
    await userEvent.click(canvas.getByRole("button", { name: "Last 7 days" }));
    await expect(canvas.getByRole("button", { name: "Last 7 days" })).toHaveAttribute("aria-pressed", "true");
    await waitFor(() => expect(revenue.textContent).not.toBe(before));
    await expect(canvas.getByText("Per day, USD")).toBeVisible();
  },
};

/** Refresh reloads the data; the charts stay on screen, dimmed, until it arrives. */
export const Refresh: Story = {
  render: () => <SalesDashboard />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/Updated/)).toBeVisible();
    const button = canvas.getByRole("button", { name: "Refresh data" });
    await userEvent.click(button);
    await expect(button).toBeDisabled();
    await waitFor(() => expect(button).toBeEnabled(), { timeout: 3000 });
  },
};
