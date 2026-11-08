import { Box, type BoxProps } from "@mui/material";
import React from "react";

export interface FabricCenterProps extends BoxProps {}

/**
 * Centers children both horizontally and vertically.
 *
 * @example
 * <FabricCenter sx={{ height: 200 }}>
 *   <Spinner />
 * </FabricCenter>
 */
export const FabricCenter = React.forwardRef<HTMLDivElement, FabricCenterProps>(
  function FabricCenter({ sx, ...rest }, ref) {
    return (
      <Box
        ref={ref}
        sx={[
          {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          },
          ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
        ]}
        {...rest}
      />
    );
  },
);
