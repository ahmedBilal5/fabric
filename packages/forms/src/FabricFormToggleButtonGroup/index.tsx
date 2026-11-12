import type { FabricToggleButtonGroupProps } from "@fabric-kit/components";
import { FabricToggleButtonGroup } from "@fabric-kit/components";
import type { ReactNode } from "react";
import type { FieldPath, FieldValues } from "react-hook-form";
import type { FabricFieldProps } from "../FabricFormField";
import { FabricFormField } from "../FabricFormField";
import { FieldFeedback } from "../internal/FieldFeedback";

/** Props for the controlled FabricToggleButtonGroup binding. Value and change are owned by the form. */
export type FabricFormToggleButtonGroupProps<
  T extends FieldValues,
  N extends FieldPath<T> = FieldPath<T>,
  TOutput extends FieldValues = T,
> = FabricFieldProps<T, N, TOutput> &
  Omit<
    FabricToggleButtonGroupProps,
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
/** React Hook Form binding for FabricToggleButtonGroup, with validation feedback and focus support. */
export function FabricFormToggleButtonGroup<
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
}: FabricFormToggleButtonGroupProps<T, N, TOutput>) {
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
      {({ field, error, helperText, describedBy }) => (
        <FieldFeedback
          error={error}
          helperText={helperText}
          id={describedBy}
          disabled={field.disabled}
        >
          <FabricToggleButtonGroup
            {...props}
            value={field.value ?? (props.exclusive === false ? [] : null)}
            onChange={(_, value: unknown) => field.onChange(value)}
            aria-describedby={describedBy}
            aria-invalid={error}
            disabled={field.disabled}
          />
        </FieldFeedback>
      )}
    </FabricFormField>
  );
}
