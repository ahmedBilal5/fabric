/**
 * FabricGrid — the design-system responsive grid container.
 *
 * Thin wrapper over MUI v9 `Grid` (the CSS Grid-based successor to the v5
 * `Grid2` primitive), with the full typed `GridProps` surface. Size items with
 * `size={{ xs, sm, md, lg, xl }}`; every child of a `container` is an item.
 *
 * @example
 * ```tsx
 * <FabricGrid container spacing={2}>
 *   <FabricGrid size={{ xs: 12, md: 6 }}>Left</FabricGrid>
 *   <FabricGrid size={{ xs: 12, md: 6 }}>Right</FabricGrid>
 * </FabricGrid>
 * ```
 */

import Grid, { type GridProps } from "@mui/material/Grid";
import { forwardRef, memo } from "react";

export interface FabricGridProps extends GridProps {}

export type {
  GridDirection as FabricGridDirection,
  GridOffset as FabricGridOffset,
  GridSize as FabricGridSize,
  GridSpacing as FabricGridSpacing,
  GridWrap as FabricGridWrap,
} from "@mui/material/Grid";

const FabricGridImpl = forwardRef<HTMLDivElement, FabricGridProps>(function FabricGrid(props, ref) {
  return <Grid ref={ref} {...props} />;
});

FabricGridImpl.displayName = "FabricGrid";

export const FabricGrid = memo(FabricGridImpl);
