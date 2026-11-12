import { fontWeight, radii, spacing } from "@fabric-kit/design-tokens";
import { Box } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import { type ReactNode, useId } from "react";
import { fillFieldsSx } from "../internal/fill";

export interface FabricFormSectionProps {
  /** Section heading, e.g. "Billing address". */
  title?: ReactNode;
  /** One or two lines under the heading: what this section is for. */
  description?: ReactNode;
  /** The fields. They stack with even spacing; group side-by-side fields in `FabricFormRow`. */
  children: ReactNode;
  /**
   * `"stacked"`: heading above the fields. `"split"`: heading and description in a
   * left column, fields on the right, from the `md` breakpoint (settings-style forms).
   * @default "stacked"
   */
  layout?: "stacked" | "split";
  /** `"card"` puts the section on a bordered surface. `"plain"` has no box. @default "card" */
  variant?: "card" | "plain";
  /** Content at the end of the heading row, such as a "Reset" link. */
  action?: ReactNode;
  /** Heading level, so the page outline stays correct. @default 2 */
  headingLevel?: 2 | 3 | 4;
  /** Space between fields. @default "xlsm" (20px) */
  gap?: keyof typeof spacing;
  /** Class on the root. */
  className?: string;
  /** System styles on the root. */
  sx?: SxProps<Theme>;
}

/**
 * FabricFormSection — a titled group of related fields.
 *
 * Split long forms into sections of three to six fields with a clear heading:
 * "Contact", "Billing address", "Notifications". The section is a `<section>`
 * named by its heading, so screen-reader users can jump between them.
 */
export function FabricFormSection({
  title,
  description,
  children,
  layout = "stacked",
  variant = "card",
  action,
  headingLevel = 2,
  gap = "xlsm",
  className,
  sx,
}: Readonly<FabricFormSectionProps>) {
  const headingId = useId();
  const hasHeader = title != null || description != null || action != null;
  const split = layout === "split";

  const header = hasHeader && (
    <Box sx={{ display: "flex", alignItems: "flex-start", gap: `${spacing.md}px`, minWidth: 0 }}>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {title != null && (
          <Box
            component={`h${headingLevel}`}
            id={headingId}
            sx={{
              m: 0,
              fontSize: "1rem",
              lineHeight: 1.4,
              fontWeight: fontWeight.semiBold,
              color: "var(--mui-palette-text-primary)",
            }}
          >
            {title}
          </Box>
        )}
        {description != null && (
          <Box
            sx={{
              mt: title != null ? `${spacing.xs}px` : 0,
              fontSize: "0.875rem",
              lineHeight: 1.5,
              color: "var(--mui-palette-text-secondary)",
              maxWidth: "60ch",
            }}
          >
            {description}
          </Box>
        )}
      </Box>
      {action}
    </Box>
  );

  return (
    <Box
      component="section"
      aria-labelledby={title != null ? headingId : undefined}
      className={className}
      sx={[
        {
          display: "grid",
          gap: split ? { xs: `${spacing.lg}px`, md: `${spacing["2xl"]}px` } : `${spacing.xl}px`,
          gridTemplateColumns: split
            ? { xs: "minmax(0, 1fr)", md: "minmax(0, 1fr) minmax(0, 2fr)" }
            : "minmax(0, 1fr)",
          minWidth: 0,
        },
        variant === "card" && {
          p: { xs: `${spacing.lg}px`, sm: `${spacing.xl}px` },
          borderRadius: `${radii.xl}px`,
          border: "1px solid var(--mui-palette-divider)",
          backgroundColor: "var(--mui-palette-background-paper)",
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {header}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: `${spacing[gap]}px`,
          minWidth: 0,
          ...fillFieldsSx,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
