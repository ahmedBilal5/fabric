import type {
  FabricGlobalSearchConfig,
  FabricGlobalSearchContext,
  FabricSearchResponse,
  FabricSearchResultRow,
  FabricSearchTabModel,
  FabricViewAllSearchResultsConfig,
} from "./types";

const DEFAULT_CONTEXT: FabricGlobalSearchContext = { label: "", type: "" };

/** Escapes a string for use inside a `RegExp`. */
export function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** True for the error a fetch throws when its `AbortSignal` fires. */
export function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError";
}

/** Maps a raw row onto `name`, `description` and `image` using its type's config keys. */
export function normalizeSearchResultRow<Row extends FabricSearchResultRow>(
  record: Row,
  config: FabricGlobalSearchConfig<Row>,
): Row {
  const entryConfig = record.type ? config[record.type] : undefined;
  if (!entryConfig) return record;

  const image = entryConfig.imageKey ? record[entryConfig.imageKey] : record.image;
  return {
    ...record,
    name: String(record[entryConfig.labelKey] ?? ""),
    description: String(record[entryConfig.descriptionKey] ?? ""),
    image: image ? String(image) : undefined,
  };
}

/**
 * Turns a grouped response into the flat option list the autocomplete needs.
 *
 * Rows follow config key order, the `context` type moves to the top, and a
 * placeholder row is added for each configured type with no matches so its
 * group still renders a "No results" line.
 */
export function flattenSearchResults<Row extends FabricSearchResultRow>(
  data: FabricSearchResponse<Row> | undefined,
  config: FabricGlobalSearchConfig<Row>,
  context: FabricGlobalSearchContext = DEFAULT_CONTEXT,
) {
  const byType = new Map(data?.groups.map((group) => [group.type, group]) ?? []);
  const types = Object.keys(config).sort((a, b) =>
    a === context.type ? -1 : b === context.type ? 1 : 0,
  );

  return types.flatMap((type) => {
    const results = byType.get(type)?.results ?? [];
    if (!results.length) return [{ type, name: "", description: "" } as Row];
    return results.map((record) => normalizeSearchResultRow({ ...record, type }, config));
  });
}

/** Initial per-tab grid state for the results page. */
export function createInitialTabModels<Row extends FabricSearchResultRow>(
  config: FabricViewAllSearchResultsConfig<Row>,
  pageSize = 10,
  counts: Record<string, number> = {},
): Record<string, FabricSearchTabModel> {
  return Object.fromEntries(
    Object.keys(config).map((key) => [
      key,
      { paginationModel: { page: 0, pageSize }, totalRecords: counts[key] ?? 0 },
    ]),
  );
}
