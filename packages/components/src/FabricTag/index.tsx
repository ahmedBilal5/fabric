/**
 * FabricTag — a compact, square-cornered label for metadata, categories and versions.
 *
 * Built on MUI `Chip`, so `onDelete`, `onClick`, `disabled`, keyboard support, `ref`,
 * `sx` and `className` work as they do on `FabricChip`. Tags differ from chips in shape
 * (4px radius instead of a pill) and in their four styles:
 *
 * - `standard`: neutral tag. Use `active` for the selected look; hover and press
 *   states show when the tag has `onClick`.
 * - `color` + `color`: solid status fill.
 * - `indicator` + `color`: tinted fill with a status dot.
 * - `outlined`: for versions; add `secondaryLabel` for a muted second segment.
 *   `variant="color" color="primary" secondaryLabel` gives a filled two-part tag.
 *
 * Status colors: `queued`, `running`, `success`, `warning`, `cancelled`, `error`,
 * `suspended`, `archived`, `unknown`. Colors come from `@fabric-kit/design-tokens`
 * (`status`, `surface`, `chip`, `tag`).
 *
 * @example
 * ```tsx
 * <FabricTag label="Draft" />
 * <FabricTag label="Done" variant="color" color="success" />
 * <FabricTag label="Running" variant="indicator" color="running" />
 * <FabricTag label="Version: 1.2" secondaryLabel="Level: AAA" variant="outlined" />
 * ```
 */

import {
  border,
  chip,
  dark,
  duration,
  easing,
  fontWeight,
  opacity,
  radii,
  status,
  surface,
  tag,
  text,
} from "@fabric-kit/design-tokens";
import { Chip, type ChipProps } from "@mui/material";
import { styled } from "@mui/material/styles";
import { forwardRef, memo, type ReactNode } from "react";

/** Tag styles. */
export type FabricTagVariant = "standard" | "color" | "indicator" | "outlined";

/** Tag colors, shared with `FabricChip`. `primary` is meant for the dual fill tag. */
export type FabricTagColor =
  | "queued"
  | "running"
  | "success"
  | "warning"
  | "cancelled"
  | "error"
  | "suspended"
  | "archived"
  | "unknown"
  | "primary";

export interface FabricTagProps
  extends Omit<ChipProps, "label" | "variant" | "color" | "size" | "avatar" | "icon"> {
  /** Main text. Required. */
  label: ReactNode;
  /**
   * Second segment shown after the label (two-part tags).
   * Muted in `outlined`; on a darker fill in `color` with `color="primary"`.
   */
  secondaryLabel?: ReactNode;
  /** Tag style. Defaults to `standard`. */
  variant?: FabricTagVariant;
  /** Color for `color` and `indicator`. Ignored by `standard` and `outlined`. Defaults to `unknown`. */
  color?: FabricTagColor;
  /** Selected look for `standard` (darker text). Sets `aria-pressed` when the tag is clickable. */
  active?: boolean;
}

type Scheme = "light" | "dark";

interface TagStyleProps {
  tagVariant: FabricTagVariant;
  tagColor: FabricTagColor;
  dual: boolean;
  active: boolean;
}

/** Solid color for a tag color (color fill and indicator dot). */
const solidOf = (scheme: Scheme, color: FabricTagColor) => {
  if (color === "primary") return "var(--mui-palette-primary-main)";
  return (scheme === "dark" ? dark.status : status)[color];
};

/** Tinted background for the indicator tag. `queued` uses white. */
const tintOf = (scheme: Scheme, color: FabricTagColor) => {
  const s = scheme === "dark" ? dark.surface : surface;
  if (color === "queued" || color === "primary") return s.primary;
  return s[color === "warning" ? "warningBg" : color];
};

/** Keeps the background steady on hover/focus (MUI tints it by default). */
const steadyBg = (backgroundColor: string) => ({
  backgroundColor,
  "&.MuiChip-clickable:hover, &.Mui-focusVisible": { backgroundColor },
});

