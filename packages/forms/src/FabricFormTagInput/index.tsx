import type { FabricTagInputProps } from "@fabric-kit/components";
import { FabricTagInput } from "@fabric-kit/components";
import type { ReactNode } from "react";
import type { FieldPath, FieldValues } from "react-hook-form";
import type { FabricFieldProps } from "../FabricFormField";
import { FabricFormField } from "../FabricFormField";

/** Props for the FabricTagInput binding. Value and change are owned by the form. */
export type FabricFormTagInputProps<
  T extends FieldValues,
  N extends FieldPath<T> = FieldPath<T>,
  TOutput extends FieldValues = T,
> = FabricFieldProps<T, N, TOutput> &
  Omit<FabricTagInputProps, "value" | "onChange" | "onBlur" | "error" | "helperText"> & {
    helperText?: ReactNode;
  };

/**
 * React Hook Form binding for FabricTagInput. The form value is a string array, with `[]` for none.
 */
export function FabricFormTagInput<
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
}: FabricFormTagInputProps<T, N, TOutput>) {
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
        <FabricTagInput
          {...props}
          value={field.value ?? []}
          onChange={field.onChange}
          disabled={field.disabled}
          error={error}
          helperText={helperText}
        />
      )}
    </FabricFormField>
  );
}
