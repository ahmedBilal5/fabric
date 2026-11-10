---
"@fabric-kit/theme": minor
"@fabric-kit/components": patch
---

Add `palette.control` for the neutral colors of form and navigation controls: field labels, tab text, input underlines and disabled tabs. `createFabricTheme` derives them from your `text` and `divider` colors, so a brand's neutrals now reach text fields, tabs, checkbox and radio labels, card labels, accordions and the date pickers. Set `palette.control` keys to override them. Fabric's own look is unchanged.
