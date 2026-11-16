import { FabricBarChart, FabricChartCard, FabricStatCard } from "@fabric-kit/charts";
import { FabricButton, FabricMeter } from "@fabric-kit/components";
import { spacing } from "@fabric-kit/design-tokens";
import {
  FabricDashboardGrid,
  FabricDashboardItem,
  FabricDashboardPage,
} from "@fabric-kit/patterns";
import Box from "@mui/material/Box";
import { useProjects } from "../data";
import { href, routePath } from "../routes";

const usd = { style: "currency", currency: "USD", maximumFractionDigits: 0 } as const;

/** A dashboard: key numbers and charts. */
export function HomePage() {
  const { projects } = useProjects();
  const open = projects.filter((p) => p.status !== "done");
  const budget = open.reduce((sum, p) => sum + p.budget, 0);
  const spent = open.reduce((sum, p) => sum + p.spent, 0);

  return (
    <FabricDashboardPage
      title="Home"
      description="How your projects are doing."
      actions={
        <FabricButton variant="contained" href={href(routePath({ name: "project-new" }))}>
          New project
        </FabricButton>
      }
    >
      <FabricDashboardGrid>
        <FabricDashboardItem size="third">
          <FabricStatCard
            label="Open projects"
            value={open.length}
            caption={`${projects.length - open.length} done`}
            href={href(routePath({ name: "projects" }))}
          />
        </FabricDashboardItem>
        <FabricDashboardItem size="third">
          <FabricStatCard label="Budget of open projects" value={budget} valueFormat={usd} />
        </FabricDashboardItem>
        <FabricDashboardItem size="third">
          <FabricStatCard
            label="Spent so far"
            value={spent}
            valueFormat={usd}
            caption="On open projects"
          />
        </FabricDashboardItem>

        <FabricDashboardItem size="twoThirds">
          <FabricChartCard
            headingLevel="h2"
            title="Budget and spend"
            description="Open projects, USD"
          >
            <FabricBarChart
              layout="horizontal"
              height={300}
              valueFormat={usd}
              yAxis={[{ data: open.map((p) => p.name) }]}
              series={[
                { label: "Budget", data: open.map((p) => p.budget) },
                { label: "Spent", data: open.map((p) => p.spent) },
              ]}
            />
          </FabricChartCard>
        </FabricDashboardItem>
        <FabricDashboardItem size="third">
          <FabricChartCard headingLevel="h2" title="Budget used" tableToggle={false}>
            <Box sx={{ display: "grid", gap: `${spacing.xlsm}px`, pt: `${spacing.xs}px` }}>
              {open.slice(0, 4).map((p) => (
                <FabricMeter
                  key={p.id}
                  label={p.name}
                  value={p.spent}
                  max={p.budget}
                  format="percent"
                />
              ))}
            </Box>
          </FabricChartCard>
        </FabricDashboardItem>
      </FabricDashboardGrid>
    </FabricDashboardPage>
  );
}
