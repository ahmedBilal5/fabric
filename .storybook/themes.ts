import { createFabricTheme, theme as fabricTheme } from "@fabric-kit/theme";
import type { Theme } from "@mui/material/styles";

/**
 * Sample brands for the Storybook toolbar. Each is built with `createFabricTheme`,
 * the same API apps use, so switching brands also tests that every component
 * follows the theme instead of Fabric's built-in colors.
 */
export const BRAND_THEMES: Record<string, { title: string; theme: Theme }> = {
  fabric: { title: "Fabric (clay)", theme: fabricTheme },
  ocean: {
    title: "Ocean (blue)",
    theme: createFabricTheme({
      colorSchemes: {
        light: {
          palette: {
            primary: { main: "#1D5FBF", contrastText: "#FFFFFF" },
            secondary: { main: "#0F766E", contrastText: "#FFFFFF" },
          },
        },
        dark: {
          palette: {
            primary: { main: "#8AB4F8", contrastText: "#0B1B33" },
            secondary: { main: "#5EEAD4", contrastText: "#042F2B" },
          },
        },
      },
    }),
  },
  forest: {
    title: "Forest (green)",
    theme: createFabricTheme({
      colorSchemes: {
        light: {
          palette: {
            primary: { main: "#2F6B3A", contrastText: "#FFFFFF" },
            secondary: { main: "#8A5A00", contrastText: "#FFFFFF" },
          },
        },
        dark: {
          palette: {
            primary: { main: "#8FD19E", contrastText: "#0E2414" },
            secondary: { main: "#F2C46D", contrastText: "#2B1D00" },
          },
        },
      },
    }),
  },
};

export const DEFAULT_BRAND = "fabric";

export function brandTheme(brand: unknown): Theme {
  return (typeof brand === "string" && BRAND_THEMES[brand]?.theme) || fabricTheme;
}
