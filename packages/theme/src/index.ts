// MUI type augmentations (palette, breakpoints, chip). A real import so tsc emits them to dist.
import "./mui-overrides";

export { baseThemeOptions, createFabricTheme, ThemeProvider, theme } from "./create-theme";
export { ThemeModeSwitcher } from "./mode-switcher";
export type { DesignSystemProviderProps } from "./provider";
export { DesignSystemProvider, useSafeThemeMode, useThemeMode } from "./provider";
export { useBreakpoint } from "./use-breakpoint";
