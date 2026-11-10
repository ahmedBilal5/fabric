# @fabric-kit/patterns

Whole pages for Fabric apps, assembled from Fabric components and kits. Today it ships `FabricSystemPage` for 404, 403, no-access, server-error and maintenance pages. List, detail, form, settings and dashboard page patterns are on the [roadmap](https://github.com/ahmedBilal5/fabric/issues/42).

Part of [Fabric](https://ahmedbilal5.github.io/fabric/), a free, open-source design system on top of MUI.

```bash
pnpm add @fabric-kit/patterns @fabric-kit/components @fabric-kit/theme @mui/material @emotion/react @emotion/styled
```

```tsx
import { FabricSystemPage } from "@fabric-kit/patterns";

<FabricSystemPage kind="not-found" homeHref="/" />;
```

Documentation: [https://ahmedbilal5.github.io/fabric/docs/](https://ahmedbilal5.github.io/fabric/docs/)

## License

MIT
