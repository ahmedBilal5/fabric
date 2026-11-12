/** Limits for the files someone can add. */
export interface FabricFileRules {
  /** File types allowed, as in `<input accept>`: ".pdf", "image/*", "application/pdf". */
  accept?: string;
  /** Largest file size in bytes. */
  maxSize?: number;
  /** Most files in total, counting ones already added. */
  maxFiles?: number;
}

/** A file that was refused, and why. */
export interface FabricRejectedFile {
  file: File;
  reason: "type" | "size" | "count";
}

/** True when a file matches an `accept` string (extensions, exact types or `type/*`). */
export function matchesAccept(file: { name: string; type: string }, accept?: string): boolean {
  if (!accept?.trim()) return true;
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return accept
    .split(",")
    .map((a) => a.trim().toLowerCase())
    .filter(Boolean)
    .some((rule) => {
      if (rule.startsWith(".")) return name.endsWith(rule);
      if (rule.endsWith("/*")) return type.startsWith(rule.slice(0, -1));
      return type === rule;
    });
}

/** Splits incoming files into accepted and rejected ones, in order. */
export function validateFiles(
  files: File[],
  rules: FabricFileRules,
  existingCount = 0,
): { accepted: File[]; rejected: FabricRejectedFile[] } {
  const accepted: File[] = [];
  const rejected: FabricRejectedFile[] = [];
  for (const file of files) {
    if (!matchesAccept(file, rules.accept)) rejected.push({ file, reason: "type" });
    else if (rules.maxSize !== undefined && file.size > rules.maxSize)
      rejected.push({ file, reason: "size" });
    else if (rules.maxFiles !== undefined && existingCount + accepted.length >= rules.maxFiles)
      rejected.push({ file, reason: "count" });
    else accepted.push(file);
  }
  return { accepted, rejected };
}

/** Readable list of allowed types: ".pdf,image/*" → "PDF or images". */
export function describeAccept(accept?: string): string | null {
  if (!accept?.trim()) return null;
  const parts = accept
    .split(",")
    .map((a) => a.trim())
    .filter(Boolean)
    .map((rule) => {
      if (rule.startsWith(".")) return rule.slice(1).toUpperCase();
      if (rule.endsWith("/*")) return `${rule.slice(0, -2)}s`;
      const sub = rule.split("/")[1] ?? rule;
      return sub.toUpperCase();
    });
  const unique = [...new Set(parts)];
  if (unique.length === 1) return unique[0];
  return `${unique.slice(0, -1).join(", ")} or ${unique[unique.length - 1]}`;
}
