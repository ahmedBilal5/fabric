import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { defineConfig } from "vitest/config";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Root Vitest config. All Storybook stories tagged `test` are transformed into
// component tests and run in a real Chromium tab via Playwright. Non-Storybook
// unit tests should be added as a separate project alongside this one.
export default defineConfig({
  test: {
    projects: [
      {
        extends: true,
        plugins: [
          storybookTest({
            configDir: resolve(__dirname, ".storybook"),
            storybookScript: "pnpm storybook --ci",
          }),
        ],
        test: {
          name: "storybook",
          // Reduce dep-optimization racing on cold cache (Storybook addon FAQ).
          isolate: false,
          browser: {
            enabled: true,
            provider: "playwright",
            headless: true,
            // Vitest's default port (63315) sits inside a Windows-reserved
            // TCP range (63288-63387) and fails with EACCES. Pin something below.
            api: 5137,
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
});
