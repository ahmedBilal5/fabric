import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Served from GitHub Pages at https://ahmedbilal5.github.io/fabric/; Storybook lives at /fabric/docs/.
export default defineConfig({
  base: process.env.SITE_BASE ?? "/fabric/",
  plugins: [react()],
  build: { outDir: "dist", chunkSizeWarningLimit: 2000 },
});
