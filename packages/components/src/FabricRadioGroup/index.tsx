/**
 * FabricRadioGroup — the design-system radio-group form control.
 *
 * Extends MUI `RadioGroup` with a data-driven `options` API, first-class `error`
 * and `helperText` slots, and a semantic `variant` prop (`'default' | 'warning'`).
 * Handlers follow MUI's standard `onChange(event, value)` signature (plus the
 * `onValueChange(value)` shorthand for consumers who just want the string).
 *
 * Every group instance gets a unique `useId()`-generated `name`, so multiple
 * groups on one page keep their selections independent. Stable per-option keys
 * (derived from `option.value`) prevent focus loss on parent re-render. All
 * ARIA linkage (`aria-labelledby`, `aria-describedby`) is wired via `useId()`.
 *
 *
 * @example
 * ```tsx
 * <FabricRadioGroup
 *   label="Shipping speed"
 *   value={shipping}
 *   onChange={setShipping}
 *   options={[
 *     { value: 'standard', label: 'Standard (5-7 days)' },
 *     { value: 'express',  label: 'Express (2-3 days)' },
 *     { value: 'overnight', label: 'Overnight' },
 *   ]}
 * />
 * ```
 */

import {
  FormControl,
  FormControlLabel,
  type FormControlProps,
  FormHelperText,
  FormLabel,
  RadioGroup,
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import React, { forwardRef, memo, type ReactNode, useId } from "react";
import { FabricRadio } from "../FabricRadio";
import { controlLabelTextSx } from "../internal/ControlLabel";

export interface RadioOption {
  /** Serialized value stored on the group when this option is selected. */
  value: string;
  /** Displayed label. `ReactNode` — icon+text, chips, colored spans all work. */
  label: ReactNode;
  /** Disable this individual option without disabling the whole group. */
  disabled?: boolean;
}

export type RadioGroupVariant = "default" | "warning";

export interface FabricRadioGroupProps extends Omit<FormControlProps, "onChange" | "variant"> {
  /** Group label — rendered in `<FormLabel>` and auto-wired via `aria-labelledby`. */
  label?: ReactNode;
  /** Helper or error text below the group. Auto-wired via `aria-describedby`. */
  helperText?: ReactNode;
  /** Radio options. Data-driven API — one FormControlLabel per option. */
  options: RadioOption[];
  /** Currently selected value. Empty string / undefined = no selection. */
  value?: string;
  /** MUI-standard change handler with the full event object. */
  onChange?: (event: React.ChangeEvent<HTMLInputElement>, value: string) => void;
  /** Shorthand handler for consumers who only need the value. */
  onValueChange?: (value: string) => void;
  /** Lay options horizontally instead of stacked. */
  row?: boolean;
  /** Semantic variant driving the selected-option background color. */
  variant?: RadioGroupVariant;
  /** Radio size shared by every option in the group. Defaults to `medium` (24px). */
  size?: "small" | "medium";
  /** Style overrides for the inner `<RadioGroup>`. */
  radioGroupSx?: SxProps<Theme>;
  /** Style overrides applied to each `<FormControlLabel>`. */
  optionSx?: SxProps<Theme>;
  /** Style overrides for the group `<FormLabel>`. */
  groupLabelSx?: SxProps<Theme>;
  /**
   * Custom control per option — replaces the entire radio input.
   * When set, the `size` prop no longer applies (consumer owns the control).
   */
  controlComponent?: React.ReactElement;
}

// Selected-option background. CSS variables (not `theme.palette`, which always holds the
// light values) so it follows dark mode and custom themes.
// - `default` → the theme's selected tint
// - `warning` → the warning color at 20%
function useSelectedBg(variant: RadioGroupVariant): string {
  if (variant === "warning") {
    return "rgba(var(--mui-palette-warning-mainChannel) / 0.2)";
  }
  return "var(--mui-palette-action-selected)";
}

const FabricRadioGroupImpl = forwardRef<HTMLDivElement, FabricRadioGroupProps>(
  function FabricRadioGroup(
    {
      label,
      helperText,
      options,
      value,
      onChange,
      onValueChange,
      row,
      variant = "default",
      size = "medium",
      radioGroupSx,
      optionSx,
      groupLabelSx,
      controlComponent,
      error,
      disabled,
      ...formControlProps
    },
    ref,
  ) {
    const labelId = useId();
    const helperId = useId();
    const groupName = useId();
    const selectedBg = useSelectedBg(variant);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>, nextValue: string) => {
      onChange?.(event, nextValue);
      onValueChange?.(nextValue);
    };

    return (
      <FormControl ref={ref} error={error} disabled={disabled} {...formControlProps}>
        {label !== undefined && (
          <FormLabel id={labelId} sx={groupLabelSx}>
            {label}
          </FormLabel>
        )}
        <RadioGroup
          name={groupName}
          value={value ?? ""}
          onChange={handleChange}
          row={row}
          aria-labelledby={label !== undefined ? labelId : undefined}
          aria-describedby={helperText !== undefined ? helperId : undefined}
          sx={radioGroupSx}
        >
          {options.map((option) => (
            <FormControlLabel
              key={option.value}
              value={option.value}
              // MUI's default hit-area padding keeps the group's row spacing; a bare FabricRadio has none.
              control={controlComponent ?? <FabricRadio size={size} sx={{ p: "9px" }} />}
              disabled={option.disabled}
              label={option.label}
              sx={[
                controlLabelTextSx(),
                { backgroundColor: option.value === value ? selectedBg : undefined },
                ...(Array.isArray(optionSx) ? optionSx : optionSx ? [optionSx] : []),
              ]}
            />
          ))}
        </RadioGroup>
        {helperText !== undefined && <FormHelperText id={helperId}>{helperText}</FormHelperText>}
      </FormControl>
    );
  },
);

FabricRadioGroupImpl.displayName = "FabricRadioGroup";

export const FabricRadioGroup = memo(FabricRadioGroupImpl);
