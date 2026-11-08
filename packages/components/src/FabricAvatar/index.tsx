/**
 * FabricAvatar — the design-system user/entity avatar.
 *
 * Extends MUI `Avatar` with two props:
 *
 *   `name`  — derives two-letter initials for `children`, a deterministic
 *             HSL background color, and `alt` for screen readers.
 *
 *   `size`  — preset sizing (`xs`=20 · `sm`=24 · `md`=32 · `lg`=40) or a
 *             number. Font size scales with the box so initials always fit.
 *
 * The look: semi-bold initials with 0.5px letter spacing, a 1px white ring
 * or, with `border`, a 1px grey border with a 2px gap, and a 6px radius for
 * MUI's `rounded` variant. `appearance` applies fixed initials colors
 * (`default` yellow, `inverse` brown); without it, a `name` keeps its own
 * derived color.
 *
 * Every explicit prop passed by the consumer wins over the derived values:
 * `<FabricAvatar name="Jane Doe" sx={{ bgcolor: 'red' }}>JD</FabricAvatar>`
 * renders a red background with the given children, not derived ones.
 *
 * @example
 * ```tsx
 * <FabricAvatar name="Jane Doe" src={user.avatarUrl} size={32} />
 * <FabricAvatar name="Jane Doe" appearance="inverse" border />
 * ```
 */

import { brand, dark, fontFamily, fontWeight, text } from "@fabric-kit/design-tokens";
import Avatar, { type AvatarProps } from "@mui/material/Avatar";
import type { Theme } from "@mui/material/styles";
import type React from "react";
import { forwardRef, memo, useMemo } from "react";

export type FabricAvatarSize = "xs" | "sm" | "md" | "lg";

/**
 * Fixed initials colors: `default` is yellow with dark text, `inverse` is
 * brown with white text.
 */
export type FabricAvatarAppearance = "default" | "inverse";

const SIZE_PX: Record<FabricAvatarSize, number> = {
  xs: 20,
  sm: 24,
  md: 32,
  lg: 40,
};

export interface FabricAvatarProps extends Omit<AvatarProps, "children"> {
  children?: React.ReactNode;
  /**
   * Person / entity name. When set and no explicit `children` is provided,
   * generates two-letter initials; when set and `sx.bgcolor` is not
   * provided, generates a deterministic HSL background color; when set and
   * no explicit `alt` is provided, uses the name as the `alt` text.
   */
  name?: string;
  /**
   * Size preset (`xs`=20 · `sm`=24 · `md`=32 · `lg`=40) or a raw pixel
   * value. Font-size scales with the box so initials remain readable.
   */
  size?: FabricAvatarSize | number;
  /**
   * Fixed initials colors: `default` is yellow with dark text, `inverse` is
   * brown with white text. When unset, a `name` keeps its own derived color.
   */
  appearance?: FabricAvatarAppearance;
  /**
   * A 1px grey border with a 2px gap around the avatar.
   * When `false`, the avatar has a 1px white ring.
   * @default false
   */
  border?: boolean;
}

function computeInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

// Deterministic HSL: the same name always maps to the same color. 30% lightness keeps
// white initials at 4.5:1 or better for every hue, in light and dark mode.
function computeBgColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
    hash |= 0;
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 50%, 30%)`;
}

const APPEARANCE_COLORS = {
  default: {
    light: { bgcolor: brand.yellow, color: text.primary },
    dark: { bgcolor: dark.brand.yellow, color: dark.text.inverse },
  },
  inverse: {
    light: {
      bgcolor: "var(--mui-palette-secondary-main)",
      color: "var(--mui-palette-secondary-contrastText)",
    },
    dark: {
      bgcolor: "var(--mui-palette-secondary-main)",
      color: "var(--mui-palette-secondary-contrastText)",
    },
  },
} as const;

// Avatar base: UI SemiBold initials (10/14 at 24px) with 0.5px letter spacing. The ring and the
// border sit inside the avatar's box so its size never changes:
//   no border → 1px white ring drawn over the content (an inset outline also covers photos)
//   border    → 1px grey border + 2px transparent gap; the fill and photo use the inner box
const baseSx = (border: boolean) => (theme: Theme) => ({
  boxSizing: "border-box" as const,
  fontFamily: fontFamily.body,
  fontWeight: fontWeight.semiBold,
  letterSpacing: "0.5px",
  lineHeight: 1.4,
  "&.MuiAvatar-rounded": { borderRadius: "6px" },
  "& .MuiAvatar-img": { borderRadius: "inherit" },
  ...(border
    ? {
        border: `1px solid ${(theme.vars ?? theme).palette.divider}`,
        padding: theme.spacing(0.5),
        backgroundClip: "content-box",
      }
    : {
        outline: `1px solid ${(theme.vars ?? theme).palette.background.paper}`,
        outlineOffset: "-1px",
      }),
});

const appearanceSx = (appearance: FabricAvatarAppearance) => (theme: Theme) => ({
  ...APPEARANCE_COLORS[appearance].light,
  ...theme.applyStyles("dark", APPEARANCE_COLORS[appearance].dark),
});

const FabricAvatarImpl = forwardRef<HTMLDivElement, FabricAvatarProps>(function FabricAvatar(
  { name, size, appearance, border = false, children, alt, sx, ...rest },
  ref,
) {
  const dims = useMemo(() => {
    if (size === undefined) return null;
    const px = typeof size === "number" ? size : SIZE_PX[size];
    return {
      width: px,
      height: px,
      fontSize: Math.max(10, Math.round(px * 0.4)),
    };
  }, [size]);

  const derivedInitials = useMemo(
    () => (children === undefined && name ? computeInitials(name) : undefined),
    [children, name],
  );

  const finalSx = useMemo(() => {
    // `appearance` colors win over the name-derived color.
    const colors = appearance
      ? appearanceSx(appearance)
      : name
        ? { bgcolor: computeBgColor(name), color: "var(--mui-palette-common-white)" }
        : undefined;
    // Order matters: base, then size, then colors, then the consumer `sx` wins.
    return [
      baseSx(border),
      ...(dims ? [dims] : []),
      ...(colors ? [colors] : []),
      ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
    ];
  }, [border, dims, appearance, name, sx]);

  return (
    <Avatar ref={ref} alt={alt ?? name} sx={finalSx as AvatarProps["sx"]} {...rest}>
      {children !== undefined ? children : derivedInitials}
    </Avatar>
  );
});

FabricAvatarImpl.displayName = "FabricAvatar";

export const FabricAvatar = memo(FabricAvatarImpl);
