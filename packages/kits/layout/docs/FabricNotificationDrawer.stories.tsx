import HomeIcon from "@fabric-kit/icons/Home";
import PeopleIcon from "@fabric-kit/icons/People";
import StorageIcon from "@fabric-kit/icons/Storage";
import { Box, Typography } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { FabricAppShell } from "../src/FabricAppShell";
import { FabricNotificationDrawer } from "../src/FabricNotificationDrawer";
import type { AppSwitcherItem, NavigationItem, NotificationItem, UserInfo } from "../src/types";

const sampleItems: NotificationItem[] = [
  {
    id: "1",
    sender: { name: "John Smith", id: "user-1" },
    content: "Approved your request for data source access",
    context: "Production DB",
    timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(), // 2 min ago
    isRead: false,
    type: "readonly",
  },
  {
    id: "2",
    sender: { name: "Alice Johnson", avatar: "https://i.pravatar.cc/40?img=5", id: "user-2" },
    content: "Requested approval for data pipeline deployment to staging environment",
    context: "Customer ETL Flow",
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 min ago
    isRead: false,
    type: "approval",
  },
  {
    id: "3",
    sender: { name: "System", id: "system" },
    content: "Your scheduled export has completed successfully and is ready for download",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
    isRead: true,
    type: "readonly",
  },
  {
    id: "4",
    sender: { name: "Bob Williams", id: "user-4" },
    content: "Invited you to collaborate on the MDM workspace",
    context: "MDM Workspace",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    isRead: true,
    type: "actionable",
  },
  {
    id: "5",
    sender: { name: "Onboarding", id: "system" },
    content: "Complete your profile setup to unlock all features",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    isRead: true,
    type: "onboarding",
  },
  {
    id: "6",
    sender: { name: "Carol Davis", id: "user-6" },
    content: "Shared a new data mapping configuration with your team",
    context: "Product Mapping",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    isRead: true,
    type: "readonly",
  },
];

const meta = {
  title: "Kits/Layout/FabricNotificationDrawer",
  component: FabricNotificationDrawer,
  parameters: {
    docs: {
      description: {
        component:
          "Right-anchored notification drawer with infinite scroll, sort/filter header, " +
          "and per-item action buttons. Full-screen on mobile viewports.",
      },
    },
    layout: "fullscreen",
  },
} satisfies Meta<typeof FabricNotificationDrawer>;

export default meta;
type Story = StoryObj<typeof FabricNotificationDrawer>;

/* ------------------------------------------------------------------ */

export const Default: Story = {
  name: "Default",
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <FabricNotificationDrawer
        open={open}
        onClose={() => setOpen(false)}
        items={sampleItems}
        onSortByUnread={() => console.log("sort unread")}
        onSortByDate={() => console.log("sort date")}
        onMarkAllRead={() => console.log("mark all read")}
        onSenderClick={(id) => console.log("sender clicked", id)}
        onItemClick={(item) => console.log("item clicked", item.id)}
      />
    );
  },
};

export const WithActions: Story = {
  name: "With actionable items",
  render: () => {
    const [open, setOpen] = useState(true);
    const [items, setItems] = useState(sampleItems);
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

    return (
      <FabricNotificationDrawer
        open={open}
        onClose={() => setOpen(false)}
        items={items}
        onAction={handleAction}
        actionLoadingIds={loadingIds}
        onSortByUnread={() => {}}
        onSortByDate={() => {}}
        onMarkAllRead={() => setItems((prev) => prev.map((i) => ({ ...i, isRead: true })))}
      />
    );
  },
};

export const Loading: Story = {
  name: "Loading state",
  args: {
    open: true,
    onClose: () => {},
    items: [],
    loading: true,
  },
};

export const Empty: Story = {
  name: "Empty state",
  args: {
    open: true,
    onClose: () => {},
    items: [],
  },
};

export const InfiniteScroll: Story = {
  name: "Infinite scroll",
  render: () => {
    const [open, setOpen] = useState(true);
    const [items, setItems] = useState(sampleItems);
    const [hasMore, setHasMore] = useState(true);

    const loadMore = () => {
      setTimeout(() => {
        const newItems: NotificationItem[] = Array.from({ length: 5 }, (_, i) => ({
          id: `extra-${items.length + i}`,
          sender: { name: `User ${items.length + i}`, id: `user-${items.length + i}` },
          content: `Notification content #${items.length + i}`,
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * (items.length + i)).toISOString(),
          isRead: true,
          type: "readonly" as const,
        }));
        const updated = [...items, ...newItems];
        setItems(updated);
        if (updated.length >= 30) setHasMore(false);
      }, 800);
    };

    return (
      <FabricNotificationDrawer
        open={open}
        onClose={() => setOpen(false)}
        items={items}
        hasMore={hasMore}
        onLoadMore={loadMore}
        onViewAll={() => console.log("view all")}
        onSortByUnread={() => {}}
        onSortByDate={() => {}}
        onMarkAllRead={() => {}}
      />
    );
  },
};

/* ------------------------------------------------------------------ */

const navItems: NavigationItem[] = [
  { key: "home", label: "Home", icon: <HomeIcon /> },
  { key: "users", label: "Users", icon: <PeopleIcon /> },
  { key: "data", label: "Data Sources", icon: <StorageIcon /> },
];

const shellUser: UserInfo = {
  firstName: "Jane",
  lastName: "Doe",
  email: "jane.doe@example.com",
};

const shellApps: AppSwitcherItem[] = [
  { id: "analytics", label: "Analytics", onClick: () => {} },
  { id: "admin", label: "Administration", onClick: () => {} },
];

export const WithAppShell: Story = {
  name: "Integrated with AppShell",
  render: () => {
    const [selected, setSelected] = useState("home");
    const [notifOpen, setNotifOpen] = useState(false);
    const [items, setItems] = useState(sampleItems);
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
          }}
          topBarProps={{
            appTitle: "Data Studio",
            user: shellUser,
            notificationCount: unreadCount,
            appSwitcherItems: shellApps,
            onNotificationClick: () => setNotifOpen(true),
            onUserMenuAction: (action) => console.log(action),
          }}
        >
          <Box sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom>
              Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Click the notification bell in the top bar to open the drawer.
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
          onItemClick={(item) => console.log("navigate to", item.url ?? item.id)}
          onSenderClick={(id) => console.log("view profile", id)}
        />
      </>
    );
  },
};
