import { fileURLToPath } from "node:url";
import mdx from "@mdx-js/rollup";
import rehypeShiki from "@shikijs/rehype";
import react from "@vitejs/plugin-react";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import { createCssVariablesTheme } from "shiki";
import { defineConfig } from "vite";
import { docsIndex } from "./docs-index";
import { rehypeToc } from "./rehype-toc";

// Code colours are CSS variables (set in styles/docs.css), so they follow the site's tokens.
const codeTheme = createCssVariablesTheme({ name: "fabric", variablePrefix: "--code-" });

/** React and MUI in long-lived chunks; the live screens are split by `React.lazy`. */
const CHUNKS: [name: string, test: RegExp][] = [
  ["react", /node_modules\/(react|react-dom|scheduler)\//],
  [
    "mui",
    /node_modules\/(@mui\/(material|system|utils|styled-engine)|@emotion|@popperjs|@babel\/runtime)\//,
  ],
  ["mui-x", /node_modules\/(@mui\/x-internals|@base-ui\/utils|reselect|use-sync-external-store)\//],
  ["charts", /node_modules\/(@mui\/x-charts|@mui\/x-charts-vendor|d3-[a-z-]+)\//],
  ["data-grid", /node_modules\/@mui\/x-data-grid\//],
];

function vendorChunk(id: string) {
  return CHUNKS.find(([, test]) => test.test(id))?.[0];
}

// Served from GitHub Pages at https://ahmedbilal5.github.io/fabric/: the landing page at
// the root, the docs under docs/, and Storybook under storybook/ (added by the Pages build).
export default defineConfig({
  base: process.env.SITE_BASE ?? "/fabric/",
  plugins: [
    {
      enforce: "pre",
      ...mdx({
        remarkPlugins: [remarkFrontmatter, remarkGfm],
        rehypePlugins: [
          rehypeToc,
          [
            rehypeShiki,
            {
              theme: codeTheme,
              langs: ["tsx", "ts", "jsx", "js", "json", "bash", "css", "html", "diff", "mdx"],
            },
          ],
        ],
      }),
    },
    react({ include: /\.(mdx|tsx?|jsx?)$/ }),
    docsIndex(fileURLToPath(new URL("../..", import.meta.url))),
  ],
  build: {
    outDir: "dist",
    rollupOptions: {
      // 404.html is what GitHub Pages serves for a missing path. docs.html is the
      // template the prerender fills in for every docs page.
      input: {
        main: fileURLToPath(new URL("index.html", import.meta.url)),
        docs: fileURLToPath(new URL("docs.html", import.meta.url)),
        notFound: fileURLToPath(new URL("404.html", import.meta.url)),
      },
      output: { manualChunks: vendorChunk },
    },
  },
});
