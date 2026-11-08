import { Box, type BoxProps } from "@mui/material";
import React from "react";
import {
  type ResponsiveValue,
  resolveResponsiveGap,
  resolveResponsiveProp,
  type Space,
} from "./system";

export interface FabricFlexProps extends Omit<BoxProps, "gap"> {
  /** Gap between children. Accepts a token key or a responsive object. */
  gap?: ResponsiveValue<Space>;
  /** Main-axis direction. @default 'row' */
  direction?: ResponsiveValue<React.CSSProperties["flexDirection"]>;
  /** Cross-axis alignment (alignItems). */
  align?: ResponsiveValue<React.CSSProperties["alignItems"]>;
  /** Main-axis distribution (justifyContent). */
  justify?: ResponsiveValue<React.CSSProperties["justifyContent"]>;
  /** Allow children to wrap. Pass `true` for `'wrap'`. @default false */
  wrap?: boolean | ResponsiveValue<React.CSSProperties["flexWrap"]>;
}

/**
 * Generic flex container. Use `FabricStack` for vertical, `FabricInline` for horizontal wrapping row.
 *
 * @example
 * <FabricFlex direction="row" gap="md" align="center">
 *   <Avatar />
 *   <FabricText>Name</FabricText>
 * </FabricFlex>
 *
 * @example Responsive
 * <FabricFlex direction={{ xs: 'column', md: 'row' }} gap={{ xs: 'sm', md: 'lg' }}>
 *   <Panel />
 *   <Panel />
 * </FabricFlex>
 */
export const FabricFlex = React.forwardRef<HTMLDivElement, FabricFlexProps>(function FabricFlex(
  { gap, direction, align, justify, wrap, sx, ...rest },
  ref,
) {
  const resolvedWrap =
    wrap === true ? "wrap" : wrap === false ? undefined : resolveResponsiveProp(wrap);
  return (
    <Box
      ref={ref}
      sx={[
        {
          display: "flex",
          flexDirection: resolveResponsiveProp(direction),
          alignItems: resolveResponsiveProp(align),
          justifyContent: resolveResponsiveProp(justify),
          flexWrap: resolvedWrap,
          gap: resolveResponsiveGap(gap),
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
      {...rest}
    />
  );
});
