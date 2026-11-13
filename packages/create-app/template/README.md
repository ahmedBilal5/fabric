# fabric-app-template

A React app built with [Fabric](https://ahmedbilal5.github.io/fabric/), a free design system on MUI. Made with `@fabric-kit/create-app`.

## Run it

```bash
npm install
npm run dev
```

Then open the address it prints. `npm run build` makes a production build in `dist/`.

## What's inside

```
src
├── main.tsx        Fonts, the theme provider, data and router
├── theme.ts        Your theme: change the colors here
├── App.tsx         The app shell (sidebar, top bar) and one page per route
├── PageSuspense.tsx Loads each page on demand, then focuses its heading
├── routes.ts       Paths and pages
├── router.tsx      A tiny hash router
├── data.tsx        Sample projects, held in memory
└── pages
    ├── HomePage.tsx         Dashboard: stat cards and charts
    ├── ProjectsPage.tsx     List: search, filters, grid, bulk delete
    ├── ProjectPage.tsx      Detail: summary and tabs
    ├── ProjectFormPage.tsx  Create and edit form with validation
    ├── SettingsPage.tsx     Settings sections
    └── NotFoundPage.tsx     404
```

## Next steps

- **Your brand:** set your colors in `src/theme.ts`.
- **Your data:** replace `ProjectsProvider` in `src/data.tsx` with calls to your API. The pages only use `useProjects()`.
- **A new page:** add a route in `src/routes.ts`, load it with `lazy()` and render it in `App.tsx`, and add it to the sidebar's `NAV` list. Each page is its own chunk, so the first visit stays small.
- **A bigger router:** swap `src/router.tsx` for React Router or TanStack Router when you need nested layouts or data loading.

## Learn more

- [Components and patterns](https://ahmedbilal5.github.io/fabric/docs/)
- [Keeping the bundle small](https://ahmedbilal5.github.io/fabric/docs/?path=/docs/foundations-bundle-size--docs)
- [The example admin app](https://ahmedbilal5.github.io/fabric/admin/) and [its source](https://github.com/ahmedBilal5/fabric/tree/main/apps/admin)
