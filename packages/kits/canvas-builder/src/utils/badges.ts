import { labels } from "@fabric-kit/design-tokens";
import type { CanvasBadgeInfo, CanvasBadgePalette } from "../types";
import { tintOver } from "./themeColors";

// FABRIC_TOKEN_MISS: share of text.primary mixed into the badge color so badge text reaches 4.5:1 in light and dark mode.
const BADGE_TEXT_CONTRAST_PERCENT = 55;

/** Badge text color: the palette color pulled toward `text.primary` so it stays readable in both color schemes. */
export const getBadgeTextColor = (color: string) =>
  tintOver("var(--mui-palette-text-primary)", BADGE_TEXT_CONTRAST_PERCENT, color);

// Tint mixed into the paper colour (not transparency) so edges/handles behind the badge don't show through.
const solidTint = (color: string) =>
  `color-mix(in srgb, ${color} 14%, var(--mui-palette-background-paper))`;

/**
 * Semantic badge palettes used by `FabricCanvasNode` for optional node badges.
 */
export const BADGE_PALETTES: Record<
  CanvasBadgePalette,
  { bg: string; border: string; text: string }
> = {
  purple: { bg: solidTint(labels.purple), border: labels.purple, text: labels.purple },
  blue: {
    bg: "var(--mui-palette-info-light)",
    border: "var(--mui-palette-info-main)",
    text: "var(--mui-palette-info-main)",
  },
  grey: { bg: solidTint(labels.gray), border: labels.gray, text: labels.gray },
};

/**
 * Normalizes optional badge metadata into a concrete label + palette pair.
 */
export const normalizeBadge = (
  badge: CanvasBadgeInfo | undefined,
): { label: string; palette: CanvasBadgePalette } | null => {
  if (!badge) return null;
  return { label: badge.label, palette: badge.palette ?? "purple" };
};
