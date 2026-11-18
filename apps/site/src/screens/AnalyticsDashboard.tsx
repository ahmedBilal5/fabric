import {
  FabricAreaChart,
  FabricChartCard,
  FabricPieChart,
  FabricStatCard,
} from "@fabric-kit/charts";
import { FabricTag } from "@fabric-kit/components";
import { FabricDatagrid, type GridColDef } from "@fabric-kit/datagrid";
import BarChartOutlined from "@fabric-kit/icons/BarChartOutlined";
import Inventory2Outlined from "@fabric-kit/icons/Inventory2Outlined";
import PeopleOutlined from "@fabric-kit/icons/PeopleOutlined";
import ReceiptLongOutlined from "@fabric-kit/icons/ReceiptLongOutlined";
import SettingsOutlined from "@fabric-kit/icons/SettingsOutlined";
import SpaceDashboardOutlined from "@fabric-kit/icons/SpaceDashboardOutlined";
import { FabricAppShell, type NavigationItem } from "@fabric-kit/layout";
import {
  FabricDashboardGrid,
  FabricDashboardItem,
  FabricDashboardPage,
} from "@fabric-kit/patterns";
import { useBreakpoint } from "@fabric-kit/theme";
import { useEffect, useState } from "react";

const NAV: NavigationItem[] = [
  { key: "overview", label: "Overview", icon: <SpaceDashboardOutlined /> },
  { key: "orders", label: "Orders", icon: <ReceiptLongOutlined /> },
  { key: "customers", label: "Customers", icon: <PeopleOutlined /> },
  { key: "products", label: "Products", icon: <Inventory2Outlined /> },
  { key: "reports", label: "Reports", icon: <BarChartOutlined /> },
  { key: "settings", label: "Settings", icon: <SettingsOutlined /> },
];

// Sample data: twelve weeks of a small online store.
const WEEKS = Array.from({ length: 12 }, (_, i) => new Date(2026, 8, 7 + i * 7));
const REVENUE = [
  32100, 35400, 34200, 38900, 37600, 41800, 40900, 43700, 42500, 46300, 45100, 48210,
];
const ORDERS_PER_WEEK = [880, 940, 915, 1020, 990, 1090, 1060, 1130, 1105, 1210, 1190, 1284];
const CHANNELS = [
  { id: "web", label: "Web store", value: 742 },
  { id: "marketplace", label: "Marketplace", value: 318 },
  { id: "wholesale", label: "Wholesale", value: 224 },
];

const usd = { style: "currency", currency: "USD", maximumFractionDigits: 0 } as const;
const shortDate = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

type OrderRow = {
  id: string;
  customer: string;
  total: number;
  status: "Paid" | "Shipped" | "Refunded";
  placed: string;
};

const ORDERS: OrderRow[] = [
  {
    id: "#10482",
    customer: "Northwind Traders",
    total: 420,
    status: "Paid",
    placed: "Today, 09:14",
  },
  {
    id: "#10481",
    customer: "Blue Harbor Coffee",
    total: 86.4,
    status: "Shipped",
    placed: "Today, 08:52",
  },
  { id: "#10480", customer: "Lumen Studio", total: 1240, status: "Paid", placed: "Yesterday" },
  { id: "#10479", customer: "Fieldnote Press", total: 58, status: "Refunded", placed: "Yesterday" },
  { id: "#10478", customer: "Copperline Bikes", total: 312.75, status: "Shipped", placed: "Mon" },
];

const STATUS_COLOR = { Paid: "success", Shipped: "running", Refunded: "cancelled" } as const;
const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

const COLUMNS: GridColDef<OrderRow>[] = [
  { field: "id", headerName: "Order", width: 96 },
  { field: "customer", headerName: "Customer", flex: 1, minWidth: 160 },
  { field: "placed", headerName: "Placed", width: 120 },
  {
    field: "status",
    headerName: "Status",
    width: 120,
    renderCell: ({ value }) => (
      <FabricTag
        variant="indicator"
        color={STATUS_COLOR[value as OrderRow["status"]]}
        label={value}
      />
    ),
  },
  {
    field: "total",
    headerName: "Total",
    width: 110,
    align: "right",
    headerAlign: "right",
    valueFormatter: (value: number) => money.format(value),
  },
];

