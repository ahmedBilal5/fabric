# @fabric-kit/charts

Bar, line, area, pie and sparkline charts, a chart card with a Chart/Table switch, and stat cards, built on the free MIT tier of MUI X Charts. Colors come from the theme, so brand themes and dark mode apply, and every chart has a table view for screen readers.

Part of [Fabric](https://ahmedbilal5.github.io/fabric/), a free, open-source design system on top of MUI.

```bash
pnpm add @fabric-kit/charts @mui/x-charts @mui/material @emotion/react @emotion/styled
```

```tsx
import { FabricBarChart, FabricChartCard, FabricStatCard } from "@fabric-kit/charts";

<FabricStatCard
  label="Active customers"
  value={1284}
  previousValue={1190}
  comparisonLabel="vs last month"
/>;

<FabricChartCard title="New customers by month">
  <FabricBarChart
    xAxis={[{ data: ["Jan", "Feb", "Mar"] }]}
    series={[{ label: "Customers", data: [42, 57, 61] }]}
  />
</FabricChartCard>;
```

Series colors come from `theme.palette.chart.categorical`. Change them with `createFabricTheme` from `@fabric-kit/theme`.

Documentation: [https://ahmedbilal5.github.io/fabric/docs/](https://ahmedbilal5.github.io/fabric/docs/)

## License

MIT
