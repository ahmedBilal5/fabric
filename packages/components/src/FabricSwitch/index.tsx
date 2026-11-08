/**
 * FabricSwitch — the design-system switch.
 *
 * Extends MUI `Switch` with a first-class `label` slot and both MUI-standard
 * `onChange(event, checked)` and the boolean shorthand `onCheckedChange(checked)`.
 * Renders bare `<Switch>` when no label is set and wraps in `<FormControlLabel>`
 * when a label is present (matches `FabricCheckbox` convention).
 *
 * Thumb slides via MUI's default transform transition. Colors route through
 * `theme.palette.<color>.main` (defaults to `primary`) so brand + dark-mode work.
 * `size` is `medium` (default, 34×20 track) or `small` (26×16 track).
 * `labelPlacement`, `labelSx`, `sx: SxProps<Theme>` all exposed. `forwardRef`,
 * `displayName`, and `React.memo` all present.
 *
 * @example
 * ```tsx
 * <FabricSwitch
 *   label="Enable notifications"
 *   checked={enabled}
 *   onCheckedChange={setEnabled}
 * />
 * ```
 */

import { duration, easing, opacity, radii } from "@fabric-kit/design-tokens";
import {
  FormControlLabel,
  type FormControlLabelProps,
  Switch,
  type SwitchProps,
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import { styled } from "@mui/material/styles";
import React, { forwardRef, memo, type ReactNode } from "react";
import { controlLabel, controlLabelSx } from "../internal/ControlLabel";

// Control dimensions: no semantic token maps to them, so they stay as literals. Colors, radii,
// timings and typography route through @fabric-kit/design-tokens.
// `medium` keeps the thumb inside the track, scaled to MUI's
// default track width; `small` is the same design at the small radio/checkbox height.
const SWITCH_SIZES = {
  medium: { height: 24, trackWidth: 34, trackHeight: 20, thumb: 16 },
  small: { height: 20, trackWidth: 26, trackHeight: 16, thumb: 12 },
} as const;
const THUMB_INSET = 2;
const HALO_PADDING = 2;

// A small custom thumb shadow; none of the shadow tokens is this subtle.
const THUMB_SHADOW = "0px 1px 4px rgba(0, 0, 0, 0.16)";

const StyledSwitch = styled(Switch)(({ theme, size }) => {
  const { height, trackWidth, trackHeight, thumb } =
    SWITCH_SIZES[size === "small" ? "small" : "medium"];
  const thumbTravel = trackWidth - thumb - THUMB_INSET * 2;
  const padY = (height - trackHeight) / 2;
  const baseLeft = THUMB_INSET - HALO_PADDING;
  const baseTop = padY + THUMB_INSET - HALO_PADDING;

  return {
    width: trackWidth,
    height,
    padding: `${padY}px 0`,
    display: "flex",
    "& .MuiSwitch-switchBase": {
      top: baseTop,
      left: baseLeft,
      padding: HALO_PADDING,
      color: theme.palette.common.white,
      "&.Mui-checked": {
        transform: `translateX(${thumbTravel}px)`,
        color: theme.palette.common.white,
        "& + .MuiSwitch-track": {
          opacity: 1,
        },
      },
      // MUI tints the disabled thumb; keep it white.
      "&.Mui-disabled, &.Mui-checked.Mui-disabled": {
        color: theme.palette.common.white,
      },
      "&.Mui-disabled + .MuiSwitch-track": {
        opacity: opacity.disabled,
      },
    },
    "& .MuiSwitch-thumb": {
      boxShadow: THUMB_SHADOW,
      width: thumb,
      height: thumb,
      borderRadius: radii.full,
      transition: theme.transitions.create("transform", {
        duration: duration.normal,
        easing: easing.inOut,
      }),
    },
    "& .MuiSwitch-track": {
      borderRadius: radii.full,
      opacity: 1,
      backgroundColor: "var(--mui-palette-action-disabled)",
      boxSizing: "border-box",
    },
  };
});

// Sensible label-size subset shared with FabricCheckbox.
export type SwitchLabelSize = "xs" | "sm" | "md" | "lg";

export interface FabricSwitchProps extends SwitchProps {
  /** Label rendered next to the switch. Omit for a bare switch (e.g. inside a table cell). */
  label?: ReactNode;
  /** Position of the label relative to the switch. */
  labelPlacement?: FormControlLabelProps["labelPlacement"];
  /** Skip FormControlLabel's automatic <Typography> wrap when passing a pre-styled label. */
  disableTypography?: boolean;
  /** Semantic label-size token. Ignored when `disableTypography` is set. */
  labelSize?: SwitchLabelSize;
  /** Style overrides for the FormControlLabel root. Prefer this over `sx` for label-side styling. */
  labelSx?: SxProps<Theme>;
  /** Show the 16px info icon after the label. Ignored when `label` is omitted. */
  showInfo?: boolean;
  /**
   * Boolean-shorthand handler for the common "just give me the checked value" case.
   * Fires AFTER `onChange` with the same value. Prefer `onChange` if you need the event.
   */
  onCheckedChange?: (checked: boolean) => void;
}

const FabricSwitchImpl = forwardRef<HTMLButtonElement, FabricSwitchProps>(function FabricSwitch(
  {
    label,
    labelPlacement = "end",
    disableTypography,
    labelSize,
    labelSx,
    showInfo,
    onCheckedChange,
    onChange,
    disabled,
    required,
    color = "primary",
    ...switchProps
  },
  ref,
) {
  const handleChange = onCheckedChange
    ? (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
        onChange?.(event, checked);
        onCheckedChange(checked);
      }
    : onChange;

  const switchEl = (
    <StyledSwitch
      ref={ref}
      color={color}
      disabled={disabled}
      required={required}
      onChange={handleChange}
      {...switchProps}
    />
  );

  if (label === undefined) return switchEl;

  return (
    <FormControlLabel
      control={switchEl}
      label={controlLabel(label, showInfo)}
      labelPlacement={labelPlacement}
      disabled={disabled}
      required={required}
      disableTypography={disableTypography}
      sx={controlLabelSx(labelSize, labelSx)}
    />
  );
});

FabricSwitchImpl.displayName = "FabricSwitch";

export const FabricSwitch = memo(FabricSwitchImpl);
