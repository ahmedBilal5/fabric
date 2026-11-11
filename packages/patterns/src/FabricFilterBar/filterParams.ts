import { useCallback, useEffect, useMemo, useState } from "react";
import type { FabricFilterDef, FabricFilterValues } from "./types";

/**
 * Reads and writes the address bar's query string. The default uses
 * `window.location` and `history.replaceState`; pass your router's instead (for
 * React Router: `const [params, setParams] = useSearchParams()` →
 * `{ params, setParams: (p) => setParams(p, { replace: true }) }`).
 */
export interface SearchParamsAdapter {
  /** The current query string. */
  params: URLSearchParams;
  /** Replaces the query string. */
  setParams: (params: URLSearchParams) => void;
}

/**
 * Writes filter values and a search query into URL search params. Multi-select
 * filters repeat their key (`status=paid&status=draft`). Empty values are removed;
 * params that aren't filters are kept.
 */
export function filtersToSearchParams(
  defs: FabricFilterDef[],
  values: FabricFilterValues,
  search: string,
  base: URLSearchParams = new URLSearchParams(),
  searchKey = "q",
): URLSearchParams {
  const params = new URLSearchParams(base);
  params.delete(searchKey);
  if (search.trim()) params.set(searchKey, search);
  for (const def of defs) {
    params.delete(def.id);
    const v = values[def.id];
    if (Array.isArray(v)) for (const item of v) params.append(def.id, item);
    else if (v) params.set(def.id, v);
  }
  return params;
}

/**
 * Reads filter values and a search query from URL search params. Values that aren't
 * among a filter's options are dropped, so a stale or edited link can't put the
 * page in an impossible state.
 */
export function filtersFromSearchParams(
  defs: FabricFilterDef[],
  params: URLSearchParams,
  searchKey = "q",
): { values: FabricFilterValues; search: string } {
  const values: FabricFilterValues = {};
  for (const def of defs) {
    const allowed = new Set(def.options.map((o) => o.value));
    const raw = params.getAll(def.id).filter((v) => allowed.has(v));
    if (raw.length === 0) continue;
    values[def.id] = def.multiple ? raw : raw[0];
  }
  return { values, search: params.get(searchKey) ?? "" };
}

const readWindowParams = () =>
  new URLSearchParams(typeof window === "undefined" ? "" : window.location.search);

function useWindowParams(): SearchParamsAdapter {
  const [params, setState] = useState(readWindowParams);
  useEffect(() => {
    const onPop = () => setState(readWindowParams());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  const setParams = useCallback((next: URLSearchParams) => {
    const qs = next.toString();
    const url = `${window.location.pathname}${qs ? `?${qs}` : ""}${window.location.hash}`;
    window.history.replaceState(window.history.state, "", url);
    setState(new URLSearchParams(next));
  }, []);
  return { params, setParams };
}

export interface UseFilterParamsOptions {
  /** Your router's search params. Defaults to the browser's address bar. */
  adapter?: SearchParamsAdapter;
  /** Query-string key for the search text. @default "q" */
  searchKey?: string;
}

export interface FilterParams {
  /** Current filter values, read from the URL. */
  values: FabricFilterValues;
  /** Current search text, read from the URL. */
  search: string;
  /** Replaces the filter values. */
  setValues: (values: FabricFilterValues) => void;
  /** Replaces the search text. */
  setSearch: (search: string) => void;
  /** Clears search and every filter. */
  clear: () => void;
}

/**
 * Keeps a filter bar's search and filters in the URL, so a filtered list can be
 * bookmarked, shared and restored with the back button.
 *
 * @example
 * ```tsx
 * const filters = useFilterParams(FILTERS);
 * <FabricFilterBar
 *   filters={FILTERS}
 *   values={filters.values}
 *   onValuesChange={filters.setValues}
 *   search={filters.search}
 *   onSearchChange={filters.setSearch}
 * />
 * ```
 */
export function useFilterParams(
  defs: FabricFilterDef[],
  { adapter, searchKey = "q" }: UseFilterParamsOptions = {},
): FilterParams {
  const fallback = useWindowParams();
  const { params, setParams } = adapter ?? fallback;
  const { values, search } = useMemo(
    () => filtersFromSearchParams(defs, params, searchKey),
    [defs, params, searchKey],
  );
  const setValues = useCallback(
    (next: FabricFilterValues) =>
      setParams(filtersToSearchParams(defs, next, search, params, searchKey)),
    [defs, search, params, searchKey, setParams],
  );
  const setSearch = useCallback(
    (next: string) => setParams(filtersToSearchParams(defs, values, next, params, searchKey)),
    [defs, values, params, searchKey, setParams],
  );
  const clear = useCallback(
    () => setParams(filtersToSearchParams(defs, {}, "", params, searchKey)),
    [defs, params, searchKey, setParams],
  );
  return { values, search, setValues, setSearch, clear };
}
