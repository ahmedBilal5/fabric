/**
 * FabricMeter — how much of something is used ("8 of 10 seats") or done ("3 of 5
 * steps"), as a thin bar with a label and the value in words.
 *
 * Two kinds:
 * - `quota` (default): usage against a limit. It turns amber, then red, as it fills,
 *   and says so in words ("Nearly full", "Limit reached"), so color is never the only cue.
 *   Screen readers get `role="meter"`.
 * - `progress`: how far along a task is. Always the brand color, `role="progressbar"`.
 *
 * @example
 * ```tsx
 * <FabricMeter label="Seats" value={8} max={10} unit="seats" />
 * <FabricMeter kind="progress" label="Setup" value={3} max={5} unit="steps" />
 * ```
 */

import { fontSize, fontWeight, radii, spacing } from "@fabric-kit/design-tokens";
import ErrorIcon from "@fabric-kit/icons/Error";
import WarningAmberIcon from "@fabric-kit/icons/WarningAmberRounded";
import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";
import { forwardRef, memo, type ReactNode, useId } from "react";
import {
  type FabricMeterLevel,
  type FabricMeterThresholds,
  meterState,
  meterValueText,
} from "./meter";

export type { FabricMeterLevel, FabricMeterThresholds } from "./meter";
export { meterState, meterValueText } from "./meter";

export interface FabricMeterProps {
  /** What is measured, e.g. "Seats" or "Storage". */
  label: ReactNode;
  /** Current amount. May go above `max` for overage. */
  value: number;
  /** The limit or total. @default 100 */
  max?: number;
  /** @default 0 */
  min?: number;
  /** `quota` for usage against a limit, `progress` for how far along a task is. @default "quota" */
  kind?: "quota" | "progress";
  /** Plural noun for the value, e.g. "seats" gives "8 of 10 seats". */
  unit?: string;
  /** How the value reads: "8 of 10", "80%" or "8". @default "fraction" */
  format?: "fraction" | "percent" | "value";
  /** Replace the value text, e.g. "4.2 GB of 10 GB". Also read by screen readers. */
  valueText?: string;
  /**
   * Where a quota turns amber and red, as fractions of `max`. Ignored for progress.
   * @default { warning: 0.8, critical: 1 }
   */
  thresholds?: FabricMeterThresholds;
  /** Words shown at each level. @default { warning: "Nearly full", critical: "Limit reached" } */
  statusText?: Partial<Record<Exclude<FabricMeterLevel, "normal">, ReactNode>>;
  /** Extra text under the bar, e.g. "Resets on 1 December". */
  helperText?: ReactNode;
  /** Bar thickness. @default "medium" */
  size?: "small" | "medium";
  /** Hide the label visually (it's still read out), e.g. inside a table cell. */
  hideLabel?: boolean;
  /** Locale for numbers. Defaults to the browser's. */
  locale?: string;
  /** System styles on the root. */
  sx?: SxProps<Theme>;
  /** Class on the root. */
  className?: string;
}

const fill: Record<FabricMeterLevel, string> = {
  normal: "var(--mui-palette-primary-main)",
  warning: "var(--mui-palette-warning-main)",
  critical: "var(--mui-palette-error-main)",
};

const statusColor = {
  warning: "var(--mui-palette-semantic-warning-text)",
  critical: "var(--mui-palette-semantic-error-text)",
} as const;

const srOnly = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  whiteSpace: "nowrap",
} as const;

const FabricMeterImpl = forwardRef<HTMLDivElement, FabricMeterProps>(function FabricMeter(
  {
    label,
    value,
    max = 100,
    min = 0,
    kind = "quota",
    unit,
    format = "fraction",
    valueText,
    thresholds = { warning: 0.8, critical: 1 },
    statusText,
    helperText,
    size = "medium",
    hideLabel = false,
    locale,
    sx,
    className,
  },
  ref,
) {
  const id = useId();
  const quota = kind === "quota";
  const state = meterState(value, { min, max, thresholds: quota ? thresholds : undefined });
  const text = valueText ?? meterValueText(value, { min, max, unit, format, locale });
  const status =
    state.level === "normal"
      ? null
      : (statusText?.[state.level] ??
        (state.level === "warning" ? "Nearly full" : state.over ? "Over limit" : "Limit reached"));
  const spokenStatus = typeof status === "string" ? `, ${status}` : "";
  const thickness = size === "small" ? 4 : 8;
  const color = fill[state.level];

  return (
    <Box
      ref={ref}
      className={className}
      sx={[
        { display: "flex", flexDirection: "column", gap: `${spacing.xs}px`, minWidth: 0 },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Box
        sx={[
          {
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: `${spacing.sm}px`,
            fontSize: fontSize.md,
          },
          hideLabel && { justifyContent: "flex-end" },
        ]}
      >
        <Box
          id={`${id}-label`}
          sx={
            hideLabel
              ? srOnly
              : {
                  fontWeight: fontWeight.medium,
                  color: "var(--mui-palette-text-primary)",
                  minWidth: 0,
                }
          }
        >
          {label}
        </Box>
        <Box
          aria-hidden="true"
          sx={{
            color: "var(--mui-palette-text-secondary)",
            fontVariantNumeric: "tabular-nums",
            whiteSpace: "nowrap",
          }}
        >
          {text}
        </Box>
      </Box>
      <Box
        role={quota ? "meter" : "progressbar"}
        aria-labelledby={`${id}-label`}
        aria-describedby={helperText ? `${id}-help` : undefined}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={Math.min(max, Math.max(min, value))}
        aria-valuetext={`${text}${spokenStatus}`}
        sx={{
          position: "relative",
          height: thickness,
          borderRadius: `${radii.full}px`,
          overflow: "hidden",
          // The track is a pale step of the fill's own color, so the state reads across the bar.
          backgroundColor: `color-mix(in srgb, ${color} 16%, transparent)`,
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            right: "auto",
            width: `${state.ratio * 100}%`,
            borderRadius: `${radii.full}px`,
            backgroundColor: color,
            transition: "width 300ms ease, background-color 150ms",
            "@media (prefers-reduced-motion: reduce)": { transition: "none" },
          }}
        />
      </Box>
      {(status || helperText) && (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            columnGap: `${spacing.sm}px`,
            fontSize: fontSize.sm,
            color: "var(--mui-palette-text-secondary)",
          }}
        >
          {status && state.level !== "normal" && (
            <Box
              component="span"
              aria-hidden="true"
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: "2px",
                fontWeight: fontWeight.semiBold,
                color: statusColor[state.level],
                "& svg": { fontSize: 14 },
              }}
            >
              {state.level === "warning" ? <WarningAmberIcon /> : <ErrorIcon />}
              {status}
            </Box>
          )}
          {helperText && (
            <Box component="span" id={`${id}-help`}>
              {helperText}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
});

FabricMeterImpl.displayName = "FabricMeter";

/** A labelled bar for usage against a limit, or progress through a task. */
export const FabricMeter = memo(FabricMeterImpl);
