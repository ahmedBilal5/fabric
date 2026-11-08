import { DocsContainer } from "@storybook/addon-docs/blocks";
import type { Preview } from "@storybook/react-vite";
import React from "react";
import { create, themes } from "storybook/theming";
import { INITIAL_VIEWPORTS } from "storybook/viewport";

import "@fontsource/geist/400.css";
import "@fontsource/geist/500.css";
import "@fontsource/geist/600.css";
import "@fontsource/geist/700.css";
import "@fontsource/geist-mono/400.css";

import { dark } from "@fabric-kit/design-tokens";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { useColorScheme } from "@mui/material/styles";
import { GLOBALS_UPDATED, SET_GLOBALS } from "storybook/internal/core-events";
import { addons } from "storybook/preview-api";
import { useDarkMode } from "storybook-dark-mode";
import { BRAND_THEMES, brandTheme, DEFAULT_BRAND } from "./themes";

const sbDarkTheme = {
  ...themes.dark,
  brandTitle: "Fabric",
  brandUrl: "../",
  appBg: dark.surface.secondary,
  appContentBg: dark.surface.primary,
  appBorderColor: dark.border.default,
  textColor: dark.text.primary,
  barBg: dark.surface.primary,
  barTextColor: dark.text.secondary,
  barSelectedColor: dark.brand.primaryLight,
  colorPrimary: dark.brand.primary,
  colorSecondary: dark.brand.primaryLight,
};

const sbLightTheme = create({
  base: "light",
  brandTitle: "Fabric",
  brandUrl: "../",
});

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

// Docs pages render outside the story decorators, so they follow the toolbar's brand
// through the preview channel instead of `context.globals`.
function useBrandGlobal(): string {
  const [brand, setBrand] = React.useState<string>(DEFAULT_BRAND);
  React.useEffect(() => {
    const channel = addons.getChannel();
    const onGlobals = ({ globals }: { globals?: Record<string, unknown> }) => {
      if (typeof globals?.brand === "string") setBrand(globals.brand);
    };
    channel.on(GLOBALS_UPDATED, onGlobals);
    channel.on(SET_GLOBALS, onGlobals);
    return () => {
      channel.off(GLOBALS_UPDATED, onGlobals);
      channel.off(SET_GLOBALS, onGlobals);
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
          "*",
          "Kits",
          [
            "Layout",
            [
              "Overview",
              "FabricAppShell",
              "FabricTopBar",
              "FabricSidebar",
              "FabricBanner",
              "FabricNotificationDrawer",
              "*",
            ],
            "*",
          ],
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
      container: ({ children, ...props }: React.ComponentProps<typeof DocsContainer>) => {
        const isDark = useDarkMode();
        const brand = useBrandGlobal();
        return (
          <DocsContainer {...props} theme={isDark ? sbDarkTheme : sbLightTheme}>
            <ThemeProvider theme={brandTheme(brand)}>{children}</ThemeProvider>
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
