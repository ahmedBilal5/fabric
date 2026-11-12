import type { FabricDateTimePickerProps } from "@fabric-kit/date-picker";
import { FabricDateTimePicker } from "@fabric-kit/date-picker";
import type { ReactNode } from "react";
import type { FieldPath, FieldValues } from "react-hook-form";
import type { FabricFieldProps } from "../FabricFormField";
import { FabricFormField } from "../FabricFormField";

/** Props for the controlled FabricDateTimePicker binding. Value and change are owned by the form. */
export type FabricFormDateTimePickerProps<
  T extends FieldValues,
  N extends FieldPath<T> = FieldPath<T>,
  TOutput extends FieldValues = T,
> = FabricFieldProps<T, N, TOutput> &
  Omit<
    FabricDateTimePickerProps,
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
  > & { helperText?: ReactNode };
/** React Hook Form binding for FabricDateTimePicker, with validation feedback and focus support. */
export function FabricFormDateTimePicker<
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
  exact,
  ...props
}: FabricFormDateTimePickerProps<T, N, TOutput>) {
  return (
    <FabricFormField
      rootRef={rootRef}
      exact={exact}
      name={name}
      control={control}
      rules={rules}
      defaultValue={defaultValue}
      shouldUnregister={shouldUnregister}
      disabled={disabled}
      helperText={helperText}
    >
      {({ field, error, helperText }) => (
        <FabricDateTimePicker
          {...props}
          value={field.value ?? null}
          onChange={field.onChange}
          disabled={field.disabled}
          error={error}
          helperText={helperText}
        />
      )}
    </FabricFormField>
  );
}
