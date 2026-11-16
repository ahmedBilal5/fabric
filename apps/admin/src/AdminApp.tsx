/**
 * The example admin app: Fabric's app shell around one page per route. Every screen is
 * a Fabric page pattern (dashboard, list, detail, form, settings, system page) over the
 * mock data in `./data`.
 */

import { FabricConfirmProvider, FabricToastProvider, useToast } from "@fabric-kit/components";
import { spacing } from "@fabric-kit/design-tokens";
import PeopleOutlined from "@fabric-kit/icons/PeopleOutlined";
import SettingsOutlined from "@fabric-kit/icons/SettingsOutlined";
import SpaceDashboardOutlined from "@fabric-kit/icons/SpaceDashboardOutlined";
import {
  FabricAppShell,
  FabricNotificationDrawer,
  type NavigationItem,
  type NotificationItem,
} from "@fabric-kit/layout";
import { useBreakpoint } from "@fabric-kit/theme";
import Box from "@mui/material/Box";
import { lazy, useEffect, useMemo, useRef, useState } from "react";
import { useData } from "./data/store";
import { PageSuspense } from "./PageSuspense";
import { useRouter } from "./router";
import { navKeyFor, routePath } from "./routes";

export const APP_NAME = "Acme Admin";

// One chunk per page: the charts, the data grid and the date pickers only download
// when a page that uses them opens.
const pages = {
  dashboard: () => import("./pages/DashboardPage"),
  customers: () => import("./pages/CustomersPage"),
  customer: () => import("./pages/CustomerPage"),
  customerForm: () => import("./pages/CustomerFormPage"),
  settings: () => import("./pages/SettingsPage"),
  notFound: () => import("./pages/NotFoundPage"),
};
const DashboardPage = lazy(() => pages.dashboard().then((m) => ({ default: m.DashboardPage })));
const CustomersPage = lazy(() => pages.customers().then((m) => ({ default: m.CustomersPage })));
const CustomerPage = lazy(() => pages.customer().then((m) => ({ default: m.CustomerPage })));
const CustomerFormPage = lazy(() =>
  pages.customerForm().then((m) => ({ default: m.CustomerFormPage })),
);
const SettingsPage = lazy(() => pages.settings().then((m) => ({ default: m.SettingsPage })));
const NotFoundPage = lazy(() => pages.notFound().then((m) => ({ default: m.NotFoundPage })));

/**
 * Starts downloading every page now, e.g. once the first page has loaded or before a
 * story renders. Later navigation is then instant.
 */
export function preloadPages() {
  return Promise.all(Object.values(pages).map((load) => load()));
}

const NAV: NavigationItem[] = [
  { key: "dashboard", label: "Dashboard", icon: <SpaceDashboardOutlined />, path: "#/" },
  { key: "customers", label: "Customers", icon: <PeopleOutlined />, path: "#/customers" },
  { key: "settings", label: "Settings", icon: <SettingsOutlined />, path: "#/settings" },
];

export interface AdminAppProps {
  /** Show the light/dark toggle in the top bar. Storybook hides it: its toolbar sets the mode. */
  showThemeToggle?: boolean;
  /** Name the browser tab after the current page. @default true */
  syncDocumentTitle?: boolean;
}

/** The whole example app. Needs `DataProvider` and `RouterProvider` above it. */
export function AdminApp(props: AdminAppProps) {
  return (
    <FabricConfirmProvider>
      <FabricToastProvider>
        <Shell {...props} />
      </FabricToastProvider>
    </FabricConfirmProvider>
  );
}

