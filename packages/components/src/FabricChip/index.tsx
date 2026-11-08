/**
 * FabricChip — the design-system chip.
 *
 * Extends MUI `Chip` with a required `label` and keeps MUI's defaults
 * (`size="medium"`, `variant="filled"`, `color="default"`). Adds status colors
 * (`queued`, `running`, `cancelled`, `suspended`, `archived`, `unknown`), a
 * `filledAlt` variant, and a short color transition for hover and click feedback.
 * `forwardRef` targets the root `<div>`; `React.memo` keeps large chip lists cheap.
 *
 * Colors, sizes and typography are applied by the `MuiChip` override in
 * `@fabric-kit/theme`; the color tokens live in `chip` (`@fabric-kit/design-tokens`).
 * `primary`, `secondary` and `info` keep MUI's default styling.
 *
 * @example
 * ```tsx
 * <FabricChip label="Active" color="success" onDelete={() => remove('active')} />
 * <FabricChip label="Queued" color="queued" variant="filledAlt" size="small" />
 * ```
 */

import { duration, easing } from "@fabric-kit/design-tokens";
// Type-only: loads the theme's MUI augmentations so `color="queued"` / `variant="filledAlt"` type-check.
import type {} from "@fabric-kit/theme";
import { Chip, type ChipProps } from "@mui/material";
import { styled } from "@mui/material/styles";
import { forwardRef, memo, type ReactNode } from "react";

// Chip owns its own pill shape; sizes and colors come from the theme's `MuiChip`
// override. The transition covers hover-in/out and the color swap that
// happens on click for clickable chips.
const StyledChip = styled(Chip)(({ theme }) => ({
  transition: theme.transitions.create(["background-color", "box-shadow", "color"], {
    duration: duration.fast,
    easing: easing.inOut,
  }),
}));

export interface FabricChipProps extends Omit<ChipProps, "label"> {
  /**
   * Content shown inside the chip. Required — a chip without a label is
   * semantically empty. Accepts `ReactNode` so consumers can compose small
   * inline markup (an icon + text, a `<strong>`, etc.) when needed.
   */
  label: ReactNode;
}

const FabricChipImpl = forwardRef<HTMLDivElement, FabricChipProps>(function FabricChip(
  { label, ...chipProps },
  ref,
) {
  return <StyledChip ref={ref} label={label} {...chipProps} />;
});

FabricChipImpl.displayName = "FabricChip";

export const FabricChip = memo(FabricChipImpl);
