import type { FabricSwitchProps } from "@fabric-kit/components";
import { FabricSwitch } from "@fabric-kit/components";
import type { ReactNode } from "react";
import type { FieldPath, FieldValues } from "react-hook-form";
import type { FabricFieldProps } from "../FabricFormField";
import { FabricFormField } from "../FabricFormField";
import { FieldFeedback } from "../internal/FieldFeedback";

/** Props for the controlled FabricSwitch binding. Value and change are owned by the form. */
export type FabricFormSwitchProps<
  T extends FieldValues,
  N extends FieldPath<T> = FieldPath<T>,
  TOutput extends FieldValues = T,
> = FabricFieldProps<T, N, TOutput> &
  Omit<
    FabricSwitchProps,
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
/** React Hook Form binding for FabricSwitch, with validation feedback and focus support. */
export function FabricFormSwitch<
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
}: FabricFormSwitchProps<T, N, TOutput>) {
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
          <FabricSwitch
            {...props}
            checked={Boolean(field.value)}
            onChange={(_, checked) => field.onChange(checked)}
            name={field.name}
            slotProps={{
              ...props.slotProps,
              input: (ownerState) => {
                const input =
                  typeof props.slotProps?.input === "function"
                    ? props.slotProps.input(ownerState)
                    : props.slotProps?.input;
                return {
                  ...input,
                  "aria-describedby":
                    [input?.["aria-describedby"], describedBy].filter(Boolean).join(" ") ||
                    undefined,
                  "aria-invalid": error,
                };
              },
            }}
            disabled={field.disabled}
          />
        </FieldFeedback>
      )}
    </FabricFormField>
  );
}
