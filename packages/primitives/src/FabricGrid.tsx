import { Box, type BoxProps } from "@mui/material";
import React from "react";
import {
  type ResponsiveValue,
  resolveResponsiveGap,
  resolveResponsiveProp,
  type Space,
} from "./system";

export interface FabricGridProps extends Omit<BoxProps, "gap"> {
  /** Gap between grid cells. Accepts a token key or a responsive object. */
  gap?: ResponsiveValue<Space>;
  /** CSS `grid-template-columns` value, e.g. `'1fr 1fr'` or `'repeat(3, 1fr)'`. */
  columns?: ResponsiveValue<string>;
  /** CSS `grid-template-rows` value. */
  rows?: ResponsiveValue<string>;
  /** Row alignment (alignItems). */
  align?: ResponsiveValue<React.CSSProperties["alignItems"]>;
  /** Column distribution (justifyContent). */
  justify?: ResponsiveValue<React.CSSProperties["justifyContent"]>;
}

/**
 * CSS Grid container.
 *
 * @example
 * <FabricGrid columns="1fr 1fr" gap="lg">
 *   <Card />
 *   <Card />
 * </FabricGrid>
 *
 * @example Responsive
 * <FabricGrid columns={{ xs: '1fr', md: '1fr 1fr 1fr' }} gap={{ xs: 'sm', md: 'lg' }}>
 *   <Card />
 *   <Card />
 *   <Card />
 * </FabricGrid>
 */
export const FabricGrid = React.forwardRef<HTMLDivElement, FabricGridProps>(function FabricGrid(
  { gap, columns, rows, align, justify, sx, ...rest },
  ref,
) {
  return (
    <Box
      ref={ref}
      sx={[
        {
          display: "grid",
          gridTemplateColumns: resolveResponsiveProp(columns),
          gridTemplateRows: resolveResponsiveProp(rows),
          alignItems: resolveResponsiveProp(align),
          justifyContent: resolveResponsiveProp(justify),
          gap: resolveResponsiveGap(gap),
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
      {...rest}
    />
  );
});
