# @fabric-kit/forms

## 0.1.0

### Minor Changes

- df29424: Add React Hook Form bindings for all existing Fabric inputs, with a Zod resolver,
  validation/helper text, disabled state, blur tracking, reset support and invalid-field
  focus. Includes generic autocomplete modes, checkbox arrays, date/time and range
  pickers, a custom-field render API, documentation and interaction stories.
- df29424: Add form layout and flows: `FabricForm` (provider, error summary and save errors), `FabricFormSection`, `FabricFormRow`, `FabricFormActions` (sticky Save bar), `FabricFormErrorSummary`, `FabricWizard` and `useUnsavedChanges`. Add bindings for the new number, password, one-time code, phone, tag and file-upload inputs.

### Patch Changes

- 886a6a6: Fix screen-reader-only text that was as wide as its container (`width: 1` in `sx` means 100%), which made pages scroll sideways. Affected `FabricStatCard`, chart table views, `FabricMeter`, `FabricFileUpload`, `FabricBulkActionBar` and `FabricWizard`.
- Updated dependencies [297ae9c]
- Updated dependencies [f74032f]
- Updated dependencies [f74032f]
- Updated dependencies [f74032f]
- Updated dependencies [1b36102]
- Updated dependencies [df29424]
- Updated dependencies [df29424]
- Updated dependencies [df29424]
- Updated dependencies [213d543]
- Updated dependencies [213d543]
- Updated dependencies [886a6a6]
- Updated dependencies [886a6a6]
- Updated dependencies [cee30e7]
  - @fabric-kit/components@0.2.0
  - @fabric-kit/date-picker@0.2.0
  - @fabric-kit/design-tokens@0.2.0
