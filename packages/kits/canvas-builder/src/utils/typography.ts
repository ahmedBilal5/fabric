import { fontFamily, fontSize, fontWeight } from "@fabric-kit/design-tokens";

/**
 * Canvas label text: heading font, 12px Medium.
 * No `textVariant` matches since the typography pass removed `labelMd`, so the canvas builds the
 * same look from tokens. Spread it first in `sx` so local overrides still win.
 */
export const canvasLabelText = {
  fontFamily: fontFamily.heading,
  fontSize: fontSize.sm,
  fontWeight: fontWeight.medium,
  // FABRIC_TOKEN_MISS: the design label line height; no lineHeight token matches 1.16.
  lineHeight: 1.16,
} as const;
