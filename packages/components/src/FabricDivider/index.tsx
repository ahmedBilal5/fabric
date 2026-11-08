/**
 * FabricDivider — the design-system section separator.
 *
 * A typed pass-through for MUI `Divider`: every prop, variant and orientation
 * works unchanged, and it picks up the theme's divider color.
 *
 * @example
 * ```tsx
 * <FabricStack gap="md">
 *   <FabricText>Section A</FabricText>
 *   <FabricDivider />
 *   <FabricText>Section B</FabricText>
 * </FabricStack>
 * ```
 */

import Divider, { type DividerProps } from "@mui/material/Divider";
import { forwardRef, memo } from "react";

export interface FabricDividerProps extends DividerProps {}

const FabricDividerImpl = forwardRef<HTMLHRElement, FabricDividerProps>(
  function FabricDivider(props, ref) {
    return <Divider ref={ref} {...props} />;
  },
);

FabricDividerImpl.displayName = "FabricDivider";

export const FabricDivider = memo(FabricDividerImpl);
