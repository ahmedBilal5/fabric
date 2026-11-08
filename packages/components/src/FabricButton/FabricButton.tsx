/**
 * FabricButton — the design-system button. Wraps MUI `Button` with Fabric's
 * look (4px `standard` or 24px `round` corners, a semi-bold capitalized label,
 * no shadow, compact padding driven by `size`) and extensions:
 *
 * - **`shape`** — `standard` (4px, default) or `round` (24px) corners.
 * - **`loading`** — shows a spinner in place of children and blocks clicks.
 * - **`tooltip`** — wraps the button in an MUI Tooltip; works even when the
 *   button is `disabled` (the button is span-wrapped internally).
 * - **`menu`** — turns the button into a split-dropdown; passing a non-empty
 *   array attaches a caret and opens a Fabric menu below the button. The button
 *   shows its active look while the menu is open. Items can be `destructive`
 *   (error color).
 *
 * The full MUI `Button` surface (`variant`, `color`, `size`, `startIcon`,
 * `endIcon`, `href`, `component`, event handlers, `sx`) is preserved via
 * spread — consumers can override any of the baked-in styles per call site.
 *
 *
 * @example
 * ```tsx
 * <FabricButton variant="contained" onClick={handleSave} loading={saving}>
 *   Save
 * </FabricButton>
 *
 * <FabricButton
 *   variant="outlined"
 *   endIcon={<ArrowDropDownIcon />}
 *   menu={[
 *     { label: 'Duplicate', onClick: () => duplicate() },
 *     { label: 'Delete', onClick: () => remove() },
 *   ]}
 * >
 *   Actions
 * </FabricButton>
 * ```
 */

import {
  brand,
  duration,
  easing,
  fontFamily,
  fontSize,
  fontWeight,
  iconSize,
  letterSpacing,
  lineHeight,
  radii,
  shadows,
  spacing,
  textVariant,
} from "@fabric-kit/design-tokens";
import ArrowDropDownIcon from "@fabric-kit/icons/ArrowDropDown";
import ArrowDropUpIcon from "@fabric-kit/icons/ArrowDropUp";
import {
  Button,
  type ButtonProps,
  CircularProgress,
  Tooltip,
  type TooltipProps,
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import { styled } from "@mui/material/styles";
import React, { forwardRef, memo, type ReactNode, useState } from "react";
import { FabricMenu } from "../FabricMenu";

/** Corner style: `standard` is 4px, `round` is 24px. */
export type FabricButtonShape = "standard" | "round";

// Label sizes: small 12/18 (26px tall), medium 14/20 (28px), large 16/24 (40px).
const sizeSpec = {
  small: {
    fontSize: fontSize.sm,
    lineHeight: lineHeight.normal,
    padY: spacing.xs,
    padX: spacing.sm,
  },
  medium: {
    fontSize: fontSize.md,
    lineHeight: textVariant.uiLg.lineHeight,
    padY: spacing.xs,
    padX: spacing.sm,
  },
  large: {
    fontSize: fontSize.lg,
    lineHeight: lineHeight.normal,
    padY: spacing.sm,
    padX: spacing.lg,
  },
} as const;

interface StyledButtonOwnProps {
  shape: FabricButtonShape;
  hasStartIcon: boolean;
  hasEndIcon: boolean;
}

// Font, letter spacing and state colors come from the theme's MuiButton override.
// This wrapper owns shape, padding and size; consumers can still override via `sx`.
const StyledButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== "shape" && prop !== "hasStartIcon" && prop !== "hasEndIcon",
})<StyledButtonOwnProps>(
  ({ theme, shape, hasStartIcon, hasEndIcon, size = "medium", variant = "text" }) => {
    const spec = sizeSpec[size === "small" || size === "large" ? size : "medium"];
    // The outline is drawn inside the button, so the 1px outline border is taken out of the padding.
    const border = variant === "outlined" ? 1 : 0;
    const padX = spec.padX + (shape === "round" ? spacing.xs : 0);
    // The icon side is tighter than the label side.
    const padLeft = (hasStartIcon ? spacing.xs : padX) - border;
    const padRight = (hasEndIcon ? spacing.xs : padX) - border;
    return {
      borderRadius: shape === "round" ? radii["3xl"] : radii.md,
      padding: `${spec.padY - border}px ${padRight}px ${spec.padY - border}px ${padLeft}px`,
      fontSize: spec.fontSize,
      lineHeight: spec.lineHeight,
      boxShadow: "none",
      transition: theme.transitions.create(
        ["background-color", "box-shadow", "border-color", "color"],
        { duration: duration.fast, easing: easing.inOut },
      ),
      "&:hover": { boxShadow: "none" },
      "&:active": { boxShadow: "none" },
      "&.Mui-focusVisible": { boxShadow: "none" },
      "& .MuiButton-startIcon, & .MuiButton-endIcon": { margin: 0 },
      "& .MuiButton-startIcon": { marginRight: theme.spacing(0.5) },
      "& .MuiButton-endIcon": { marginLeft: theme.spacing(0.5) },
      "& .MuiButton-startIcon > *:nth-of-type(1), & .MuiButton-endIcon > *:nth-of-type(1)": {
        fontSize: size === "large" ? iconSize.md : iconSize.sm,
      },
    };
  },
);

