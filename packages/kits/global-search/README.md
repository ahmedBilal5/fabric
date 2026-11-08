# @fabric-kit/global-search

A grouped, command-palette style search box and a matching "View all results" page for Fabric apps. Works with any backend: you pass async functions, Fabric handles debouncing, request cancellation, grouping, highlighting and paging.

```bash
pnpm add @fabric-kit/global-search @fabric-kit/components @fabric-kit/datagrid @mui/material @mui/x-data-grid @emotion/react @emotion/styled
```

## Search box

```tsx
import { FabricGlobalSearch } from "@fabric-kit/global-search";

<FabricGlobalSearch
  onSearch={async (query, { signal }) => {
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal });
    return res.json(); // { groups: [{ type, results, totalCount }], totalCount }
  }}
  config={{
    customer: {
      displayLabel: "Customers",
      labelKey: "name",
      descriptionKey: "city",
      onClickResult: (row) => navigate(`/customers/${row.id}`),
    },
  }}
  onClickViewAll={(query) => navigate(`/search?q=${query}`)}
/>;
```

## Results page

```tsx
import { FabricViewAllSearchResults } from "@fabric-kit/global-search";

<FabricViewAllSearchResults
  query={query}
  config={{ customer: { tabLabel: "Customers", columns } }}
  onFetchPage={async ({ type, query, page, pageSize, sortModel, signal }) => {
    const res = await fetch(`/api/search/${type}?q=${query}&page=${page}&size=${pageSize}`, {
      signal,
    });
    return res.json(); // { rows, totalCount }
  }}
/>;
```

See the [docs](https://ahmedbilal5.github.io/fabric/docs/) for every prop and live examples.
