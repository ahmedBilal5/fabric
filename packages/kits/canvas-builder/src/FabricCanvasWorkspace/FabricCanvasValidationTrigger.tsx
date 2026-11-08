import { FabricTooltip } from "@fabric-kit/components";
import Info from "@fabric-kit/icons/Info";
import ReportGmailerrorred from "@fabric-kit/icons/ReportGmailerrorred";
import Warning from "@fabric-kit/icons/Warning";
import { type MouseEvent, useEffect, useMemo, useRef } from "react";

import type { CanvasValidationSummary, FabricCanvasValidationTriggerProps } from "../types";

// Theme palette keys, so the icons follow light/dark mode.
const COLORS = {
  error: "var(--mui-palette-error-main)",
  warning: "var(--mui-palette-warning-main)",
  info: "var(--mui-palette-info-main)",
  nodeError: "var(--mui-palette-error-light)",
  nodeWarning: "var(--mui-palette-warning-light)",
} as const;

const getDefaultTooltip = (summary: CanvasValidationSummary) => {
  const parts = [
    summary.errorCount > 0 && `${summary.errorCount} Error${summary.errorCount > 1 ? "s" : ""}`,
    summary.warningCount > 0 &&
      `${summary.warningCount} Warning${summary.warningCount > 1 ? "s" : ""}`,
    (summary.infoCount ?? 0) > 0 && `${summary.infoCount} Info`,
  ].filter(Boolean);

  if (parts.length === 0) {
    return "No validation issues";
  }

  return `${parts.join(", ")} — click to view details`;
};

export const FabricCanvasValidationTrigger = ({
  summary,
  validationStatus,
  nodeScoped = false,
  popoverId,
  activePopoverId,
  onActivePopoverChange,
  iconSize,
  tooltipFormatter,
  onAnchorElementChange,
  testId,
}: FabricCanvasValidationTriggerProps) => {
  const anchorRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    onAnchorElementChange?.(anchorRef.current);
    return () => onAnchorElementChange?.(null);
  }, [onAnchorElementChange]);

  const hasIssues =
    summary.errorCount > 0 ||
    summary.warningCount > 0 ||
    (summary.infoCount ?? 0) > 0 ||
    Boolean(validationStatus?.hasErrors) ||
    Boolean(validationStatus?.hasWarnings) ||
    Boolean(validationStatus?.hasInfo);

  const status = useMemo(() => {
    if (validationStatus?.hasErrors || summary.errorCount > 0) {
      return "error" as const;
    }
    if (validationStatus?.hasWarnings || summary.warningCount > 0) {
      return "warning" as const;
    }
    return "info" as const;
  }, [
    summary.errorCount,
    summary.warningCount,
    validationStatus?.hasErrors,
    validationStatus?.hasWarnings,
  ]);

  if (!hasIssues) {
    return null;
  }

  const color =
    status === "error"
      ? nodeScoped
        ? COLORS.nodeError
        : COLORS.error
      : status === "warning"
        ? nodeScoped
          ? COLORS.nodeWarning
          : COLORS.warning
        : COLORS.info;

  const tooltip = tooltipFormatter?.(summary) ?? getDefaultTooltip(summary);
  const isOpen = activePopoverId === popoverId;
  const handleClick = (event: MouseEvent<SVGSVGElement>) => {
    event.stopPropagation();
    event.preventDefault();
    onAnchorElementChange?.(event.currentTarget);
    onActivePopoverChange(isOpen ? null : popoverId);
  };

  return (
    <FabricTooltip title={tooltip}>
      {status === "error" ? (
        <ReportGmailerrorred
          ref={anchorRef}
          data-testid={testId}
          sx={{
            color,
            cursor: "pointer",
            ...(iconSize ? { fontSize: iconSize } : {}),
          }}
          onClick={handleClick}
        />
      ) : status === "warning" ? (
        <Warning
          ref={anchorRef}
          data-testid={testId}
          sx={{
            color,
            cursor: "pointer",
            ...(iconSize ? { fontSize: iconSize } : {}),
          }}
          onClick={handleClick}
        />
      ) : (
        <Info
          ref={anchorRef}
          data-testid={testId}
          sx={{
            color,
            cursor: "pointer",
            ...(iconSize ? { fontSize: iconSize } : {}),
          }}
          onClick={handleClick}
        />
      )}
    </FabricTooltip>
  );
};
