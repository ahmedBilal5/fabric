import { Box, type BoxProps } from "@mui/material";
import React from "react";
import {
  type ResponsiveValue,
  resolveResponsiveGap,
  resolveResponsiveProp,
  type Space,
} from "./system";

export interface FabricInlineProps extends Omit<BoxProps, "gap"> {
  /** Horizontal gap between items. Accepts a token key or a responsive object. */
  gap?: ResponsiveValue<Space>;
  /** Vertical alignment of items. @default 'center' */
  align?: ResponsiveValue<React.CSSProperties["alignItems"]>;
}

/**
 * Horizontal wrapping row with items centered by default.
 *
 * @example
 * <FabricInline gap="sm">
 *   <Chip label="Tag A" />
 *   <Chip label="Tag B" />
 * </FabricInline>
 */
export const FabricInline = React.forwardRef<HTMLDivElement, FabricInlineProps>(
  function FabricInline({ gap, align = "center", sx, ...rest }, ref) {
    return (
      <Box
        ref={ref}
        sx={[
          {
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            alignItems: resolveResponsiveProp(align),
            gap: resolveResponsiveGap(gap),
          },
          ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
        ]}
        {...rest}
      />
    );
  },
);
