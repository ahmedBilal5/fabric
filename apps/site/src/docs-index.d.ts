/** Every docs page in Storybook, built from the repo by `docs-index.ts`. */
declare module "virtual:docs-index" {
  export type { DocsEntry } from "../docs-index";

  const entries: import("../docs-index").DocsEntry[];
  export default entries;
}
