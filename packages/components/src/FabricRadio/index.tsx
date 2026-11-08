/**
 * FabricRadio — single-radio primitive analogous to FabricCheckbox.
 *
 * Rarely used standalone in real apps (radios almost always live in a group),
 * but exists so consumers can compose their own layouts via <FabricRadioGroup>
 * children when the default `options` API isn't flexible enough.
 *
 * Preserves the full MUI RadioProps surface. `onChange(event, checked)` signature
 * flows through untouched. `onCheckedChange(checked)` provided as the boolean
 * shorthand for consistency with FabricCheckbox and FabricSwitch.
 *
 * @example
 * ```tsx
 * <FabricRadio
 *   label="Standard shipping"
 *   value="standard"
 *   checked={shipping === 'standard'}
 *   onCheckedChange={(c) => c && setShipping('standard')}
 * />
 * ```
 */

import { duration, easing, opacity } from "@fabric-kit/design-tokens";
import RadioButtonChecked from "@fabric-kit/icons/RadioButtonChecked";
import RadioButtonUnchecked from "@fabric-kit/icons/RadioButtonUnchecked";
import {
  FormControlLabel,
  type FormControlLabelProps,
  Radio,
  type RadioProps,
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import { styled } from "@mui/material/styles";
import React, { forwardRef, memo, type ReactNode } from "react";
import { controlLabel, controlLabelSx } from "../internal/ControlLabel";

// Sensible label-size subset shared with FabricCheckbox and FabricSwitch.
export type RadioLabelSize = "xs" | "sm" | "md" | "lg";

// Glyph-only box (no MUI padding), `text.disabled` when off and the
// theme's primary (MUI default for `color="primary"`) when checked.
const StyledRadio = styled(Radio)(({ theme }) => ({
  padding: 0,
  color: "var(--mui-palette-text-disabled)",
  transition: theme.transitions.create("color", {
    duration: duration.fast,
    easing: easing.inOut,
  }),
  "&.Mui-disabled": { opacity: opacity.disabled },
}));

export interface FabricRadioProps extends RadioProps {
  /** Label rendered next to the radio. Omit for a bare radio (e.g. inside a table cell). */
  label?: ReactNode;
  /** Position of the label relative to the radio. */
  labelPlacement?: FormControlLabelProps["labelPlacement"];
  /** Skip FormControlLabel's automatic <Typography> wrap when passing a pre-styled label. */
  disableTypography?: boolean;
  /** Semantic label-size token. Ignored when `disableTypography` is set. */
  labelSize?: RadioLabelSize;
  /** Style overrides for the FormControlLabel root. */
  labelSx?: SxProps<Theme>;
  /** Show the 16px info icon after the label. Ignored when `label` is omitted. */
  showInfo?: boolean;
  /**
   * Boolean-shorthand handler for the "just give me the checked value" case.
   * Fires AFTER `onChange` with the same value.
   */
  onCheckedChange?: (checked: boolean) => void;
}

const FabricRadioImpl = forwardRef<HTMLButtonElement, FabricRadioProps>(function FabricRadio(
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
    value,
    size = "medium",
    ...radioProps
  },
  ref,
) {
  const handleChange = onCheckedChange
    ? (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
        onChange?.(event, checked);
        onCheckedChange(checked);
      }
    : onChange;

  const radio = (
    <StyledRadio
      ref={ref}
      icon={<RadioButtonUnchecked />}
      checkedIcon={<RadioButtonChecked />}
      disabled={disabled}
      required={required}
      onChange={handleChange}
      value={value}
      size={size}
      {...radioProps}
    />
  );

  if (label === undefined) return radio;

  return (
    <FormControlLabel
      value={value}
      control={radio}
      label={controlLabel(label, showInfo)}
      labelPlacement={labelPlacement}
      disabled={disabled}
      required={required}
      disableTypography={disableTypography}
      sx={controlLabelSx(labelSize, labelSx)}
    />
  );
});

FabricRadioImpl.displayName = "FabricRadio";

export const FabricRadio = memo(FabricRadioImpl);
