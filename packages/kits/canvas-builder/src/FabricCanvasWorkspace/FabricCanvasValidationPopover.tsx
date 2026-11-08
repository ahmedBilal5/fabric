import { FabricAccordion, FabricBox, FabricChip } from "@fabric-kit/components";
import ChevronRight from "@fabric-kit/icons/ChevronRight";
import Close from "@fabric-kit/icons/Close";
import DragIndicator from "@fabric-kit/icons/DragIndicator";
import ErrorIcon from "@fabric-kit/icons/Error";
import Info from "@fabric-kit/icons/Info";
import ReportGmailerrorred from "@fabric-kit/icons/ReportGmailerrorred";
import Warning from "@fabric-kit/icons/Warning";
import { FabricSurface, FabricText } from "@fabric-kit/primitives";
import { useTheme } from "@mui/material/styles";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import type {
  CanvasValidationItem,
  CanvasValidationSeverity,
  FabricCanvasValidationPopoverProps,
} from "../types";
import { type CanvasThemeColors, getCanvasThemeColors, withAlpha } from "../utils/themeColors";
import { getValidationSummary } from "./validationUtils";

const ANCHOR_OFFSET = 8;
const VIEWPORT_PADDING = 16;
const DEFAULT_WIDTH_PX = 400;
const DEFAULT_MAX_HEIGHT_PX = 500;

const getSeverityColors = (colors: CanvasThemeColors) => ({
  error: colors.error,
  warning: colors.warning,
  info: colors.info,
  errorBg: withAlpha(colors.error, 8),
  warningBg: withAlpha(colors.warning, 10),
  infoBg: withAlpha(colors.info, 8),
});

type DragPosition = {
  x: number;
  y: number;
};

