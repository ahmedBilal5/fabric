/** Find the first message for a composite value, including nested range/array errors. */
export function getErrorMessage(
  error: unknown,
  visited = new WeakSet<object>(),
): string | undefined {
  if (typeof error !== "object" || error === null || visited.has(error)) return undefined;
  visited.add(error);
  if ("message" in error && typeof error.message === "string") return error.message;
  for (const [key, value] of Object.entries(error)) {
    // Native input refs can contain cycles and are not validation errors.
    if (key === "ref") continue;
    const message = getErrorMessage(value, visited);
    if (message !== undefined) return message;
  }
  return undefined;
}
