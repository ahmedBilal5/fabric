/**
 * The docs site's navigation, as pure functions so they can be unit tested.
 *
 * Pages come from two places while the docs move out of Storybook (Phases 5 and 6):
 * - **Site pages:** MDX files in `apps/site/content/docs/`, rendered by the site.
 * - **Storybook pages:** everything not moved yet. They stay in the nav and link to
 *   Storybook, so nothing goes missing in between.
 *
 * Both are placed by a Storybook-style title (`Foundations/Installation`) and sorted
 * with the same order as Storybook's sidebar.
 */

/** A docs page that Storybook still hosts. */
export interface StoryDoc {
  /** Storybook title, e.g. `Components/FabricButton`. */
  title: string;
  /** Storybook docs id, e.g. `components-fabricbutton--overview`. */
  id: string;
}

/** A docs page the site renders from MDX. */
export interface SitePage {
  /** URL path under `docs/`, from the file path: `foundations/installation`. */
  slug: string;
  /** Where it sits in the nav, as a Storybook-style title: `Foundations/Installation`. */
  nav: string;
  /** Page heading and `<title>`. */
  title: string;
  /** One sentence for the lead paragraph, search results and link previews. */
  description: string;
  /** Path from the repo root, for "Edit this page". */
  file: string;
  /** Storybook docs ids this page replaces. Old links to them redirect here. */
  replaces: string[];
}

