import { redirects } from "virtual:docs-index";
import { pageHref, storybookHref } from "../docs-nav";

export const GITHUB_URL = "https://github.com/ahmedBilal5/fabric";
/** The pinned roadmap issue: every planned item and what has shipped. */
export const ROADMAP_URL = `${GITHUB_URL}/issues/42`;
export const NPM_URL = "https://www.npmjs.com/org/fabric-kit";
export const INSTALL_COMMAND = "pnpm add @fabric-kit/components @fabric-kit/theme";
export const CREATE_COMMAND = "npm create @fabric-kit/app@latest";

/** The example admin app, deployed beside the site at `<base>/admin/`. */
export const EXAMPLE_APP_URL = `${import.meta.env.BASE_URL}admin/`;

/** Storybook, the workshop for every story, with controls, viewports and the a11y panel. */
export const STORYBOOK_URL = `${import.meta.env.BASE_URL}storybook/`;

/**
 * A docs page by its Storybook docs id, e.g. `foundations-installation--docs`: the
 * page on the docs site once it has moved there, otherwise in Storybook. No id gives
 * the docs home.
 */
export function docsUrl(id?: string): string {
  const base = import.meta.env.BASE_URL;
  if (!id) return pageHref(base, "");
  return redirects[id] ?? storybookHref(base, id);
}

/**
 * The "What's new" line under the nav. Update it when a roadmap phase ships, so returning
 * visitors see what changed.
 */
export const WHATS_NEW = {
  label: "New in Phase 4",
  text: "A starter app and a complete example admin app, built only from Fabric.",
};
