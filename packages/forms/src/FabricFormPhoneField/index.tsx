import type { FabricPhoneFieldProps } from "@fabric-kit/components";
import { FabricPhoneField } from "@fabric-kit/components";
import type { ReactNode } from "react";
import type { FieldPath, FieldValues } from "react-hook-form";
import type { FabricFieldProps } from "../FabricFormField";
import { FabricFormField } from "../FabricFormField";

/** Props for the FabricPhoneField binding. Value and change are owned by the form. */
export type FabricFormPhoneFieldProps<
  T extends FieldValues,
  N extends FieldPath<T> = FieldPath<T>,
  TOutput extends FieldValues = T,
> = FabricFieldProps<T, N, TOutput> &
  Omit<
    FabricPhoneFieldProps,
    "ref" | "name" | "value" | "defaultValue" | "onChange" | "onBlur" | "error" | "helperText"
  > & { helperText?: ReactNode };

/**
 * React Hook Form binding for FabricPhoneField. The form value is an E.164 string such as "+442071234567", or `""`; check it with `isE164` from `@fabric-kit/components`.
 */
export function FabricFormPhoneField<
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
}: FabricFormPhoneFieldProps<T, N, TOutput>) {
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
        <FabricPhoneField
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
