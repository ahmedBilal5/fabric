import { defineConfig } from "vitest/config";

// Unit tests for the docs build logic (nav, links, headings). They run in Node.
export default defineConfig({
  test: { environment: "node", include: ["test/**/*.test.ts"] },
});
