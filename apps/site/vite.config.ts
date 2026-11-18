import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { docsIndex } from "./docs-index";

/** React and MUI in long-lived chunks; the live screens are split by `React.lazy`. */
const CHUNKS: [name: string, test: RegExp][] = [
  ["react", /node_modules\/(react|react-dom|scheduler)\//],
  ["mui", /node_modules\/(@mui\/(material|system|utils|styled-engine)|@emotion|@popperjs)\//],
  [
    "mui-x",
    /node_modules\/(@mui\/x-internals|@base-ui\/utils|reselect|use-sync-external-store|@babel\/runtime)\//,
  ],
  ["charts", /node_modules\/(@mui\/x-charts|@mui\/x-charts-vendor|d3-[a-z-]+)\//],
  ["data-grid", /node_modules\/@mui\/x-data-grid\//],
];

function vendorChunk(id: string) {
  return CHUNKS.find(([, test]) => test.test(id))?.[0];
}

// Served from GitHub Pages at https://ahmedbilal5.github.io/fabric/; Storybook lives at /fabric/docs/.
export default defineConfig({
  base: process.env.SITE_BASE ?? "/fabric/",
  plugins: [react(), docsIndex(fileURLToPath(new URL("../..", import.meta.url)))],
  build: {
    outDir: "dist",
    rollupOptions: {
      // 404.html is what GitHub Pages serves for a missing path.
      input: {
        main: fileURLToPath(new URL("index.html", import.meta.url)),
        notFound: fileURLToPath(new URL("404.html", import.meta.url)),
      },
      output: { manualChunks: vendorChunk },
    },
  },
});
