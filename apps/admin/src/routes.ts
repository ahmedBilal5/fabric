/**
 * The app's pages and their paths. Pure functions, so they're easy to test and the
 * router stays tiny. Paths live after the `#` (`#/customers/c-1004?tab=invoices`), so
 * the build works from any folder on a static host.
 */

export type Route =
  | { name: "dashboard" }
  | { name: "customers" }
  | { name: "customer-new" }
  | { name: "customer"; id: string }
  | { name: "customer-edit"; id: string }
  | { name: "settings"; section?: string }
  | { name: "not-found"; path: string };

/** The sidebar entry each page belongs to. */
export type NavKey = "dashboard" | "customers" | "settings";

/** Splits `/customers?q=acme` into its path and query. Adds a leading slash, drops a trailing one. */
export function splitLocation(location: string): { path: string; search: URLSearchParams } {
  const [rawPath, query = ""] = location.split("?", 2);
  let path = rawPath.startsWith("/") ? rawPath : `/${rawPath}`;
  if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
  return { path, search: new URLSearchParams(query) };
}

/** Which page a path shows. Unknown paths give `not-found`. */
export function matchRoute(path: string): Route {
  const parts = path.split("/").filter(Boolean).map(decodeURIComponent);
  const [first, second, third, ...rest] = parts;
  if (parts.length === 0) return { name: "dashboard" };
  if (first === "customers" && rest.length === 0) {
    if (!second) return { name: "customers" };
    if (second === "new" && !third) return { name: "customer-new" };
    if (!third) return { name: "customer", id: second };
    if (third === "edit") return { name: "customer-edit", id: second };
  }
  if (first === "settings" && !third) return { name: "settings", section: second };
  return { name: "not-found", path };
}

/** The path for a page: the inverse of `matchRoute`. */
export function routePath(route: Exclude<Route, { name: "not-found" }>): string {
  switch (route.name) {
    case "dashboard":
      return "/";
    case "customers":
      return "/customers";
    case "customer-new":
      return "/customers/new";
    case "customer":
      return `/customers/${encodeURIComponent(route.id)}`;
    case "customer-edit":
      return `/customers/${encodeURIComponent(route.id)}/edit`;
    case "settings":
      return route.section ? `/settings/${encodeURIComponent(route.section)}` : "/settings";
  }
}

/** The sidebar entry to highlight for a page. */
export function navKeyFor(route: Route): NavKey | undefined {
  switch (route.name) {
    case "dashboard":
      return "dashboard";
    case "customers":
    case "customer":
    case "customer-new":
    case "customer-edit":
      return "customers";
    case "settings":
      return "settings";
    default:
      return undefined;
  }
}

/** An `href` for a path. Hash links work in any host and in Storybook. */
export const href = (path: string) => `#${path}`;
