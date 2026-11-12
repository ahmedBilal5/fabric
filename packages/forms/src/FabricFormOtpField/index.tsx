import type { FabricOtpFieldProps } from "@fabric-kit/components";
import { FabricOtpField } from "@fabric-kit/components";
import type { ReactNode } from "react";
import type { FieldPath, FieldValues } from "react-hook-form";
import type { FabricFieldProps } from "../FabricFormField";
import { FabricFormField } from "../FabricFormField";

/** Props for the FabricOtpField binding. Value and change are owned by the form. */
export type FabricFormOtpFieldProps<
  T extends FieldValues,
  N extends FieldPath<T> = FieldPath<T>,
  TOutput extends FieldValues = T,
> = FabricFieldProps<T, N, TOutput> &
  Omit<FabricOtpFieldProps, "name" | "value" | "onChange" | "onBlur" | "error" | "helperText"> & {
    helperText?: ReactNode;
  };

/**
 * React Hook Form binding for FabricOtpField. The form value is the code typed so far, as a string. Validate its length in your schema.
 */
export function FabricFormOtpField<
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
}: FabricFormOtpFieldProps<T, N, TOutput>) {
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
        <FabricOtpField
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
