import type { FabricSelectProps } from "@fabric-kit/components";
import { FabricSelect } from "@fabric-kit/components";
import type { ReactNode } from "react";
import type { FieldPath, FieldValues } from "react-hook-form";
import type { FabricFieldProps } from "../FabricFormField";
import { FabricFormField } from "../FabricFormField";

/** Props for the controlled FabricSelect binding. Value and change are owned by the form. */
export type FabricFormSelectProps<
  T extends FieldValues,
  N extends FieldPath<T> = FieldPath<T>,
  TOutput extends FieldValues = T,
> = FabricFieldProps<T, N, TOutput> &
  Omit<
    FabricSelectProps,
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
/** React Hook Form binding for FabricSelect, with validation feedback and focus support. */
export function FabricFormSelect<
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
}: FabricFormSelectProps<T, N, TOutput>) {
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
        <FabricSelect
          {...props}
          value={field.value ?? ""}
          onChange={field.onChange}
          name={field.name}
          disabled={field.disabled}
          error={error}
          helperText={helperText}
        />
      )}
    </FabricFormField>
  );
}
