import { createFabricTheme, theme as fabricTheme } from "@fabric-kit/theme";
import type { Theme } from "@mui/material/styles";
import {
  BRAND_PALETTES,
  type BrandName,
  type BrandScheme,
  DEFAULT_BRAND,
  isBrand,
} from "./brand-palettes";

export { DEFAULT_BRAND };

/** The MUI palette for one brand and mode: accents plus the neutrals around them. */
function schemePalette(c: BrandScheme, mode: "light" | "dark") {
  return {
    primary: { main: c.primary, contrastText: c.primaryContrast },
    secondary: { main: c.secondary, contrastText: c.secondaryContrast },
    text: { primary: c.text, secondary: c.textSecondary, disabled: c.textDisabled },
    background: { default: c.bg, paper: c.paper },
    divider: c.divider,
    // Dark mode tints hover and selection with the primary color (createFabricTheme does
    // that); light mode uses the brand's own neutral, as Fabric does.
    action: {
      disabledBackground: c.subtle,
      ...(mode === "light" && { hover: c.subtle, selected: c.subtle }),
    },
    appShell: { text: c.textSecondary, toggleBg: c.subtle, toggleBgPress: c.dividerLight },
    datagrid: { rowLine: c.dividerLight, footerLine: c.divider, emptyText: c.textDisabled },
  };
}

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