export interface NavItem {
  /** Sidebar text: a site page's title, or a Storybook title shortened by {@link navLabel}. */
  label: string;
  /** Full Storybook-style title, searched by the finder. */
  title: string;
  href: string;
  /** True for site pages, false for pages still in Storybook. */
  local: boolean;
  /** Site pages only. */
  slug?: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export interface PageLink {
  label: string;
  href: string;
  local: boolean;
}

/** What a site page needs besides its MDX: nav position and neighbours. */
export interface PageMeta extends SitePage {
  section: string;
  label: string;
  href: string;
  prev?: PageLink;
  next?: PageLink;
}

export interface DocsData {
  sections: NavSection[];
  /** Site pages by slug. */
  pages: Record<string, PageMeta>;
  /** Storybook docs id → site URL, for every moved page. */
  redirects: Record<string, string>;
}

/**
 * Sidebar order, in Storybook's `storySort` format: a name, optionally followed by
 * the order of its children; `*` is everything else, alphabetically. Mirrors
 * `.storybook/preview.tsx` so both sidebars agree.
 */
export type Order = (string | Order)[];

export const ORDER: Order = [
  "Foundations",
  [
    "Welcome",
    "Installation",
    "Theming",
    "Design Tokens",
    "Theme",
    "Contribution Guidelines",
    "Responsive Design",
    "Bundle Size",
    "*",
  ],
  "Primitives",
  [
    "FabricFlex",
    "FabricStack",
    "FabricInline",
    "FabricGrid",
    "FabricText",
    "FabricSurface",
    "FabricDivider",
    "Utilities",
    "FabricVisibility",
    "*",
  ],
  "Components",
  "Advanced Components",
  "Forms",
  ["Introduction", "Layout", "Bindings", "Wizard", "Recipes", "*"],
  "Charts",
  [
    "Introduction",
    "Chart card",
    "Bar chart",
    "Line and area charts",
    "Pie chart",
    "Sparkline",
    "Stat card",
    "*",
  ],
  "*",
  "Kits",
  [
    "Overview",
    "Layout",
    [
      "Overview",
      "FabricAppShell",
      "FabricTopBar",
      "FabricSidebar",
      "FabricPageHeader",
      "FabricBanner",
      "FabricNotificationDrawer",
      "*",
    ],
    "Global Search",
    ["Overview", "*"],
    "Chatbot",
    ["Overview", "*"],
    "Versioning",
    ["Overview", "*"],
    "Canvas Builder",
    ["FabricCanvasBuilder", ["Overview", "*"], "*"],
    "*",
  ],
  "Patterns",
  "Examples",
  ["Admin app", "Starter app", "*"],
];

/** URL and heading-id slug: lowercase words joined by dashes. */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[`'’"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

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

const stripFabric = (s: string) => s.replace(/^Fabric(?=[A-Z])/, "");
const squash = (s: string) => s.toLowerCase().replace(/\s+/g, "");

/**
 * The sidebar label for a title: the parts after the section, without a trailing
 * "Overview" or the `Fabric` prefix. `Kits/Layout/FabricPageHeader` → "Layout / PageHeader".
 */
export function navLabel(title: string): string {
  const parts = title.split("/").slice(1);
  if (parts.length > 1 && parts.at(-1) === "Overview") parts.pop();
  if (parts.length === 0) return "Overview";
  const out: string[] = [];
  for (const part of parts.map(stripFabric)) {
    // "Canvas Builder / CanvasBuilder" says the same thing twice.
    if (out.length && squash(out.at(-1) as string) === squash(part)) continue;
    out.push(part);
  }
  return out.join(" / ");
}

function rank(order: Order | undefined, name: string): { index: number; children?: Order } {
  if (!order) return { index: Number.MAX_SAFE_INTEGER };
  let star = Number.MAX_SAFE_INTEGER;
  for (let i = 0; i < order.length; i++) {
    const entry = order[i];
    if (typeof entry !== "string") continue;
    const next = order[i + 1];
    const children = Array.isArray(next) ? next : undefined;
    if (entry === name) return { index: i, children };
    if (entry === "*") star = i;
  }
  return { index: star };
}

/** Sorts two titles the way Storybook's `storySort` does with {@link ORDER}. */
export function compareTitles(a: string, b: string, order: Order = ORDER): number {
  const pa = a.split("/");
  const pb = b.split("/");
  let level: Order | undefined = order;
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    // A parent ("Kits/Layout") comes before its children ("Kits/Layout/…").
    if (pa[i] === undefined) return -1;
    if (pb[i] === undefined) return 1;
    if (pa[i] === pb[i]) {
      level = rank(level, pa[i]).children;
      continue;
    }
    const ra = rank(level, pa[i]);
    const rb = rank(level, pb[i]);
    if (ra.index !== rb.index) return ra.index - rb.index;
    return pa[i].localeCompare(pb[i]);
  }
  return 0;
}

/** Reads a flat `key: value` YAML frontmatter block. Lists are `[a, b]`. */
export function parseFrontmatter(source: string): Record<string, string | string[]> {
  const block = /^---\r?\n([\s\S]*?)\r?\n---/.exec(source);
  const out: Record<string, string | string[]> = {};
  if (!block) return out;
  for (const line of block[1].split(/\r?\n/)) {
    const match = /^([A-Za-z]\w*):\s*(.*)$/.exec(line.trim());
    if (!match) continue;
    const raw = match[2].trim();
    const unquote = (s: string) => s.trim().replace(/^(["'])(.*)\1$/, "$2");
    out[match[1]] = raw.startsWith("[")
      ? raw.slice(1, -1).split(",").map(unquote).filter(Boolean)
      : unquote(raw);
  }
  return out;
}

/** Builds a {@link SitePage} from an MDX file's path and source, or throws on bad frontmatter. */
export function sitePageFrom(file: string, slug: string, source: string): SitePage {
  const fm = parseFrontmatter(source);
  const str = (key: string) => {
    const value = fm[key];
    if (typeof value !== "string" || !value)
      throw new Error(`${file}: frontmatter needs a "${key}"`);
    return value;
  };
  const nav = str("nav");
  const replaces = fm.replaces;
  return {
    slug,
    nav,
    title: str("title"),
    description: str("description"),
    file,
    replaces: Array.isArray(replaces)
      ? replaces
      : typeof replaces === "string"
        ? [replaces]
        : [toStoryId(nav, "Docs")],
  };
}

/** The Storybook URL for a docs or story id. */
export function storybookHref(base: string, id: string): string {
  const kind = id.endsWith("--docs") || id.endsWith("--overview") ? "docs" : "story";
  return `${base}storybook/?path=/${kind}/${id}`;
}

/** The docs URL for a site page slug (`""` is the docs home). */
export function pageHref(base: string, slug: string): string {
  return slug ? `${base}docs/${slug}/` : `${base}docs/`;
}

/** Merges Storybook and site pages into sections, page metadata and redirects. */
export function buildDocs(stories: StoryDoc[], sitePages: SitePage[], base: string): DocsData {
  const redirects: Record<string, string> = {};
  const byTitle = new Map<string, NavItem>();

  for (const page of sitePages) {
    const href = pageHref(base, page.slug);
    for (const id of page.replaces) redirects[id] = href;
    if (byTitle.has(page.nav)) throw new Error(`Two docs pages use nav "${page.nav}"`);
    byTitle.set(page.nav, {
      // Site pages are labelled by their own (sentence-case) title.
      label: page.title,
      title: page.nav,
      href,
      local: true,
      slug: page.slug,
    });
  }
  for (const story of stories) {
    // A moved page wins over the Storybook page it replaces.
    if (redirects[story.id] || byTitle.has(story.title)) continue;
    byTitle.set(story.title, {
      label: navLabel(story.title),
      title: story.title,
      href: storybookHref(base, story.id),
      local: false,
    });
  }

  const sorted = [...byTitle.values()].sort((a, b) => compareTitles(a.title, b.title));
  const sections: NavSection[] = [];
  for (const item of sorted) {
    const section = item.title.split("/")[0];
    if (sections.at(-1)?.title !== section) sections.push({ title: section, items: [] });
    sections.at(-1)?.items.push(item);
  }

  const flat = sections.flatMap((s) => s.items);
  const link = (item: NavItem | undefined): PageLink | undefined =>
    item && { label: item.label, href: item.href, local: item.local };
  const pages: Record<string, PageMeta> = {};
  for (const page of sitePages) {
    const i = flat.findIndex((item) => item.slug === page.slug);
    pages[page.slug] = {
      ...page,
      section: page.nav.split("/")[0],
      label: flat[i].label,
      href: flat[i].href,
      prev: link(flat[i - 1]),
      next: link(flat[i + 1]),
    };
  }
  return { sections, pages, redirects };
}

/**
 * Resolves a link written in a docs page. Storybook-style links (`?path=/docs/<id>`)
 * go to the moved page when there is one, otherwise to Storybook. Returns
 * `undefined` for a Storybook id that doesn't exist, so the build can fail on it.
 */
export function resolveDocsLink(
  href: string,
  data: Pick<DocsData, "redirects">,
  knownIds: ReadonlySet<string>,
  base: string,
): string | undefined {
  const match = /^\?path=\/(docs|story)\/([^&#]+)(#.*)?$/.exec(href);
  if (!match) return href;
  const [, kind, id, hash = ""] = match;
  // Single stories aren't in the docs index, so only docs links are checked.
  if (kind === "story") return `${base}storybook/?path=/story/${id}${hash}`;
  const moved = data.redirects[id];
  if (moved) return moved + hash;
  if (!knownIds.has(id)) return undefined;
  return storybookHref(base, id) + hash;
}
