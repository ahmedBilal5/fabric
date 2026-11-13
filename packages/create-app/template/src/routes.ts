/** The app's pages and their paths. Add a page here, in `App.tsx`, and in the sidebar. */

export type Route =
  | { name: "home" }
  | { name: "projects" }
  | { name: "project-new" }
  | { name: "project"; id: string }
  | { name: "project-edit"; id: string }
  | { name: "settings"; section?: string }
  | { name: "not-found"; path: string };

/** Splits `/projects?q=web` into its path and query. */
export function splitLocation(location: string): { path: string; search: URLSearchParams } {
  const [rawPath, query = ""] = location.split("?", 2);
  let path = rawPath.startsWith("/") ? rawPath : `/${rawPath}`;
  if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
  return { path, search: new URLSearchParams(query) };
}

/** Which page a path shows. */
export function matchRoute(path: string): Route {
  const [first, second, third, ...rest] = path.split("/").filter(Boolean).map(decodeURIComponent);
  if (!first) return { name: "home" };
  if (first === "projects" && rest.length === 0) {
    if (!second) return { name: "projects" };
    if (second === "new" && !third) return { name: "project-new" };
    if (!third) return { name: "project", id: second };
    if (third === "edit") return { name: "project-edit", id: second };
  }
  if (first === "settings" && !third) return { name: "settings", section: second };
  return { name: "not-found", path };
}

/** The path for a page. */
export function routePath(route: Exclude<Route, { name: "not-found" }>): string {
  switch (route.name) {
    case "home":
      return "/";
    case "projects":
      return "/projects";
    case "project-new":
      return "/projects/new";
    case "project":
      return `/projects/${encodeURIComponent(route.id)}`;
    case "project-edit":
      return `/projects/${encodeURIComponent(route.id)}/edit`;
    case "settings":
      return route.section ? `/settings/${encodeURIComponent(route.section)}` : "/settings";
  }
}

/** An `href` for a path. */
export const href = (path: string) => `#${path}`;
