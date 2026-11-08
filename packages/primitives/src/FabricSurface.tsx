import { Paper, type PaperProps } from "@mui/material";
import React from "react";

type SurfaceVariant = "primary" | "secondary" | "outlined";

export interface FabricSurfaceProps extends Omit<PaperProps, "variant"> {
  /** Visual treatment. `'outlined'` renders a border with no elevation. @default 'primary' */
  variant?: SurfaceVariant;
}

/**
 * Elevated or outlined content area. Wraps MUI `Paper`.
 *
 * @example
 * <FabricSurface variant="outlined" sx={{ p: 2 }}>
 *   <FabricText>Card content</FabricText>
 * </FabricSurface>
 */
export const FabricSurface = React.forwardRef<HTMLDivElement, FabricSurfaceProps>(
  function FabricSurface({ variant = "primary", elevation, sx, ...rest }, ref) {
    const isOutlined = variant === "outlined";
    const baseSx = isOutlined ? { border: 1, borderColor: "divider" } : {};
    return (
      <Paper
        ref={ref}
        elevation={isOutlined ? 0 : (elevation ?? 1)}
        sx={[baseSx, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}
        {...rest}
      />
    );
  },
);
