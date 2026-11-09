---
"@fabric-kit/theme": patch
"@fabric-kit/components": patch
---

Brand themes now reach more of Fabric:

- Tabs, accordions, steppers, cards, icon buttons, tooltips, the action bar, the data grid and the date pickers read text, background and divider colors from the theme instead of Fabric's fixed values, so a `createFabricTheme` brand's neutrals apply to them. Fabric's own look is unchanged.
- `palette.appShell` and `palette.datagrid` overrides accept a partial object, so you can set only the colors you change.
