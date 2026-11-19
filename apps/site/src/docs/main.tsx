import "@fontsource/geist-mono/400.css";
import "../styles/page.css";
import "../styles/docs.css";

import { pages } from "virtual:docs-index";
import { createRoot, hydrateRoot } from "react-dom/client";
import { DocsApp } from "./DocsApp";
import { type DocsModule, slugFromPath, slugOf } from "./pages";

// Each page is its own chunk; only the open page downloads.
const loaders = import.meta.glob<DocsModule>("../../content/docs/**/*.mdx");
const bySlug = Object.fromEntries(
  Object.entries(loaders).map(([path, load]) => [slugOf(path), load]),
);

const slug = slugFromPath(window.location.pathname, import.meta.env.BASE_URL);
// The prerender writes the <title>; the dev server's shell has none.
if (!document.title)
  document.title = pages[slug] ? `${pages[slug].title} · Fabric docs` : "Documentation · Fabric";

async function start() {
  const page = bySlug[slug] ? await bySlug[slug]() : undefined;
  // biome-ignore lint/style/noNonNullAssertion: the root element is in docs.html.
  const root = document.getElementById("root")!;
  const app = <DocsApp slug={slug} page={page} />;
  // The build prerenders every page, so hydrate it; the dev server sends an empty shell.
  if (root.hasChildNodes()) hydrateRoot(root, app);
  else createRoot(root).render(app);
}

start();
