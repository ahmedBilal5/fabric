/**
 * FabricCheckbox — the design-system checkbox.
 *
 * Extends MUI `Checkbox` with a first-class `label` slot, `indeterminate` typed at
 * the props level, and both MUI-standard `onChange(event, checked)` and the boolean
 * shorthand `onCheckedChange(checked)`. Renders bare `<Checkbox>` when no label is set
 * and wraps in `<FormControlLabel>` when a label is present. Multi-checkbox layouts
 * belong to `<CheckboxGroup>`, not to this component.
 *
 * `disabled` and `required` propagate to both the input and the label. `labelSx`
 * exposes label styling via `SxProps<Theme>`. `disableTypography` skips the wrap for
 * consumers who pass pre-styled label content. `forwardRef` targets the underlying
 * `<input>` element (MUI convention). `React.memo` avoids re-renders in dense rows.
 *
 * @example
 * ```tsx
 * <FabricCheckbox
 *   label="Send me marketing emails"
 *   checked={optIn}
 *   onChange={(e) => setOptIn(e.target.checked)}
 * />
 * ```
 */

import { duration, easing, opacity } from "@fabric-kit/design-tokens";
import CheckBox from "@fabric-kit/icons/CheckBox";
import CheckBoxOutlineBlank from "@fabric-kit/icons/CheckBoxOutlineBlank";
import IndeterminateCheckBox from "@fabric-kit/icons/IndeterminateCheckBox";
import {
  Checkbox,
  type CheckboxProps,
  FormControlLabel,
  type FormControlLabelProps,
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import { styled } from "@mui/material/styles";
import React, { forwardRef, memo, type ReactNode } from "react";
import { controlLabel, controlLabelSx } from "../internal/ControlLabel";

// Sensible label-size subset. Full FontSize scale is available via `sx` if a
// consumer really needs `3xl` on a checkbox label.
export type CheckboxLabelSize = "xs" | "sm" | "md" | "lg";

// Glyph-only box (no MUI padding), `text.disabled` when off and the
// theme's palette color (MUI default for `color="primary"`) when checked or indeterminate.
const StyledCheckbox = styled(Checkbox)(({ theme }) => ({
  padding: 0,
  color: "var(--mui-palette-text-disabled)",
  transition: theme.transitions.create("color", {
    duration: duration.fast,
    easing: easing.inOut,
  }),
  "&.Mui-disabled": { opacity: opacity.disabled },
}));

export interface FabricCheckboxProps extends CheckboxProps {
  /** Label rendered next to the checkbox. Omit for a bare checkbox (e.g. inside a table cell). */
  label?: ReactNode;
  /** Position of the label relative to the checkbox. */
  labelPlacement?: FormControlLabelProps["labelPlacement"];
  /** Skip FormControlLabel's automatic <Typography> wrap when passing a pre-styled label. */
  disableTypography?: boolean;
  /** Semantic label-size token. Ignored when `disableTypography` is set. */
  labelSize?: CheckboxLabelSize;
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

const FabricCheckboxImpl = forwardRef<HTMLButtonElement, FabricCheckboxProps>(
  function FabricCheckbox(
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
      ...checkboxProps
    },
    ref,
  ) {
    const handleChange = onCheckedChange
      ? (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
          onChange?.(event, checked);
          onCheckedChange(checked);
        }
      : onChange;

    const checkbox = (
      <StyledCheckbox
        ref={ref}
        icon={<CheckBoxOutlineBlank />}
        checkedIcon={<CheckBox />}
        indeterminateIcon={<IndeterminateCheckBox />}
        disabled={disabled}
        required={required}
        onChange={handleChange}
        {...checkboxProps}
      />
    );

    if (label === undefined) return checkbox;

    return (
      <FormControlLabel
        control={checkbox}
        label={controlLabel(label, showInfo)}
        labelPlacement={labelPlacement}
        disabled={disabled}
        required={required}
        disableTypography={disableTypography}
        sx={controlLabelSx(labelSize, labelSx)}
      />
    );
  },
);

FabricCheckboxImpl.displayName = "FabricCheckbox";

export const FabricCheckbox = memo(FabricCheckboxImpl);
