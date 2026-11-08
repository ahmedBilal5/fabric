/** Semantic tone of an edge label pill. */
export type CanvasEdgeTone = "success" | "error" | "neutral";

const SUCCESS_LABELS = new Set(["success"]);
const ERROR_LABELS = new Set(["error", "failure", "failed"]);

/**
 * Resolves the pill tone for an edge. An explicit `tone` always wins; otherwise the
 * conventional "success" / "error" handle names pick the matching tone.
 */
export const resolveEdgeTone = (label?: string, tone?: CanvasEdgeTone): CanvasEdgeTone => {
  if (tone) {
    return tone;
  }

  const normalized = label?.trim().toLowerCase() ?? "";
  if (SUCCESS_LABELS.has(normalized)) {
    return "success";
  }
  if (ERROR_LABELS.has(normalized)) {
    return "error";
  }
  return "neutral";
};
