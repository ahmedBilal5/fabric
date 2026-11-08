import {
  type FontSize,
  fontSize,
  type TextVariantKey,
  textVariant,
} from "@fabric-kit/design-tokens";
import { Typography, type TypographyProps } from "@mui/material";
import React from "react";
import type { ResponsiveValue } from "./system";

export interface FabricTextProps extends TypographyProps {
  /** Font size from the design-token scale (xs=10px … 4xl=32px). Accepts responsive object. */
  size?: ResponsiveValue<keyof FontSize>;
  /** Composite text preset (font-size + weight + line-height + letter-spacing). */
  textVariant?: TextVariantKey;
  /** Truncate with ellipsis when text overflows. @default false */
  truncate?: boolean;
  /** Text color — accepts CSS variables, MUI palette paths, or any CSS color value. */
  color?: string;
}

const truncateSx = {
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
} as const;

function resolveSize(
  size: ResponsiveValue<keyof FontSize> | undefined,
): string | Record<string, string> | undefined {
  if (size === undefined) return undefined;
  if (typeof size === "string") return fontSize[size];
  const result: Record<string, string> = {};
  for (const [bp, val] of Object.entries(size)) {
    if (val !== undefined) result[bp] = fontSize[val as keyof FontSize];
  }
  return result;
}

/**
 * Typography primitive. Wraps MUI `Typography` with token-based sizing.
 *
 * @example
 * <FabricText size="lg" truncate>Long title…</FabricText>
 * <FabricText textVariant="heading.md">Section</FabricText>
 *
 * @example Responsive
 * <FabricText size={{ xs: 'md', md: 'xl' }}>Scales with viewport</FabricText>
 */
export const FabricText = React.forwardRef<HTMLElement, FabricTextProps>(function FabricText(
  { size, textVariant: tv, truncate, color, sx, ...rest },
  ref,
) {
  const resolvedSize = resolveSize(size);
  const variantSx = tv ? textVariant[tv] : undefined;
  const baseSx = {
    ...(variantSx as object),
    ...(resolvedSize && typeof resolvedSize === "string" ? { fontSize: resolvedSize } : undefined),
    ...(resolvedSize && typeof resolvedSize === "object" ? { fontSize: resolvedSize } : undefined),
    ...(truncate ? truncateSx : undefined),
    ...(color ? { color } : undefined),
  };
  return (
    <Typography ref={ref} sx={[baseSx, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]} {...rest} />
  );
});
