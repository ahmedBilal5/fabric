import { spacing } from "@fabric-kit/design-tokens";
import { Box } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import type { ReactNode } from "react";
import {
  type FieldValues,
  FormProvider,
  type SubmitErrorHandler,
  type UseFormReturn,
} from "react-hook-form";
import { FabricFormErrorSummary } from "../FabricFormErrorSummary";

export interface FabricFormProps<
  T extends FieldValues,
  // biome-ignore lint/suspicious/noExplicitAny: matches React Hook Form's own default for the context type
  TContext = any,
  TOutput extends FieldValues = T,
> {
  /** The form from `useForm`. Its fields can then omit `control`. */
  form: UseFormReturn<T, TContext, TOutput>;
  /**
   * Called with valid values. Return a promise to show the save button's loading
   * state. Throw (or reject) to show the error's message at the top of the form.
   */
  onSubmit: (values: TOutput) => unknown;
  /** Called when submission fails validation. */
  onInvalid?: SubmitErrorHandler<T>;
  /** List every problem at the top after a failed submit. @default true */
  errorSummary?: boolean;
  /** Field labels by path, used to prefix messages in the error summary. */
  errorLabels?: Record<string, string>;
  /** Sections, rows, fields and `FabricFormActions`. */
  children: ReactNode;
  /** Space between direct children. @default "xl" (24px) */
  gap?: keyof typeof spacing;
  /** `id` on the `<form>`, so a button elsewhere can submit it with `form="…"`. */
  id?: string;
  /** Accessible name, when the page has more than one form. */
  "aria-label"?: string;
  /** Id of the heading that names the form. */
  "aria-labelledby"?: string;
  /** Class on the `<form>`. */
  className?: string;
  /** System styles on the `<form>`. */
  sx?: SxProps<Theme>;
}

const fallbackMessage = "Something went wrong and your changes weren't saved. Try again.";

/**
 * FabricForm — the `<form>` element for React Hook Form, with Fabric's spacing,
 * an error summary and a place for save errors.
 *
 * It provides the form to every field inside (no `control` props needed), turns
 * off the browser's own validation bubbles, and stacks its children with even
 * spacing. If `onSubmit` throws, the message appears at the top as a form-wide
 * error and the form stays as the person left it.
 *
 * @example
 * ```tsx
 * const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues });
 * <FabricForm form={form} onSubmit={(values) => api.save(values)}>
 *   <FabricFormSection title="Contact">
 *     <FabricFormTextField<Values> name="email" label="Email" />
 *   </FabricFormSection>
 *   <FabricFormActions />
 * </FabricForm>
 * ```
 */
export function FabricForm<
  T extends FieldValues,
  // biome-ignore lint/suspicious/noExplicitAny: matches React Hook Form's own default for the context type
  TContext = any,
  TOutput extends FieldValues = T,
>({
  form,
  onSubmit,
  onInvalid,
  errorSummary = true,
  errorLabels,
  children,
  gap = "xl",
  id,
  className,
  sx,
  ...aria
}: Readonly<FabricFormProps<T, TContext, TOutput>>) {
  const submit = form.handleSubmit(async (values) => {
    try {
      await onSubmit(values);
    } catch (error) {
      form.setError("root.submit", {
        type: "submit",
        message: error instanceof Error && error.message ? error.message : fallbackMessage,
      });
    }
  }, onInvalid);

  return (
    <FormProvider {...form}>
      <Box
        component="form"
        id={id}
        noValidate
        className={className}
        aria-label={aria["aria-label"]}
        aria-labelledby={aria["aria-labelledby"]}
        onSubmit={(e) => {
          form.clearErrors("root");
          void submit(e);
        }}
        sx={[
          { display: "flex", flexDirection: "column", gap: `${spacing[gap]}px`, minWidth: 0 },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        {errorSummary && (
          <FabricFormErrorSummary
            form={form as unknown as UseFormReturn<FieldValues>}
            labels={errorLabels}
          />
        )}
        {children}
      </Box>
    </FormProvider>
  );
}
