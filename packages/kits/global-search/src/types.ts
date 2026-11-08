import type {
  GridColDef,
  GridFilterModel,
  GridPaginationModel,
  GridSortModel,
  GridValidRowModel,
} from "@fabric-kit/datagrid";
import type React from "react";

/** Context that moves one result type to the top of the grouped results, e.g. the current page's. */
export interface FabricGlobalSearchContext {
  /** Display label shown by host shells, when applicable. */
  label: string;
  /** Result type to promote to the top of the list. */
  type: string;
}

/** How to display one result type (e.g. `"customer"`, `"order"`) in the autocomplete. */
export interface FabricGlobalSearchConfigEntry<Row = FabricSearchResultRow> {
  /** Icon shown next to results of this type when they have no image. */
  icon?: React.ReactNode;
  /** Group heading, e.g. "Customers". */
  displayLabel: string;
  /** Row field used as the result's main label. */
  labelKey: string;
  /** Row field used as the secondary text on the right. */
  descriptionKey: string;
  /** Row field holding an image URL for a round avatar. */
  imageKey?: string;
  /** Called when the user picks a result of this type. */
  onClickResult: (row: Row) => void;
}

/** Display configuration keyed by result type. Key order sets group order. */
export type FabricGlobalSearchConfig<Row = FabricSearchResultRow> = Record<
  string,
  FabricGlobalSearchConfigEntry<Row>
>;

/** A search result. Any extra fields from your API pass through untouched. */
export interface FabricSearchResultRow {
  id?: string | number;
  /** Result type. Must match a key in the search config. */
  type?: string;
  name?: string;
  description?: string;
  image?: string;
  [key: string]: unknown;
}

/** Results for one type. */
export interface FabricSearchResultGroup<Row = FabricSearchResultRow> {
  type: string;
  /** The top matches to show in the autocomplete (usually 3 to 5). */
  results: Row[];
  /** Total matches of this type, shown in the group heading. */
  totalCount?: number;
}

/** What `onSearch` resolves with. */
export interface FabricSearchResponse<Row = FabricSearchResultRow> {
  groups: FabricSearchResultGroup<Row>[];
  /** Total matches across all types, shown on the "View all" button. */
  totalCount?: number;
}

/** Options passed to your fetch functions. */
export interface FabricSearchRequestOptions {
  /** Aborted when a newer request supersedes this one. Pass it to `fetch`. */
  signal: AbortSignal;
}

/** Props for the autocomplete search box. */
export interface FabricGlobalSearchProps<Row = FabricSearchResultRow> {
  /**
   * Fetches grouped results for a query. Called after the user stops typing
   * for `debounceMs`. Works with any backend: REST, GraphQL, a local index.
   */
  onSearch: (
    query: string,
    options: FabricSearchRequestOptions,
  ) => Promise<FabricSearchResponse<Row>>;
  /** Display configuration keyed by result type. */
  config: FabricGlobalSearchConfig<Row>;
  /** Called from the "View all results" button. Omit to hide the button. */
  onClickViewAll?: (query: string) => void;
  /** Promotes one result type to the top, e.g. the type of the current page. */
  context?: FabricGlobalSearchContext;
  /** Input placeholder. @default 'Search' */
  placeholder?: string;
  /** Debounce in milliseconds. @default 300 */
  debounceMs?: number;
  /** Disable the input. */
  disabled?: boolean;
  /** Called when `onSearch` rejects (aborted requests are ignored). */
  onError?: (error: unknown) => void;
}

/** Tab configuration for one result type on the results page. */
export interface FabricViewAllSearchResultsConfigEntry<
  Row extends GridValidRowModel = FabricSearchResultRow,
> {
  /** Tab label. */
  tabLabel: string;
  /** Columns for this tab's data grid. */
  columns?: GridColDef<Row>[];
  /** Render something other than a grid for this tab. */
  component?: React.ComponentType<{ query: string; type: string }>;
}

/** Results-page configuration keyed by result type. Key order sets tab order. */
export type FabricViewAllSearchResultsConfig<
  Row extends GridValidRowModel = FabricSearchResultRow,
> = Record<string, FabricViewAllSearchResultsConfigEntry<Row>>;

/** The page of results the grid is asking for. */
export interface FabricSearchPageParams extends FabricSearchRequestOptions {
  query: string;
  /** Result type of the active tab. */
  type: string;
  /** Zero-based page index. */
  page: number;
  pageSize: number;
  sortModel?: GridSortModel;
  filterModel?: GridFilterModel;
}

/** What `onFetchPage` resolves with. */
export interface FabricSearchPage<Row = FabricSearchResultRow> {
  rows: Row[];
  /** Total matching rows for this type, used for pagination and the tab count. */
  totalCount: number;
}

/** Per-tab grid state kept by FabricViewAllSearchResults. */
export interface FabricSearchTabModel {
  filterModel?: GridFilterModel;
  sortModel?: GridSortModel;
  paginationModel: GridPaginationModel;
  totalRecords: number;
}

/** Props for the full results page. */
export interface FabricViewAllSearchResultsProps<
  Row extends GridValidRowModel = FabricSearchResultRow,
> {
  /** The query to show results for. */
  query: string;
  /** Tab configuration keyed by result type. */
  config: FabricViewAllSearchResultsConfig<Row>;
  /** Fetches one page of one type. Sorting, filtering and paging run on your server. */
  onFetchPage: (params: FabricSearchPageParams) => Promise<FabricSearchPage<Row>>;
  /** Known totals per type for the tab labels, e.g. from the last `onSearch` response. */
  counts?: Record<string, number>;
  /** Initial page size. @default 10 */
  pageSize?: number;
  /** Called when `onFetchPage` rejects (aborted requests are ignored). */
  onError?: (error: unknown) => void;
}
