import type { FabricPasswordFieldProps } from "@fabric-kit/components";
import { FabricPasswordField } from "@fabric-kit/components";
import type { ReactNode } from "react";
import type { FieldPath, FieldValues } from "react-hook-form";
import type { FabricFieldProps } from "../FabricFormField";
import { FabricFormField } from "../FabricFormField";

/** Props for the FabricPasswordField binding. Value and change are owned by the form. */
export type FabricFormPasswordFieldProps<
  T extends FieldValues,
  N extends FieldPath<T> = FieldPath<T>,
  TOutput extends FieldValues = T,
> = FabricFieldProps<T, N, TOutput> &
  Omit<
    FabricPasswordFieldProps,
    "ref" | "name" | "value" | "defaultValue" | "onChange" | "onBlur" | "error" | "helperText"
  > & { helperText?: ReactNode };

/**
 * React Hook Form binding for FabricPasswordField. The form value is the password string. The strength meter stays visible under validation messages.
 */
export function FabricFormPasswordField<
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
}: FabricFormPasswordFieldProps<T, N, TOutput>) {
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
        <FabricPasswordField
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
