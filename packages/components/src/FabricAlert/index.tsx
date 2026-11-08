/**
 * FabricAlert — the design-system alert / banner.
 *
 * Wraps MUI `Alert`. `children` accepts rich content, `title` renders an
 * `<AlertTitle>`, `collapsible` animates enter/exit with `<Collapse>`, and
 * `autoHideMs` calls `onClose` after a delay (opt-in).
 *
 * Pick a `variant` for the visual treatment and a `subVariant` for the meaning.
 * Colors come from the theme's `palette.semantic`. `subVariant` replaces MUI's
 * `severity`, `color` and `iconMapping`.
 *
 * `icon`, `action`, `onClose` and all other MUI Alert props pass through.
 *
 * @example
 * ```tsx
 * <FabricAlert variant="standard" subVariant="criticalUrgent" title="Urgent" onClose={close}>
 *   The import failed.
 * </FabricAlert>
 * ```
 */

import { fontSize, iconSize, radii, spacing, textVariant } from "@fabric-kit/design-tokens";
import CancelOutlinedIcon from "@fabric-kit/icons/CancelOutlined";
import CheckCircleOutlineOutlinedIcon from "@fabric-kit/icons/CheckCircleOutlineOutlined";
import CloseIcon from "@fabric-kit/icons/Close";
import ErrorOutlineOutlinedIcon from "@fabric-kit/icons/ErrorOutlineOutlined";
import InfoOutlinedIcon from "@fabric-kit/icons/InfoOutlined";
import WarningAmberIcon from "@fabric-kit/icons/WarningAmber";
import { Alert, type AlertProps, AlertTitle, Collapse, IconButton } from "@mui/material";
import { styled } from "@mui/material/styles";
import React, { forwardRef, memo, type ReactNode, useEffect } from "react";

export type { FabricInformationBarProps, FabricInformationBarVariant } from "./InformationBar";
export { FabricInformationBar } from "./InformationBar";

/**
 * Visual treatment of the alert.
 *
 * - `standard`: tinted background, colored border and text.
 * - `standardAlt`: paper background, colored border and text.
 * - `outlined`: paper background, colored border, default text color.
 * - `filled`: solid color with contrasting text.
 */
export type FabricAlertVariant = "standard" | "standardAlt" | "outlined" | "filled";

/**
 * Meaning of the alert; sets the color and icon.
 *
 * - `criticalUrgent`: errors and urgent problems (red).
 * - `cancelledExpire`: cancelled or expired items (grey).
 * - `warningFailed`: warnings and failures that need attention (orange).
 * - `runningInProgressInfo`: information and work in progress (blue).
 * - `completeSuccess`: completed and successful actions (green).
 */
export type FabricAlertSubVariant =
  | "criticalUrgent"
  | "cancelledExpire"
  | "warningFailed"
  | "runningInProgressInfo"
  | "completeSuccess";

/** Keys of `theme.palette.semantic` that alerts read their colors from. */
type SemanticState = "error" | "cancelled" | "warning" | "running" | "success";

const SUB_VARIANT_STATE: Record<FabricAlertSubVariant, SemanticState> = {
  criticalUrgent: "error",
  cancelledExpire: "cancelled",
  warningFailed: "warning",
  runningInProgressInfo: "running",
  completeSuccess: "success",
};

const SUB_VARIANT_ICON: Record<FabricAlertSubVariant, ReactNode> = {
  criticalUrgent: <ErrorOutlineOutlinedIcon />,
  cancelledExpire: <CancelOutlinedIcon />,
  warningFailed: <WarningAmberIcon />,
  runningInProgressInfo: <InfoOutlinedIcon />,
  completeSuccess: <CheckCircleOutlineOutlinedIcon />,
};

interface StyledAlertOwnProps {
  fabricVariant: FabricAlertVariant;
  fabricState: SemanticState;
}

// Colors are MUI CSS variables (the theme's `palette.semantic.<state>.{main,bg,text}`), so light /
// dark mode switches without a re-render. Layout: 8px padding and gap,
// 4px radius, scaled down so a corner alert sits in proportion with the information bar: 14px
// text and 20px icons, and 12px text and 16px icons below the `sm` breakpoint.
const semanticColor = (state: SemanticState, key: "main" | "bg" | "text") =>
  `var(--mui-palette-semantic-${state}-${key})`;

