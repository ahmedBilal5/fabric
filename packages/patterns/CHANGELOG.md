# @fabric-kit/patterns

## 0.1.0

### Minor Changes

- f74032f: New package: `@fabric-kit/patterns`, for whole pages built from Fabric components and kits. It starts with `FabricSystemPage`: not-found (404), forbidden (403), no-access, server-error (500) and maintenance pages with default copy and actions (go home, go back, try again, request access), an error reference line, and full-viewport or in-container layout.
- 1b36102: - `FabricFilterBar`: search, single- and multi-choice filter menus, "Clear all" and a live result count.
  - `useFilterParams`, `filtersToSearchParams` and `filtersFromSearchParams`: keep search and filters in the URL, with the browser's address bar or your router.
  - `FabricListPage`: page header, filter bar, data grid, bulk actions, CSV export, and empty, no-results, loading and error states.
  - `FabricDetailPage`: header with status and actions, key-value summary, tabbed sections and a side panel that moves below the content on small screens.
- df29424: Add `FabricFormPage` (create and edit pages with view and edit modes, a sticky Save bar and an unsaved-changes warning) and `FabricSettingsPage` with `FabricSettingsGroup` and `FabricSettingsRow`.
- 213d543: Add `FabricDashboardPage`, `FabricDashboardGrid` and `FabricDashboardItem`: a page header, one date-range filter row and a responsive widget grid.

### Patch Changes

- ffd9348: Update the package description: the list, detail, form, settings and dashboard pages have shipped.
- Updated dependencies [297ae9c]
- Updated dependencies [f74032f]
- Updated dependencies [f74032f]
- Updated dependencies [f74032f]
- Updated dependencies [ffd9348]
- Updated dependencies [886a6a6]
- Updated dependencies [f74032f]
- Updated dependencies [1b36102]
- Updated dependencies [1b36102]
- Updated dependencies [df29424]
- Updated dependencies [df29424]
- Updated dependencies [df29424]
- Updated dependencies [df29424]
- Updated dependencies [df29424]
- Updated dependencies [213d543]
- Updated dependencies [213d543]
- Updated dependencies [886a6a6]
- Updated dependencies [886a6a6]
- Updated dependencies [cee30e7]
  - @fabric-kit/theme@0.2.0
  - @fabric-kit/components@0.2.0
  - @fabric-kit/layout@0.2.0
  - @fabric-kit/datagrid@0.2.0
  - @fabric-kit/date-picker@0.2.0
  - @fabric-kit/forms@0.1.0
  - @fabric-kit/design-tokens@0.2.0
  - @fabric-kit/primitives@0.1.1
