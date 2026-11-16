/**
 * Brand switching for the example app. Each brand is a theme from `createFabricTheme`,
 * the same API your app uses for its own colors. The palettes are Storybook's sample
 * brands (Fabric, Ocean, Forest), so the app and the docs match.
 */

import { createFabricTheme, theme as fabricTheme } from "@fabric-kit/theme";
import type { Theme } from "@mui/material/styles";
import { createContext, type ReactNode, useContext, useMemo, useState } from "react";
import {
  BRAND_PALETTES,
  type BrandName,
  DEFAULT_BRAND,
  isBrand,
  schemePalette,
} from "../../../.storybook/brand-palettes";

export type { BrandName };

function buildTheme(name: BrandName): Theme {
  if (name === "fabric") return fabricTheme;
  const p = BRAND_PALETTES[name];
  return createFabricTheme({
    colorSchemes: {
      light: { palette: schemePalette(p.light, "light") },
      dark: { palette: schemePalette(p.dark, "dark") },
    },
  });
}

const themes = new Map<BrandName, Theme>();
/** The theme for a brand, built once. */
export function brandTheme(name: BrandName): Theme {
  let theme = themes.get(name);
  if (!theme) {
    theme = buildTheme(name);
    themes.set(name, theme);
  }
  return theme;
}

/** Brands for the Appearance settings, in menu order. */
export const BRANDS = (Object.keys(BRAND_PALETTES) as BrandName[]).map((value) => ({
  value,
  label: BRAND_PALETTES[value].title,
}));

const STORAGE_KEY = "fabric-admin-brand";

function storedBrand(): BrandName {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return isBrand(value) ? value : DEFAULT_BRAND;
  } catch {
    return DEFAULT_BRAND;
  }
}

interface BrandValue {
  brand: BrandName;
  setBrand: (brand: BrandName) => void;
}

const BrandContext = createContext<BrandValue | null>(null);

/** Holds the chosen brand and remembers it in this browser. */
export function BrandProvider({ children }: { children: (theme: Theme) => ReactNode }) {
  const [brand, setBrandState] = useState<BrandName>(storedBrand);
  const value = useMemo<BrandValue>(
    () => ({
      brand,
      setBrand: (next) => {
        setBrandState(next);
        try {
          window.localStorage.setItem(STORAGE_KEY, next);
        } catch {
          // Private mode or blocked storage: the choice lasts until the tab closes.
        }
      },
    }),
    [brand],
  );
  return <BrandContext.Provider value={value}>{children(brandTheme(brand))}</BrandContext.Provider>;
}

/** The brand picker's state, or `null` where the host sets the theme (Storybook). */
export function useBrand(): BrandValue | null {
  return useContext(BrandContext);
}
