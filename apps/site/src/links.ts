export const GITHUB_URL = "https://github.com/ahmedBilal5/fabric";
export const NPM_URL = "https://www.npmjs.com/org/fabric-kit";
export const INSTALL_COMMAND = "pnpm add @fabric-kit/components @fabric-kit/theme";

/** Storybook lives under `<base>/docs/`. Pass a story or docs id to deep-link. */
export function docsUrl(path?: string): string {
  const root = `${import.meta.env.BASE_URL}docs/`;
  return path ? `${root}?path=/docs/${path}` : root;
}
