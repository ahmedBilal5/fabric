/**
 * A tiny router: enough for an example app, with no extra dependency. In a real app,
 * use the router you already have (React Router, TanStack Router, Next.js); the pages
 * only need `navigate`, the current route and its search params.
 *
 * - `hash` mode reads and writes `location.hash`, so back and forward work.
 * - `memory` mode keeps the location in state, for Storybook and tests. Clicks on
 *   `#/…` links inside the app are routed in memory instead of changing the page URL.
 */

import {
  createContext,
  type MouseEvent,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { matchRoute, type Route, splitLocation } from "./routes";

export interface RouterValue {
  /** The current path, e.g. `/customers/c-1004`. */
  path: string;
  /** The current query string. */
  search: URLSearchParams;
  /** The page for the current path. */
  route: Route;
  /** Goes to a path, optionally with a query: `navigate("/customers?q=acme")`. */
  navigate: (to: string, options?: { replace?: boolean }) => void;
  /** Replaces the query string without adding a history entry. */
  setSearch: (search: URLSearchParams) => void;
  /** Routes clicks on `#/…` links in memory mode. Put it on the app's root element. */
  onLinkClick: (event: MouseEvent) => void;
}

const RouterContext = createContext<RouterValue | null>(null);

const readHash = () =>
  typeof window === "undefined" ? "/" : window.location.hash.replace(/^#/, "") || "/";

export interface RouterProviderProps {
  /** Where the location lives. @default "hash" */
  mode?: "hash" | "memory";
  /** The starting location in memory mode, e.g. `/customers?q=acme`. @default "/" */
  initialLocation?: string;
  children: ReactNode;
}

export function RouterProvider({
  mode = "hash",
  initialLocation = "/",
  children,
}: RouterProviderProps) {
  const [location, setLocation] = useState(() => (mode === "hash" ? readHash() : initialLocation));

  useEffect(() => {
    if (mode !== "hash") return;
    const sync = () => setLocation(readHash());
    // Typed or pasted links fire `hashchange`; back and forward fire `popstate`.
    window.addEventListener("hashchange", sync);
    window.addEventListener("popstate", sync);
    return () => {
      window.removeEventListener("hashchange", sync);
      window.removeEventListener("popstate", sync);
    };
  }, [mode]);

  const navigate = useCallback(
    (to: string, { replace = false } = {}) => {
      if (mode === "hash") {
        if (replace) window.history.replaceState(window.history.state, "", `#${to}`);
        else window.history.pushState(window.history.state, "", `#${to}`);
      }
      setLocation(to);
    },
    [mode],
  );

  const value = useMemo<RouterValue>(() => {
    const { path, search } = splitLocation(location);
    return {
      path,
      search,
      route: matchRoute(path),
      navigate,
      setSearch: (next) => {
        const qs = next.toString();
        navigate(qs ? `${path}?${qs}` : path, { replace: true });
      },
      onLinkClick: (event) => {
        if (mode !== "memory" || event.defaultPrevented || event.button !== 0) return;
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        const link = (event.target as HTMLElement).closest?.("a[href^='#/']");
        if (!link) return;
        event.preventDefault();
        navigate(link.getAttribute("href")?.slice(1) ?? "/");
      },
    };
  }, [location, mode, navigate]);

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

/** The current route and how to change it. */
export function useRouter(): RouterValue {
  const value = useContext(RouterContext);
  if (!value) throw new Error("useRouter must be used inside <RouterProvider>");
  return value;
}
