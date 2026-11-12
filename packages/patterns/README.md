# @fabric-kit/patterns

Whole pages for Fabric apps, assembled from Fabric components and kits:

- `FabricListPage`: header, filter bar, data grid, bulk actions, export, and empty, no-results and error states.
- `FabricDetailPage`: header with status and actions, key-value summary, tabbed sections and an activity side panel.
- `FabricFilterBar` and `useFilterParams`: search and filters, kept in the URL.
- `FabricFormPage`: create and edit pages with view and edit modes, a sticky Save bar and an unsaved-changes warning.
- `FabricSettingsPage`, `FabricSettingsGroup` and `FabricSettingsRow`: a section list with grouped setting rows.
- `FabricDashboardPage`, `FabricDashboardGrid` and `FabricDashboardItem`: a header, one date-range filter row and a responsive widget grid for stat cards and charts from `@fabric-kit/charts`.
- `FabricSystemPage`: 404, 403, no-access, server-error and maintenance pages.

Part of [Fabric](https://ahmedbilal5.github.io/fabric/), a free, open-source design system on top of MUI.

```bash
pnpm add @fabric-kit/patterns @fabric-kit/components @fabric-kit/theme @mui/material @mui/x-data-grid @emotion/react @emotion/styled
```

```tsx
import { FabricSystemPage } from "@fabric-kit/patterns";

<FabricSystemPage kind="not-found" homeHref="/" />;
```

Documentation: [https://ahmedbilal5.github.io/fabric/docs/](https://ahmedbilal5.github.io/fabric/docs/)

## License

MIT
