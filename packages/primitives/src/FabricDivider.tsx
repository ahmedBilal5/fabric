import { spacing } from "@fabric-kit/design-tokens";
import { Divider as MuiDivider, type DividerProps as MuiDividerProps } from "@mui/material";
import React from "react";
import type { Space } from "./system";

export interface FabricDividerProps extends MuiDividerProps {
  /** Vertical margin above and below the divider. @see Space */
  spacing?: Space;
}

/**
 * Themed horizontal rule with token-based vertical spacing.
 *
 * @example
 * <FabricDivider spacing="md" />
 */
export const FabricDivider = React.forwardRef<HTMLHRElement, FabricDividerProps>(
  function FabricDivider({ spacing: spacingKey, sx, ...rest }, ref) {
    const baseSx = spacingKey ? { my: `${spacing[spacingKey]}px` } : {};
    return (
      <MuiDivider ref={ref} sx={[baseSx, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]} {...rest} />
    );
  },
);
