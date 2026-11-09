/**
 * Colors for the sample brands in the Storybook toolbar, in plain values so both
 * the preview (MUI themes, see themes.ts) and the manager (Storybook's own UI,
 * see sb-themes.ts) can read them. The manager bundle can't import workspace
 * packages, so Fabric's own values are copied from `@fabric-kit/design-tokens`.
 *
 * Each brand sets its neutrals too (backgrounds, text, dividers), not only its
 * accent, so a brand changes the whole look, as it would in a real app.
 */
export interface BrandScheme {
  primary: string;
  primaryContrast: string;
  secondary: string;
  secondaryContrast: string;
  /** Page background. */
  bg: string;
  /** Cards, menus, dialogs. */
  paper: string;
  /** Pressed and disabled fills, toolbar buttons. */
  subtle: string;
  text: string;
  textSecondary: string;
  textDisabled: string;
  divider: string;
  /** A shade of the accent that holds white text: Storybook's selected sidebar row. */
  selected: string;
  /** A lighter line, for rows inside a table. */
  dividerLight: string;
  /** Strong input borders. */
  borderStrong: string;
}

export interface BrandPalette {
  title: string;
  light: BrandScheme;
  dark: BrandScheme;
}

export const BRAND_PALETTES = {
  fabric: {
    title: "Fabric (clay)",
    light: {
      primary: "#B23E2A",
      primaryContrast: "#FFFFFF",
      secondary: "#C2410C",
      secondaryContrast: "#FFFFFF",
      bg: "#F8F6F3",
      paper: "#FFFFFF",
      subtle: "#F3F0EC",
      text: "#2E2925",
      textSecondary: "#6E655D",
      textDisabled: "#A8A099",
      divider: "#E6E1DB",
      selected: "#B23E2A",
      dividerLight: "#EFEBE6",
      borderStrong: "#D9D2CA",
    },
    dark: {
      primary: "#EB8E74",
      primaryContrast: "#151210",
      secondary: "#F0915E",
      secondaryContrast: "#151210",
      bg: "#151210",
      paper: "#2A2420",
      subtle: "#1C1815",
      text: "#F0ECE8",
      textSecondary: "#B5ACA3",
      textDisabled: "#776E66",
      divider: "#4A423B",
      selected: "#C9553E",
      dividerLight: "#3A332E",
      borderStrong: "#4A423B",
    },
  },
  ocean: {
    title: "Ocean (blue)",
    light: {
      primary: "#1D5FBF",
      primaryContrast: "#FFFFFF",
      secondary: "#0F766E",
      secondaryContrast: "#FFFFFF",
      bg: "#F3F6FA",
      paper: "#FFFFFF",
      subtle: "#E9EEF5",
      text: "#1B2430",
      textSecondary: "#556275",
      textDisabled: "#97A3B3",
      divider: "#D9E1EB",
      selected: "#1D5FBF",
      dividerLight: "#E6ECF3",
      borderStrong: "#C3CEDB",
    },
    dark: {
      primary: "#8AB4F8",
      primaryContrast: "#0B1B33",
      secondary: "#5EEAD4",
      secondaryContrast: "#042F2B",
      bg: "#0D131A",
      paper: "#17202A",
      subtle: "#121A23",
      text: "#E5ECF4",
      textSecondary: "#A3B0C0",
      textDisabled: "#667385",
      divider: "#2D3A49",
      selected: "#3D74C9",
      dividerLight: "#243140",
      borderStrong: "#3A4A5C",
    },
  },
  forest: {
    title: "Forest (green)",
    light: {
      primary: "#2F6B3A",
      primaryContrast: "#FFFFFF",
      secondary: "#8A5A00",
      secondaryContrast: "#FFFFFF",
      bg: "#F3F5F0",
      paper: "#FFFFFF",
      subtle: "#E9EDE5",
      text: "#1E2A21",
      textSecondary: "#5A685D",
      textDisabled: "#9DA89F",
      divider: "#DAE1D5",
      selected: "#2F6B3A",
      dividerLight: "#E7ECE3",
      borderStrong: "#C5CEBF",
    },
    dark: {
      primary: "#8FD19E",
      primaryContrast: "#0E2414",
      secondary: "#F2C46D",
      secondaryContrast: "#2B1D00",
      bg: "#0E1410",
      paper: "#19221B",
      subtle: "#131B15",
      text: "#E6EEE7",
      textSecondary: "#A6B4A9",
      textDisabled: "#6A786D",
      divider: "#2F3D32",
      selected: "#377545",
      dividerLight: "#26322A",
      borderStrong: "#3B4B3F",
    },
  },
} satisfies Record<string, BrandPalette>;

export type BrandName = keyof typeof BRAND_PALETTES;

export const DEFAULT_BRAND: BrandName = "fabric";

export function isBrand(value: unknown): value is BrandName {
  return typeof value === "string" && value in BRAND_PALETTES;
}
