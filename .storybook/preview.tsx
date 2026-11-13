import { DocsContainer } from "@storybook/addon-docs/blocks";
import type { Preview } from "@storybook/react-vite";
import React from "react";
import { INITIAL_VIEWPORTS } from "storybook/viewport";

import "@fontsource/geist/400.css";
import "@fontsource/geist/500.css";
import "@fontsource/geist/600.css";
import "@fontsource/geist/700.css";
import "@fontsource/geist-mono/400.css";

import { CssBaseline, ThemeProvider } from "@mui/material";
import { useColorScheme } from "@mui/material/styles";
import { UPDATE_GLOBALS } from "storybook/internal/core-events";
import { addons } from "storybook/preview-api";
import { useDarkMode } from "storybook-dark-mode";
import { sbDarkTheme, sbLightTheme, sbTheme } from "./sb-themes";
import { BRAND_THEMES, brandTheme, DEFAULT_BRAND } from "./themes";
import "./docs.css";

// storybook-dark-mode tags the preview <body> with `light` before it reads our
// `classTarget: "html"` setting, and never removes it. MUI's color-scheme selector
// is the `.light` / `.dark` class, so a stale `body.light` pins everything inside
// it to light colors when you switch to dark. Only <html> should carry the class.
if (typeof document !== "undefined" && document.body) {
  const stripBodyScheme = () => {
    if (document.body.classList.contains("light") || document.body.classList.contains("dark")) {
      document.body.classList.remove("light", "dark");
    }
  };
  stripBodyScheme();
  new MutationObserver(stripBodyScheme).observe(document.body, {
    attributes: true,
    attributeFilter: ["class"],
  });
}

// Bridges Storybook's `useDarkMode()` state to MUI's `useColorScheme()` so the
// dark-mode addon's toggle actually swaps the MUI CSS variables. Without this,
// MUI's CssVarsProvider fights the addon: both try to control the `.dark` class
// on <html>, and MUI wins with its default `'light'` state → pickers, text
// fields, and every palette-driven color stay stuck in light mode.
function SyncColorScheme() {
  const isDark = useDarkMode();
  const { setMode } = useColorScheme();
  React.useEffect(() => {
    setMode(isDark ? "dark" : "light");
  }, [isDark, setMode]);
  return null;
}

// Docs pages render outside the story decorators, so they can't read
// `context.globals`. Instead they read the brand from the preview's store and
// listen for UPDATE_GLOBALS, the event the toolbar sends to the preview.
// (GLOBALS_UPDATED and SET_GLOBALS are sent *by* the preview, so its own
// listeners never hear them.)
type PreviewGlobals = {
  __STORYBOOK_PREVIEW__?: {
    storyStoreValue?: { userGlobals?: { get(): Record<string, unknown> } };
  };
};

function storedBrand(): string {
  const brand = (
    globalThis as PreviewGlobals
  ).__STORYBOOK_PREVIEW__?.storyStoreValue?.userGlobals?.get()?.brand;
  return typeof brand === "string" ? brand : DEFAULT_BRAND;
}

const brandListeners = new Set<(brand: string) => void>();
let brandChannelReady = false;

function listenForBrand() {
  if (brandChannelReady) return;
  brandChannelReady = true;
  addons.getChannel().on(UPDATE_GLOBALS, ({ globals }: { globals?: Record<string, unknown> }) => {
    if (typeof globals?.brand !== "string") return;
    for (const listener of brandListeners) listener(globals.brand);
  });
}

function useBrandGlobal(): string {
  listenForBrand();
  const [brand, setBrand] = React.useState<string>(storedBrand);
  React.useEffect(() => {
    brandListeners.add(setBrand);
    setBrand(storedBrand());
    return () => {
      brandListeners.delete(setBrand);
    };
  }, []);
  return brand;
}

export const globalTypes = {
  brand: {
    description: "Sample brand theme, built with createFabricTheme",
    toolbar: {
      title: "Theme",
      icon: "paintbrush",
      items: Object.entries(BRAND_THEMES).map(([value, { title }]) => ({ value, title })),
      dynamicTitle: true,
    },
  },
};

export const initialGlobals = { brand: DEFAULT_BRAND };

export const decorators = [
  (Story: React.ComponentType, context: { globals: Record<string, unknown> }) => {
    return (
      <ThemeProvider theme={brandTheme(context.globals.brand)}>
        <CssBaseline enableColorScheme />
        <SyncColorScheme />
        <Story />
      </ThemeProvider>
    );
  },
];

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    options: {
      storySort: {
        order: [
          "Foundations",
          ["Welcome", "Installation", "Theming", "*"],
          [
            "Design Tokens",
            ["Overview", "Colors", "Typography", "Scales", "*"],
            "Theme",
            ["Overview", "*"],
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
        ],
        method: "alphabetical",
      },
    },
    backgrounds: { disable: true },
    viewport: {
      viewports: {
        ...INITIAL_VIEWPORTS,
        fabricMobile: {
          name: "Mobile (375×812)",
          styles: { width: "375px", height: "812px" },
        },
        fabricTablet: {
          name: "Tablet (900×1024)",
          styles: { width: "900px", height: "1024px" },
        },
        fabricDesktop: {
          name: "Desktop (1440×900)",
          styles: { width: "1440px", height: "900px" },
        },
        fabricWide: {
          name: "Wide (1920×1080)",
          styles: { width: "1920px", height: "1080px" },
        },
      },
    },
    docs: {
      // Component descriptions come from JSDoc. Keep the summary and drop tag blocks
      // such as @example, whose JSX would otherwise render as stray text.
      extractComponentDescription: (component: { __docgenInfo?: { description?: string } }) =>
        (component?.__docgenInfo?.description ?? "").split(/\n\s*@\w+/)[0].trim() || null,
      container: ({ children, ...props }: React.ComponentProps<typeof DocsContainer>) => {
        const isDark = useDarkMode();
        const brand = useBrandGlobal();
        return (
          <DocsContainer {...props} theme={sbTheme(brand, isDark ? "dark" : "light")}>
            <ThemeProvider theme={brandTheme(brand)}>
              <SyncColorScheme />
              {children}
            </ThemeProvider>
          </DocsContainer>
        );
      },
    },
    darkMode: {
      dark: sbDarkTheme,
      light: sbLightTheme,
      darkClass: "dark",
      lightClass: "light",
      classTarget: "html",
      stylePreview: true,
    },
  },
};

export default preview;
