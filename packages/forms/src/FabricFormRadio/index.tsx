import type { FabricRadioProps } from "@fabric-kit/components";
import { FabricRadio } from "@fabric-kit/components";
import type { ReactNode } from "react";
import type { FieldPath, FieldValues } from "react-hook-form";
import type { FabricFieldProps } from "../FabricFormField";
import { FabricFormField } from "../FabricFormField";
import { FieldFeedback } from "../internal/FieldFeedback";

/** Bind a standalone radio option to a string field shared by its siblings. */
export type FabricFormRadioProps<
  T extends FieldValues,
  N extends FieldPath<T> = FieldPath<T>,
  TOutput extends FieldValues = T,
> = FabricFieldProps<T, N, TOutput> &
  Omit<
    FabricRadioProps,
    | "ref"
    | "name"
    | "value"
    | "defaultValue"
    | "checked"
    | "defaultChecked"
    | "onChange"
    | "onCheckedChange"
    | "onBlur"
  > & { value: string; helperText?: ReactNode };

/** Controlled radio option. Prefer FabricFormRadioGroup for labelled groups. */
export function FabricFormRadio<
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
}: FabricFormRadioProps<T, N, TOutput>) {
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
          <FabricRadio
            {...props}
            name={name}
            checked={field.value === props.value}
            onChange={() => field.onChange(props.value)}
            disabled={field.disabled}
            slotProps={{
              ...props.slotProps,
              input: (ownerState) => {
                const input =
                  typeof props.slotProps?.input === "function"
                    ? props.slotProps.input(ownerState)
                    : props.slotProps?.input;
                return {
                  ...input,
                  "aria-invalid": error,
                  "aria-describedby":
                    [input?.["aria-describedby"], describedBy].filter(Boolean).join(" ") ||
                    undefined,
                };
              },
            }}
          />
        </FieldFeedback>
      )}
    </FabricFormField>
  );
}