function Shell({ showThemeToggle = true, syncDocumentTitle = true }: AdminAppProps) {
  const { route, path, navigate, onLinkClick } = useRouter();
  const toast = useToast();
  const notifications = useNotifications();
  const content = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);
  // On phones the sidebar is an overlay: start closed, and close it after each navigation.
  const isMobile = useBreakpoint("down", "md");
  const [desktopOpen, setDesktopOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  // biome-ignore lint/correctness/useExhaustiveDependencies: closes on every page change
  useEffect(() => setMobileOpen(false), [path]);

  // Once the new page is on screen, move focus to its heading so screen readers
  // announce it, start at the top, and name the tab after the page.
  const pageShown = () => {
    requestAnimationFrame(() => {
      const heading = content.current?.querySelector("h1");
      if (syncDocumentTitle && heading?.textContent)
        document.title = `${heading.textContent} · ${APP_NAME}`;
      if (firstRender.current) {
        firstRender.current = false;
        return;
      }
      window.scrollTo?.({ top: 0 });
      if (heading) {
        heading.setAttribute("tabindex", "-1");
        heading.focus({ preventScroll: true });
      }
    });
  };

  return (
    <Box onClick={onLinkClick} sx={{ "& h1:focus": { outline: "none" } }}>
      <FabricAppShell
        sidebarOpen={isMobile ? mobileOpen : desktopOpen}
        onSidebarOpenChange={isMobile ? setMobileOpen : setDesktopOpen}
        sidebarProps={{ open: true, onToggle: () => {}, items: NAV, selectedKey: navKeyFor(route) }}
        topBarProps={{
          appTitle: APP_NAME,
          user: { firstName: "Jane", lastName: "Doe", email: "jane@acme.example.com" },
          notificationCount: notifications.unread,
          onNotificationClick: () => notifications.setOpen(true),
          onUserMenuAction: (action) => {
            if (action === "profile") navigate(routePath({ name: "settings", section: "profile" }));
            else toast({ title: "This example has no sign-in", severity: "info" });
          },
          showThemeToggle,
        }}
      >
        <Box
          ref={content}
          sx={{
            width: "100%",
            maxWidth: 1440,
            mx: "auto",
            p: { xs: `${spacing.lg}px`, md: `${spacing.xl}px` },
            pb: { xs: `${spacing["3xl"]}px` },
          }}
        >
          <PageSuspense pageKey={path} onShown={pageShown}>
            <Page />
          </PageSuspense>
        </Box>
      </FabricAppShell>
      <FabricNotificationDrawer
        open={notifications.open}
        onClose={() => notifications.setOpen(false)}
        items={notifications.items}
        onMarkAllRead={notifications.markAllRead}
        onItemClick={(item) => {
          notifications.markRead(item.id);
          notifications.setOpen(false);
          if (item.url) navigate(item.url);
        }}
      />
    </Box>
  );
}

function Page() {
  const { route } = useRouter();
  switch (route.name) {
    case "dashboard":
      return <DashboardPage />;
    case "customers":
      return <CustomersPage />;
    case "customer-new":
      return <CustomerFormPage />;
    case "customer":
      return <CustomerPage id={route.id} />;
    case "customer-edit":
      return <CustomerFormPage id={route.id} />;
    case "settings":
      return <SettingsPage section={route.section} />;
    default:
      return <NotFoundPage />;
  }
}

/** A few notifications about past-due and new accounts, from the data. */
function useNotifications() {
  const { customers, today } = useData();
  const [open, setOpen] = useState(false);
  const [read, setRead] = useState<Set<string | number>>(() => new Set());
  const items = useMemo<NotificationItem[]>(() => {
    const overdue = customers.filter((c) => c.status === "past_due").slice(0, 2);
    const newest = customers.filter((c) => c.status === "trial").slice(0, 2);
    const hour = 3_600_000;
    return [
      ...overdue.map((c, i) => ({
        id: `overdue-${c.id}`,
        sender: { name: "Billing" },
        content: `${c.name}'s latest invoice is overdue.`,
        timestamp: new Date(today.getTime() - (i + 1) * 5 * hour),
        type: "readonly" as const,
        url: routePath({ name: "customer", id: c.id }),
      })),
      ...newest.map((c, i) => ({
        id: `trial-${c.id}`,
        sender: { name: c.owner },
        content: `${c.name} started a trial.`,
        context: `${c.seats} seats`,
        timestamp: new Date(today.getTime() - (i + 1) * 26 * hour),
        type: "readonly" as const,
        url: routePath({ name: "customer", id: c.id }),
      })),
    ].map((n) => ({ ...n, isRead: read.has(n.id) }));
  }, [customers, today, read]);

  return {
    open,
    setOpen,
    items,
    unread: items.filter((n) => !n.isRead).length,
    markRead: (id: string | number) => setRead((s) => new Set(s).add(id)),
    markAllRead: () => setRead(new Set(items.map((n) => n.id))),
  };
}
