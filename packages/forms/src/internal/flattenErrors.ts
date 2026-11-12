/** One validation message and the field it belongs to. */
export interface FabricFormErrorItem {
  /** Field path, e.g. "billing.email" or "members.1.name". "root" for form-wide errors. */
  name: string;
  /** The message to show. */
  message: string;
}

/**
 * Turns React Hook Form's nested `formState.errors` into a flat list, in the
 * order fields were registered. Form-wide errors (`root`, `root.*`) come first.
 * Composite fields (a date range, a field array row) report their first message
 * under the field's own path, so focusing it works.
 */
export function flattenErrors(errors: unknown): FabricFormErrorItem[] {
  const items: FabricFormErrorItem[] = [];
  const roots: FabricFormErrorItem[] = [];
  const seen = new WeakSet<object>();

  const visit = (node: unknown, path: string[]) => {
    if (typeof node !== "object" || node === null || seen.has(node)) return;
    seen.add(node);
    const record = node as Record<string, unknown>;
    if (typeof record.message === "string" && record.message !== "") {
      const name = path.join(".");
      const item = { name: path[0] === "root" ? "root" : name, message: record.message };
      (path[0] === "root" ? roots : items).push(item);
      return;
    }
    for (const [key, value] of Object.entries(record)) {
      // Native refs and the error's own fields aren't nested errors.
      if (key === "ref" || key === "type" || key === "types") continue;
      visit(value, [...path, key]);
    }
  };

  visit(errors, []);
  return [...roots, ...items];
}
