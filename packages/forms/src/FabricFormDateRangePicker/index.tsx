import type { FabricDateRangePickerProps } from "@fabric-kit/date-picker";
import { FabricDateRangePicker } from "@fabric-kit/date-picker";
import { Box } from "@mui/material";
import type { ReactNode } from "react";
import type { FieldPath, FieldValues } from "react-hook-form";
import type { FabricFieldProps } from "../FabricFormField";
import { FabricFormField } from "../FabricFormField";

/** Props for the controlled FabricDateRangePicker binding. Value and change are owned by the form. */
export type FabricFormDateRangePickerProps<
  T extends FieldValues,
  N extends FieldPath<T> = FieldPath<T>,
  TOutput extends FieldValues = T,
> = FabricFieldProps<T, N, TOutput> &
  Omit<
    FabricDateRangePickerProps,
    | "ref"
    | "name"
    | "value"
    | "defaultValue"
    | "checked"
    | "defaultChecked"
    | "onChange"
    | "onBlur"
    | "onValueChange"
    | "onCheckedChange"
    | "error"
    | "helperText"
  > & {
    helperText?: ReactNode;
    /** Class applied to the range binding container. */
    className?: string;
    /** Accessible name for the composite range and its validation feedback. */
    "aria-label"?: string;
  };
/** React Hook Form binding for FabricDateRangePicker, with validation feedback and focus support. */
export function FabricFormDateRangePicker<
  T extends FieldValues,
  N extends FieldPath<T> = FieldPath<T>,
  TOutput extends FieldValues = T,
>({
  name,
  control,
  rules,
  defaultValue,
  shouldUnregister,
  disabled,
  helperText,
  rootRef,
  className,
  "aria-label": ariaLabel = "Date range",
  exact,
  ...props
}: FabricFormDateRangePickerProps<T, N, TOutput>) {
  return (
    <FabricFormField
      rootRef={rootRef}
      className={className}
      exact={exact}
      name={name}
      control={control}
      rules={rules}
      defaultValue={defaultValue}
      shouldUnregister={shouldUnregister}
      disabled={disabled}
      helperText={helperText}
    >
      {({ field, error, helperText, describedBy }) => (
        <Box
          role="group"
          aria-label={ariaLabel}
          aria-describedby={describedBy}
          aria-invalid={error}
        >
          <FabricDateRangePicker
            {...props}
            value={field.value ?? { start: null, end: null }}
            onChange={field.onChange}
            disabled={field.disabled}
            error={error}
            helperText={helperText != null ? <span id={describedBy}>{helperText}</span> : undefined}
          />
        </Box>
      )}
    </FabricFormField>
  );
}
