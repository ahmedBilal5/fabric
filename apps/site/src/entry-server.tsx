import { pages, redirects } from "virtual:docs-index";
import { renderToString } from "react-dom/server";
import { App } from "./App";
import { DocsApp } from "./docs/DocsApp";
import { type DocsModule, slugOf } from "./docs/pages";

/** Prerenders the page's text and chrome; live screens render in the browser. */
export function render(): string {
  return renderToString(<App />);
}

const modules = import.meta.glob<DocsModule>("../content/docs/**/*.mdx", { eager: true });
const bySlug = Object.fromEntries(Object.entries(modules).map(([path, m]) => [slugOf(path), m]));

/** Every docs URL to prerender: the home page (`""`) and each site page. */
export const docsSlugs = ["", ...Object.keys(pages)];

/** The `<title>` and description of a docs page, for the prerendered `<head>`. */
export function docsHead(slug: string): { title: string; description: string } {
  const meta = pages[slug];
  return meta
    ? { title: `${meta.title} · Fabric docs`, description: meta.description }
    : {
        title: "Documentation · Fabric",
        description:
          "Guides, components, patterns and kits for Fabric, a free, open-source design system on MUI.",
      };
}

/** Prerenders one docs page. */
export function renderDocs(slug: string): string {
  return renderToString(<DocsApp slug={slug} page={bySlug[slug]} />);
}

export { redirects };
