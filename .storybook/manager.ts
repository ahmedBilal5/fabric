import { addons } from "storybook/manager-api";
import { sbLightTheme } from "./sb-themes";

addons.setConfig({
  sidebar: {
    showRoots: true,
  },
  // storybook-dark-mode swaps this for sbDarkTheme / sbLightTheme from preview.tsx.
  theme: sbLightTheme,
});
