/**
 * Builds the docs navigation at build time, so it can't fall behind the packages.
 *
 * - Storybook pages: every MDX page names its Storybook title directly
 *   (`<Meta title="…" />`) or through the stories file it documents
 *   (`<Meta of={Stories} name="Overview" />`); stories tagged `autodocs` get a page too.
 * - Site pages: MDX files in `apps/site/content/docs/`, placed by their frontmatter.
 *
 * The result is served as `virtual:docs-index` (see `src/docs-index.d.ts`).
 */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import type { Plugin } from "vite";
import { buildDocs, type SitePage, type StoryDoc, sitePageFrom, toStoryId } from "./docs-nav";

const ROOTS = ["docs", "packages", "apps"];
const SKIP = new Set(["node_modules", "dist", "dist-ssr", "storybook-static", ".turbo", "site"]);

function files(dir: string, test: (name: string) => boolean, out: string[] = []): string[] {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) files(path, test, out);
    else if (test(name)) out.push(path);
  }
  return out;
}

function storiesTitle(mdxPath: string, source: string, binding: string): string | undefined {
  const from = new RegExp(`import \\* as ${binding} from ['"]([^'"]+)['"]`).exec(source)?.[1];
  if (!from) return undefined;
  const base = resolve(dirname(mdxPath), from);
  const file = [base, `${base}.tsx`, `${base}.ts`].find(
    (f) => existsSync(f) && statSync(f).isFile(),
  );
  if (!file) return undefined;
  return metaTitle(readFileSync(file, "utf8"));
}

const META = /(?:const meta\b[^=]*=|export default)\s*\{/;

/** The `title` of a stories file's default export, not one in its sample data. */
function metaTitle(source: string): string | undefined {
  const meta = META.exec(source);
  if (!meta) return undefined;
  return /\btitle:\s*["']([^"']+)["']/.exec(source.slice(meta.index))?.[1];
}

/** Every docs page Storybook builds: MDX pages and autodocs stories. */
export function readStoryDocs(repoRoot: string): StoryDoc[] {
  const docs = new Map<string, StoryDoc>();
  const add = (title: string, name: string) => {
    const id = toStoryId(title, name);
    if (!docs.has(id)) docs.set(id, { title, id });
  };
  for (const root of ROOTS) {
    const found = files(
      join(repoRoot, root),
      (n) => n.endsWith(".mdx") || n.endsWith(".stories.tsx"),
    );
    for (const file of found) {
      const source = readFileSync(file, "utf8");
      if (file.endsWith(".stories.tsx")) {
        const title = metaTitle(source);
        const meta = source.slice(META.exec(source)?.index ?? 0);
        if (title && /\btags:\s*\[[^\]]*["']autodocs["']/.test(meta)) add(title, "Docs");
        continue;
      }
      const direct = /<Meta\s+title=["']([^"']+)["'](?:\s+name=["']([^"']+)["'])?/.exec(source);
      const linked = /<Meta\s+of=\{(\w+)\}(?:\s+name=["']([^"']+)["'])?/.exec(source);
      if (direct) add(direct[1], direct[2] ?? "Docs");
      else if (linked) {
        const title = storiesTitle(file, source, linked[1]);
        if (title) add(title, linked[2] ?? "Docs");
      }
    }
  }
  return [...docs.values()];
}

/** The site's own docs pages, from `apps/site/content/docs/**.mdx`. */
export function readSitePages(repoRoot: string): SitePage[] {
  const dir = join(repoRoot, "apps/site/content/docs");
  return files(dir, (n) => n.endsWith(".mdx")).map((file) => {
    const slug = relative(dir, file)
      .replace(/\\/g, "/")
      .replace(/(^|\/)index\.mdx$/, "")
      .replace(/\.mdx$/, "");
    const rel = relative(repoRoot, file).replace(/\\/g, "/");
    return sitePageFrom(rel, slug, readFileSync(file, "utf8"));
  });
}

const ID = "virtual:docs-index";

/**
 * Serves `virtual:docs-index`, and in dev sends `<base>docs/…` page URLs to
 * `docs.html` (the build writes one HTML file per page instead).
 */
export function docsIndex(repoRoot: string): Plugin {
  let base = "/";
  return {
    name: "fabric-docs-index",
    configResolved(config) {
      base = config.base;
    },
    resolveId: (id) => (id === ID ? `\0${ID}` : undefined),
    load(id) {
      if (id !== `\0${ID}`) return undefined;
      const stories = readStoryDocs(repoRoot);
      const data = buildDocs(stories, readSitePages(repoRoot), base);
      const known = [...stories.map((s) => s.id), ...Object.keys(data.redirects)];
      return [
        `export const base = ${JSON.stringify(base)};`,
        `export const sections = ${JSON.stringify(data.sections)};`,
        `export const pages = ${JSON.stringify(data.pages)};`,
        `export const redirects = ${JSON.stringify(data.redirects)};`,
        `export const knownIds = new Set(${JSON.stringify(known)});`,
      ].join("\n");
    },
    handleHotUpdate({ file, server }) {
      // A new or renamed docs page changes the nav.
      if (!file.endsWith(".mdx")) return;
      const mod = server.moduleGraph.getModuleById(`\0${ID}`);
      if (mod) server.moduleGraph.invalidateModule(mod);
    },
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const path = req.url?.split(/[?#]/)[0] ?? "";
        if (path.startsWith(`${base}docs`) && !/\.\w+$/.test(path)) {
          req.url = `${base}docs.html${req.url?.slice(path.length) ?? ""}`;
        }
        next();
      });
    },
  };
}
