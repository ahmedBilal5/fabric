import { labels } from "@fabric-kit/design-tokens";
import { describe, expect, it } from "vitest";
import { BADGE_PALETTES, getBadgeTextColor, normalizeBadge } from "../src/utils/badges";

describe("badges", () => {
  it("normalizes badge defaults", () => {
    expect(normalizeBadge(undefined)).toBeNull();
    expect(normalizeBadge({ label: "QA" })).toEqual({
      label: "QA",
      palette: "purple",
    });
    expect(normalizeBadge({ label: "Feed", palette: "blue" })).toEqual({
      label: "Feed",
      palette: "blue",
    });
  });

  it("pulls badge text toward text.primary so it follows the color scheme", () => {
    expect(getBadgeTextColor(labels.purple)).toBe(
      `color-mix(in srgb, var(--mui-palette-text-primary) 55%, ${labels.purple})`,
    );
  });

  it("maps badge palettes to Fabric tokens", () => {
    expect(BADGE_PALETTES.purple).toEqual({
      bg: `color-mix(in srgb, ${labels.purple} 14%, var(--mui-palette-background-paper))`,
      border: labels.purple,
      text: labels.purple,
    });
    expect(BADGE_PALETTES.blue).toEqual({
      bg: "var(--mui-palette-info-light)",
      border: "var(--mui-palette-info-main)",
      text: "var(--mui-palette-info-main)",
    });
    expect(BADGE_PALETTES.grey).toEqual({
      bg: `color-mix(in srgb, ${labels.gray} 14%, var(--mui-palette-background-paper))`,
      border: labels.gray,
      text: labels.gray,
    });
  });
});
