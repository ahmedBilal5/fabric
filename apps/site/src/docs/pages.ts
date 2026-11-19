import type { ComponentType } from "react";
import type { TocItem } from "../../rehype-toc";

/** A compiled docs page: the MDX content and its headings. */
export interface DocsModule {
  default: ComponentType<{ components?: Record<string, unknown> }>;
  toc: TocItem[];
}

/** `../../content/docs/foundations/installation.mdx` → `foundations/installation`. */
export function slugOf(path: string): string {
  return path
    .replace(/^.*\/content\/docs\//, "")
    .replace(/(^|\/)index\.mdx$/, "")
    .replace(/\.mdx$/, "");
}

/** The page slug for a URL path: `/fabric/docs/foundations/installation/` → `foundations/installation`. */
export function slugFromPath(pathname: string, base: string): string {
  return pathname
    .slice(`${base}docs`.length)
    .replace(/^\.html/, "")
    .replace(/\/index\.html$/, "")
    .replace(/^\/+|\/+$/g, "");
}
