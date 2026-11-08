import type { FabricVersion, FabricVersionGroup } from "./types";

/**
 * Groups versions for the timeline: consecutive drafts collapse into one group,
 * and each published version stands alone. Order is preserved.
 */
export function groupVersions(versions: readonly FabricVersion[]): FabricVersionGroup[] {
  const groups: FabricVersionGroup[] = [];
  for (const version of versions) {
    const last = groups[groups.length - 1];
    if (version.status === "draft" && last?.status === "draft") {
      last.versions.push(version);
    } else {
      groups.push({ status: version.status, versions: [version] });
    }
  }
  return groups;
}

/** Short, locale-aware timestamp, e.g. "Mar 12, 2026, 4:05 PM". */
export function formatVersionTimestamp(value: Date | string | undefined): string {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
