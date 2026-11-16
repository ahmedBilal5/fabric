import { createFabricTheme, theme as fabricTheme } from "@fabric-kit/theme";
import type { Theme } from "@mui/material/styles";
import {
  BRAND_PALETTES,
  type BrandName,
  DEFAULT_BRAND,
  isBrand,
  schemePalette,
} from "./brand-palettes";

export { DEFAULT_BRAND };

function brandOf(name: BrandName): Theme {
  const p = BRAND_PALETTES[name];
  return createFabricTheme({
    colorSchemes: {
      light: { palette: schemePalette(p.light, "light") },
      dark: { palette: schemePalette(p.dark, "dark") },
    },
  });
}

/**
 * Sample brands for the Storybook toolbar. Each is built with `createFabricTheme`,
 * the same API apps use, so switching brands also tests that every component
 * follows the theme instead of Fabric's built-in colors.
 */
export const BRAND_THEMES: Record<BrandName, { title: string; theme: Theme }> = {
  fabric: { title: BRAND_PALETTES.fabric.title, theme: fabricTheme },
  ocean: { title: BRAND_PALETTES.ocean.title, theme: brandOf("ocean") },
  forest: { title: BRAND_PALETTES.forest.title, theme: brandOf("forest") },
};

export function brandTheme(brand: unknown): Theme {
  return isBrand(brand) ? BRAND_THEMES[brand].theme : fabricTheme;
}
