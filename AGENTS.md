# Fabric: contributor and agent guide

Fabric is a free, open-source design system built on top of MUI. It adds design tokens, a themed MUI setup, layout primitives, polished component wrappers, styled MUI X controls (free tiers only), and higher-level kits such as an app shell, global search, a chat panel and a workflow canvas.

Think like a design-system maintainer: the goal is stable, well-documented packages that many apps can adopt, not just code that compiles.

`CLAUDE.md` and `AGENTS.md` hold the same text, for different coding agents. CI fails if they differ, so change both.

## Roadmap and current work

- **Scope:** [`docs/ROADMAP.md`](docs/ROADMAP.md) lists every phase and item, with its issue number.
- **Progress:** the pinned [Roadmap issue #42](https://github.com/ahmedBilal5/fabric/issues/42) and the issues it links. An item is done when its issue is closed.
- **Done:** Phase 0 (#1–#8), Phase 1 (#9–#17), Phase 2 (#18–#26) and Phase 3 (#27–#30). **Next:** Phase 4, the example admin app (#31–#33).
- One branch per phase (or per item), cut from `main`, e.g. `phase-2-forms`. Open the PR against `main` with `Closes #n` for each item, so the issues close on merge. Don't stack a PR on another unmerged branch: Phase 1 was once merged into its base branch instead of `main` by mistake.
- When issues close, tick their boxes in #42.

## Layers

Fabric is built bottom-up. Each layer may use any layer below it, never above.

```
design-tokens → theme → primitives → components → advanced-components → kits/* → patterns
```

| Layer | Package(s)                                                                       | Rules                                                                         |
| ----- | -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| 1     | `@fabric-kit/design-tokens`                                                      | Plain TS values. No React, no MUI.                                            |
| 2     | `@fabric-kit/theme`                                                              | MUI theme built from tokens.                                                  |
| 3     | `@fabric-kit/primitives`                                                         | Layout and text: Flex, Stack, Inline, Grid, Text, Surface.                    |
| 4     | `@fabric-kit/components`                                                         | Fabric wrappers around MUI components.                                        |
| 5     | `@fabric-kit/datagrid`, `date-picker`, `tree-view`, `charts`, `forms`            | Styled MUI X controls (free MIT tier only), and form bindings and layout.     |
| 6     | `@fabric-kit/layout`, `global-search`, `chatbot`, `versioning`, `canvas-builder` | Composed, app-level kits. Kits must not depend on each other.                 |
| 7     | `@fabric-kit/patterns`                                                           | Whole pages (system, list, detail, form, settings, dashboard) from any layer. |

`@fabric-kit/forms` binds the inputs from `components` and `date-picker` to React Hook Form, so it may use other layer-5 packages; nothing below it may use it.

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
- Charts take series colors from `theme.palette.chart.categorical` (a fixed order checked for color-blind readers) and a single series from the primary color. Status colors are only for meaning (good or bad), never for "series 4".
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

## How existing work is laid out

Phases 0 and 1 set these conventions. Follow them so new work looks the same.

- **Files:** a component lives in `packages/<pkg>/src/FabricX/index.tsx` (extra files in the same folder) and is exported from `src/index.ts`. In `components`, the `FabricX.stories.tsx` and `FabricX.mdx` sit beside the source. In `datagrid`, `charts` and `patterns` they live in the package's `docs/` folder, with shared sample data (`docs/sampleData.ts`, `docs/invoices.tsx`).
- **Stories:** titles are `Components/FabricX`, `Advanced Components/FabricX`, `Forms/<Topic>` (form layout, bindings, wizard), `Charts/<Topic>` (bar chart, stat card, …) or `Patterns/<Name>`. Add `tags: ["test"]` so the stories run as browser tests (`pnpm test-storybook`), and use `play` functions for interactions. Each MDX page opens with `<Meta of={Stories} name="Overview" />`.
- **Unit tests:** put pure logic (parsing, URL sync, selection maths) in plain `.ts` files and test it in Node. Each package with tests has a `vitest.config.ts` (`environment: "node"`, `include: ["test/**/*.test.ts"]`) and a `test` script.
- **Dependencies between packages:** add `workspace:*` to `package.json` and a reference in `tsconfig.json`. Keep to the layer order.
- **Data stays with the app:** patterns take rows, values and callbacks. They never fetch.
- **Accessibility:** use an explicit `aria-label` when a button's visible text is split up (e.g. "Status: 2 selected"), `aria-live="polite"` for counts that change, `role="toolbar"` / `role="search"` where they fit, `menuitemcheckbox` / `menuitemradio` in choice menus, Escape to dismiss, and respect reduced motion.
- **Changesets:** one per package per feature, `minor` for new features and `patch` for fixes (see the `phase-1-*` files in `.changeset/`).
- **Docs:** when adding a package or pattern, update the package README, the package table in the root `README.md`, and `docs/Introduction.mdx`.

## Pitfalls

- **MDX braces:** `{word}` in MDX prose is run as JavaScript and crashes the docs page. Put it in backticks.
- **Fake secrets:** GitHub push protection rejects realistic sample keys such as `sk_live_…`. Use `example-key-…`.
- **Storybook on WSL:** with the repo on `/mnt/c`, the dev server (port 6007) doesn't see edited or new files. Restart it.
- **Grid checkboxes:** Fabric's data grid hides row checkboxes until hover. `FabricListPage` forces them visible when there are bulk actions.
- **Selection model:** in MUI X v9 it is `{ type: "include" | "exclude", ids: Set }`, not an array. Use `getSelectedCount` and `emptySelection` from `@fabric-kit/datagrid`.
- **Fading elements in tests:** wrap visibility checks in `waitFor`. While a dialog closes the page is still `aria-hidden`, so role queries after it need `waitFor` too.
- **Confirm dialogs** (`useConfirm`) have `role="alertdialog"`, not `dialog`.
- **Flag emoji** don't render on Windows or Linux. Show country codes as text.
- **Colors in JS:** with Fabric's CSS-variables theme, `useTheme().palette` stays on the light scheme in dark mode. Where you need a real color value (SVG attributes, charts), resolve the scheme with `useColorScheme()` and read `theme.colorSchemes[mode].palette`, as `useChartPalette` does.
- **Docs prose styles** in `.storybook/docs.css` skip `.docs-story`, so they never restyle the examples. Keep new prose rules scoped the same way.
- **Slow stories:** under a full run the `Scales` story can time out. Rerun it alone before treating it as a failure.
- **Semantic elements:** `FabricText` has no `component` prop typing. Use `styled("time")` (or similar) when you need a specific element.

## Working rules for agents

- Commit and push only when the maintainer asks. Branch first; never commit to `main`.
- Never copy code, config, `.env` files or git history from a private or commercial codebase. Fabric is an open-source fork, and the original's MUI X licence key must never appear here.
- End commit messages with a `Co-Authored-By` line for the agent that wrote them.
- Run the checks below before saying something works, and report failures as they are.

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
