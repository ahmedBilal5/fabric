import type {
  FabricSearchPage,
  FabricSearchPageParams,
  FabricSearchRequestOptions,
  FabricSearchResponse,
  FabricSearchResultRow,
} from "../src";

/**
 * A tiny in-memory "backend" for the global-search stories. Real apps call
 * their own API inside `onSearch` / `onFetchPage`.
 */

export interface SampleRow extends FabricSearchResultRow {
  id: string;
  type: "customer" | "order" | "product";
  title: string;
  subtitle: string;
  owner: string;
  avatar?: string;
}

const customers: SampleRow[] = [
  ["Northwind Traders", "Seattle, WA", "Ada Lovelace"],
  ["Blue Harbor Coffee", "Portland, OR", "Grace Hopper"],
  ["Harborview Clinic", "Boston, MA", "Alan Turing"],
  ["Northstar Outfitters", "Denver, CO", "Katherine Johnson"],
  ["Riverbend Books", "Austin, TX", "Ada Lovelace"],
  ["North Coast Surf", "San Diego, CA", "Grace Hopper"],
].map(([title, subtitle, owner], i) => ({
  id: `cus-${i + 1}`,
  type: "customer",
  title,
  subtitle,
  owner,
}));

const orders: SampleRow[] = Array.from({ length: 24 }, (_, i) => {
  const customer = customers[i % customers.length];
  return {
    id: `ord-${1040 + i}`,
    type: "order",
    title: `Order #${1040 + i} · ${customer.title}`,
    subtitle: `$${(120 + i * 37.5).toFixed(2)}`,
    owner: customer.owner,
  };
});

const products: SampleRow[] = [
  ["North Ridge Backpack", "SKU NR-200"],
  ["Harbor Ceramic Mug", "SKU HC-014"],
  ["Trailhead Water Bottle", "SKU TW-330"],
  ["Northern Lights Poster", "SKU NL-050"],
].map(([title, subtitle], i) => ({
  id: `prd-${i + 1}`,
  type: "product",
  title,
  subtitle,
  owner: "Catalog team",
}));

const all = [...customers, ...orders, ...products];

function wait(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });
}

function matches(row: SampleRow, query: string) {
  const q = query.toLowerCase();
  return row.title.toLowerCase().includes(q) || row.subtitle.toLowerCase().includes(q);
}

/** Fake `onSearch`: top 3 matches per type plus totals, after a short delay. */
export async function sampleSearch(
  query: string,
  { signal }: FabricSearchRequestOptions,
): Promise<FabricSearchResponse<SampleRow>> {
  await wait(400, signal);
  const hits = all.filter((row) => matches(row, query));
  const types = ["customer", "order", "product"] as const;
  const groups = types.map((type) => {
    const ofType = hits.filter((row) => row.type === type);
    return { type, results: ofType.slice(0, 3), totalCount: ofType.length };
  });
  return { groups, totalCount: hits.length };
}

/** Fake `onFetchPage`: filters, sorts and pages one type on the "server". */
export async function sampleFetchPage({
  query,
  type,
  page,
  pageSize,
  sortModel,
  signal,
}: FabricSearchPageParams): Promise<FabricSearchPage<SampleRow>> {
  await wait(300, signal);
  let rows = all.filter((row) => row.type === type && matches(row, query));
  const [sort] = sortModel ?? [];
  if (sort?.sort) {
    const field = sort.field as keyof SampleRow;
    const dir = sort.sort === "asc" ? 1 : -1;
    rows = [...rows].sort((a, b) => String(a[field]).localeCompare(String(b[field])) * dir);
  }
  return { rows: rows.slice(page * pageSize, (page + 1) * pageSize), totalCount: rows.length };
}
