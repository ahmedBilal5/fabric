/**
 * FabricSelect — the design-system select.
 *
 * Extends MUI `Select` with a data-driven `options` API (each option accepts an
 * icon slot + label + disabled), typed `renderValue` that searches BOTH the
 * `options` and the `children` slot, `label: ReactNode`, first-class `error`/
 * `helperText`, and `containerSx` for the outer wrapper.
 *
 * `onChange` receives the MUI event; `onValueChange` is a shorthand that receives
 * the value. Both fire when set. Option icons accept a `ReactNode` or an image URL.
 * The label is linked with `useId()`, and the ref goes to the MUI `Select` root.
 *
 * @example
 * ```tsx
 * <FabricSelect
 *   label="Category"
 *   value={category}
 *   onChange={(e) => setCategory(e.target.value)}
 *   options={[
 *     { value: 'electronics', label: 'Electronics' },
 *     { value: 'apparel',     label: 'Apparel' },
 *   ]}
 * />
 * ```
 */

import { spacing } from "@fabric-kit/design-tokens";
import { FabricInline, FabricText } from "@fabric-kit/primitives";
import {
  Box,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  type SelectChangeEvent,
  type SelectProps,
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import React, { forwardRef, memo, type ReactNode, useId } from "react";

export interface SelectOption {
  /** Value stored when this option is picked. */
  value: string;
  /** Option label. */
  label: ReactNode;
  /** Icon rendered before the label: a `ReactNode`, or an image URL. */
  icon?: ReactNode | string;
  /** Disable this individual option. */
  disabled?: boolean;
}

export interface FabricSelectProps
  extends Omit<SelectProps<string>, "onChange" | "renderValue" | "label" | "value"> {
  /** Currently selected value. */
  value: string;
  /** Options to render. You can also pass `<MenuItem>` children. */
  options?: SelectOption[];
  /** Placeholder shown when no value is selected. */
  placeholder?: string;
  /** Show the raw value alongside the label in each menu item. */
  showValue?: boolean;
  /** MUI-standard onChange with the full event object. */
  onChange?: (event: SelectChangeEvent<string>, child: ReactNode) => void;
  /** Shorthand handler: fires with the value after `onChange`. */
  onValueChange?: (value: string, event?: SelectChangeEvent<string>, child?: ReactNode) => void;
  /**
   * Custom render for the selected value. When omitted, falls back to
   * icon + label lookup across BOTH `options` and `children` MenuItems.
   */
  renderValue?: (selected: string) => ReactNode;
  /** Styles for the outer wrapper. Defaults to `{ minWidth: 120 }`. */
  containerSx?: SxProps<Theme>;
  /** FormControl `required` — adds asterisk to label. */
  required?: boolean;
  /** FormControl `error` state. */
  error?: boolean;
  /** Helper text below the select. Auto-wired via `aria-describedby`. */
  helperText?: ReactNode;
  /** Label above the select. */
  label?: ReactNode;
}

// Outline, radius and colors come from the theme. Only the fixed height
// (40px, 32px small) and the flex-centred value stay local.
const baseOutlinedSx: SxProps<Theme> = {
  "& .MuiInputBase-root": { height: "40px", minHeight: "40px" },
  "& .MuiInputBase-sizeSmall": { height: "32px", minHeight: "32px" },
  "& .MuiSelect-select": {
    display: "flex",
    alignItems: "center",
    minHeight: "unset",
    paddingTop: 0,
    paddingBottom: 0,
  },
};

// Menu attached below the field: 4px inset, 26px rows, 2px gap.
const menuPaperSx: SxProps<Theme> = {
  mt: 0,
  p: 0.5,
  borderRadius: "4px",
  border: "1px solid var(--mui-palette-divider)",
  boxShadow: "0 0 12px -2px rgba(0, 0, 0, 0.25)",
  "& .MuiMenu-list": { p: 0, display: "flex", flexDirection: "column", gap: "2px" },
  "& .MuiMenuItem-root": {
    minHeight: 26,
    py: "1px",
    pl: 1,
    pr: 1,
    borderRadius: "4px",
    fontSize: 14,
    lineHeight: "20px",
  },
};

function renderIcon(icon: ReactNode | string, alt: ReactNode): ReactNode {
  if (typeof icon === "string") {
    return (
      <img src={icon} alt={typeof alt === "string" ? alt : ""} style={{ width: 24, height: 24 }} />
    );
  }
  return icon;
}

const FabricSelectImpl = forwardRef<HTMLDivElement, FabricSelectProps>(function FabricSelect(
  {
    value,
    options,
    placeholder,
    showValue = false,
    onChange,
    onValueChange,
    renderValue,
    containerSx,
    required = false,
    error,
    helperText,
    label,
    size = "medium",
    MenuProps,
    children,
    ...selectProps
  },
  ref,
) {
  const labelId = useId();
  const helperId = useId();

  const handleChange = (event: SelectChangeEvent<string>, child: ReactNode) => {
    const next = event.target.value;
    onChange?.(event, child);
    onValueChange?.(next, event, child);
  };

  // renderValue lookup — searches options first, then children.
  const internalRenderValue = (selected: string): ReactNode => {
    if (renderValue) return renderValue(selected);

    const matchedOption = options?.find((option) => option.value === selected);

    if (matchedOption) {
      return (
        <FabricInline gap="md" sx={{ pl: `${spacing.sm}px` }}>
          {matchedOption.icon && renderIcon(matchedOption.icon, matchedOption.label)}
          <FabricText component="span">{matchedOption.label}</FabricText>
        </FabricInline>
      );
    }

    // Search consumer's <MenuItem> children by value.
    const childMenuItem = React.Children.toArray(children).find((child) => {
      if (!React.isValidElement(child)) return false;
      return (child.props as { value?: string }).value === selected;
    });

    if (childMenuItem && React.isValidElement(childMenuItem)) {
      return (
        <FabricInline gap="md" sx={{ pl: `${spacing.sm}px` }}>
          <FabricText component="span">
            {(childMenuItem.props as { children?: ReactNode }).children}
          </FabricText>
        </FabricInline>
      );
    }

    return (
      <FabricText component="span" color="text.secondary">
        {placeholder || "Select an option"}
      </FabricText>
    );
  };

  return (
    <Box sx={{ minWidth: 120, ...(containerSx as object) }}>
      <FormControl fullWidth size={size} required={required} error={error} sx={baseOutlinedSx}>
        {label !== undefined && <InputLabel id={labelId}>{label}</InputLabel>}
        <Select
          ref={ref as React.Ref<HTMLDivElement>}
          value={value}
          labelId={labelId}
          label={label as string | undefined}
          onChange={handleChange}
          renderValue={internalRenderValue}
          fullWidth
          aria-describedby={helperText !== undefined ? helperId : undefined}
          {...selectProps}
          MenuProps={{
            anchorOrigin: { vertical: "bottom", horizontal: "left" },
            transformOrigin: { vertical: "top", horizontal: "left" },
            ...MenuProps,
            slotProps: {
              ...MenuProps?.slotProps,
              paper: { ...(MenuProps?.slotProps?.paper as object), sx: menuPaperSx },
            },
          }}
        >
          {options?.map((option) => (
            <MenuItem
              key={option.value}
              value={option.value}
              disabled={option.disabled}
              sx={menuItemSx}
            >
              {option.icon && renderIcon(option.icon, option.label)}
              {showValue ? <span>{option.value} - </span> : null}
              {option.label}
            </MenuItem>
          ))}
          {children ?? null}
        </Select>
        {helperText !== undefined && <FormHelperText id={helperId}>{helperText}</FormHelperText>}
      </FormControl>
    </Box>
  );
});

FabricSelectImpl.displayName = "FabricSelect";

export const FabricSelect = memo(FabricSelectImpl);

const menuItemSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1.5,
};
