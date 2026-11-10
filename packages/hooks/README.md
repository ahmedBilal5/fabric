# @fabric-kit/hooks

React hooks and formatting helpers for Fabric apps:

- `useDisclosure`, `useDebounce`, `useDebouncedCallback`, `useHotkeys`, `useClipboard`, `useLocalStorage`, `useRelativeTime`
- `formatDate`, `formatRelativeTime`, `formatNumber`, `formatCurrency`, `formatPercent`, `formatFileSize`

The formatters use the browser's built-in `Intl` APIs, so there is no date or number library to install. The package depends only on React and works with or without MUI.

Part of [Fabric](https://ahmedbilal5.github.io/fabric/), a free, open-source design system on top of MUI.

```bash
pnpm add @fabric-kit/hooks
```

```tsx
import { formatCurrency, useDisclosure, useHotkeys } from "@fabric-kit/hooks";

const palette = useDisclosure();
useHotkeys("mod+k", palette.onOpen);

formatCurrency(1499.5, "USD"); // "$1,499.50"
```

Documentation: [https://ahmedbilal5.github.io/fabric/docs/](https://ahmedbilal5.github.io/fabric/docs/)

## License

MIT
