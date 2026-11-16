import {
  FabricAreaChart,
  FabricBarChart,
  FabricChartCard,
  FabricPieChart,
  FabricStatCard,
} from "@fabric-kit/charts";
import { FabricButton, FabricEmptyState, FabricSelect, FabricStatus } from "@fabric-kit/components";
import type { FabricDateRange } from "@fabric-kit/date-picker";
import { spacing } from "@fabric-kit/design-tokens";
import {
  FabricDashboardGrid,
  FabricDashboardItem,
  FabricDashboardPage,
} from "@fabric-kit/patterns";
import Box from "@mui/material/Box";
import { useEffect, useMemo, useState } from "react";
import { addDays, type Customer, customerMrr, OWNERS } from "../data/customers";
import { dashboardMetrics, pastDue } from "../data/query";
import { useData } from "../data/store";
import { useRouter } from "../router";
import { href, routePath } from "../routes";

const usd = { style: "currency", currency: "USD", maximumFractionDigits: 0 } as const;
const money = new Intl.NumberFormat("en-US", usd);

const FORMATS = {
  day: { month: "short", day: "numeric" },
  week: { month: "short", day: "numeric" },
  month: { month: "short", year: "2-digit" },
} as const;

export function DashboardPage() {
  const { customers, ready, today } = useData();
  const { navigate } = useRouter();
  const [range, setRange] = useState<FabricDateRange>(() => ({
    start: addDays(today, -89),
    end: today,
  }));
  const [owner, setOwner] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const [updated, setUpdated] = useState(() => new Date());

  useEffect(() => {
    if (!refreshing) return;
    const t = setTimeout(() => {
      setRefreshing(false);
      setUpdated(new Date());
    }, 700);
    return () => clearTimeout(t);
  }, [refreshing]);

  const scoped = useMemo(
    () => (owner === "all" ? customers : customers.filter((c) => c.owner === owner)),
    [customers, owner],
  );
  const metrics = useMemo(
    () =>
      range.start && range.end ? dashboardMetrics(scoped, range.start, range.end, today) : null,
    [scoped, range.start, range.end, today],
  );
  const loading = !ready;
  const busy = loading || refreshing;
  const series = metrics?.series ?? [];
  const per = metrics?.granularity ?? "day";
  const format = (d: Date) => d.toLocaleDateString("en-US", FORMATS[per]);
  const overdue = pastDue(scoped).slice(0, 5);

  return (
    <FabricDashboardPage
      title="Dashboard"
      description="Revenue and customers across your workspace."
      actions={
        <FabricButton variant="contained" href={href(routePath({ name: "customer-new" }))}>
          New customer
        </FabricButton>
      }
      dateRange={range}
      onDateRangeChange={setRange}
      today={today}
      filters={
        <FabricSelect
          label="Account owner"
          value={owner}
          onChange={(e) => setOwner(String(e.target.value))}
          options={[
            { value: "all", label: "Everyone" },
            ...OWNERS.map((o) => ({ value: o, label: o })),
          ]}
          sx={{ minWidth: 180 }}
        />
      }
      lastUpdated={updated}
      onRefresh={() => setRefreshing(true)}
      refreshing={refreshing}
    >
      <FabricDashboardGrid>
        <FabricDashboardItem size="quarter">
          <FabricStatCard
            label="Monthly recurring revenue"
            value={metrics?.mrr.value ?? null}
            previousValue={metrics?.mrr.previous}
            comparisonLabel="vs start of period"
            valueFormat={usd}
            trend={series.map((p) => p.mrr)}
            loading={loading}
            href={href(routePath({ name: "customers" }))}
          />
        </FabricDashboardItem>
        <FabricDashboardItem size="quarter">
          <FabricStatCard
            label="Paying customers"
            value={metrics?.paying.value ?? null}
            previousValue={metrics?.paying.previous}
            comparisonLabel="vs start of period"
            loading={loading}
          />
        </FabricDashboardItem>
        <FabricDashboardItem size="quarter">
          <FabricStatCard
            label="Sign-ups"
            value={metrics?.signups.value ?? null}
            previousValue={metrics?.signups.previous}
            comparisonLabel="vs previous period"
            trend={series.map((p) => p.signups)}
            trendType="bar"
            loading={loading}
          />
        </FabricDashboardItem>
        <FabricDashboardItem size="quarter">
          <FabricStatCard
            label="Cancellations"
            value={metrics?.churned.value ?? null}
            previousValue={metrics?.churned.previous}
            goodDirection="down"
            comparisonLabel="vs previous period"
            loading={loading}
          />
        </FabricDashboardItem>

        <FabricDashboardItem size="twoThirds">
          <FabricChartCard
            headingLevel="h2"
            title="Monthly recurring revenue"
            description={`At the end of each ${per}, USD`}
          >
            <FabricAreaChart
              loading={busy}
              height={280}
              valueFormat={usd}
              xAxis={[{ data: series.map((p) => p.start), valueFormatter: format }]}
              series={[{ label: "Revenue", data: series.map((p) => p.mrr) }]}
            />
          </FabricChartCard>
        </FabricDashboardItem>
        <FabricDashboardItem size="third">
          <FabricChartCard headingLevel="h2" title="Paying customers by plan">
            <FabricPieChart
              loading={busy}
              data={metrics?.byPlan ?? []}
              centerLabel="Customers"
              height={240}
            />
          </FabricChartCard>
        </FabricDashboardItem>

        <FabricDashboardItem size="half">
          <FabricChartCard headingLevel="h2" title="Sign-ups" description={`Per ${per}`}>
            <FabricBarChart
              loading={busy}
              height={240}
              xAxis={[{ data: series.map((p) => p.start), valueFormatter: format }]}
              series={[{ label: "Sign-ups", data: series.map((p) => p.signups) }]}
            />
          </FabricChartCard>
        </FabricDashboardItem>
        <FabricDashboardItem size="half">
          <FabricChartCard
            headingLevel="h2"
            title="Revenue by industry"
            description="At the end of the period, USD"
          >
            <FabricBarChart
              loading={busy}
              layout="horizontal"
              height={240}
              valueFormat={usd}
              yAxis={[{ data: (metrics?.byIndustry ?? []).map((i) => i.label) }]}
              series={[{ label: "Revenue", data: (metrics?.byIndustry ?? []).map((i) => i.value) }]}
            />
          </FabricChartCard>
        </FabricDashboardItem>

        <FabricDashboardItem size="full">
          <FabricChartCard
            headingLevel="h2"
            title="Overdue accounts"
            description="Customers whose latest invoice is unpaid, largest first"
            tableToggle={false}
            action={
              <FabricButton
                size="small"
                onClick={() => navigate(`${routePath({ name: "customers" })}?status=past_due`)}
              >
                View all
              </FabricButton>
            }
          >
            {overdue.length === 0 ? (
              <FabricEmptyState
                size="sm"
                title="Nothing overdue"
                description="Every account is paid up."
              />
            ) : (
              <OverdueList customers={overdue} />
            )}
          </FabricChartCard>
        </FabricDashboardItem>
      </FabricDashboardGrid>
    </FabricDashboardPage>
  );
}

function OverdueList({ customers }: { customers: Customer[] }) {
  return (
    <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0 }}>
      {customers.map((c) => (
        <Box
          component="li"
          key={c.id}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: `${spacing.md}px`,
            py: `${spacing.sm}px`,
            borderTop: "1px solid var(--mui-palette-divider)",
            "&:first-of-type": { borderTop: 0 },
          }}
        >
          <Box
            component="a"
            href={href(routePath({ name: "customer", id: c.id }))}
            sx={{ flex: 1, minWidth: 0, color: "var(--mui-palette-text-primary)", fontWeight: 500 }}
          >
            {c.name}
          </Box>
          <FabricStatus status="error" label="Past due" size="sm" />
          <Box sx={{ width: 96, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
            {money.format(customerMrr(c))}
          </Box>
        </Box>
      ))}
    </Box>
  );
}
