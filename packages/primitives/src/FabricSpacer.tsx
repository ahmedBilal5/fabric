import { spacing } from "@fabric-kit/design-tokens";
import { Box, type BoxProps } from "@mui/material";
import React from "react";
import type { Space } from "./system";

export interface FabricSpacerProps extends Omit<BoxProps, "children" | "flex"> {
  /** Fixed spacing size. Sets both width and height. @see Space */
  size?: Space;
  /** When true, acts as a flex-grow spacer instead of fixed size. */
  flex?: boolean;
}

/**
 * Aria-hidden spacing element. Use `size` for fixed gaps or `flex` for flexible push.
 *
 * @example
 * <FabricFlex>
 *   <Logo />
 *   <FabricSpacer flex />
 *   <Nav />
 * </FabricFlex>
 */
export const FabricSpacer = React.forwardRef<HTMLDivElement, FabricSpacerProps>(
  function FabricSpacer({ size, flex, sx, ...rest }, ref) {
    const baseSx = {
      ...(flex ? { flex: 1 } : {}),
      ...(size ? { width: `${spacing[size]}px`, height: `${spacing[size]}px`, flexShrink: 0 } : {}),
    };
    return (
      <Box
        ref={ref}
        aria-hidden
        sx={[baseSx, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}
        {...rest}
      />
    );
  },
);
