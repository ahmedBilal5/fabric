import BarChartIcon from "@fabric-kit/icons/BarChart";
import HomeIcon from "@fabric-kit/icons/Home";
import PeopleIcon from "@fabric-kit/icons/People";
import SearchIcon from "@fabric-kit/icons/Search";
import SettingsIcon from "@fabric-kit/icons/Settings";
import StorageIcon from "@fabric-kit/icons/Storage";
import { Box, InputAdornment, TextField, Typography } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { FabricAppShell } from "../src/FabricAppShell";
import { FabricBanner } from "../src/FabricBanner";
import { FabricNotificationDrawer } from "../src/FabricNotificationDrawer";
import type {
  AppSwitcherItem,
  NavigationItem,
  NotificationItem,
  UserInfo,
  WorkspaceItem,
} from "../src/types";
import { appShortcuts } from "./appShortcuts";

const notifications: NotificationItem[] = [
  {
    id: "1",
    sender: { name: "John Smith", id: "user-1" },
    content: "Approved your request for data source access",
    context: "Production DB",
    timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    isRead: false,
    type: "readonly",
  },
  {
    id: "2",
    sender: { name: "Alice Johnson", id: "user-2" },
    content: "Requested approval for data pipeline deployment",
    context: "Customer ETL Flow",
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    isRead: false,
    type: "approval",
  },
  {
    id: "3",
    sender: { name: "System", id: "system" },
    content: "Your scheduled export has completed successfully",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    isRead: true,
    type: "readonly",
  },
];

const navItems: NavigationItem[] = [
  { key: "home", label: "Home", icon: <HomeIcon /> },
  { key: "analytics", label: "Analytics", icon: <BarChartIcon /> },
  { key: "users", label: "Users", icon: <PeopleIcon /> },
  { key: "data", label: "Data Sources", icon: <StorageIcon /> },
  { key: "settings", label: "Settings", icon: <SettingsIcon /> },
];

const user: UserInfo = {
  firstName: "Jane",
  lastName: "Doe",
  email: "jane.doe@example.com",
};

const apps: AppSwitcherItem[] = appShortcuts;

const workspaces: WorkspaceItem[] = [
  { id: "ws-1", name: "Production", icon: <StorageIcon fontSize="small" /> },
  { id: "ws-2", name: "Staging", icon: <StorageIcon fontSize="small" /> },
];

const meta = {
  title: "Kits/Layout/FabricAppShell",
  component: FabricAppShell,
  parameters: {
    docs: {
      description: {
        component:
          "Full application shell composing FabricSidebar + FabricTopBar + content area. " +
          "Manages sidebar open/close state internally (uncontrolled) or via " +
          "`sidebarOpen`/`onSidebarOpenChange` (controlled). Responsive: sidebar collapses " +
          "to overlay on mobile, topbar shows hamburger toggle.",
      },
    },
    layout: "fullscreen",
  },
} satisfies Meta<typeof FabricAppShell>;

export default meta;
type Story = StoryObj<typeof FabricAppShell>;

/* ------------------------------------------------------------------ */

export const Default: Story = {
  render: () => {
    const [selected, setSelected] = useState("home");

    return (
      <FabricAppShell
        sidebarProps={{
          open: true,
          onToggle: () => {},
          items: navItems.map((item) => ({
            ...item,
            onClick: () => setSelected(item.key),
          })),
          selectedKey: selected,
        }}
        topBarProps={{
          appTitle: "Platform Application",
          user,
          notificationCount: 3,
          appSwitcherItems: apps,
          onNotificationClick: () => {},
          onUserMenuAction: (action) => console.log(action),
        }}
      >
        <Box sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>
            Welcome
          </Typography>
          <Typography variant="body1" color="text.secondary">
            This is the main content area rendered inside FabricAppShell.
          </Typography>
        </Box>
      </FabricAppShell>
    );
  },
};

export const WithSearchAndWorkspaces: Story = {
  name: "With search, workspaces, impersonation banner and notifs",
  render: () => {
    const [selected, setSelected] = useState("home");
    const [notifOpen, setNotifOpen] = useState(false);
    const [items, setItems] = useState(notifications);
    const [loadingIds, setLoadingIds] = useState<(string | number)[]>([]);

    const handleAction = (id: string | number, action: string) => {
      setLoadingIds((prev) => [...prev, id]);
      setTimeout(() => {
        setItems((prev) =>
          prev.map((item) => (item.id === id ? { ...item, actionPerformed: action } : item)),
        );
        setLoadingIds((prev) => prev.filter((i) => i !== id));
      }, 1000);
    };

    const unreadCount = items.filter((i) => !i.isRead).length;

    return (
      <>
        <FabricAppShell
          sidebarProps={{
            open: true,
            onToggle: () => {},
            items: navItems.map((item) => ({
              ...item,
              onClick: () => setSelected(item.key),
            })),
            selectedKey: selected,
            workspaceItems: workspaces,
            showWorkspaceSelector: true,
            onWorkspaceChange: (id) => console.log("Switch to", id),
          }}
          topBarProps={{
            appTitle: "Administration",
            user,
            notificationCount: unreadCount,
            appSwitcherItems: apps,
            renderSearch: () => (
              <TextField
                placeholder="Search..."
                size="small"
                fullWidth
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            ),
            onNotificationClick: () => setNotifOpen(true),
            onUserMenuAction: (action) => console.log(action),
          }}
          bannerSlot={
            <FabricBanner
              sx={{ width: "100%" }}
              fixed={false}
              severity="warning"
              message="You are viewing the app as Jane Doe (jane.doe@example.com)."
              action={{ label: "Exit", onClick: () => console.log("exit") }}
            />
          }
        >
          <Box sx={{ p: 4 }}>
            <Typography variant="body1">
              Full shell with search, workspaces, a banner, and the notification drawer.
              Click the bell icon to open notifications.
            </Typography>
          </Box>
        </FabricAppShell>

        <FabricNotificationDrawer
          open={notifOpen}
          onClose={() => setNotifOpen(false)}
          items={items}
          onAction={handleAction}
          actionLoadingIds={loadingIds}
          onSortByUnread={() => console.log("sort unread")}
          onSortByDate={() => console.log("sort date")}
          onMarkAllRead={() => setItems((prev) => prev.map((i) => ({ ...i, isRead: true })))}
          onItemClick={(item) => console.log("navigate to", item.id)}
          onSenderClick={(id) => console.log("view profile", id)}
        />
      </>
    );
  },
};

export const WithBanner: Story = {
  name: "With banner slot",
  render: () => {
    const [selected, setSelected] = useState("home");

    return (
      <FabricAppShell
        sidebarProps={{
          open: true,
          onToggle: () => {},
          items: navItems.map((item) => ({
            ...item,
            onClick: () => setSelected(item.key),
          })),
          selectedKey: selected,
        }}
        topBarProps={{
          appTitle: "Administration",
          user,
          notificationCount: 0,
          onNotificationClick: () => {},
          onUserMenuAction: (action) => console.log(action),
        }}
        bannerSlot={
          <FabricBanner
            fixed={false}
            severity="info"
            message="Scheduled maintenance on Sunday from 02:00 to 03:00 UTC."
            sx={{ width: "100%" }}
          />
        }
      >
        <Box sx={{ p: 4 }}>
          <Typography variant="body1">Banner slot pushes sidebar and content down.</Typography>
        </Box>
      </FabricAppShell>
    );
  },
};
