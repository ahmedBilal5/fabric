import { spacing } from "@fabric-kit/design-tokens";
import { Box } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import type { ReactNode } from "react";
import { fillFieldsSx } from "../internal/fill";

export interface FabricFormRowProps {
  /** Fields to put side by side. */
  children: ReactNode;
  /**
   * Columns from the `sm` breakpoint up; one column below it. A list sizes each
   * column as a fraction, e.g. `[2, 1]` for a wide street and a narrow postcode.
   * @default 2
   */
  columns?: 2 | 3 | 4 | number[];
  /** Space between fields. @default "lg" (16px) */
  gap?: keyof typeof spacing;
  /** Class on the root. */
  className?: string;
  /** System styles on the root. */
  sx?: SxProps<Theme>;
}

/**
 * FabricFormRow — puts short, related fields side by side: first and last name,
 * city and postcode, start and end time. On phones they stack.
 *
 * Keep rows to fields people fill in together; one field per row is easier to
 * scan for everything else.
 */
export function FabricFormRow({
  children,
  columns = 2,
  gap = "lg",
  className,
  sx,
}: Readonly<FabricFormRowProps>) {
  const template = Array.isArray(columns)
    ? columns.map((c) => `minmax(0, ${c}fr)`).join(" ")
    : `repeat(${columns}, minmax(0, 1fr))`;
  return (
    <Box
      className={className}
      sx={[
        {
          display: "grid",
          gap: `${spacing[gap]}px`,
          gridTemplateColumns: { xs: "minmax(0, 1fr)", sm: template },
          alignItems: "start",
          ...fillFieldsSx,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {children}
    </Box>
  );
}
