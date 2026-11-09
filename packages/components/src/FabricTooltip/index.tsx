/**
 * FabricTooltip — the design-system tooltip.
 *
 * Extends MUI `Tooltip` with Fabric's tooltip look as defaults (navy `dark`
 * variant by default, white `light` variant via `variant`; typography, padding
 * and shadow from design tokens). `title` accepts any `ReactNode`.
 * Defaults `arrow={true}`. All standard
 * MUI Tooltip props pass through — consumers override via `slotProps.tooltip.sx`
 * / `slotProps.arrow.sx` and their values win on any key they spell out.
 *
 * No `forwardRef` here — MUI Tooltip already forwards its ref to the anchor
 * child via `React.cloneElement`; wrapping it in another `forwardRef` breaks
 * that pass-through.
 *
 * @example
 * ```tsx
 * <FabricTooltip title="Delete this item" placement="top">
 *   <IconButton onClick={remove}><DeleteIcon /></IconButton>
 * </FabricTooltip>
 * ```
 */

import { brand, dark, radii, shadows, spacing, text, textVariant } from "@fabric-kit/design-tokens";
import { Tooltip, type TooltipProps } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import { memo, type ReactNode, useMemo } from "react";

/** `dark` is the navy tooltip (default); `light` is the white tooltip. */
export type FabricTooltipVariant = "dark" | "light";

export interface FabricTooltipProps extends Omit<TooltipProps, "title"> {
  /**
   * Tooltip content: text, or rich content such as icons + text, formatted
   * labels and keyboard shortcuts.
   */
  title: ReactNode;
  /** Visual variant. @default 'dark' */
  variant?: FabricTooltipVariant;
}

const toArray = (sx?: SxProps<Theme>) => (Array.isArray(sx) ? sx : sx ? [sx] : []);

// Baked-in DS visual defaults. Consumer `sx` is appended after these, so it wins on any key.
const tooltipSx =
  (variant: FabricTooltipVariant) =>
  (theme: Theme): SxProps<Theme> => ({
    ...textVariant.bodyMd,
    padding: `${spacing.xs}px ${spacing.sm}px`,
    borderRadius: `${radii.md}px`,
    // `filter` (not boxShadow) so the shadow follows the arrow too.
    filter: `drop-shadow(${shadows.dropdown})`,
    ...(variant === "light"
      ? {
          backgroundColor: "var(--mui-palette-background-paper)",
          color: text.medium,
          ...theme.applyStyles("dark", {
            backgroundColor: "var(--mui-palette-background-paper)",
            color: dark.text.medium,
          }),
        }
      : {
          backgroundColor: brand.navy,
          color: text.inverse,
          // Navy would vanish on dark surfaces, so the tooltip flips to the light navy counterpart.
          ...theme.applyStyles("dark", {
            backgroundColor: dark.brand.navy,
            color: dark.text.inverse,
          }),
        }),
  });

const arrowSx =
  (variant: FabricTooltipVariant) =>
  (theme: Theme): SxProps<Theme> =>
    variant === "light"
      ? {
          color: "var(--mui-palette-background-paper)",
          ...theme.applyStyles("dark", { color: "var(--mui-palette-background-paper)" }),
        }
      : { color: brand.navy, ...theme.applyStyles("dark", { color: dark.brand.navy }) };

function FabricTooltipImpl({
  slotProps: consumerSlotProps,
  arrow = true,
  variant = "dark",
  ...rest
}: FabricTooltipProps) {
  // Merge DS defaults with consumer slotProps — consumer's `sx` keys win.
  const mergedSlotProps = useMemo(() => {
    const consumerTooltip = consumerSlotProps?.tooltip as { sx?: SxProps<Theme> } | undefined;
    const consumerArrow = consumerSlotProps?.arrow as { sx?: SxProps<Theme> } | undefined;
    return {
      ...consumerSlotProps,
      tooltip: {
        ...(consumerSlotProps?.tooltip ?? {}),
        sx: [tooltipSx(variant), ...toArray(consumerTooltip?.sx)],
      },
      arrow: {
        ...(consumerSlotProps?.arrow ?? {}),
        sx: [arrowSx(variant), ...toArray(consumerArrow?.sx)],
      },
    };
  }, [consumerSlotProps, variant]);

  return <Tooltip arrow={arrow} slotProps={mergedSlotProps} {...rest} />;
}

FabricTooltipImpl.displayName = "FabricTooltip";

export const FabricTooltip = memo(FabricTooltipImpl);
