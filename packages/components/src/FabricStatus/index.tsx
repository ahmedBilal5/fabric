/**
 * FabricStatus — a colored dot with a short label, for the state of a record, a job
 * or a service: "Active", "Failed", "Running".
 *
 * Lighter than `FabricTag`: no fill, so it suits table cells, lists and headers where
 * many statuses appear together. Colors come from the theme's semantic palette, so
 * they follow the brand and dark mode. `pulse` animates the dot for work in progress
 * (and stays still for people who prefer reduced motion).
 *
 * @example
 * ```tsx
 * <FabricStatus status="success" label="Active" />
 * <FabricStatus status="running" label="Deploying" pulse />
 * <FabricStatus status="error" aria-label="Failed" />  // dot only
 * ```
 */

import { fontWeight, radii, spacing } from "@fabric-kit/design-tokens";
import { keyframes, type SxProps, styled, type Theme } from "@mui/material/styles";
import { type CSSProperties, forwardRef, type HTMLAttributes, memo, type ReactNode } from "react";

/** Status colors, shared with `FabricTag` and `FabricChip`. */
export type FabricStatusColor =
  | "queued"
  | "running"
  | "success"
  | "warning"
  | "cancelled"
  | "error"
  | "suspended"
  | "archived"
  | "unknown";

/** `sm` for dense tables, `md` (default) for most places. */
export type FabricStatusSize = "sm" | "md";

export interface FabricStatusProps extends Omit<HTMLAttributes<HTMLSpanElement>, "color"> {
  /** Which status color the dot takes. @default "unknown" */
  status?: FabricStatusColor;
  /** Text next to the dot. Without it, pass `aria-label` so the status is announced. */
  label?: ReactNode;
  /** Animate the dot, for work in progress. Still when the user prefers reduced motion. */
  pulse?: boolean;
  /** Dot and text size. @default "md" */
  size?: FabricStatusSize;
  /** System styles on the root. */
  sx?: SxProps<Theme>;
}

const ripple = keyframes`
  0% { transform: scale(1); opacity: 0.55; }
  80%, 100% { transform: scale(2.6); opacity: 0; }
`;

const Root = styled("span")({
  display: "inline-flex",
  alignItems: "center",
  gap: spacing.sm,
  minWidth: 0,
  color: "var(--mui-palette-text-primary)",
  fontWeight: fontWeight.medium,
  lineHeight: 1.4,
  verticalAlign: "middle",
});

const Dot = styled("span", { shouldForwardProp: (p) => p !== "pulse" && p !== "dotSize" })<{
  pulse: boolean;
  dotSize: number;
}>(({ pulse, dotSize }) => ({
  position: "relative",
  flexShrink: 0,
  width: dotSize,
  height: dotSize,
  borderRadius: radii.full,
  backgroundColor: "var(--fabric-status-color)",
  ...(pulse && {
    "&::after": {
      content: '""',
      position: "absolute",
      inset: 0,
      borderRadius: "inherit",
      backgroundColor: "var(--fabric-status-color)",
      animation: `${ripple} 1.6s cubic-bezier(0.2, 0, 0.2, 1) infinite`,
      "@media (prefers-reduced-motion: reduce)": { animation: "none" },
    },
  }),
}));

const FabricStatusImpl = forwardRef<HTMLSpanElement, FabricStatusProps>(function FabricStatus(
  { status = "unknown", label, pulse = false, size = "md", sx, style, ...rest },
  ref,
) {
  const dotOnly = label == null || label === "";
  return (
    <Root
      ref={ref}
      // A dot alone is an image with a name; with a label, the text carries it.
      role={dotOnly ? "img" : undefined}
      data-status={status}
      sx={sx}
      style={
        {
          "--fabric-status-color": `var(--mui-palette-semantic-${status}-main)`,
          fontSize: size === "sm" ? "0.75rem" : "0.875rem",
          ...style,
        } as CSSProperties
      }
      {...rest}
    >
      <Dot aria-hidden pulse={pulse} dotSize={size === "sm" ? 6 : 8} />
      {!dotOnly && <span style={{ minWidth: 0 }}>{label}</span>}
    </Root>
  );
});

FabricStatusImpl.displayName = "FabricStatus";

/** A colored status dot with a label. */
export const FabricStatus = memo(FabricStatusImpl);
