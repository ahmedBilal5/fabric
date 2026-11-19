/** The docs navigation, built from the repo at build time by `docs-index.ts`. */
declare module "virtual:docs-index" {
  /** The site's base URL, e.g. `/fabric/`. */
  export const base: string;
  /** Every docs page, grouped and sorted as in the sidebar. */
  export const sections: import("../docs-nav").NavSection[];
  /** Site-rendered pages by slug. */
  export const pages: Record<string, import("../docs-nav").PageMeta>;
  /** Storybook docs id → site URL, for every moved page. */
  export const redirects: Record<string, string>;
  /** Every docs id that exists, in Storybook or moved. */
  export const knownIds: ReadonlySet<string>;
}

/** Docs pages also export their headings (see `rehype-toc.ts`). */
declare module "*.mdx" {
  export const toc: import("../rehype-toc").TocItem[];
}
