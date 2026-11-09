---
"@fabric-kit/theme": patch
"@fabric-kit/components": patch
"@fabric-kit/date-picker": patch
"@fabric-kit/layout": patch
---

Fixes from a visual audit of Storybook:

- Theme: chip colors now switch with dark mode through CSS custom properties, so an `sx` background or color on a chip is no longer overridden in dark mode.
- Components and date-picker: re-export MUI's `AdapterDayjs` instead of `AdapterMoment`. The moment adapter needs the `moment` package, which Fabric doesn't install, so importing the package barrel could fail to resolve `moment`. The `FabricAdapterMoment`, `FabricMomentDatePicker` and `FabricMomentTimePicker` aliases are removed; import `AdapterMoment` from `@mui/x-date-pickers/AdapterMoment` if you use moment.
- Theme: outlined fields without a label no longer show a small gap in their top border.
- Layout: the sidebar's "Close menu" button no longer clips its icon and label, and the workspace selector is a keyboard-accessible button with its arrow beside the name.
