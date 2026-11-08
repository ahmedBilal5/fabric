/**
 * FabricIconButton — the design-system icon-only button. Wraps MUI `IconButton`
 * with Fabric's button look at a fixed 26px square, in the same three
 * `variant`s and two `shape`s as `FabricButton`.
 *
 * - **`variant`** — `text` (default), `outlined` or `contained`.
 * - **`shape`** — `standard` (4px, default) or `round` (24px, a circle at 26px).
 * - **`color`** — `primary` (default) or `error`, `info`, `success`, `warning`.
 *   The semantic colors reuse the semantic `FabricButton` states.
 * - **`aria-label`** — required: an icon-only control has no visible name.
 *
 * The full MUI `IconButton` surface (`size`, `disabled`, `href`, `component`,
 * event handlers, `sx`) is preserved, so call sites can still override the
 * baked-in styles. Both MUI sizes render at 26px; the icon slot is 18px in the
 * round shape and 16px in the standard one.
 *
 * @example
 * ```tsx
 * <FabricIconButton aria-label="Delete" variant="outlined" onClick={remove}>
 *   <DeleteIcon />
 * </FabricIconButton>
 * ```
 */

import {
  border,
  brand,
  dark,
  duration,
  easing,
  field,
  iconSize,
  opacity,
  radii,
  status,
  stepper,
  text,
} from "@fabric-kit/design-tokens";
import { IconButton, type IconButtonProps } from "@mui/material";
import { alpha, styled } from "@mui/material/styles";
import { forwardRef, memo } from "react";

export type FabricIconButtonVariant = "text" | "outlined" | "contained";

export type FabricIconButtonSemanticColor = "error" | "info" | "success" | "warning";

export type FabricIconButtonColor = "primary" | FabricIconButtonSemanticColor;

/** Corner style: `standard` is 4px, `round` is 24px. */
export type FabricIconButtonShape = "standard" | "round";

// Icon button frame.
const BUTTON_SIZE = 26;

interface StateColors {
  main: string;
  hover: string;
  press: string;
  subtle: string;
  onMain: string;
  /** Outline stroke at rest */
  stroke: string;
  /** Outline stroke on hover and press */
  strokeActive: string;
  /** Outline fill when selected */
  selectedBg: string;
  /** Filled button when disabled */
  disabledFill: string;
}

// Same palette as the theme's MuiButton states. Primary colors are CSS variables so a custom
// theme recolors them; dark mode hovers to the lighter primary shade.
const lightColors: StateColors = {
  main: "var(--mui-palette-primary-main)",
  hover: "var(--mui-palette-primary-dark)",
  press: brand.navy,
  subtle: text.secondary,
  onMain: "var(--mui-palette-primary-contrastText)",
  stroke: border.default,
  strokeActive: field.underline,
  selectedBg: "var(--mui-palette-action-selected)",
  disabledFill: stepper.disabledBg,
};

const darkColors: StateColors = {
  main: "var(--mui-palette-primary-main)",
  hover: "var(--mui-palette-primary-light)",
  press: "var(--mui-palette-primary-main)",
  subtle: dark.text.secondary,
  onMain: "var(--mui-palette-primary-contrastText)",
  stroke: dark.border.default,
  strokeActive: dark.border.strong,
  selectedBg: "var(--mui-palette-action-selected)",
  disabledFill: dark.stepper.disabledBg,
};

const DISABLED_TEXT = "var(--mui-palette-action-disabled)";

const primaryStyles = (variant: FabricIconButtonVariant, c: StateColors) => {
  if (variant === "contained") {
    return {
      color: c.onMain,
      backgroundColor: c.main,
      "&:hover": { backgroundColor: c.hover },
      "&:active": { backgroundColor: c.press },
      "&.Mui-selected": { backgroundColor: c.main },
      "&.Mui-disabled": { color: c.onMain, backgroundColor: c.disabledFill },
    };
  }
  if (variant === "outlined") {
    // Outline: grey stroke that darkens on hover and press; the icon turns blue.
    return {
      color: c.subtle,
      borderColor: c.stroke,
      "&:hover": { color: c.hover, backgroundColor: "transparent", borderColor: c.strokeActive },
      "&:active": { color: c.press, borderColor: c.strokeActive },
      "&.Mui-selected": { color: c.main, backgroundColor: c.selectedBg, borderColor: c.stroke },
      "&.Mui-disabled": { color: DISABLED_TEXT, borderColor: c.stroke },
    };
  }
  return {
    color: c.subtle,
    "&:hover": { color: c.hover, backgroundColor: "transparent" },
    "&:active": { color: c.press },
    "&.Mui-selected": { color: c.main },
    "&.Mui-disabled": { color: DISABLED_TEXT },
  };
};

