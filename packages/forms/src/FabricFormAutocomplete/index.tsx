import type { FabricAutocompleteProps } from "@fabric-kit/components";
import { FabricAutocomplete } from "@fabric-kit/components";
import type { FieldPath, FieldValues } from "react-hook-form";
import type { FabricFieldProps } from "../FabricFormField";
import { FabricFormField } from "../FabricFormField";

/** Generic autocomplete binding, preserving object options, multiple selection and free solo. */
export type FabricFormAutocompleteProps<
  T extends FieldValues,
  Option,
  Multiple extends boolean | undefined = false,
  DisableClearable extends boolean | undefined = false,
  FreeSolo extends boolean | undefined = false,
  N extends FieldPath<T> = FieldPath<T>,
  TOutput extends FieldValues = T,
> = FabricFieldProps<T, N, TOutput> &
  Omit<
    FabricAutocompleteProps<Option, Multiple, DisableClearable, FreeSolo>,
    "ref" | "name" | "value" | "defaultValue" | "onChange" | "onBlur" | "error"
  >;

/** Bind an autocomplete without erasing MUI's option and selection generics. */
export function FabricFormAutocomplete<
  T extends FieldValues,
  Option,
  Multiple extends boolean | undefined = false,
  DisableClearable extends boolean | undefined = false,
  FreeSolo extends boolean | undefined = false,
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
}: FabricFormAutocompleteProps<T, Option, Multiple, DisableClearable, FreeSolo, N, TOutput>) {
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
        <FabricAutocomplete
          {...props}
          value={field.value}
          onChange={(_, value) => field.onChange(value)}
          disabled={field.disabled}
          error={error}
          helperText={helperText}
        />
      )}
    </FabricFormField>
  );
}
