# @fabric-kit/components

## 0.2.0

### Minor Changes

- f74032f: Add `useConfirm` and `useToast`.

  - `useConfirm()` returns `confirm(options)`, which opens a confirmation dialog and resolves to `true` or `false`. It supports destructive actions (`danger`), type-to-confirm and queued requests. Mount `FabricConfirmProvider` once.
  - `useToast()` returns `toast(options)` with `success`, `info`, `warning`, `error` and `dismiss` helpers. Toasts queue, show one at a time and can carry an Undo-style action. Mount `FabricToastProvider` once.
  - Fix: FabricSnackbar's close button now reports `escapeKeyDown` instead of `clickaway`, so handlers that ignore click-away (as the docs recommend) close on the X.

- f74032f: Add `FabricEmptyState` for empty lists, searches with no results, first-run screens and failed loads. It has `empty`, `no-results` and `error` variants with default icons, a custom `illustration` slot, up to two actions, and `sm` and `md` sizes.
- 1b36102: New components for record pages:

  - `FabricStatus`: a colored status dot with a label, with an optional pulse for work in progress.
  - `FabricRelativeTime`: "3 minutes ago" in a `<time>` element that updates itself, with the exact time on hover and focus.
  - `FabricKeyValueList`: label and value pairs in one or two columns, side by side or stacked, with copyable values, hints and an empty-value placeholder.
  - `FabricActivityFeed`: who did what and when, grouped by day, with icon markers, content blocks, loading, empty and "Show more" states.
  - `FabricComments` and `FabricCommentComposer`: comment threads with one level of replies, @mentions, editing and deleting your own comments, and ⌘/Ctrl+Enter to post. `parseMentions`, `getMentionedIds`, `mentionsToDisplay` and `displayToMentions` work with the stored `@[Name](id)` format.

- df29424: Add form inputs: `FabricNumberField` (stepping, limits, currency, percent and unit formatting), `FabricPasswordField` (show/hide and a strength meter), `FabricOtpField` (one-time codes with paste and auto-advance), `FabricPhoneField` (country picker, E.164 value), `FabricTagInput` and `FabricFileUpload` with `useFileUpload` (drop zone, progress, retry, remove). Add `useMaybeConfirm`. Checkbox, radio and switch labels now show as written instead of capitalizing every word.
- 213d543: Add `FabricMeter` for quotas ("8 of 10 seats", turning amber and red as it fills) and progress, with `meterState` and `meterValueText` helpers.

### Patch Changes

- 297ae9c: Brand themes now reach more of Fabric:

  - Tabs, accordions, steppers, cards, icon buttons, tooltips, the action bar, the data grid and the date pickers read text, background and divider colors from the theme instead of Fabric's fixed values, so a `createFabricTheme` brand's neutrals apply to them. Fabric's own look is unchanged.
  - `palette.appShell` and `palette.datagrid` overrides accept a partial object, so you can set only the colors you change.

- f74032f: Add `palette.control` for the neutral colors of form and navigation controls: field labels, tab text, input underlines and disabled tabs. `createFabricTheme` derives them from your `text` and `divider` colors, so a brand's neutrals now reach text fields, tabs, checkbox and radio labels, card labels, accordions and the date pickers. Set `palette.control` keys to override them. Fabric's own look is unchanged.
- 886a6a6: Fix screen-reader-only text that was as wide as its container (`width: 1` in `sx` means 100%), which made pages scroll sideways. Affected `FabricStatCard`, chart table views, `FabricMeter`, `FabricFileUpload`, `FabricBulkActionBar` and `FabricWizard`.
- 886a6a6: `FabricToggleButtonGroup`'s track now uses the theme's divider color, so it follows your brand instead of always showing Fabric's warm gray.
- cee30e7: Fixes from a visual audit of Storybook:

  - Theme: chip colors now switch with dark mode through CSS custom properties, so an `sx` background or color on a chip is no longer overridden in dark mode.
  - Components and date-picker: re-export MUI's `AdapterDayjs` instead of `AdapterMoment`. The moment adapter needs the `moment` package, which Fabric doesn't install, so importing the package barrel could fail to resolve `moment`. The `FabricAdapterMoment`, `FabricMomentDatePicker` and `FabricMomentTimePicker` aliases are removed; import `AdapterMoment` from `@mui/x-date-pickers/AdapterMoment` if you use moment.
  - Theme: outlined fields without a label no longer show a small gap in their top border.
  - Layout: the sidebar's "Close menu" button no longer clips its icon and label, and the workspace selector is a keyboard-accessible button with its arrow beside the name.

- Updated dependencies [297ae9c]
- Updated dependencies [f74032f]
- Updated dependencies [f74032f]
- Updated dependencies [df29424]
- Updated dependencies [df29424]
- Updated dependencies [213d543]
- Updated dependencies [1b36102]
- Updated dependencies [cee30e7]
  - @fabric-kit/theme@0.2.0
  - @fabric-kit/hooks@0.1.0
  - @fabric-kit/date-picker@0.2.0
  - @fabric-kit/design-tokens@0.2.0
  - @fabric-kit/primitives@0.1.1
