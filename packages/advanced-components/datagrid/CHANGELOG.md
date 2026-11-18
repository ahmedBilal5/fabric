# @fabric-kit/datagrid

## 0.2.0

### Minor Changes

- 1b36102: - `FabricBulkActionBar`: the bar that appears when rows are selected, with a count, actions, "Select all N", a "More actions" menu and Escape to clear. Inline or floating. `getSelectedCount` and `emptySelection` help with MUI X selection models.
  - `FabricSavedViews` and `useSavedViews`: built-in and user-saved grid views with save, save as, rename, delete and an "Edited" state, kept in memory, in `localStorage`, or on your server.

### Patch Changes

- 886a6a6: Fix screen-reader-only text that was as wide as its container (`width: 1` in `sx` means 100%), which made pages scroll sideways. Affected `FabricStatCard`, chart table views, `FabricMeter`, `FabricFileUpload`, `FabricBulkActionBar` and `FabricWizard`.
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
