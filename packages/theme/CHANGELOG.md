# @fabric-kit/theme

## 0.2.0

### Minor Changes

- f74032f: Add `palette.control` for the neutral colors of form and navigation controls: field labels, tab text, input underlines and disabled tabs. `createFabricTheme` derives them from your `text` and `divider` colors, so a brand's neutrals now reach text fields, tabs, checkbox and radio labels, card labels, accordions and the date pickers. Set `palette.control` keys to override them. Fabric's own look is unchanged.
- 213d543: Add chart series colors: `chart.categorical` and `dark.chart.categorical` tokens, exposed as `theme.palette.chart.categorical`. Override them with `createFabricTheme`.

### Patch Changes

- 297ae9c: Brand themes now reach more of Fabric:

  - Tabs, accordions, steppers, cards, icon buttons, tooltips, the action bar, the data grid and the date pickers read text, background and divider colors from the theme instead of Fabric's fixed values, so a `createFabricTheme` brand's neutrals apply to them. Fabric's own look is unchanged.
  - `palette.appShell` and `palette.datagrid` overrides accept a partial object, so you can set only the colors you change.

- cee30e7: Fixes from a visual audit of Storybook:

  - Theme: chip colors now switch with dark mode through CSS custom properties, so an `sx` background or color on a chip is no longer overridden in dark mode.
  - Components and date-picker: re-export MUI's `AdapterDayjs` instead of `AdapterMoment`. The moment adapter needs the `moment` package, which Fabric doesn't install, so importing the package barrel could fail to resolve `moment`. The `FabricAdapterMoment`, `FabricMomentDatePicker` and `FabricMomentTimePicker` aliases are removed; import `AdapterMoment` from `@mui/x-date-pickers/AdapterMoment` if you use moment.
  - Theme: outlined fields without a label no longer show a small gap in their top border.
  - Layout: the sidebar's "Close menu" button no longer clips its icon and label, and the workspace selector is a keyboard-accessible button with its arrow beside the name.

- Updated dependencies [213d543]
  - @fabric-kit/design-tokens@0.2.0
