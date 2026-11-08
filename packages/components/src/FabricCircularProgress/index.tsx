/**
 * FabricCircularProgress — the design-system loading spinner.
 *
 * Extends MUI `CircularProgress`: every variant, color, thickness and slot
 * passes through, fully typed. The one change is that `size` defaults to `24`
 * (MUI's default is `40`), which suits buttons, rows and dense layouts.
 *
 * @example
 * ```tsx
 * <FabricCenter sx={{ height: 200 }}>
 *   <FabricCircularProgress size={40} />
 * </FabricCenter>
 * ```
 */

import CircularProgress, { type CircularProgressProps } from "@mui/material/CircularProgress";
import { forwardRef, memo } from "react";

export interface FabricCircularProgressProps extends CircularProgressProps {}

const FabricCircularProgressImpl = forwardRef<HTMLSpanElement, FabricCircularProgressProps>(
  function FabricCircularProgress({ size = 24, ...rest }, ref) {
    return <CircularProgress ref={ref} size={size} {...rest} />;
  },
);

FabricCircularProgressImpl.displayName = "FabricCircularProgress";

export const FabricCircularProgress = memo(FabricCircularProgressImpl);
