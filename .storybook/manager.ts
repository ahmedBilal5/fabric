import { GLOBALS_UPDATED, SET_GLOBALS } from "storybook/internal/core-events";
import { type API, addons } from "storybook/manager-api";
import { type Mode, sbLightTheme, sbTheme } from "./sb-themes";

addons.setConfig({
  sidebar: {
    showRoots: true,
  },
  theme: sbLightTheme,
});

// Storybook's own UI follows the brand picked in the toolbar. storybook-dark-mode
// owns light/dark and calls `api.setOptions({ theme })` whenever it renders (on
// every story and docs render), so this swaps each theme it sets for the current
// brand's version of the same mode, and re-applies when the brand changes.
type Options = Parameters<API["setOptions"]>[0];

addons.register("fabric/brand-chrome", (api) => {
  let brand: unknown = api.getGlobals?.()?.brand;
  let mode: Mode = "light";
  const setOptions = api.setOptions.bind(api);

  api.setOptions = (options: Options) => {
    const base = (options?.theme as { base?: string } | undefined)?.base;
    if (!base) return setOptions(options);
    mode = base === "dark" ? "dark" : "light";
    return setOptions({ ...options, theme: sbTheme(brand, mode) });
  };

  const onGlobals = ({ globals }: { globals?: Record<string, unknown> }) => {
    if (globals?.brand === undefined || globals.brand === brand) return;
    brand = globals.brand;
    setOptions({ theme: sbTheme(brand, mode) });
  };
  const channel = addons.getChannel();
  channel.on(GLOBALS_UPDATED, onGlobals);
  channel.on(SET_GLOBALS, onGlobals);
});
