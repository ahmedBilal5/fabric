import {
  FabricFileUpload,
  type FabricFileUploadProps,
  type FabricUploadFile,
  type UseFileUploadOptions,
  useFileUpload,
} from "@fabric-kit/components";
import { type ReactNode, useEffect, useRef } from "react";
import type { ControllerRenderProps, FieldPath, FieldValues } from "react-hook-form";
import type { FabricFieldProps } from "../FabricFormField";
import { FabricFormField } from "../FabricFormField";

/** Props for the FabricFileUpload binding. The form holds the file list. */
export type FabricFormFileUploadProps<
  T extends FieldValues,
  N extends FieldPath<T> = FieldPath<T>,
  TOutput extends FieldValues = T,
> = FabricFieldProps<T, N, TOutput> &
  Omit<
    FabricFileUploadProps,
    "files" | "onAdd" | "onRemove" | "onRetry" | "onBlur" | "error" | "helperText"
  > & {
    /** Sends one file to your storage. See `useFileUpload`. */
    upload: UseFileUploadOptions<unknown>["upload"];
    helperText?: ReactNode;
  };

function Bound({
  field,
  upload,
  error,
  helperText,
  ...props
}: Omit<FabricFileUploadProps, "files" | "onAdd" | "onRemove" | "onRetry"> & {
  field: ControllerRenderProps<FieldValues, string>;
  upload: UseFileUploadOptions<unknown>["upload"];
}) {
  const value = (field.value ?? []) as FabricUploadFile[];
  const uploads = useFileUpload({ upload, initialFiles: value, onFilesChange: field.onChange });
  // Follow resets and loaded data.
  const own = useRef(uploads.files);
  own.current = uploads.files;
  const setFiles = uploads.setFiles;
  useEffect(() => {
    if (value !== own.current) setFiles(value);
  }, [value, setFiles]);

  return (
    <FabricFileUpload
      {...props}
      files={uploads.files}
      onAdd={uploads.add}
      onRemove={uploads.remove}
      onRetry={uploads.retry}
      onBlur={field.onBlur}
      disabled={field.disabled || props.disabled}
      error={error}
      helperText={helperText}
    />
  );
}

/**
 * React Hook Form binding for FabricFileUpload. The form value is the list of
 * `FabricUploadFile`s; each finished file's `result` holds what your `upload`
 * returned. Check in your schema that every file is done before saving:
 * `z.array(file).refine((files) => files.every((f) => f.status === "done"), "Wait for uploads to finish.")`.
 */
export function FabricFormFileUpload<
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
  upload,
  ...props
}: FabricFormFileUploadProps<T, N, TOutput>) {
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
        <Bound
          {...props}
          field={field as unknown as ControllerRenderProps<FieldValues, string>}
          upload={upload}
          error={error}
          helperText={helperText}
        />
      )}
    </FabricFormField>
  );
}
