/**
 * Builds the nav finder's list from the repo's docs pages, so it can't fall behind the
 * packages. Every public component has an MDX page (see CLAUDE.md); each page names
 * its Storybook title directly (`<Meta title="…" />`) or through the stories file it
 * documents (`<Meta of={Stories} name="Overview" />`). The finder imports the result
 * as `virtual:docs-index`.
 */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import type { Plugin } from "vite";

export interface DocsEntry {
  /** What the finder shows, e.g. "Button" for `Components/FabricButton`. */
  name: string;
  /** The title's first part, e.g. "Components". */
  group: string;
  /** The full Storybook title, searched as well as the name. */
  title: string;
  /** The Storybook docs id, e.g. `components-fabricbutton--overview`. */
  path: string;
}

const ROOTS = ["docs", "packages", "apps"];
const SKIP = new Set(["node_modules", "dist", "dist-ssr", "storybook-static", ".turbo"]);

/** Storybook's id rules: lowercase, punctuation and slashes become single dashes. */
export function toStoryId(title: string, name: string): string {
  const clean = (s: string) =>
    s
      .toLowerCase()
      .replace(/[ ’–—―′¿'`~!@#$%^&*()_|+\-=?;:'",.<>{}[\]\\/]/gi, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "");
  return `${clean(title)}--${clean(name)}`;
}

function docsFiles(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) docsFiles(path, out);
    else if (name.endsWith(".mdx") || name.endsWith(".stories.tsx")) out.push(path);
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

/** The `title` of a stories file's default export, not one in its sample data. */
function metaTitle(source: string): string | undefined {
  const meta = /(?:const meta\b[^=]*=|export default)\s*\{/.exec(source);
  if (!meta) return undefined;
  return /\btitle:\s*["']([^"']+)["']/.exec(source.slice(meta.index))?.[1];
}

function entryFor(title: string, metaName: string): DocsEntry {
  const parts = title.split("/");
  const last = parts.at(-1) === "Overview" && parts.length > 1 ? parts.at(-2) : parts.at(-1);
  return {
    name: (last ?? title).replace(/^Fabric(?=[A-Z])/, ""),
    group: parts[0],
    title,
    path: toStoryId(title, metaName),
  };
}

/** Reads every docs page under the repo root: MDX pages and autodocs stories. */
export function readDocsIndex(repoRoot: string): DocsEntry[] {
  const entries = new Map<string, DocsEntry>();
  for (const root of ROOTS) {
    for (const file of docsFiles(join(repoRoot, root))) {
      const source = readFileSync(file, "utf8");
      if (file.endsWith(".stories.tsx")) {
        // Stories tagged `autodocs` get a generated docs page instead of an MDX one.
        const meta = source.slice(
          /(?:const meta\b[^=]*=|export default)\s*\{/.exec(source)?.index ?? 0,
        );
        const title = metaTitle(source);
        if (title && /\btags:\s*\[[^\]]*["']autodocs["']/.test(meta)) {
          const entry = entryFor(title, "Docs");
          if (!entries.has(entry.path)) entries.set(entry.path, entry);
        }
        continue;
      }
      const direct = /<Meta\s+title=["']([^"']+)["'](?:\s+name=["']([^"']+)["'])?/.exec(source);
      const linked = /<Meta\s+of=\{(\w+)\}(?:\s+name=["']([^"']+)["'])?/.exec(source);
      let entry: DocsEntry | undefined;
      if (direct) entry = entryFor(direct[1], direct[2] ?? "Docs");
      else if (linked) {
        const title = storiesTitle(file, source, linked[1]);
        if (title) entry = entryFor(title, linked[2] ?? "Docs");
      }
      if (entry) entries.set(entry.path, entry);
    }
  }
  return [...entries.values()].sort((a, b) => a.title.localeCompare(b.title));
}

const ID = "virtual:docs-index";

/** Serves `virtual:docs-index`: the docs pages as `DocsEntry[]`. */
export function docsIndex(repoRoot: string): Plugin {
  return {
    name: "fabric-docs-index",
    resolveId: (id) => (id === ID ? `\0${ID}` : undefined),
    load: (id) =>
      id === `\0${ID}` ? `export default ${JSON.stringify(readDocsIndex(repoRoot))};` : undefined,
  };
}
