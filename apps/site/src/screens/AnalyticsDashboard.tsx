import {
  FabricCard,
  FabricCardHeader,
  FabricCardRows,
  FabricChip,
  FabricGrid,
  FabricTag,
} from "@fabric-kit/components";
import { FabricDatagrid, type GridColDef } from "@fabric-kit/datagrid";
import BarChartOutlined from "@fabric-kit/icons/BarChartOutlined";
import Inventory2Outlined from "@fabric-kit/icons/Inventory2Outlined";
import PeopleOutlined from "@fabric-kit/icons/PeopleOutlined";
import ReceiptLongOutlined from "@fabric-kit/icons/ReceiptLongOutlined";
import SettingsOutlined from "@fabric-kit/icons/SettingsOutlined";
import SpaceDashboardOutlined from "@fabric-kit/icons/SpaceDashboardOutlined";
import { FabricAppShell, type NavigationItem } from "@fabric-kit/layout";
import { FabricFlex, FabricStack, FabricText } from "@fabric-kit/primitives";
import { useState } from "react";

const NAV: NavigationItem[] = [
  { key: "overview", label: "Overview", icon: <SpaceDashboardOutlined /> },
  { key: "orders", label: "Orders", icon: <ReceiptLongOutlined /> },
  { key: "customers", label: "Customers", icon: <PeopleOutlined /> },
  { key: "products", label: "Products", icon: <Inventory2Outlined /> },
  { key: "reports", label: "Reports", icon: <BarChartOutlined /> },
  { key: "settings", label: "Settings", icon: <SettingsOutlined /> },
];

// Sample data for the concept screen.
const WEEK = [32, 41, 38, 52, 47, 61, 58, 66, 63, 74, 71, 82];

const KPIS = [
  { title: "Revenue", value: "$48,210", rows: [{ label: "Last week", value: "$43,960" }] },
  { title: "Orders", value: "1,284", rows: [{ label: "Last week", value: "1,190" }] },
  { title: "Average order", value: "$37.55", rows: [{ label: "Last week", value: "$36.94" }] },
];

type OrderRow = {
  id: string;
  customer: string;
  total: string;
  status: "Paid" | "Shipped" | "Refunded";
  date: string;
};

const ORDERS: OrderRow[] = [
  {
    id: "#10482",
    customer: "Northwind Traders",
    total: "$420.00",
    status: "Paid",
    date: "Today, 09:14",
  },
  {
    id: "#10481",
    customer: "Blue Harbor Coffee",
    total: "$86.40",
    status: "Shipped",
    date: "Today, 08:52",
  },
  { id: "#10480", customer: "Lumen Studio", total: "$1,240.00", status: "Paid", date: "Yesterday" },
  {
    id: "#10479",
    customer: "Fieldnote Press",
    total: "$58.00",
    status: "Refunded",
    date: "Yesterday",
  },
  { id: "#10478", customer: "Copperline Bikes", total: "$312.75", status: "Shipped", date: "Mon" },
];

const STATUS_COLOR = { Paid: "success", Shipped: "running", Refunded: "cancelled" } as const;

const COLUMNS: GridColDef<OrderRow>[] = [
  { field: "id", headerName: "Order", width: 96 },
  { field: "customer", headerName: "Customer", flex: 1, minWidth: 160 },
  { field: "date", headerName: "Placed", width: 120 },
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
  { field: "total", headerName: "Total", width: 110, align: "right", headerAlign: "right" },
];

function Sparkline() {
  const max = Math.max(...WEEK);
  const points = WEEK.map((v, i) => `${(i / (WEEK.length - 1)) * 100},${40 - (v / max) * 36}`).join(
    " ",
  );
  return (
    <svg
      viewBox="0 0 100 40"
      preserveAspectRatio="none"
      role="img"
      aria-label="Revenue rising over twelve weeks"
      style={{ width: "100%", height: 120 }}
    >
      <polyline
        points={`0,40 ${points} 100,40`}
        fill="var(--mui-palette-primary-main)"
        fillOpacity="0.08"
        stroke="none"
      />
      <polyline
        points={points}
        fill="none"
        stroke="var(--mui-palette-primary-main)"
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/** Concept screen: a store's analytics overview built from Fabric kits. */
export function AnalyticsDashboard() {
  const [selected, setSelected] = useState("overview");
  return (
    <FabricAppShell
      sidebarProps={{
        open: true,
        onToggle: () => {},
        items: NAV.map((item) => ({ ...item, onClick: () => setSelected(item.key) })),
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
      <FabricStack gap="lg" sx={{ p: 3 }}>
        <FabricFlex justify="space-between" align="center">
          <FabricText textVariant="headingMd" component="h3" sx={{ m: 0 }}>
            Overview
          </FabricText>
          <FabricChip label="Last 12 weeks" variant="outlined" />
        </FabricFlex>
        <FabricGrid container spacing={2}>
          {KPIS.map((kpi) => (
            <FabricGrid key={kpi.title} size={{ xs: 12, sm: 4 }}>
              <FabricCard>
                <FabricCardHeader size="large" title={kpi.value} subheader={kpi.title} />
                <FabricCardRows rows={kpi.rows} />
              </FabricCard>
            </FabricGrid>
          ))}
        </FabricGrid>
        <FabricCard sx={{ p: 2 }}>
          <FabricText textVariant="uiMd" color="text.secondary">
            Weekly revenue
          </FabricText>
          <Sparkline />
        </FabricCard>
        <FabricCard>
          <FabricDatagrid
            sx={{ "& .MuiDataGrid-topContainer": { position: "relative" } }}
            rows={ORDERS}
            columns={COLUMNS}
            hideFooter
            disableRowSelectionOnClick
            density="compact"
          />
        </FabricCard>
      </FabricStack>
    </FabricAppShell>
  );
}
