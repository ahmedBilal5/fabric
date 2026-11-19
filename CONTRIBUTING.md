# Contributing to Fabric

Thanks for helping. Bug reports, docs fixes, new stories and new components are all welcome.

## Set up

Requires Node 22 and pnpm 9.

```bash
git clone https://github.com/ahmedBilal5/fabric.git
cd fabric
pnpm install
pnpm build          # builds every package (Storybook and the site use the built icons)
pnpm storybook      # stories and component playground at http://localhost:6007
pnpm site:dev       # the landing page and docs site
pnpm admin:dev      # the example admin app
```

## Where things live

```
packages/design-tokens        colors, type, spacing, radii, shadows, motion
packages/theme                the MUI theme and DesignSystemProvider
packages/primitives           layout and text primitives
packages/components           MUI components with Fabric defaults
packages/advanced-components  datagrid, date-picker, tree-view, charts
packages/forms                React Hook Form and Zod bindings, form layout, wizard
packages/kits/*               layout, global-search, chatbot, versioning, canvas-builder
packages/patterns             whole pages: list, detail, form, settings, dashboard
packages/icons                Material Symbols as React components (generated)
packages/hooks                React hooks and Intl formatting helpers
packages/create-app           the starter CLI and its template
apps/site                     the landing page and docs site (dogfoods the packages)
apps/site/content/docs        docs pages, as MDX
apps/admin                    the example admin app
docs/                         Storybook guides not yet moved to the docs site
```

Each layer may use the layers above it in that list, never below; `icons` and `hooks` can be used by any layer from primitives up. Kits never depend on each other. [CLAUDE.md](CLAUDE.md) has the full rules and the quality bar for components, and the [contribution guidelines](https://ahmedbilal5.github.io/fabric/docs/foundations/contributing/) cover API design, docs and the review checklist.

## Making a change

1. Branch from `main`.
2. Make the change with stories and docs. Check it in Storybook in light and dark mode and at mobile width.
3. Run the checks:

   ```bash
   pnpm lint
   pnpm typecheck
   pnpm typecheck:stories
   pnpm test
   ```
4. If the change affects a published package, add a changeset: `pnpm changeset`. Don't edit versions by hand.
5. Open a pull request.

## Ground rules

- Free dependencies only. Never import `@mui/x-*-pro`, `@mui/x-*-premium` or `@mui/x-license` (lint blocks it).
- Kits stay backend-agnostic: they take async functions, never call a specific API.
- Colors come from the theme (`var(--mui-palette-*)`), sizes from the tokens.
- Sample data in stories is neutral and fictional (Acme, Northwind, example.com).

By contributing you agree to follow the [Code of Conduct](CODE_OF_CONDUCT.md) and to license your contribution under the [MIT license](LICENSE).
