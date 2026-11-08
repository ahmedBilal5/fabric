/**
 * FabricInformationBar — a thin, single-line status bar.
 *
 * Where `FabricAlert` is a bordered card with a title and description, the information bar is a
 * compact full-width strip: an icon, one line of text, an optional `action`, and a close
 * button when `onClose` is passed. Use it for passive page-level notices.
 *
 * The six `variant` values: `default`, `information`, `success`,
 * `warning`, `cancelled`, `urgent`. Colors come from the theme's `palette.semantic`, so they
 * follow light / dark mode. `urgent` renders with `role="alert"`; every other state uses
 * `role="status"`.
 *
 *
 * @example
 * ```tsx
 * <FabricInformationBar variant="warning" onClose={dismiss}>
 *   Schema drift detected on 3 sources.
 * </FabricInformationBar>
 * ```
 */

import { iconSize, spacing, textVariant } from "@fabric-kit/design-tokens";
import CancelOutlinedIcon from "@fabric-kit/icons/CancelOutlined";
import CheckCircleOutlineOutlinedIcon from "@fabric-kit/icons/CheckCircleOutlineOutlined";
import CloseIcon from "@fabric-kit/icons/Close";
import ErrorOutlineOutlinedIcon from "@fabric-kit/icons/ErrorOutlineOutlined";
import InfoOutlinedIcon from "@fabric-kit/icons/InfoOutlined";
import WarningAmberIcon from "@fabric-kit/icons/WarningAmber";
import { IconButton } from "@mui/material";
import { styled } from "@mui/material/styles";
import React, { forwardRef, type HTMLAttributes, memo, type ReactNode } from "react";

/** State of the bar; sets the color and icon. */
export type FabricInformationBarVariant =
  | "default"
  | "information"
  | "success"
  | "warning"
  | "cancelled"
  | "urgent";

/** Keys of `theme.palette.semantic` that the bar reads its colors from. */
type SemanticState = "queued" | "running" | "success" | "warning" | "cancelled" | "error";

const VARIANT_STATE: Record<FabricInformationBarVariant, SemanticState> = {
  default: "queued",
  information: "running",
  success: "success",
  warning: "warning",
  cancelled: "cancelled",
  urgent: "error",
};

const VARIANT_ICON: Record<FabricInformationBarVariant, ReactNode> = {
  default: <InfoOutlinedIcon />,
  information: <InfoOutlinedIcon />,
  success: <CheckCircleOutlineOutlinedIcon />,
  warning: <WarningAmberIcon />,
  cancelled: <CancelOutlinedIcon />,
  urgent: <ErrorOutlineOutlinedIcon />,
};

interface BarOwnProps {
  fabricVariant: FabricInformationBarVariant;
}

// Sized so the bar reads at page level next to an alert: 8px vertical padding,
// 20px icons and 14px text make a 36px bar (`controlHeight.sm`). Below the `sm` breakpoint it uses
// a compact size: 6px vertical padding, 16px icons, 12px text, 28px tall. The compact line
// height is 14px (the `bodySm` token is 1.5), so the text line height is overridden.
const Bar = styled("div", {
  shouldForwardProp: (prop) => prop !== "fabricVariant",
})<BarOwnProps>(({ theme, fabricVariant }) => {
  // MUI CSS variables from the theme's `palette.semantic.<state>`; they follow light / dark mode.
  const state = VARIANT_STATE[fabricVariant];
  const textPrimary = "var(--mui-palette-text-primary)";

  return {
    display: "flex",
    alignItems: "center",
    boxSizing: "border-box",
    width: "100%",
    gap: `${spacing.xs}px`,
    padding: `${spacing.sm}px ${spacing.xl}px`,
    backgroundColor: `var(--mui-palette-semantic-${state}-bg)`,
    color: textPrimary,
    ...textVariant.bodyMd,
    "& .FabricInformationBar-icon": {
      display: "inline-flex",
      flexShrink: 0,
      // The default state keeps a neutral icon; the others use the semantic accent.
      color:
        fabricVariant === "default" ? textPrimary : `var(--mui-palette-semantic-${state}-main)`,
      "& .MuiSvgIcon-root": { fontSize: iconSize.lg },
    },
    "& .FabricInformationBar-text": { minWidth: 0 },
    "& .FabricInformationBar-close": {
      marginLeft: "auto",
      padding: 0,
      color: textPrimary,
      "& .MuiSvgIcon-root": { fontSize: iconSize.lg },
    },
    [theme.breakpoints.down("sm")]: {
      padding: `${theme.spacing(1.5)} ${spacing.xl}px`,
      ...textVariant.bodySm,
      lineHeight: 14 / 12,
      "& .FabricInformationBar-icon .MuiSvgIcon-root, & .FabricInformationBar-close .MuiSvgIcon-root":
        { fontSize: iconSize.sm },
    },
  };
});

export interface FabricInformationBarProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * State of the bar; sets the background, icon and icon color.
   * @default 'default'
   */
  variant?: FabricInformationBarVariant;
  /** Replace the state's icon. Pass `false` to hide it. */
  icon?: ReactNode | false;
  /** Optional action shown after the text, usually a small `FabricButton`. */
  action?: ReactNode;
  /** Shows a close button and is called when it is clicked. */
  onClose?: React.MouseEventHandler<HTMLButtonElement>;
  /**
   * Accessible label for the close button.
   * @default 'Close'
   */
  closeText?: string;
  /** The message. */
  children?: ReactNode;
}

const FabricInformationBarImpl = forwardRef<HTMLDivElement, FabricInformationBarProps>(
  function FabricInformationBar(
    { variant = "default", icon, action, onClose, closeText = "Close", children, role, ...rest },
    ref,
  ) {
    const resolvedIcon = icon === undefined ? VARIANT_ICON[variant] : icon;

    return (
      <Bar
        ref={ref}
        fabricVariant={variant}
        role={role ?? (variant === "urgent" ? "alert" : "status")}
        {...rest}
      >
        {resolvedIcon ? <span className="FabricInformationBar-icon">{resolvedIcon}</span> : null}
        <span className="FabricInformationBar-text">{children}</span>
        {action}
        {onClose ? (
          <IconButton
            className="FabricInformationBar-close"
            size="small"
            aria-label={closeText}
            onClick={onClose}
          >
            <CloseIcon />
          </IconButton>
        ) : null}
      </Bar>
    );
  },
);

FabricInformationBarImpl.displayName = "FabricInformationBar";

export const FabricInformationBar = memo(FabricInformationBarImpl);