// Semantic colors follow the semantic FabricButton states in the theme.
// Filled semantic buttons rest at full color so the icon meets contrast; hover darkens.
const SEMANTIC_HOVER_OVERLAY = "inset 0 0 0 999px rgba(0, 0, 0, 0.1)";

const semanticStyles = (
  variant: FabricIconButtonVariant,
  _color: FabricIconButtonSemanticColor,
  c: StateColors,
  base: string,
) => {
  if (variant === "contained") {
    return {
      color: c.onMain,
      backgroundColor: base,
      "&:hover": { backgroundColor: base, boxShadow: SEMANTIC_HOVER_OVERLAY },
      "&:active": { backgroundColor: base },
      "&.Mui-selected": { backgroundColor: alpha(base, opacity[50]) },
      "&.Mui-disabled": { color: c.onMain, backgroundColor: alpha(base, opacity[10]) },
    };
  }
  return {
    color: base,
    ...(variant === "outlined" && { borderColor: base }),
    "&:hover": { backgroundColor: alpha(base, opacity[5]) },
    "&:active": { backgroundColor: alpha(base, opacity[10]) },
    "&.Mui-selected": { backgroundColor: alpha(base, opacity[10]) },
    "&.Mui-disabled": {
      color: DISABLED_TEXT,
      ...(variant === "outlined" && { borderColor: c.stroke }),
    },
  };
};

const semanticBase = (color: FabricIconButtonSemanticColor, isDark: boolean) => {
  const tokens = isDark
    ? {
        error: dark.status.error,
        info: dark.brand.info,
        success: dark.status.success,
        warning: dark.status.warning,
      }
    : { error: status.error, info: brand.info, success: status.success, warning: status.warning };
  return tokens[color];
};

const colorStyles = (
  variant: FabricIconButtonVariant,
  color: FabricIconButtonColor,
  isDark: boolean,
) => {
  const c = isDark ? darkColors : lightColors;
  return color === "primary"
    ? primaryStyles(variant, c)
    : semanticStyles(variant, color, c, semanticBase(color, isDark));
};

interface StyledIconButtonOwnProps {
  shape: FabricIconButtonShape;
  fabricVariant: FabricIconButtonVariant;
  fabricColor: FabricIconButtonColor;
}

const StyledIconButton = styled(IconButton, {
  shouldForwardProp: (prop) =>
    prop !== "shape" && prop !== "fabricVariant" && prop !== "fabricColor",
})<StyledIconButtonOwnProps>(({ theme, shape, fabricVariant, fabricColor }) => ({
  boxSizing: "border-box",
  width: BUTTON_SIZE,
  height: BUTTON_SIZE,
  minWidth: BUTTON_SIZE,
  padding: 0,
  borderRadius: shape === "round" ? radii["3xl"] : radii.md,
  border: fabricVariant === "outlined" ? "1px solid" : 0,
  boxShadow: "none",
  transition: theme.transitions.create(["background-color", "border-color", "color"], {
    duration: duration.fast,
    easing: easing.inOut,
  }),
  // 18px icon slot in the round button, 16px in the standard one.
  "& .MuiSvgIcon-root": { fontSize: shape === "round" ? iconSize.md : iconSize.sm },
  ...colorStyles(fabricVariant, fabricColor, false),
  ".dark &": colorStyles(fabricVariant, fabricColor, true),
}));

export interface FabricIconButtonProps extends Omit<IconButtonProps, "color"> {
  /** Required accessible name, since the button has no visible label. */
  "aria-label": string;
  /** Button style: `text` (default), `outlined` or `contained`. */
  variant?: FabricIconButtonVariant;
  /** Color family: `primary` (default) or a semantic color such as `error` for a delete action. */
  color?: FabricIconButtonColor;
  /** Corner style: `standard` (4px, default) or `round` (24px). */
  shape?: FabricIconButtonShape;
  /** Test-id data attribute — declared so it type-checks in plain object literals. */
  "data-testid"?: string;
  /** Cypress selector — declared so it type-checks in plain object literals. */
  "data-cy"?: string;
}

const FabricIconButtonImpl = forwardRef<HTMLButtonElement, FabricIconButtonProps>(
  function FabricIconButton(
    { variant = "text", shape = "standard", color = "primary", ...rest },
    ref,
  ) {
    return (
      <StyledIconButton
        ref={ref}
        fabricVariant={variant}
        fabricColor={color}
        shape={shape}
        {...rest}
      />
    );
  },
);

FabricIconButtonImpl.displayName = "FabricIconButton";

export const FabricIconButton = memo(FabricIconButtonImpl);
