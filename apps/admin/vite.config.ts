import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

/** React and MUI in their own long-lived chunks; pages are split by `React.lazy`. */
const CHUNKS: [name: string, test: RegExp][] = [
  ["react", /node_modules\/(react|react-dom|scheduler)\//],
  ["mui", /node_modules\/(@mui\/(material|system|utils|styled-engine)|@emotion|@popperjs)\//],
  // Helpers shared by the charts and the grid. Without their own chunk they'd land in one
  // of the two, and a page with only the other would download both.
  [
    "mui-x",
    /node_modules\/(@mui\/x-internals|@base-ui\/utils|reselect|use-sync-external-store|@babel\/runtime)\//,
  ],
  // Big libraries used by only some pages. They load with the first page that needs them.
  ["charts", /node_modules\/(@mui\/x-charts|@mui\/x-charts-vendor|d3-[a-z-]+)\//],
  ["data-grid", /node_modules\/@mui\/x-data-grid\//],
];

function vendorChunk(id: string) {
  return CHUNKS.find(([, test]) => test.test(id))?.[0];
}

// Relative asset paths and hash routing, so the build works from any folder: the
// GitHub Pages deploy serves it at https://ahmedbilal5.github.io/fabric/admin/.
export default defineConfig({
  base: "./",
  plugins: [react()],
  build: { outDir: "dist", rollupOptions: { output: { manualChunks: vendorChunk } } },
});