const StyledAlert = styled(Alert, {
  shouldForwardProp: (prop) => prop !== "fabricVariant" && prop !== "fabricState",
})<StyledAlertOwnProps>(({ theme, fabricVariant, fabricState }) => {
  const accent = semanticColor(fabricState, "main");
  const filled = fabricVariant === "filled";
  const background = filled
    ? accent
    : fabricVariant === "standard"
      ? semanticColor(fabricState, "bg")
      : "var(--mui-palette-background-paper)";
  const textColor = filled
    ? "var(--mui-palette-primary-contrastText)"
    : fabricVariant === "outlined"
      ? "var(--mui-palette-text-primary)"
      : semanticColor(fabricState, "text");
  const iconColor = filled ? "var(--mui-palette-primary-contrastText)" : accent;
  const closeColor = filled
    ? "var(--mui-palette-primary-contrastText)"
    : fabricVariant === "standard"
      ? accent
      : "var(--mui-palette-text-primary)";

  // The design draws the 1px stroke inside the frame, while a CSS border adds to the box, so the
  // padding gives up that pixel to keep every variant the same height.
  const borderWidth = filled ? 0 : 1;

  return {
    gap: `${spacing.sm}px`,
    padding: `${spacing.sm - borderWidth}px`,
    borderRadius: radii.md,
    border: filled ? "none" : `${borderWidth}px solid ${accent}`,
    backgroundColor: background,
    color: textColor,
    boxShadow: "none",
    ...textVariant.bodyMd,
    "& .MuiAlert-icon": {
      marginRight: 0,
      padding: 0,
      opacity: 1,
      color: iconColor,
      "& .MuiSvgIcon-root": { fontSize: iconSize.lg },
    },
    // The content column has 2px vertical padding; the theme spacing base is 4px.
    "& .MuiAlert-message": {
      padding: `${theme.spacing(0.5)} 0`,
    },
    "& .MuiAlertTitle-root": {
      ...textVariant.headingXs,
      margin: `0 0 ${spacing.sm}px`,
      textTransform: "capitalize",
    },
    "& .MuiAlert-action": {
      alignItems: "flex-start",
      gap: `${spacing.sm}px`,
      margin: "0 0 0 auto",
      padding: 0,
      "& .MuiIconButton-root": { padding: 0, color: closeColor },
      "& .MuiSvgIcon-root": { fontSize: iconSize.lg },
    },
    [theme.breakpoints.down("sm")]: {
      gap: `${spacing.xs}px`,
      ...textVariant.bodySm,
      "& .MuiAlert-icon .MuiSvgIcon-root, & .MuiAlert-action .MuiSvgIcon-root": {
        fontSize: iconSize.sm,
      },
      "& .MuiAlertTitle-root": { fontSize: fontSize.sm },
    },
  };
});

/**
 * Props for `FabricAlert`. MUI's `severity`, `color` and `iconMapping` are omitted: `subVariant`
 * sets the color and icon, and `icon` still overrides the icon per alert.
 */
export interface FabricAlertProps
  extends Omit<AlertProps, "title" | "variant" | "severity" | "color" | "iconMapping"> {
  /** Optional title rendered as `<AlertTitle>` above the body. */
  title?: ReactNode;
  /**
   * Visual treatment. `standard` is tinted, `standardAlt` and `outlined` are white with a colored
   * border (`standardAlt` keeps the semantic text color), `filled` is a solid semantic fill.
   * @default 'standard'
   */
  variant?: FabricAlertVariant;
  /**
   * Meaning of the alert; sets the color and icon.
   * @default 'completeSuccess'
   */
  subVariant?: FabricAlertSubVariant;
  /**
   * Wrap the alert in `<Collapse in={open}>` so it animates in / out.
   * Requires `open` to drive the collapsed state.
   */
  collapsible?: boolean;
  /**
   * Controlled open state — only used when `collapsible` is set.
   * @default true
   */
  open?: boolean;
  /**
   * Auto-close delay in milliseconds. When set, `onClose` fires after the
   * timeout. Off by default.
   */
  autoHideMs?: number;
}

const FabricAlertImpl = forwardRef<HTMLDivElement, FabricAlertProps>(function FabricAlert(
  {
    title,
    variant = "standard",
    subVariant = "completeSuccess",
    icon,
    action,
    collapsible = false,
    open = true,
    autoHideMs,
    onClose,
    closeText = "Close",
    children,
    ...rest
  },
  ref,
) {
  useEffect(() => {
    if (!autoHideMs || !open || !onClose) return;
    const id = window.setTimeout(() => {
      onClose({} as React.SyntheticEvent);
    }, autoHideMs);
    return () => window.clearTimeout(id);
  }, [autoHideMs, open, onClose]);

  // MUI shows only `action` when both are set; Fabric shows the action and the close
  // button together, so compose them here.
  const resolvedAction =
    action && onClose ? (
      <>
        {action}
        <IconButton size="small" color="inherit" aria-label={closeText} onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </>
    ) : (
      action
    );

  const alertNode = (
    <StyledAlert
      ref={ref}
      fabricVariant={variant}
      fabricState={SUB_VARIANT_STATE[subVariant]}
      variant={variant === "standardAlt" ? "standard" : variant}
      icon={icon ?? SUB_VARIANT_ICON[subVariant]}
      action={resolvedAction}
      onClose={onClose}
      closeText={closeText}
      {...rest}
    >
      {title ? <AlertTitle>{title}</AlertTitle> : null}
      {children}
    </StyledAlert>
  );

  if (!collapsible) return alertNode;
  return <Collapse in={open}>{alertNode}</Collapse>;
});

FabricAlertImpl.displayName = "FabricAlert";

export const FabricAlert = memo(FabricAlertImpl);