export interface FabricButtonMenuItem {
  /** Menu-item content. */
  label: ReactNode;
  /** Click handler for this specific menu item. Closes the menu on invocation. */
  onClick: (event: React.MouseEvent<HTMLElement>) => void;
  /** Disable the item without hiding it. */
  disabled?: boolean;
  /** Icon rendered before the label. Named `startIcon` to match MUI's Button prop naming. */
  startIcon?: ReactNode;
  /** Render the item in the error color, e.g. a "Delete" row. */
  destructive?: boolean;
  /** Style overrides for this specific MenuItem. */
  sx?: SxProps<Theme>;
  /** Test hook (kebab-case matches HTML data attribute convention). */
  "data-testid"?: string;
}

interface MenuItemStateColors {
  hover: string;
  press: string;
}

const menuItemStateSx = (c: MenuItemStateColors) => ({
  "&:hover": { backgroundColor: "transparent", color: c.hover },
  "&:active": { color: c.press },
});

// Menu rows: 14/20 body-font label; hover and press colors as the buttons.
const MENU_ITEM_BASE_SX = {
  fontFamily: fontFamily.body,
  fontWeight: fontWeight.semiBold,
  fontSize: fontSize.md,
  lineHeight: textVariant.uiLg.lineHeight,
  letterSpacing: letterSpacing.wide,
  textTransform: "capitalize",
  borderRadius: `${radii.md}px`,
  "&.Mui-disabled": { color: "text.disabled", opacity: 1 },
} as const;

// Label and disabled colors come from the theme palette; hover and press have no palette key.
const MENU_ITEM_SX = {
  ...MENU_ITEM_BASE_SX,
  color: "text.primary",
  ...menuItemStateSx({ hover: "var(--mui-palette-primary-dark)", press: brand.navy }),
  ".dark &": menuItemStateSx({
    hover: "var(--mui-palette-primary-light)",
    press: "var(--mui-palette-primary-main)",
  }),
};

// Destructive rows are red and keep that color on hover and press.
const MENU_ITEM_DESTRUCTIVE_SX = {
  ...MENU_ITEM_BASE_SX,
  color: "error.main",
  ...menuItemStateSx({ hover: "error.main", press: "error.main" }),
};

// Menu panel: 4px corners, 1px border, 12px padding, rows 2px apart.
const MENU_PAPER_SX = {
  borderRadius: `${radii.md}px`,
  border: "1px solid var(--mui-palette-divider)",
  boxShadow: shadows.md,
  minWidth: 0,
} as const;

