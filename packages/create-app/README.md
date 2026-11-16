# @fabric-kit/create-app

Start a React app with [Fabric](https://ahmedbilal5.github.io/fabric/), a free design system on MUI.

```bash
npm create @fabric-kit/app@latest my-app
cd my-app
npm install
npm run dev
```

Also works with `pnpm create @fabric-kit/app` and `yarn create @fabric-kit/app`. The folder must be new or empty, and its name becomes the package name.

## What you get

A Vite and TypeScript app with Fabric's theme, the app shell (sidebar and top bar) and one page of each kind:

- a dashboard with stat cards and charts
- a list with search, filters, export and bulk actions
- a detail page with a summary and tabs
- a create and edit form with validation
- a settings page
- a 404 page

Sample data lives in memory behind one hook, ready to swap for your API. A small hash router keeps it free of extra dependencies. Every package it installs is free and MIT licensed.

See the [docs](https://ahmedbilal5.github.io/fabric/docs/?path=/docs/examples-starter-app--overview) for a tour.

## License

MIT
