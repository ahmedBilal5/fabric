import { Box } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import type { ForwardedRef, ReactNode } from "react";
import { useCallback, useId } from "react";
import type {
  FieldPath,
  FieldValues,
  UseControllerProps,
  UseControllerReturn,
} from "react-hook-form";
import { useController } from "react-hook-form";
import { getErrorMessage } from "../internal/errors";

/** Controller options shared by Fabric bindings. Supply control or a FormProvider. */
export type FabricFieldProps<
  T extends FieldValues,
  N extends FieldPath<T> = FieldPath<T>,
  TOutput extends FieldValues = T,
> = UseControllerProps<T, N, TOutput> & {
  /** Ref to the binding container; inputRef still targets the input where supported. */
  rootRef?: ForwardedRef<HTMLDivElement>;
};

/** Controller state plus validation feedback for a custom control. */
export type FabricFormFieldState<
  T extends FieldValues,
  N extends FieldPath<T>,
> = UseControllerReturn<T, N> & {
  /** Whether React Hook Form considers this field invalid. */
  error: boolean;
  /** Validation message, falling back to the supplied helper text. */
  helperText: ReactNode;
  /** ID to put on custom helper text and reference from the input. */
  describedBy: string | undefined;
};

/** Props for binding a custom input, including groups and composite controls. */
export type FabricFormFieldProps<
  T extends FieldValues,
  N extends FieldPath<T> = FieldPath<T>,
  TOutput extends FieldValues = T,
> = FabricFieldProps<T, N, TOutput> & {
  /** Class applied to the custom-field container. */
  className?: string;
  /** Theme-aware styles for the custom-field container. */
  sx?: SxProps<Theme>;
  /** Hint shown when the field has no validation message. */
  helperText?: ReactNode;
  /** Render a control using the current value, callbacks and validation state. */
  children: (state: FabricFormFieldState<T, N>) => ReactNode;
};

/** Bind a control to React Hook Form with blur tracking and invalid-field focus. */
export function FabricFormField<
  T extends FieldValues,
  N extends FieldPath<T> = FieldPath<T>,
  TOutput extends FieldValues = T,
>({ children, helperText, rootRef, className, sx, ...props }: FabricFormFieldProps<T, N, TOutput>) {
  const state = useController<T, N, TOutput>({ ...props, exact: props.exact ?? false });
  const id = useId();
  const message = getErrorMessage(state.fieldState.error) ?? helperText;
  const fieldRef = state.field.ref;
  const attachRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (typeof rootRef === "function") rootRef(node);
      else if (rootRef) rootRef.current = node;
      // Resolve lazily: MUI replaces inputs when slots and picker views change.
      // Prefer editable controls over picker buttons, and skip hidden/disabled inputs.
      const input = () =>
        node?.querySelector<HTMLElement>(
          'input:not(:disabled):not([type="hidden"]), textarea:not(:disabled), [role="combobox"]:not([aria-disabled="true"]), [role="spinbutton"]:not([aria-disabled="true"])',
        ) ?? node?.querySelector<HTMLElement>('button:not(:disabled), [tabindex="0"]');
      const nativeInput = () =>
        node?.querySelector<HTMLInputElement | HTMLTextAreaElement>(
          'input:not(:disabled):not([type="hidden"]), textarea:not(:disabled)',
        );
      // A custom control may have registered its own non-DOM focus handle.
      if (node && !input()) return;
      fieldRef(
        node
          ? {
              focus: () => input()?.focus(),
              select: () => nativeInput()?.select(),
              setCustomValidity: (message: string) => nativeInput()?.setCustomValidity(message),
              reportValidity: () => nativeInput()?.reportValidity(),
            }
          : null,
      );
    },
    [fieldRef, rootRef],
  );
  return (
    <Box
      ref={attachRef}
      className={className}
      sx={[
        {
          // Hints and group legends remain readable when their controls are disabled.
          "& .MuiFormHelperText-root.Mui-disabled, & .MuiFormLabel-root.Mui-disabled:not(.MuiInputLabel-root)":
            {
              color: "var(--mui-palette-text-secondary)",
            },
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
      onBlurCapture={() => state.field.onBlur()}
    >
      {children({
        ...state,
        error: state.fieldState.invalid,
        helperText: message,
        describedBy: message != null ? id : undefined,
      })}
    </Box>
  );
}
