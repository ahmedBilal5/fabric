import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { StorybookConfig } from "@storybook/react-vite";
import remarkGfm from "remark-gfm";

const __dirname = dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
  framework: "@storybook/react-vite",
  stories: [
    "../docs/**/*.@(mdx)",
    "../packages/design-tokens/{src,docs}/**/*.@(stories.ts|stories.tsx|mdx)",
    "../packages/theme/{src,docs}/**/*.@(stories.ts|stories.tsx|mdx)",
    "../packages/primitives/{src,docs}/**/*.@(stories.ts|stories.tsx|mdx)",
    "../packages/icons/docs/**/*.@(stories.ts|stories.tsx|mdx)",
    "../packages/advanced-components/date-picker/{src,docs}/**/*.@(stories.ts|stories.tsx|mdx)",
    "../packages/advanced-components/datagrid/{src,docs}/**/*.@(stories.ts|stories.tsx|mdx)",
    "../packages/advanced-components/tree-view/{src,docs}/**/*.@(stories.ts|stories.tsx|mdx)",
    "../packages/kits/layout/{src,docs}/**/*.@(stories.ts|stories.tsx|mdx)",
    "../packages/kits/versioning/{src,docs}/**/*.@(stories.ts|stories.tsx|mdx)",
    "../packages/kits/global-search/{src,docs}/**/*.@(stories.ts|stories.tsx|mdx)",
    "../packages/kits/chatbot/{src,docs}/**/*.@(stories.ts|stories.tsx|mdx)",
    "../packages/kits/canvas-builder/{src,docs}/**/*.@(stories.ts|stories.tsx|mdx)",
    "../packages/components/src/**/*.@(stories.ts|stories.tsx|mdx)",
    // Discover the Overview mdx before the CSF stories so it sits first in each
    // component's sidebar tree. `Fabric+([A-Za-z]).mdx` matches Fabric<Name>.mdx.
    "../packages/components/src/**/Fabric+([A-Za-z]).mdx",
    "../packages/components/src/**/*.@(stories.ts|stories.tsx)",
  ],
  addons: [
    "@storybook/addon-a11y",
    "@storybook/addon-themes",
    {
      name: "@storybook/addon-docs",
      options: {
        mdxPluginOptions: {
          mdxCompileOptions: {
            remarkPlugins: [remarkGfm],
          },
        },
      },
    },
    "storybook-dark-mode",
    "@storybook/addon-vitest",
  ],
  staticDirs: ["./static"],
  viteFinal: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...((config.resolve.alias as Record<string, string>) || {}),
      "@fabric-kit/design-tokens": resolve(__dirname, "../packages/design-tokens/src"),
      "@fabric-kit/theme": resolve(__dirname, "../packages/theme/src"),
      "@fabric-kit/primitives": resolve(__dirname, "../packages/primitives/src"),
      "@fabric-kit/components": resolve(__dirname, "../packages/components/src"),
      "@fabric-kit/date-picker": resolve(
        __dirname,
        "../packages/advanced-components/date-picker/src",
      ),
      "@fabric-kit/datagrid": resolve(__dirname, "../packages/advanced-components/datagrid/src"),
      "@fabric-kit/tree-view": resolve(__dirname, "../packages/advanced-components/tree-view/src"),
      "@fabric-kit/layout": resolve(__dirname, "../packages/kits/layout/src"),
      "@fabric-kit/versioning": resolve(__dirname, "../packages/kits/versioning/src"),
      "@fabric-kit/global-search": resolve(__dirname, "../packages/kits/global-search/src"),
      "@fabric-kit/chatbot": resolve(__dirname, "../packages/kits/chatbot/src"),
      "@fabric-kit/canvas-builder": resolve(__dirname, "../packages/kits/canvas-builder/src"),
      "@storybook/blocks": "@storybook/addon-docs/blocks",
    };
    // Pre-optimize MUI + emotion + react runtimes so Vitest addon tests don't
    // race with mid-test dep discovery (surfaces as
    // "Vitest failed to find the current suite" + a Vite reload).
    config.optimizeDeps = config.optimizeDeps || {};
    config.optimizeDeps.include = [
      ...(config.optimizeDeps.include || []),
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "@mui/material",
      "@mui/material/styles",
      "@mui/lab",
      "@emotion/react",
      "@emotion/styled",
      "storybook/test",
    ];

    return config;
  },
};

export default config;
