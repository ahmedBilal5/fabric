# @fabric-kit/date-picker

## 0.2.0

### Minor Changes

- df29424: Add quick-range presets to `FabricDateRangePicker` (`presets`), with built-ins such as Last 7 days and This quarter in `dateRangePresets`, and `today` for stable tests.

### Patch Changes

- df29424: Keep date ranges within phone-width forms by stacking their endpoints on small
  screens. At wider sizes, the inputs share the available row width while preserving
  explicit picker widths.
- cee30e7: Fixes from a visual audit of Storybook:

  - Theme: chip colors now switch with dark mode through CSS custom properties, so an `sx` background or color on a chip is no longer overridden in dark mode.
  - Components and date-picker: re-export MUI's `AdapterDayjs` instead of `AdapterMoment`. The moment adapter needs the `moment` package, which Fabric doesn't install, so importing the package barrel could fail to resolve `moment`. The `FabricAdapterMoment`, `FabricMomentDatePicker` and `FabricMomentTimePicker` aliases are removed; import `AdapterMoment` from `@mui/x-date-pickers/AdapterMoment` if you use moment.
  - Theme: outlined fields without a label no longer show a small gap in their top border.
  - Layout: the sidebar's "Close menu" button no longer clips its icon and label, and the workspace selector is a keyboard-accessible button with its arrow beside the name.

- Updated dependencies [297ae9c]
- Updated dependencies [f74032f]
- Updated dependencies [213d543]
- Updated dependencies [cee30e7]
  - @fabric-kit/theme@0.2.0
  - @fabric-kit/design-tokens@0.2.0
  - @fabric-kit/primitives@0.1.1
