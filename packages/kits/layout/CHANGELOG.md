# @fabric-kit/layout

## 0.2.0

### Minor Changes

- f74032f: Add `FabricPageHeader`: breadcrumbs or a back button, the title with a status, a description and a meta line, page actions with an overflow menu, and optional tabs. Actions wrap under the title on narrow screens, and `sticky` keeps the header in view.

### Patch Changes

- ffd9348: `FabricAppShell`: a banner in `bannerSlot` now spans the full width and truncates a long message, instead of shrinking to its text or overflowing on phones.
- 886a6a6: Mark the package as free of side effects, so bundlers drop the parts of it an app doesn't use.
- cee30e7: Fixes from a visual audit of Storybook:

  - Theme: chip colors now switch with dark mode through CSS custom properties, so an `sx` background or color on a chip is no longer overridden in dark mode.
  - Components and date-picker: re-export MUI's `AdapterDayjs` instead of `AdapterMoment`. The moment adapter needs the `moment` package, which Fabric doesn't install, so importing the package barrel could fail to resolve `moment`. The `FabricAdapterMoment`, `FabricMomentDatePicker` and `FabricMomentTimePicker` aliases are removed; import `AdapterMoment` from `@mui/x-date-pickers/AdapterMoment` if you use moment.
  - Theme: outlined fields without a label no longer show a small gap in their top border.
  - Layout: the sidebar's "Close menu" button no longer clips its icon and label, and the workspace selector is a keyboard-accessible button with its arrow beside the name.

- Updated dependencies [297ae9c]
- Updated dependencies [f74032f]
- Updated dependencies [f74032f]
- Updated dependencies [f74032f]
- Updated dependencies [1b36102]
- Updated dependencies [df29424]
- Updated dependencies [213d543]
- Updated dependencies [213d543]
- Updated dependencies [886a6a6]
- Updated dependencies [886a6a6]
- Updated dependencies [cee30e7]
  - @fabric-kit/theme@0.2.0
  - @fabric-kit/components@0.2.0
  - @fabric-kit/design-tokens@0.2.0
  - @fabric-kit/primitives@0.1.1