/** Colors for one scheme; applied directly for light and via `applyStyles` for dark. */
const colorStyles = (scheme: Scheme, { tagVariant, tagColor, dual, active }: TagStyleProps) => {
  const d = scheme === "dark";
  const t = d ? dark.text : text;
  const neutralText = d ? dark.chip.default.text : chip.default.text;

  if (tagVariant === "standard") {
    return {
      ...steadyBg((d ? dark.surface : surface).unknown),
      color: active ? t.primary : neutralText,
      "&.MuiChip-clickable:hover": {
        backgroundColor: (d ? dark.surface : surface).unknown,
        color: d ? dark.tag.textHover : tag.textHover,
      },
      "&.MuiChip-clickable:active": { color: t.primary },
      "&.Mui-disabled": { color: t.disabled },
    };
  }
  if (tagVariant === "color") {
    return {
      ...steadyBg(solidOf(scheme, tagColor)),
      color: t.inverse,
      ...(dual &&
        tagColor === "primary" && {
          "& .FabricTag-secondary": {
            backgroundColor: d
              ? "var(--mui-palette-primary-light)"
              : "var(--mui-palette-primary-dark)",
          },
        }),
    };
  }
  if (tagVariant === "indicator") {
    return {
      ...steadyBg(tintOf(scheme, tagColor)),
      color: neutralText,
      boxShadow: `inset 0 0 0 1px ${(d ? dark.surface : surface).queued}`,
      "& .MuiChip-icon": { color: solidOf(scheme, tagColor) },
    };
  }
  const line = (d ? dark.border : border).default;
  return {
    ...steadyBg("transparent"),
    color: t.primary,
    boxShadow: `inset 0 0 0 1px ${line}`,
    ...(dual && {
      "& .FabricTag-secondary": { color: t.secondary, borderLeft: `1px solid ${line}` },
    }),
  };
};

const StyledTag = styled(Chip, {
  shouldForwardProp: (prop) => !["tagVariant", "tagColor", "dual", "active"].includes(String(prop)),
})<TagStyleProps>(({ theme, ...props }) => {
  const { tagVariant, dual } = props;
  const isStandard = tagVariant === "standard";
  return {
    height: isStandard ? 18 : 22,
    borderRadius: radii.md,
    border: "none",
    fontSize: isStandard ? 10 : 12,
    lineHeight: isStandard ? "14px" : "18px",
    fontWeight: fontWeight.semiBold,
    letterSpacing: "0.5px",
    transition: theme.transitions.create(["background-color", "color"], {
      duration: duration.fast,
      easing: easing.inOut,
    }),
    // Insets: standard 4 + 4px spacers, color 8 / 4 + spacer, indicator 4 / 8, outlined 8 / 8.
    paddingLeft: isStandard || tagVariant === "indicator" ? 4 : 8,
    paddingRight: isStandard || tagVariant === "color" ? 4 : 8,
    "& .MuiChip-label": {
      padding: isStandard ? "0 4px" : tagVariant === "color" ? "0 4px 0 0" : 0,
    },
    "& .MuiChip-icon": { width: 12, height: 12, margin: "0 4px 0 0" },
    "&.Mui-disabled": { opacity: isStandard ? 1 : opacity.disabled },
    "&.Mui-focusVisible": {
      outline: "2px solid var(--mui-palette-primary-main)",
      outlineOffset: 1,
    },
    ...(dual && {
      paddingLeft: 0,
      paddingRight: 0,
      overflow: "hidden",
      "& .MuiChip-label": { padding: 0, display: "flex", height: "100%" },
      "& .FabricTag-main, & .FabricTag-secondary": {
        display: "inline-flex",
        alignItems: "center",
        paddingLeft: 8,
        paddingRight: 8,
      },
    }),
    ...colorStyles("light", props),
    ...theme.applyStyles("dark", colorStyles("dark", props)),
  };
});

/** 12px slot with a 5px dot in the tag color. */
const IndicatorDot = styled("span")({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  "&::before": {
    content: '""',
    width: 5,
    height: 5,
    borderRadius: radii.full,
    backgroundColor: "currentColor",
  },
});

const FabricTagImpl = forwardRef<HTMLDivElement, FabricTagProps>(function FabricTag(
  { label, secondaryLabel, variant = "standard", color = "unknown", active = false, ...chipProps },
  ref,
) {
  const dual = secondaryLabel != null;
  const clickable = !!chipProps.onClick;
  return (
    <StyledTag
      ref={ref}
      tagVariant={variant}
      tagColor={color}
      dual={dual}
      active={active}
      aria-pressed={clickable && variant === "standard" ? active : undefined}
      icon={variant === "indicator" ? <IndicatorDot aria-hidden /> : undefined}
      label={
        dual ? (
          <>
            <span className="FabricTag-main">{label}</span>
            <span className="FabricTag-secondary">{secondaryLabel}</span>
          </>
        ) : (
          label
        )
      }
      {...chipProps}
    />
  );
});

FabricTagImpl.displayName = "FabricTag";

export const FabricTag = memo(FabricTagImpl);
