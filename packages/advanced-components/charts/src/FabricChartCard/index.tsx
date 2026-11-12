/**
 * FabricChartCard — a card that frames one chart: a title, an optional description and
 * action, and a Chart/Table switch so anyone can read the exact values.
 *
 * Any Fabric chart inside follows the switch and takes the card's title as its name, so
 * you don't repeat it. Use it as a dashboard widget.
 *
 * @example
 * ```tsx
 * <FabricChartCard title="Revenue by month" description="Last 12 months, USD">
 *   <FabricBarChart xAxis={[{ data: months }]} series={[{ label: "Revenue", data: revenue }]} />
 * </FabricChartCard>
 * ```
 */

import { FabricToggleButtonGroup } from "@fabric-kit/components";
import { fontSize, fontWeight, radii, spacing } from "@fabric-kit/design-tokens";
import ShowChartIcon from "@fabric-kit/icons/ShowChart";
import TableRowsIcon from "@fabric-kit/icons/TableRows";
import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";
import { forwardRef, type ReactNode, useId, useMemo, useState } from "react";
import { ChartCardContext, type FabricChartView } from "../internal/shared";

export interface FabricChartCardProps {
  /** What the chart shows, e.g. "Revenue by month". Also names the chart for screen readers. */
  title: string;
  /** A line under the title: the unit, period or source. */
  description?: ReactNode;
  /** Content at the top right, e.g. a menu button or a "View report" link. */
  action?: ReactNode;
  /** Show the Chart/Table switch. @default true */
  tableToggle?: boolean;
  /** The view, to control it. */
  view?: FabricChartView;
  /** The starting view when uncontrolled. @default "chart" */
  defaultView?: FabricChartView;
  /** Called when the user switches between chart and table. */
  onViewChange?: (view: FabricChartView) => void;
  /** Content under the chart, e.g. a note or a link. */
  footer?: ReactNode;
  /** Heading level of the title. @default "h3" */
  headingLevel?: "h2" | "h3" | "h4";
  /** The chart. */
  children: ReactNode;
  /** System styles on the root. */
  sx?: SxProps<Theme>;
}

/** A card that frames a chart, with a title and a Chart/Table switch. */
export const FabricChartCard = forwardRef<HTMLElement, FabricChartCardProps>(
  function FabricChartCard(
    {
      title,
      description,
      action,
      tableToggle = true,
      view,
      defaultView = "chart",
      onViewChange,
      footer,
      headingLevel = "h3",
      children,
      sx,
    },
    ref,
  ) {
    const headingId = useId();
    const [ownView, setOwnView] = useState<FabricChartView>(defaultView);
    const current = view ?? ownView;
    const context = useMemo(() => ({ view: current, title }), [current, title]);

    return (
      <Box
        ref={ref}
        component="section"
        aria-labelledby={headingId}
        sx={[
          {
            display: "flex",
            flexDirection: "column",
            gap: `${spacing.md}px`,
            minWidth: 0,
            p: `${spacing.lg}px`,
            borderRadius: `${radii.lg}px`,
            border: "1px solid var(--mui-palette-divider)",
            backgroundColor: "var(--mui-palette-background-paper)",
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: `${spacing.sm}px` }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box
              component={headingLevel}
              id={headingId}
              sx={{
                m: 0,
                fontSize: fontSize.lg,
                lineHeight: 1.4,
                fontWeight: fontWeight.semiBold,
                color: "var(--mui-palette-text-primary)",
              }}
            >
              {title}
            </Box>
            {description && (
              <Box
                sx={{
                  mt: "2px",
                  fontSize: fontSize.md,
                  color: "var(--mui-palette-text-secondary)",
                }}
              >
                {description}
              </Box>
            )}
          </Box>
          {tableToggle && (
            <FabricToggleButtonGroup
              size="small"
              aria-label={`${title}: view as`}
              value={current}
              onChange={(_, next: FabricChartView | null) => {
                if (!next) return;
                setOwnView(next);
                onViewChange?.(next);
              }}
              items={[
                { value: "chart", icon: <ShowChartIcon />, "aria-label": "Chart" },
                { value: "table", icon: <TableRowsIcon />, "aria-label": "Table" },
              ]}
              sx={{ flexShrink: 0 }}
            />
          )}
          {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
        </Box>
        <ChartCardContext.Provider value={context}>
          <Box sx={{ minWidth: 0 }}>{children}</Box>
        </ChartCardContext.Provider>
        {footer && (
          <Box sx={{ fontSize: fontSize.md, color: "var(--mui-palette-text-secondary)" }}>
            {footer}
          </Box>
        )}
      </Box>
    );
  },
);