/** A store's analytics overview: FabricDashboardPage, stat cards, charts and the grid. */
export function AnalyticsDashboard() {
  const [selected, setSelected] = useState("overview");
  const [refreshing, setRefreshing] = useState(false);
  // On phones the shell's sidebar is a drawer over the whole page, so keep it closed
  // until someone opens it.
  const isMobile = useBreakpoint("down", "md");
  const [desktopOpen, setDesktopOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [updated, setUpdated] = useState(() => new Date());

  useEffect(() => {
    if (!refreshing) return;
    const timer = setTimeout(() => {
      setRefreshing(false);
      setUpdated(new Date());
    }, 700);
    return () => clearTimeout(timer);
  }, [refreshing]);

  const last = REVENUE.length - 1;
  return (
    <FabricAppShell
      sidebarOpen={isMobile ? mobileOpen : desktopOpen}
      onSidebarOpenChange={isMobile ? setMobileOpen : setDesktopOpen}
      sidebarProps={{
        open: true,
        onToggle: () => {},
        items: NAV.map((item) => ({
          ...item,
          onClick: () => {
            setSelected(item.key);
            setMobileOpen(false);
          },
        })),
        selectedKey: selected,
      }}
      topBarProps={{
        appTitle: "Acme Analytics",
        user: { firstName: "Jane", lastName: "Doe", email: "jane@acme.example" },
        notificationCount: 3,
        onNotificationClick: () => {},
        onUserMenuAction: () => {},
      }}
    >
      <FabricDashboardPage
        title="Overview"
        titleComponent="h3"
        description="Acme Store, last 12 weeks"
        lastUpdated={updated}
        onRefresh={() => setRefreshing(true)}
        refreshing={refreshing}
        sx={{ p: 3 }}
      >
        <FabricDashboardGrid>
          <FabricDashboardItem size="third">
            <FabricStatCard
              label="Revenue this week"
              value={REVENUE[last]}
              previousValue={REVENUE[last - 1]}
              comparisonLabel="vs last week"
              valueFormat={usd}
              trend={REVENUE}
            />
          </FabricDashboardItem>
          <FabricDashboardItem size="third">
            <FabricStatCard
              label="Orders this week"
              value={ORDERS_PER_WEEK[last]}
              previousValue={ORDERS_PER_WEEK[last - 1]}
              comparisonLabel="vs last week"
              trend={ORDERS_PER_WEEK}
              trendType="bar"
            />
          </FabricDashboardItem>
          <FabricDashboardItem size="third">
            <FabricStatCard
              label="Average order"
              value={REVENUE[last] / ORDERS_PER_WEEK[last]}
              previousValue={REVENUE[last - 1] / ORDERS_PER_WEEK[last - 1]}
              comparisonLabel="vs last week"
              valueFormat={{ style: "currency", currency: "USD" }}
            />
          </FabricDashboardItem>

          <FabricDashboardItem size="twoThirds">
            <FabricChartCard headingLevel="h4" title="Weekly revenue" description="USD">
              <FabricAreaChart
                loading={refreshing}
                height={220}
                valueFormat={usd}
                xAxis={[{ data: WEEKS, scaleType: "point", valueFormatter: shortDate }]}
                series={[{ label: "Revenue", data: REVENUE }]}
              />
            </FabricChartCard>
          </FabricDashboardItem>
          <FabricDashboardItem size="third">
            <FabricChartCard headingLevel="h4" title="Orders by channel" description="This week">
              <FabricPieChart
                loading={refreshing}
                data={CHANNELS}
                centerLabel="Orders"
                height={200}
              />
            </FabricChartCard>
          </FabricDashboardItem>

          <FabricDashboardItem size="full">
            <FabricChartCard headingLevel="h4" title="Recent orders" tableToggle={false}>
              <FabricDatagrid
                sx={{ "& .MuiDataGrid-topContainer": { position: "relative" } }}
                rows={ORDERS}
                columns={COLUMNS}
                hideFooter
                disableRowSelectionOnClick
                density="compact"
              />
            </FabricChartCard>
          </FabricDashboardItem>
        </FabricDashboardGrid>
      </FabricDashboardPage>
    </FabricAppShell>
  );
}
