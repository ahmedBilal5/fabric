import { Box, type BoxProps } from "@mui/material";
import React from "react";

/**
 * Fills remaining flex space (`flex: 1; min-width: 0`). Use inside `FabricFlex`/`FabricInline` to push siblings apart.
 *
 * @example
 * <FabricFlex>
 *   <Logo />
 *   <FabricGrow>{children}</FabricGrow>
 *   <UserMenu />
 * </FabricFlex>
 */
export interface FabricGrowProps extends BoxProps {}

export const FabricGrow = React.forwardRef<HTMLDivElement, FabricGrowProps>(function FabricGrow(
  { sx, ...rest },
  ref,
) {
  return (
    <Box
      ref={ref}
      sx={[{ flex: 1, minWidth: 0 }, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}
      {...rest}
    />
  );
});
