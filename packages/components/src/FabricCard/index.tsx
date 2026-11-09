/**
 * FabricCard — the design-system card container.
 *
 * Thin wrapper over MUI `Card`. Consumers compose card structure using MUI
 * `CardHeader`, `CardMedia`, `CardContent`, and `CardActions` (all
 * re-exported from `@fabric-kit/components`), plus the Fabric card parts
 * `FabricCardHeader` and `FabricCardRows`. One shell, composed per use.
 *
 * Visual defaults: an 8px radius (`radii.lg`),
 * no border, and a resting `shadows.sm`. The resting shadow is skipped when
 * the consumer opts into elevation via `raised` or `elevation`.
 *
 * Interactive cards (`onClick` set, or `interactive`) get a hover fill with
 * a lifted shadow, a pressed fill, a pointer cursor, a focus ring, and
 * button semantics (`role="button"`, `tabIndex`, Enter / Space activation).
 * `selected` paints the selected fill and exposes `aria-pressed`. `tint`
 * colours the background; a tinted card keeps its tint on
 * hover and press and only changes the shadow.
 *
 * All MUI Card props pass through: `raised`, `elevation`, `sx`, `component`,
 * `variant`. Consumer `sx` keys always win. `forwardRef` + `React.memo` +
 * `displayName` present.
 *
 * @example
 * ```tsx
 * <FabricCard onClick={open} selected={isSelected}>
 *   <FabricCardHeader avatar={<AppsIcon />} title="Rules" subheader="Manage rules" />
 * </FabricCard>
 * ```
 */

import { dark, radii, shadows, surface } from "@fabric-kit/design-tokens";
import { Card, type CardProps } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import type { KeyboardEvent } from "react";
import { forwardRef, memo, useCallback, useMemo } from "react";

/**
 * Background tints for telling kinds of cards apart, e.g. by source or owner.
 * Each one reuses a status surface token, so it follows light and dark mode.
 */
export type FabricCardTint = "neutral" | "blue" | "teal" | "lime";

const TINT_TOKENS = {
  neutral: { light: surface.queued, dark: dark.surface.queued },
  blue: { light: surface.running, dark: dark.surface.running },
  teal: { light: surface.tertiary, dark: dark.surface.tertiary },
  lime: { light: surface.success, dark: dark.surface.success },
} as const satisfies Record<FabricCardTint, { light: string; dark: string }>;

export interface FabricCardProps extends CardProps {
  /**
   * Background tint used to tell kinds of cards apart.
   * Hover and pressed keep the tint and only change the shadow.
   */
  tint?: FabricCardTint;
  /**
   * Make the card behave like a button: hover / pressed fills, pointer cursor,
   * focus ring, `role="button"` and keyboard activation.
   * @default Boolean(onClick)
   */
  interactive?: boolean;
  /**
   * Paint the selected fill. On an interactive card this also sets
   * `aria-pressed`.
   */
  selected?: boolean;
}

const HOVER_FILL = "var(--mui-palette-background-default)";
const SELECTED_FILL = "var(--mui-palette-action-selected)";
// In dark mode the action tokens are translucent tints, so they are layered
// over the paper fill instead of replacing it.
const tintLayer = (color: string) => `linear-gradient(${color}, ${color})`;

const FabricCardImpl = forwardRef<HTMLDivElement, FabricCardProps>(function FabricCard(
  { sx, raised, elevation, interactive, selected, tint, onClick, onKeyDown, className, ...rest },
  ref,
) {
  const isInteractive = interactive ?? Boolean(onClick);
  // Suppress the MUI elevation shadow only when the consumer has not opted
  // into a raised look. Consumers who want a shadow pass `raised` or
  // `elevation={n}` explicitly.
  const suppressShadow = !raised && elevation === undefined;

  const dsSx = useMemo<SxProps<Theme>>(
    () => (theme) => ({
      borderRadius: `${radii.lg}px`,
      // Zero width but keep the colour, so recipes that only set a border width or style still get it.
      border: `0 solid var(--mui-palette-divider)`,
      ...(suppressShadow ? { boxShadow: shadows.sm } : null),
      ...(tint
        ? {
            backgroundColor: TINT_TOKENS[tint].light,
            ...theme.applyStyles("dark", {
              backgroundColor: "var(--mui-palette-background-paper)",
              backgroundImage: tintLayer(TINT_TOKENS[tint].dark),
            }),
          }
        : null),
      ...(selected
        ? {
            backgroundColor: SELECTED_FILL,
            ...theme.applyStyles("dark", {
              backgroundColor: "var(--mui-palette-background-paper)",
              backgroundImage: tintLayer("var(--mui-palette-action-selected)"),
            }),
          }
        : null),
      ...(isInteractive
        ? {
            cursor: "pointer",
            transition: theme.transitions.create(["background-color", "box-shadow"], {
              duration: theme.transitions.duration.shortest,
            }),
            "&:hover": {
              boxShadow: shadows.md,
              ...(selected || tint
                ? null
                : {
                    backgroundColor: HOVER_FILL,
                    ...theme.applyStyles("dark", {
                      backgroundColor: "var(--mui-palette-background-paper)",
                      backgroundImage: tintLayer("var(--mui-palette-action-hover)"),
                    }),
                  }),
            },
            "&:active": {
              boxShadow: shadows.sm,
              ...(tint
                ? null
                : {
                    backgroundColor: SELECTED_FILL,
                    ...theme.applyStyles("dark", {
                      backgroundColor: "var(--mui-palette-background-paper)",
                      backgroundImage: tintLayer("var(--mui-palette-action-selected)"),
                    }),
                  }),
            },
            "&:focus-visible": {
              outline: "2px solid var(--mui-palette-primary-main)",
              outlineOffset: 2,
            },
          }
        : null),
    }),
    [suppressShadow, selected, isInteractive, tint],
  );

  const mergedSx = useMemo<SxProps<Theme>>(() => {
    const consumerSxArray = Array.isArray(sx) ? sx : sx ? [sx] : [];
    return [dsSx, ...consumerSxArray] as SxProps<Theme>;
  }, [dsSx, sx]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(event);
      // Only react to keys pressed on the card itself, not on nested controls.
      if (event.defaultPrevented || event.target !== event.currentTarget) return;
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        event.currentTarget.click();
      }
    },
    [onKeyDown],
  );

  const interactiveProps = isInteractive
    ? {
        role: "button",
        tabIndex: 0,
        onKeyDown: handleKeyDown,
        ...(selected === undefined ? null : { "aria-pressed": selected }),
      }
    : { onKeyDown };

  return (
    <Card
      ref={ref}
      raised={raised}
      elevation={elevation}
      className={selected ? ["Mui-selected", className].filter(Boolean).join(" ") : className}
      onClick={onClick}
      sx={mergedSx}
      {...interactiveProps}
      {...rest}
    />
  );
});

FabricCardImpl.displayName = "FabricCard";

export const FabricCard = memo(FabricCardImpl);
