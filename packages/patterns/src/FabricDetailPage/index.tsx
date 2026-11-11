/**
 * FabricDetailPage — a whole page for one record: a header with status and actions,
 * a summary of key facts, tabbed sections, and a side panel (usually activity).
 *
 * Two columns from the `md` breakpoint up; on smaller screens the side panel moves
 * below the main content. Tabs are optional: pass `sections` for tabbed content or
 * `children` for a single body.
 *
 * @example
 * ```tsx
 * <FabricDetailPage
 *   title="INV-2041"
 *   status={<FabricTag label="Paid" variant="indicator" color="success" />}
 *   breadcrumbs={[{ label: "Invoices", href: "/invoices" }, { label: "INV-2041" }]}
 *   actions={<FabricButton variant="contained">Send reminder</FabricButton>}
 *   summary={[{ label: "Customer", value: "Northwind Traders" }, { label: "Amount", value: "$12,480.00" }]}
 *   sections={[
 *     { value: "items", label: "Line items", content: <LineItems /> },
 *     { value: "payments", label: "Payments", content: <Payments /> },
 *   ]}
 *   aside={<FabricActivityFeed items={events} dense />}
 * />
 * ```
 */

import {
  type FabricKeyValueItem,
  FabricKeyValueList,
  type FabricKeyValueListProps,
} from "@fabric-kit/components";
import { fontWeight, radii, spacing } from "@fabric-kit/design-tokens";
import { FabricPageHeader, type FabricPageHeaderProps } from "@fabric-kit/layout";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import type { SxProps, Theme } from "@mui/material/styles";
import { type ReactNode, type SyntheticEvent, useId, useState } from "react";

/** One tab of the detail page. */
export interface FabricDetailSection {
  /** Stable id, also the tab's value. */
  value: string;
  /** Tab label. */
  label: ReactNode;
  /** The tab's content. Only the selected tab is rendered. */
  content: ReactNode;
  /** Disable the tab. */
  disabled?: boolean;
}

export interface FabricDetailPageProps
  extends Omit<FabricPageHeaderProps, "tabs" | "sx" | "divider"> {
  /** Key facts shown in a card above the sections. */
  summary?: FabricKeyValueItem[];
  /** Props for the summary list, e.g. `{ layout: "stacked" }`. Defaults to two columns. */
  summaryProps?: Omit<FabricKeyValueListProps, "items">;
  /** Tabbed sections. The tabs sit in the header. */
  sections?: FabricDetailSection[];
  /** The selected section, to control it (e.g. from the URL). */
  section?: string;
  /** Called when the user picks a section. */
  onSectionChange?: (value: string) => void;
  /** Main content when there are no `sections`, or under them. */
  children?: ReactNode;
  /** Side panel content, usually a `FabricActivityFeed`. */
  aside?: ReactNode;
  /** Heading above the side panel. @default "Activity" */
  asideTitle?: ReactNode;
  /** Side panel width from `md` up. Any CSS width. @default 360 */
  asideWidth?: number | string;
  /** Show placeholders while the record loads. The header keeps its title and breadcrumbs. */
  loading?: boolean;
  /** System styles on the root. */
  sx?: SxProps<Theme>;
}

const panelSx = {
  borderRadius: `${radii.lg}px`,
  border: "1px solid var(--mui-palette-divider)",
  backgroundColor: "var(--mui-palette-background-paper)",
  p: `${spacing.lg}px`,
  minWidth: 0,
} as const;

/** A whole page for one record: header, summary, tabbed sections and a side panel. */
export function FabricDetailPage({
  summary,
  summaryProps,
  sections,
  section,
  onSectionChange,
  children,
  aside,
  asideTitle = "Activity",
  asideWidth = 360,
  loading = false,
  sx,
  ...header
}: Readonly<FabricDetailPageProps>) {
  const baseId = useId();
  const [ownSection, setOwnSection] = useState(sections?.[0]?.value ?? "");
  const current = section ?? ownSection;
  const active = sections?.find((s) => s.value === current) ?? sections?.[0];

  const onTab = (_: SyntheticEvent, value: string) => {
    setOwnSection(value);
    onSectionChange?.(value);
  };

  const tabs =
    sections && sections.length > 0
      ? {
          items: sections.map((s) => ({
            value: s.value,
            label: s.label,
            disabled: s.disabled,
            id: `${baseId}-tab-${s.value}`,
            "aria-controls": `${baseId}-panel-${s.value}`,
          })),
          value: active?.value ?? "",
          onChange: onTab,
        }
      : undefined;

  const asideWidthCss = typeof asideWidth === "number" ? `${asideWidth}px` : asideWidth;

  return (
    <Box
      sx={[
        { display: "flex", flexDirection: "column", gap: `${spacing.lg}px`, minWidth: 0 },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <FabricPageHeader
        {...header}
        status={loading ? undefined : header.status}
        meta={loading ? <Skeleton width={220} /> : header.meta}
        actions={loading ? undefined : header.actions}
        moreActions={loading ? undefined : header.moreActions}
        tabs={tabs}
        divider={!tabs}
      />
      <Box
        sx={{
          display: "grid",
          gap: `${spacing.lg}px`,
          alignItems: "start",
          gridTemplateColumns: {
            xs: "minmax(0, 1fr)",
            md: aside ? `minmax(0, 1fr) ${asideWidthCss}` : "minmax(0, 1fr)",
          },
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: `${spacing.lg}px`, minWidth: 0 }}>
          {(summary || loading) && (
            <Box component="section" aria-label="Summary" sx={panelSx}>
              {loading ? (
                <Box sx={{ display: "grid", gap: `${spacing.sm}px` }}>
                  {[70, 55, 62, 48].map((w) => (
                    <Skeleton key={w} width={`${w}%`} />
                  ))}
                </Box>
              ) : (
                summary && <FabricKeyValueList columns={2} {...summaryProps} items={summary} />
              )}
            </Box>
          )}
          {active && !loading && (
            <Box
              role="tabpanel"
              id={`${baseId}-panel-${active.value}`}
              aria-labelledby={`${baseId}-tab-${active.value}`}
              sx={{ minWidth: 0 }}
            >
              {active.content}
            </Box>
          )}
          {!loading && children}
        </Box>
        {aside && (
          <Box component="aside" aria-labelledby={`${baseId}-aside`} sx={panelSx}>
            <Box
              component="h2"
              id={`${baseId}-aside`}
              sx={{
                m: 0,
                mb: `${spacing.md}px`,
                fontSize: "0.875rem",
                fontWeight: fontWeight.semiBold,
                color: "var(--mui-palette-text-primary)",
              }}
            >
              {asideTitle}
            </Box>
            {aside}
          </Box>
        )}
      </Box>
    </Box>
  );
}
