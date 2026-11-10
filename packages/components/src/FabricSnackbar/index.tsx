/**
 * FabricSnackbar — the design-system toast/snackbar.
 *
 * Composes MUI `Snackbar` + `FabricAlert` (`standardAlt`: white fill, semantic border, text and
 * icon) and adds a drop shadow (`shadows.md`) so the toast floats. `severity` picks the
 * FabricAlert `subVariant`: success → `completeSuccess`, info → `runningInProgressInfo`,
 * warning → `warningFailed`, error → `criticalUrgent`.
 *
 * `title` (any `ReactNode`) renders through FabricAlert's `title`. Flat
 * `vertical` / `horizontal` props default to `'top'` / `'right'` and compose
 * into MUI's `anchorOrigin`. `onClose` keeps MUI's `(event, reason) => void`.
 * `topOffset` pushes a top-anchored toast down, e.g. below a fixed banner.
 *
 * @example
 * ```tsx
 * <FabricSnackbar
 *   open={toast.open}
 *   onClose={() => setToast({ open: false })}
 *   severity="success"
 *   message="Saved."
 *   autoHideDuration={4000}
 * />
 * ```
 */

import { shadows, spacing } from "@fabric-kit/design-tokens";
import { type AlertColor, type AlertProps, Snackbar, type SnackbarProps } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import { forwardRef, memo, type ReactNode, useMemo } from "react";
import { FabricAlert, type FabricAlertProps, type FabricAlertSubVariant } from "../FabricAlert";

export interface FabricSnackbarProps
  extends Omit<SnackbarProps, "anchorOrigin" | "children" | "title"> {
  /** Header text rendered bold above the body. */
  title?: ReactNode;
  /** Body content rendered below the title. */
  children?: ReactNode;
  /** Severity. Picks the FabricAlert `subVariant` (icon + semantic color). */
  severity?: AlertColor;
  /** Vertical anchor. Defaults to `'top'`. */
  vertical?: "top" | "bottom";
  /** Horizontal anchor. Defaults to `'right'`. */
  horizontal?: "left" | "center" | "right";
  /**
   * Extra top offset in pixels, e.g. to clear a fixed banner or app bar
   * above the snackbar.
   */
  topOffset?: number;
  /** Icons per severity. Defaults to the FabricAlert icon for each severity. */
  iconMapping?: Partial<Record<AlertColor, ReactNode>>;
  /**
   * Extra FabricAlert config (className, action button, `variant`, sx). Merged into DS defaults;
   * consumer keys win. MUI `color` still overrides the severity color.
   */
  alertProps?: Omit<FabricAlertProps, "subVariant" | "onClose" | "children"> &
    Pick<AlertProps, "color">;
}

const SEVERITY_SUB_VARIANT: Record<AlertColor, FabricAlertSubVariant> = {
  success: "completeSuccess",
  info: "runningInProgressInfo",
  warning: "warningFailed",
  error: "criticalUrgent",
};

// Floating toast on top of the FabricAlert look. Consumer `alertProps.sx` keys win.
const DS_ALERT_SX: SxProps<Theme> = {
  boxShadow: shadows.md,
  height: "100%",
  // Apps pass whole messages as the title; show them as written, not capitalized per word.
  "& .MuiAlertTitle-root": { textTransform: "none" },
};

const SNACKBAR_LAYOUT_SX: SxProps<Theme> = {
  display: "flex",
  alignItems: "flex-start",
  gap: `${spacing.lg}px`,
};

const FabricSnackbarImpl = forwardRef<HTMLDivElement, FabricSnackbarProps>(function FabricSnackbar(
  {
    title,
    children,
    severity,
    vertical = "top",
    horizontal = "right",
    topOffset,
    iconMapping,
    alertProps,
    onClose,
    sx,
    ...snackbarRest
  },
  ref,
) {
  const anchorOrigin = useMemo(() => ({ vertical, horizontal }), [vertical, horizontal]);

  const { color, ...fabricAlertProps } = alertProps ?? {};
  const resolvedSeverity = color ?? severity ?? "success";

  const consumerAlertSx = (alertProps?.sx as object | undefined) ?? {};
  const mergedAlertSx = useMemo(
    () => ({
      ...(DS_ALERT_SX as object),
      ...(topOffset !== undefined ? { marginTop: `${topOffset}px` } : null),
      ...consumerAlertSx,
    }),
    [topOffset, consumerAlertSx],
  );

  const mergedSnackbarSx = useMemo(
    () => ({
      ...(SNACKBAR_LAYOUT_SX as object),
      ...((sx as object | undefined) ?? {}),
    }),
    [sx],
  );

  return (
    <Snackbar
      ref={ref}
      anchorOrigin={anchorOrigin}
      onClose={onClose}
      sx={mergedSnackbarSx}
      {...snackbarRest}
    >
      <FabricAlert
        variant="standardAlt"
        subVariant={SEVERITY_SUB_VARIANT[resolvedSeverity]}
        icon={iconMapping?.[severity ?? "success"]}
        // MUI has no close-button reason. Report Escape's, a deliberate dismissal, so handlers
        // that ignore "clickaway" (as the docs suggest) still close on the X.
        onClose={onClose ? (event) => onClose(event, "escapeKeyDown") : undefined}
        {...fabricAlertProps}
        title={title}
        sx={mergedAlertSx}
      >
        {children}
      </FabricAlert>
    </Snackbar>
  );
});

FabricSnackbarImpl.displayName = "FabricSnackbar";

export const FabricSnackbar = memo(FabricSnackbarImpl);
