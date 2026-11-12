import type { CheckboxGroupProps } from "@fabric-kit/components";
import { CheckboxGroup, FabricCheckbox } from "@fabric-kit/components";
import type { ReactNode } from "react";
import type { FieldPath, FieldValues } from "react-hook-form";
import type { FabricFieldProps } from "../FabricFormField";
import { FabricFormField } from "../FabricFormField";
import { setMembership } from "../internal/selection";

/** One option in a bound checkbox group. */
export interface FabricFormCheckboxOption {
  /** String stored in the selected-values array. */
  value: string;
  /** Visible checkbox label. */
  label: ReactNode;
  /** Disable this option while keeping its current value. */
  disabled?: boolean;
}

/** A string-array checkbox field with data-driven options. */
export type FabricFormCheckboxGroupProps<
  T extends FieldValues,
  N extends FieldPath<T> = FieldPath<T>,
  TOutput extends FieldValues = T,
> = FabricFieldProps<T, N, TOutput> &
  Omit<CheckboxGroupProps, "ref" | "children" | "error" | "onChange" | "defaultValue"> & {
    options: FabricFormCheckboxOption[];
  };

/** Bind a set of checkboxes to one array field. */
export function FabricFormCheckboxGroup<
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
  options,
  ...props
}: FabricFormCheckboxGroupProps<T, N, TOutput>) {
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
      {({ field, error, helperText }) => {
        const values: unknown[] = Array.isArray(field.value) ? field.value : [];
        return (
          <CheckboxGroup {...props} disabled={field.disabled} error={error} helperText={helperText}>
            {options.map((option) => (
              <FabricCheckbox
                key={option.value}
                name={field.name}
                label={option.label}
                disabled={field.disabled || option.disabled}
                checked={values.includes(option.value)}
                onChange={(_, checked) =>
                  field.onChange(setMembership(values, option.value, checked))
                }
              />
            ))}
          </CheckboxGroup>
        );
      }}
    </FabricFormField>
  );
}
