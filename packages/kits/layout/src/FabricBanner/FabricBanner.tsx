import { FabricButton, FabricCircularProgress } from "@fabric-kit/components";
import { zIndex } from "@fabric-kit/design-tokens";
import CheckCircleIcon from "@fabric-kit/icons/CheckCircle";
import ErrorIcon from "@fabric-kit/icons/Error";
import InfoIcon from "@fabric-kit/icons/Info";
import WarningAmberIcon from "@fabric-kit/icons/WarningAmber";
import { FabricFlex, FabricText } from "@fabric-kit/primitives";
import { type ReactNode, useEffect, useRef } from "react";
import type { FabricBannerProps, FabricBannerSeverity } from "../types";

const FIXED_SX = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  zIndex: zIndex.appBar,
} as const;

const SEVERITY_ICON: Record<FabricBannerSeverity, ReactNode> = {
  info: <InfoIcon />,
  success: <CheckCircleIcon />,
  warning: <WarningAmberIcon />,
  error: <ErrorIcon />,
};

/**
 * Full-width, app-level announcement bar: maintenance windows, trial
 * expiry, "you are viewing as another user", read-only mode and similar
 * messages that apply to the whole app rather than one page.
 *
 * Standalone, it pins to the top of the viewport (`fixed`, the default) and
 * reports its height through `onHeightChange` so you can offset your layout.
 * Inside `FabricAppShell`, pass it to `bannerSlot` with `fixed={false}` and
 * the shell handles the offset.
 *
 * @example
 * ```tsx
 * <FabricAppShell
 *   bannerSlot={
 *     <FabricBanner
 *       fixed={false}
 *       severity="warning"
 *       message="You are viewing the app as Jane Cooper (jane@acme.dev)"
 *       action={{ label: "Exit", onClick: stopImpersonating }}
 *     />
 *   }
 *   {...shellProps}
 * />
 * ```
 */
const SEMANTIC_STATE = {
  info: "running",
  success: "success",
  warning: "warning",
  error: "error",
} as const;

export function FabricBanner({
  message,
  severity = "info",
  icon,
  action,
  fixed = true,
  onHeightChange,
  sx,
}: FabricBannerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!onHeightChange || !ref.current) return;
    const observer = new ResizeObserver(([entry]) => {
      onHeightChange(entry.contentRect.height);
    });
    observer.observe(ref.current);
    onHeightChange(ref.current.offsetHeight);
    return () => observer.disconnect();
  }, [onHeightChange]);

  const palette = `var(--mui-palette-${severity}`;
  // The theme's semantic tints are made for text on top; layering them over the paper
  // color keeps the (translucent) dark-mode tints solid.
  const tint = `var(--mui-palette-semantic-${SEMANTIC_STATE[severity]}-bg)`;

  return (
    <FabricFlex
      ref={ref}
      role={severity === "error" || severity === "warning" ? "alert" : "status"}
      align="center"
      justify="space-between"
      gap="sm"
      sx={{
        background: `linear-gradient(${tint}, ${tint}), var(--mui-palette-background-paper)`,
        px: 2,
        py: 0.5,
        minHeight: 45,
        ...(fixed ? FIXED_SX : undefined),
        ...sx,
      }}
    >
      <FabricFlex align="center" gap="sm" sx={{ flex: 1, minWidth: 0 }}>
        {icon !== null && (
          <FabricFlex sx={{ color: `${palette}-main)`, flexShrink: 0 }}>
            {icon ?? SEVERITY_ICON[severity]}
          </FabricFlex>
        )}
        <FabricText textVariant="uiMd" truncate sx={{ color: "var(--mui-palette-text-primary)" }}>
          {message}
        </FabricText>
      </FabricFlex>

      {action && (
        <FabricButton
          size="small"
          variant="contained"
          color={severity}
          disabled={action.loading}
          onClick={action.onClick}
          sx={{ borderRadius: 20, minWidth: 0, px: 1.5, height: 26, boxShadow: "none" }}
        >
          {action.loading ? <FabricCircularProgress size={18} color="inherit" /> : action.label}
        </FabricButton>
      )}
    </FabricFlex>
  );
}
