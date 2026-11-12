import type { FabricNumberFieldProps } from "@fabric-kit/components";
import { FabricNumberField } from "@fabric-kit/components";
import type { ReactNode } from "react";
import type { FieldPath, FieldValues } from "react-hook-form";
import type { FabricFieldProps } from "../FabricFormField";
import { FabricFormField } from "../FabricFormField";

/** Props for the FabricNumberField binding. Value and change are owned by the form. */
export type FabricFormNumberFieldProps<
  T extends FieldValues,
  N extends FieldPath<T> = FieldPath<T>,
  TOutput extends FieldValues = T,
> = FabricFieldProps<T, N, TOutput> &
  Omit<
    FabricNumberFieldProps,
    "ref" | "name" | "value" | "defaultValue" | "onChange" | "onBlur" | "error" | "helperText"
  > & { helperText?: ReactNode };

/**
 * React Hook Form binding for FabricNumberField. The form value is a `number`, or `null` when empty; check required numbers with `z.number({ error: "…" })` on a nullable input.
 */
export function FabricFormNumberField<
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
}: FabricFormNumberFieldProps<T, N, TOutput>) {
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
        <FabricNumberField
          {...props}
          value={field.value ?? null}
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