const MENU_LIST_SX = {
  padding: `${spacing.md}px`,
  display: "flex",
  flexDirection: "column",
  gap: `${spacing.xs / 2}px`,
  // Replaces FabricMenu's own row layout (40px rows, 12px side padding) with compact 26px rows.
  "& .MuiMenuItem-root": {
    minHeight: 0,
    padding: `1px ${spacing.sm}px 1px ${spacing.xs}px`,
    gap: `${spacing.xs / 2}px`,
  },
  "& .MuiListItemIcon-root": { minWidth: 0, color: "inherit" },
  "& .MuiListItemIcon-root > svg": { fontSize: iconSize.xl },
} as const;

const toSxArray = (sx: SxProps<Theme> | undefined) => {
  if (!sx) return [];
  return Array.isArray(sx) ? sx : [sx];
};

export interface FabricButtonProps extends ButtonProps {
  /** Corner style: `standard` (4px, default) or `round` (24px). */
  shape?: FabricButtonShape;
  /** `small` (26px), `medium` (28px, default) or `large` (40px). */
  size?: ButtonProps["size"];
  /** Show a spinner in place of children and block interaction. */
  loading?: boolean | null;
  /** Wrap the button in an MUI Tooltip. Works with `disabled` because the button is span-wrapped. */
  tooltip?: Omit<TooltipProps, "children">;
  /** Render a split-button dropdown. Passing a non-empty array attaches a caret and opens a Menu on click. */
  menu?: FabricButtonMenuItem[];
  /** Test-id data attribute — declared so it type-checks in plain object literals (`FabricButtonProps[]`). */
  "data-testid"?: string;
  /** Cypress selector — declared so it type-checks in plain object literals. */
  "data-cy"?: string;
}

const FabricButtonImpl = forwardRef<HTMLButtonElement, FabricButtonProps>(function FabricButton(
  {
    loading,
    tooltip,
    menu,
    disabled,
    children,
    onClick,
    endIcon,
    shape = "standard",
    className,
    ...rest
  },
  ref,
) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const menuOpen = Boolean(anchorEl) && !!menu?.length;
  // The open menu gives the button its active look via the theme's `.Mui-selected` styles.
  const buttonClassName = [className, menuOpen ? "Mui-selected" : null].filter(Boolean).join(" ");

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (menu?.length) {
      setAnchorEl(event.currentTarget);
    }
    onClick?.(event);
  };

  const handleMenuClose = () => setAnchorEl(null);

  const resolvedEndIcon = menu?.length ? (
    menuOpen ? (
      <ArrowDropUpIcon fontSize="small" />
    ) : (
      <ArrowDropDownIcon fontSize="small" />
    )
  ) : (
    endIcon
  );

  // <span> wrapper preserves MUI Tooltip behaviour on disabled buttons —
  // Tooltip needs a non-disabled DOM child to hang its listeners on.
  const button = (
    <span>
      <StyledButton
        ref={ref}
        shape={shape}
        hasStartIcon={!!rest.startIcon}
        hasEndIcon={!!resolvedEndIcon}
        className={buttonClassName || undefined}
        disabled={disabled || !!loading}
        onClick={handleClick}
        endIcon={resolvedEndIcon}
        {...rest}
      >
        {loading ? <CircularProgress size={20} color="inherit" /> : children}
      </StyledButton>
    </span>
  );

  const wrapped = tooltip ? <Tooltip {...tooltip}>{button}</Tooltip> : button;

  return (
    <>
      {wrapped}
      {menu?.length ? (
        <FabricMenu
          anchorEl={anchorEl}
          open={menuOpen}
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          transformOrigin={{ vertical: "top", horizontal: "left" }}
          slotProps={{ paper: { sx: MENU_PAPER_SX }, list: { sx: MENU_LIST_SX } }}
          items={menu.map((item) => ({
            label: item.label,
            icon: item.startIcon,
            disabled: item.disabled,
            testId: item["data-testid"],
            sx: [item.destructive ? MENU_ITEM_DESTRUCTIVE_SX : MENU_ITEM_SX, ...toSxArray(item.sx)],
            onClick: (e: React.MouseEvent<HTMLElement>) => {
              item.onClick(e);
              handleMenuClose();
            },
          }))}
        />
      ) : null}
    </>
  );
});

FabricButtonImpl.displayName = "FabricButton";

export const FabricButton = memo(FabricButtonImpl);