export const FabricCanvasValidationPopover = ({
  open,
  onClose,
  anchorElement,
  groups,
  validationStatus,
  disableAccordion = false,
  draggable = true,
  readOnly = false,
  widthPx = DEFAULT_WIDTH_PX,
  maxHeightPx = DEFAULT_MAX_HEIGHT_PX,
  renderNodeIcon,
  renderValidationItem,
  ...boxProps
}: FabricCanvasValidationPopoverProps) => {
  const theme = useTheme();
  const severityColors = getSeverityColors(getCanvasThemeColors(theme));
  const popoverRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<DragPosition>({ x: 0, y: 0 });
  const [position, setPosition] = useState<DragPosition>({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [ready, setReady] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const summary = useMemo(() => getValidationSummary(groups), [groups]);
  const resolvedValidationStatus = validationStatus ?? {
    hasErrors: summary.errorCount > 0,
    hasWarnings: summary.errorCount === 0 && summary.warningCount > 0,
    hasInfo: summary.errorCount === 0 && summary.warningCount === 0 && (summary.infoCount ?? 0) > 0,
  };

  useLayoutEffect(() => {
    if (!open) {
      setReady(false);
      return;
    }

    if (!anchorElement || !popoverRef.current) {
      setReady(false);
      return;
    }

    const anchorRect = anchorElement.getBoundingClientRect();
    const popoverRect = popoverRef.current.getBoundingClientRect();

    let x = anchorRect.left + anchorRect.width / 2 - popoverRect.width / 2;
    const y = anchorRect.bottom + ANCHOR_OFFSET;

    if (x + popoverRect.width > window.innerWidth - VIEWPORT_PADDING) {
      x = window.innerWidth - popoverRect.width - VIEWPORT_PADDING;
    }
    if (x < VIEWPORT_PADDING) {
      x = VIEWPORT_PADDING;
    }

    setPosition({ x, y });
    setReady(true);
  }, [anchorElement, open]);

  useEffect(() => {
    if (!open) {
      setReady(false);
      setExpandedIndex(null);
      return;
    }

    if (!disableAccordion) {
      const firstNodeGroupIndex = groups.findIndex((group) => Boolean(group.nodeId));
      setExpandedIndex(firstNodeGroupIndex >= 0 ? firstNodeGroupIndex : null);
    }
  }, [disableAccordion, groups, open]);

  useEffect(() => {
    if (!dragging) {
      return;
    }

    const handleMouseMove = (event: MouseEvent) => {
      setPosition({
        x: event.clientX - dragStartRef.current.x,
        y: event.clientY - dragStartRef.current.y,
      });
    };

    const handleMouseUp = () => {
      setDragging(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging]);

  if (!open || !anchorElement) {
    return null;
  }

  const resolvedWidthPx = readOnly ? Math.min(widthPx, 300) : widthPx;

  return createPortal(
    <div
      ref={popoverRef}
      style={{
        position: "fixed",
        left: position.x,
        top: position.y,
        zIndex: 999999,
        width: `${resolvedWidthPx}px`,
        visibility: ready ? "visible" : "hidden",
      }}
    >
      <FabricSurface
        elevation={3}
        sx={{
          p: 1,
          borderRadius: 2,
          backgroundColor: "var(--mui-palette-background-paper)",
          color: "var(--mui-palette-text-primary)",
        }}
      >
        <FabricBox
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            marginBottom: disableAccordion ? 0 : "7px",
          }}
          onMouseDown={(event) => {
            if (!draggable) {
              return;
            }
            setDragging(true);
            dragStartRef.current = {
              x: event.clientX - position.x,
              y: event.clientY - position.y,
            };
          }}
        >
          <FabricBox sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <DragIndicator
              sx={{
                fontSize: "18px",
                color: "var(--mui-palette-text-secondary)",
                cursor: dragging ? "grabbing" : "move",
              }}
            />
            {resolvedValidationStatus.hasErrors ? (
              <>
                <ReportGmailerrorred sx={{ color: severityColors.error }} />
                <FabricText
                  sx={{
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "var(--mui-palette-text-primary)",
                  }}
                >
                  Errors
                </FabricText>
              </>
            ) : resolvedValidationStatus.hasWarnings ? (
              <>
                <Warning sx={{ color: severityColors.warning }} />
                <FabricText
                  sx={{
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "var(--mui-palette-text-primary)",
                  }}
                >
                  Warnings
                </FabricText>
              </>
            ) : resolvedValidationStatus.hasInfo ? (
              <>
                <Info sx={{ color: severityColors.info }} />
                <FabricText
                  sx={{
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "var(--mui-palette-text-primary)",
                  }}
                >
                  Info
                </FabricText>
              </>
            ) : null}
          </FabricBox>
          <Close
            sx={{ fontSize: "16px", color: "var(--mui-palette-text-primary)", cursor: "pointer" }}
            onMouseDown={(event) => event.stopPropagation()}
            onClick={onClose}
          />
        </FabricBox>

        <FabricBox
          {...boxProps}
          sx={{
            maxHeight: `${maxHeightPx}px`,
            overflow: "auto",
            ...boxProps.sx,
          }}
        >
          {groups.map((group, index) => {
            const nodeSummary = getValidationSummary([{ ...group }]);
            const isNodeLevel = Boolean(group.nodeId);
            const nodeIcon = renderNodeIcon?.(group.nodeType);

            if (!isNodeLevel || disableAccordion) {
              return (
                <FabricBox key={group.id} sx={{ px: 3, py: 2 }}>
                  {group.items.map((item) => (
                    <FabricBox key={item.id} sx={{ py: 0.5 }}>
                      {renderValidationItem ? (
                        renderValidationItem(item)
                      ) : (
                        <DefaultValidationItem item={item} />
                      )}
                    </FabricBox>
                  ))}
                </FabricBox>
              );
            }

            return (
              <FabricAccordion
                key={group.id}
                expanded={expandedIndex === index}
                onChange={() => setExpandedIndex((previous) => (previous === index ? null : index))}
                expandIcon={<ChevronRight />}
                expandIconRotationDegrees={90}
                summaryContent={
                  <FabricBox sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {nodeIcon && (
                      <FabricBox
                        sx={{ color: "var(--mui-palette-text-secondary)", display: "flex" }}
                      >
                        {nodeIcon}
                      </FabricBox>
                    )}

                    <FabricText
                      sx={{
                        fontSize: "13px",
                        fontWeight: 500,
                        color: "var(--mui-palette-text-primary)",
                      }}
                    >
                      {group.nodeLabel}
                    </FabricText>

                    {nodeSummary.errorCount > 0 && (
                      <FabricChip
                        label={`${nodeSummary.errorCount} Error${nodeSummary.errorCount > 1 ? "s" : ""}`}
                        sx={{
                          backgroundColor: withAlpha(severityColors.error, 14),
                          color: "var(--mui-palette-text-primary)",
                          fontSize: "11px",
                          height: "20px",
                        }}
                      />
                    )}

                    {nodeSummary.warningCount > 0 && (
                      <FabricChip
                        label={`${nodeSummary.warningCount} Warning${nodeSummary.warningCount > 1 ? "s" : ""}`}
                        sx={{
                          backgroundColor: withAlpha(severityColors.warning, 14),
                          color: "var(--mui-palette-text-primary)",
                          fontSize: "11px",
                          height: "20px",
                        }}
                      />
                    )}
                  </FabricBox>
                }
                summarySx={{
                  minHeight: "48px !important",
                  paddingRight: "16px",
                  "& .MuiAccordionSummary-content": {
                    margin: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  },
                }}
                detailsSx={{
                  padding: "8px 16px 16px",
                }}
              >
                {group.items.map((item) => (
                  <FabricBox key={item.id} sx={{ py: 0.5 }}>
                    {renderValidationItem ? (
                      renderValidationItem(item)
                    ) : (
                      <DefaultValidationItem item={item} />
                    )}
                  </FabricBox>
                ))}
              </FabricAccordion>
            );
          })}
        </FabricBox>
      </FabricSurface>
    </div>,
    document.body,
  );
};

const DefaultValidationItem = ({ item }: { item: CanvasValidationItem }) => {
  const severityColors = getSeverityColors(getCanvasThemeColors(useTheme()));
  const severityColor = getSeverityColor(item.severity, severityColors);
  const backgroundColor = getBackgroundColor(item.severity, severityColors);

  return (
    <FabricBox
      sx={{
        borderBottom: "1px solid",
        borderColor: "var(--mui-palette-divider)",
        p: "10px",
        backgroundColor,
      }}
    >
      <FabricBox sx={{ display: "flex", alignItems: "center", gap: "8px", mb: "8px" }}>
        {item.severity === "error" ? (
          <ErrorIcon sx={{ fontSize: "18px", color: severityColor }} />
        ) : item.severity === "warning" ? (
          <Warning sx={{ fontSize: "18px", color: severityColor }} />
        ) : (
          <Info sx={{ fontSize: "18px", color: severityColor }} />
        )}
        <FabricText sx={{ fontSize: "14px", fontWeight: 600, color: severityColor }}>
          {item.title ?? formatTitleFromCode(item.code, item.severity)}
        </FabricText>
      </FabricBox>

      <FabricBox sx={{ mb: "8px" }}>
        <FabricText sx={{ fontSize: "13px", color: "var(--mui-palette-text-primary)" }}>
          {item.message}
        </FabricText>
      </FabricBox>

      {item.context && (
        <FabricBox sx={{ mb: "8px" }}>
          <FabricText sx={{ fontSize: "11px", color: "var(--mui-palette-text-secondary)" }}>
            {item.context}
          </FabricText>
        </FabricBox>
      )}
    </FabricBox>
  );
};

const getSeverityColor = (
  severity: CanvasValidationSeverity,
  colors: ReturnType<typeof getSeverityColors>,
) => {
  if (severity === "error") {
    return colors.error;
  }
  if (severity === "warning") {
    return colors.warning;
  }
  return colors.info;
};

const getBackgroundColor = (
  severity: CanvasValidationSeverity,
  colors: ReturnType<typeof getSeverityColors>,
) => {
  if (severity === "error") {
    return colors.errorBg;
  }
  if (severity === "warning") {
    return colors.warningBg;
  }
  return colors.infoBg;
};

const formatTitleFromCode = (code: string | undefined, severity: CanvasValidationSeverity) => {
  if (!code) {
    if (severity === "warning") {
      return "Warning";
    }
    if (severity === "info") {
      return "Info";
    }
    return "Error";
  }

  return code
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};
