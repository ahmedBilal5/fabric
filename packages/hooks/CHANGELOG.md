# @fabric-kit/hooks

## 0.1.0

### Minor Changes

- f74032f: New package: `@fabric-kit/hooks`. React hooks (`useDisclosure`, `useDebounce`, `useDebouncedCallback`, `useHotkeys`, `useClipboard`, `useLocalStorage`, `useRelativeTime`) and `Intl`-based formatting helpers (`formatDate`, `formatRelativeTime`, `formatNumber`, `formatCurrency`, `formatPercent`, `formatFileSize`). Depends only on React.

### Patch Changes

- 1b36102: `formatRelativeTime` and `useRelativeTime` count days by the calendar: 26 hours ago just after midnight now reads "2 days ago", matching the date, instead of "yesterday".
