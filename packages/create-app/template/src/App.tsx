import { FabricConfirmProvider, FabricToastProvider } from "@fabric-kit/components";
import { spacing } from "@fabric-kit/design-tokens";
import FolderOutlined from "@fabric-kit/icons/FolderOutlined";
import SettingsOutlined from "@fabric-kit/icons/SettingsOutlined";
import SpaceDashboardOutlined from "@fabric-kit/icons/SpaceDashboardOutlined";
import { FabricAppShell, type NavigationItem } from "@fabric-kit/layout";
import { useBreakpoint } from "@fabric-kit/theme";
import Box from "@mui/material/Box";
import { lazy, useEffect, useRef, useState } from "react";
import { PageSuspense } from "./PageSuspense";
import { useRouter } from "./router";
import type { Route } from "./routes";

export const APP_NAME = "My Fabric app";

// One chunk per page, so the first visit only downloads the shell and the page you
// open. The charts, data grid and date pickers load with the pages that use them.
const pages = {
  home: () => import("./pages/HomePage"),
  projects: () => import("./pages/ProjectsPage"),
  project: () => import("./pages/ProjectPage"),
  projectForm: () => import("./pages/ProjectFormPage"),
  settings: () => import("./pages/SettingsPage"),
  notFound: () => import("./pages/NotFoundPage"),
};
const HomePage = lazy(() => pages.home().then((m) => ({ default: m.HomePage })));
const ProjectsPage = lazy(() => pages.projects().then((m) => ({ default: m.ProjectsPage })));
const ProjectPage = lazy(() => pages.project().then((m) => ({ default: m.ProjectPage })));
const ProjectFormPage = lazy(() =>
  pages.projectForm().then((m) => ({ default: m.ProjectFormPage })),
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
  { key: "home", label: "Home", icon: <SpaceDashboardOutlined />, path: "#/" },
  { key: "projects", label: "Projects", icon: <FolderOutlined />, path: "#/projects" },
  { key: "settings", label: "Settings", icon: <SettingsOutlined />, path: "#/settings" },
];

function navKey(route: Route) {
  if (route.name === "home" || route.name === "settings") return route.name;
  if (route.name.startsWith("project")) return "projects";
  return undefined;
}

function Page({ route }: { route: Route }) {
  switch (route.name) {
    case "home":
      return <HomePage />;
    case "projects":
      return <ProjectsPage />;
    case "project-new":
      return <ProjectFormPage />;
    case "project":
      return <ProjectPage id={route.id} />;
    case "project-edit":
      return <ProjectFormPage id={route.id} />;
    case "settings":
      return <SettingsPage section={route.section} />;
    default:
      return <NotFoundPage />;
  }
}

export interface AppProps {
  /** Show the light/dark toggle in the top bar. @default true */
  showThemeToggle?: boolean;
}

/** The app shell around the current page. */
export function App({ showThemeToggle = true }: AppProps) {
  const { route, path, onLinkClick } = useRouter();
  const content = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);
  const isMobile = useBreakpoint("down", "md");
  const [desktopOpen, setDesktopOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: closes on every page change
  useEffect(() => setMobileOpen(false), [path]);

  // Once the new page is on screen, move focus to its heading so screen readers
  // announce it, start at the top, and name the browser tab after the page.
  const pageShown = () => {
    requestAnimationFrame(() => {
      const heading = content.current?.querySelector("h1");
      if (heading?.textContent) document.title = `${heading.textContent} · ${APP_NAME}`;
      if (firstRender.current) {
        firstRender.current = false;
        return;
      }
      window.scrollTo?.({ top: 0 });
      heading?.setAttribute("tabindex", "-1");
      heading?.focus({ preventScroll: true });
    });
  };

  return (
    <FabricConfirmProvider>
      <FabricToastProvider>
        <Box onClick={onLinkClick} sx={{ "& h1:focus": { outline: "none" } }}>
          <FabricAppShell
            sidebarOpen={isMobile ? mobileOpen : desktopOpen}
            onSidebarOpenChange={isMobile ? setMobileOpen : setDesktopOpen}
            sidebarProps={{
              open: true,
              onToggle: () => {},
              items: NAV,
              selectedKey: navKey(route),
            }}
            topBarProps={{
              appTitle: APP_NAME,
              user: { firstName: "Jane", lastName: "Doe", email: "jane@example.com" },
              showNotifications: false,
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
                pb: `${spacing["3xl"]}px`,
              }}
            >
              <PageSuspense pageKey={path} onShown={pageShown}>
                <Page route={route} />
              </PageSuspense>
            </Box>
          </FabricAppShell>
        </Box>
      </FabricToastProvider>
    </FabricConfirmProvider>
  );
}
