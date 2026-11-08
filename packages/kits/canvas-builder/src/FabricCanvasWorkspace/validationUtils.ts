import type {
  CanvasValidationGroup,
  CanvasValidationSeverity,
  CanvasValidationSummary,
} from "../types";

export const EMPTY_VALIDATION_SUMMARY: CanvasValidationSummary = {
  errorCount: 0,
  warningCount: 0,
  infoCount: 0,
};

export const getValidationSummary = (groups: CanvasValidationGroup[]): CanvasValidationSummary => {
  return groups.reduce<CanvasValidationSummary>(
    (summary, group) => {
      group.items.forEach((item) => {
        if (item.severity === "error") {
          summary.errorCount += 1;
          return;
        }
        if (item.severity === "warning") {
          summary.warningCount += 1;
          return;
        }
        summary.infoCount = (summary.infoCount ?? 0) + 1;
      });
      return summary;
    },
    { ...EMPTY_VALIDATION_SUMMARY },
  );
};

export const getSeverityRank = (severity: CanvasValidationSeverity): number => {
  if (severity === "error") {
    return 3;
  }
  if (severity === "warning") {
    return 2;
  }
  return 1;
};

export const sortGroupsBySeverity = (groups: CanvasValidationGroup[]) => {
  return [...groups].sort((left, right) => {
    const leftSeverity = Math.max(...left.items.map((item) => getSeverityRank(item.severity)), 0);
    const rightSeverity = Math.max(...right.items.map((item) => getSeverityRank(item.severity)), 0);
    if (leftSeverity !== rightSeverity) {
      return rightSeverity - leftSeverity;
    }
    return (left.nodeLabel ?? left.id).localeCompare(right.nodeLabel ?? right.id);
  });
};
