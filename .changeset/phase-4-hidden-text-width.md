---
"@fabric-kit/charts": patch
"@fabric-kit/components": patch
"@fabric-kit/datagrid": patch
"@fabric-kit/forms": patch
---

Fix screen-reader-only text that was as wide as its container (`width: 1` in `sx` means 100%), which made pages scroll sideways. Affected `FabricStatCard`, chart table views, `FabricMeter`, `FabricFileUpload`, `FabricBulkActionBar` and `FabricWizard`.
