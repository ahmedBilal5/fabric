# Fabric: contributor and agent guide

Fabric is a free, open-source design system built on top of MUI. It adds design tokens, a themed MUI setup, layout primitives, polished component wrappers, styled MUI X controls (free tiers only), and higher-level kits such as an app shell, global search, a chat panel and a workflow canvas.

Think like a design-system maintainer: the goal is stable, well-documented packages that many apps can adopt, not just code that compiles.

## Layers

Fabric is built bottom-up. Each layer may use any layer below it, never above.

```
design-tokens → theme → primitives → components → advanced-components → kits/* → patterns
```

| Layer | Package(s)                                                                       | Rules                                                                               |
| ----- | -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| 1     | `@fabric-kit/design-tokens`                                                      | Plain TS values. No React, no MUI.                                                  |
| 2     | `@fabric-kit/theme`                                                              | MUI theme built from tokens.                                                        |
| 3     | `@fabric-kit/primitives`                                                         | Layout and text: Flex, Stack, Inline, Grid, Text, Surface.                          |
| 4     | `@fabric-kit/components`                                                         | Fabric wrappers around MUI components.                                              |
| 5     | `@fabric-kit/datagrid`, `date-picker`, `tree-view`                               | Styled MUI X controls. Free (MIT) MUI X packages only.                              |
| 6     | `@fabric-kit/layout`, `global-search`, `chatbot`, `versioning`, `canvas-builder` | Composed, app-level kits. Kits must not depend on each other.                       |
| 7     | `@fabric-kit/patterns`                                                           | Whole pages (system, list, detail, form) built from any layer above, kits included. |

`@fabric-kit/icons` sits beside the stack and can be used by any layer from 3 up. `@fabric-kit/hooks` (React hooks and `Intl` formatting helpers, no MUI) also sits beside it and can be used by any layer from 3 up.

`apps/site` is the landing page (Vite + React). It dogfoods the packages: every screen on it is built from Fabric. Its own chrome follows the Hallmark stamp at the top of `apps/site/src/styles/page.css`.

Reuse lower layers instead of rebuilding them. A kit that needs a table uses `@fabric-kit/datagrid`.

## Non-negotiables

- **No paid dependencies.** Never import `@mui/x-*-pro`, `@mui/x-*-premium` or `@mui/x-license`.
- **No backend assumptions.** Kits take async functions (`onSearch`, `onFetchPage`, `onSend`) and never call a specific API, GraphQL client or env var.
- **No product-specific names.** Use neutral sample data in stories (Acme, Northwind, example.com).

## Component quality bar

- Public components are prefixed `Fabric`.
- Props are typed and intentional. No `any`.
- Support `className`, `sx`, refs, disabled/loading/error states and accessibility where they apply.
- Use `ReactNode` for labels and content where realistic.
- Every export has JSDoc.
- Don't remove MUI capabilities without a reason; Fabric should feel like MUI with better defaults.

## Styling

- Spacing, radii, type, shadows, z-index and motion come from `@fabric-kit/design-tokens`.
- Colors come from MUI CSS variables, e.g. `var(--mui-palette-text-primary)`, so dark mode works.
- Avoid hardcoded hex values, raw pixel values and magic z-indexes.
- New tokens need a design reason, not a one-off need.
- Prefer Fabric primitives (`FabricFlex`, `FabricStack`, `FabricText`, …) over raw layout code.

## Docs and stories

Every public component has an MDX page and stories in Storybook. Docs cover:

- What it is and when to use it.
- Basic usage.
- Key props.
- Variants and states.
- Accessibility notes.
- How it relates to the underlying MUI component.

Stories cover the default, common variants, disabled/loading/error/empty states, long content, controlled usage, and keyboard behavior where it matters. Use realistic sample data.

## Validation

Run the smallest meaningful check after each change:

1. `pnpm --filter <package> typecheck`
2. `pnpm typecheck:stories`
3. `pnpm typecheck` at the root
4. `pnpm storybook:build` when docs or stories changed
5. `pnpm site:build` when the site or a package it uses changed
6. A visual check in Storybook when UI changed

Don't claim success without validation. Fix the source of a failure; don't silence it with casts, ignores or looser config.

## Releases

Fabric uses [Changesets](https://github.com/changesets/changesets). Add one with `pnpm changeset` for any user-facing change. Merging to `main` opens a "Version packages" PR; merging that publishes to npm (needs the `NPM_TOKEN` secret). `pnpm pages:build` assembles the site and Storybook into `_site/` for GitHub Pages.
