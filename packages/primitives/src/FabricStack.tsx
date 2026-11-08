import { Box, type BoxProps } from "@mui/material";
import React from "react";
import {
  type ResponsiveValue,
  resolveResponsiveGap,
  resolveResponsiveProp,
  type Space,
} from "./system";

export interface FabricStackProps extends Omit<BoxProps, "gap"> {
  /** Vertical gap between children. Accepts a token key or a responsive object. */
  gap?: ResponsiveValue<Space>;
  /** Horizontal alignment of children (alignItems). */
  align?: ResponsiveValue<React.CSSProperties["alignItems"]>;
  /** Vertical distribution (justifyContent). */
  justify?: ResponsiveValue<React.CSSProperties["justifyContent"]>;
}

/**
 * Vertical flex column. Shorthand for `<FabricFlex direction="column">`.
 *
 * @example
 * <FabricStack gap="md">
 *   <FabricText>First</FabricText>
 *   <FabricText>Second</FabricText>
 * </FabricStack>
 *
 * @example Responsive
 * <FabricStack gap={{ xs: 'sm', md: 'xl' }}>
 *   <Card />
 *   <Card />
 * </FabricStack>
 */
export const FabricStack = React.forwardRef<HTMLElement, FabricStackProps>(function FabricStack(
  { gap, align, justify, sx, ...rest },
  ref,
) {
  return (
    <Box
      ref={ref}
      sx={[
        {
          display: "flex",
          flexDirection: "column",
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
