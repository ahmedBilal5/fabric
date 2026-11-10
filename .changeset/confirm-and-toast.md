---
"@fabric-kit/components": minor
---

Add `useConfirm` and `useToast`.

- `useConfirm()` returns `confirm(options)`, which opens a confirmation dialog and resolves to `true` or `false`. It supports destructive actions (`danger`), type-to-confirm and queued requests. Mount `FabricConfirmProvider` once.
- `useToast()` returns `toast(options)` with `success`, `info`, `warning`, `error` and `dismiss` helpers. Toasts queue, show one at a time and can carry an Undo-style action. Mount `FabricToastProvider` once.
- Fix: FabricSnackbar's close button now reports `escapeKeyDown` instead of `clickaway`, so handlers that ignore click-away (as the docs recommend) close on the X.
