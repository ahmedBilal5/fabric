import {
  fontFamily,
  fontSize,
  fontWeight,
  letterSpacing,
  spacing,
} from "@fabric-kit/design-tokens";
import { Box, type BoxProps } from "@mui/material";
import { forwardRef, memo, type ReactNode } from "react";

export interface FabricCardRow {
  /** Left-hand text, for example `Revenue`. */
  label: ReactNode;
  /** Right-aligned text, for example `$1,200`. */
  value: ReactNode;
  /** Render the row as the bold summary line, e.g. a total. */
  emphasized?: boolean;
}

export interface FabricCardRowsProps extends Omit<BoxProps<"dl">, "children" | "component"> {
  /** The label / value pairs to show, top to bottom. */
  rows: FabricCardRow[];
  /**
   * `medium` is the metric card list (14px, semi-bold, own padding). `compact`
   * is the list-item card style (12px, regular, no padding) meant to sit inside
   * a card body next to an icon.
   * @default "medium"
   */
  size?: "medium" | "compact";
}

/**
 * FabricCardRows — label / value rows for metric and list-item cards.
 *
 * Renders a semantic description list (`<dl>`). Regular rows are 14px
 * body-font 600 in the muted label color; an `emphasized` row (the total) is 16px
 * heading-font 600 in the primary text color. Place it directly inside a
 * `FabricCard`, under a `FabricCardHeader`; it supplies its own 16px side and
 * bottom padding. `size="compact"` switches to the 12px regular rows of a
 * list-item card and drops the padding.
 *
 * @example
 * ```tsx
 * <FabricCardRows
 *   rows={[
 *     { label: "Total", value: "128", emphasized: true },
 *     { label: "Completed", value: "96" },
 *   ]}
 * />
 * ```
 */
const FabricCardRowsImpl = forwardRef<HTMLDListElement, FabricCardRowsProps>(
  function FabricCardRows({ rows, size = "medium", sx, ...rest }, ref) {
    const sxList = Array.isArray(sx) ? sx : sx ? [sx] : [];
    const compact = size === "compact";
    return (
      <Box
        ref={ref}
        component="dl"
        sx={[
          (_theme) => ({
            display: "flex",
            flexDirection: "column",
            gap: `${spacing.sm}px`,
            margin: 0,
            padding: compact ? 0 : `0 ${spacing.lg}px ${spacing.lg}px`,
            "& .FabricCardRows-row": {
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              gap: `${compact ? spacing.xs : spacing.lg}px`,
              fontFamily: fontFamily.body,
              fontSize: compact ? fontSize.sm : fontSize.md,
              fontWeight: compact ? fontWeight.regular : fontWeight.semiBold,
              lineHeight: compact ? "14px" : "20px",
              letterSpacing: compact ? "normal" : letterSpacing.wide,
              color: "var(--mui-palette-control-label)",
            },
            "& .FabricCardRows-row--emphasized": {
              fontFamily: fontFamily.heading,
              fontSize: fontSize.lg,
              letterSpacing: "normal",
              color: "var(--mui-palette-text-primary)",
            },
            "& dt, & dd": { margin: 0 },
            "& dd": { textAlign: "right" },
          }),
          ...sxList,
        ]}
        {...rest}
      >
        {rows.map((row, index) => (
          <Box
            key={index}
            className={`FabricCardRows-row${row.emphasized ? " FabricCardRows-row--emphasized" : ""}`}
          >
            <dt>{row.label}</dt>
            <dd>{row.value}</dd>
          </Box>
        ))}
      </Box>
    );
  },
);

FabricCardRowsImpl.displayName = "FabricCardRows";

export const FabricCardRows = memo(FabricCardRowsImpl);
