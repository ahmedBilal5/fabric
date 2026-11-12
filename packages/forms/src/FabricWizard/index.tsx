import { FabricButton, FabricStepper } from "@fabric-kit/components";
import { fontWeight, radii, spacing } from "@fabric-kit/design-tokens";
import { Box, LinearProgress } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import { type ReactNode, useEffect, useId, useRef, useState } from "react";
import {
  type FieldPath,
  type FieldValues,
  FormProvider,
  type UseFormReturn,
  useWatch,
} from "react-hook-form";
import { FabricFormErrorSummary } from "../FabricFormErrorSummary";
import { fillFieldsSx } from "../internal/fill";

/** One step of a wizard. */
export interface FabricWizardStep<T extends FieldValues> {
  /** Stable id. */
  id: string;
  /** Step name, shown in the stepper and as the step's heading. */
  label: ReactNode;
  /** One line under the heading. */
  description?: ReactNode;
  /** Fields checked before moving on. Leave out for steps with nothing to check. */
  fields?: FieldPath<T>[];
  /** The step's fields. */
  content: ReactNode;
}

export interface FabricWizardProps<
  T extends FieldValues,
  // biome-ignore lint/suspicious/noExplicitAny: matches React Hook Form's own default for the context type
  TContext = any,
  TOutput extends FieldValues = T,
> {
  /** The form from `useForm`, holding every step's values. */
  form: UseFormReturn<T, TContext, TOutput>;
  /** The steps, in order. */
  steps: FabricWizardStep<T>[];
  /** Called with all values from the last step. Throw to show the message above the step. */
  onSubmit: (values: TOutput) => unknown;
  /** Adds a final step that shows everything before submitting. */
  review?: ReactNode | ((values: T) => ReactNode);
  /** Label of the review step. @default "Review" */
  reviewLabel?: ReactNode;
  /** Description of the review step. @default "Check your answers before you submit." */
  reviewDescription?: ReactNode;
  /** The current step index, to control it (e.g. from the URL). */
  step?: number;
  /** Called when the step changes. */
  onStepChange?: (index: number) => void;
  /** Shows a Cancel button. */
  onCancel?: () => void;
  /** @default "Continue" */
  nextLabel?: ReactNode;
  /** @default "Back" */
  backLabel?: ReactNode;
  /** @default "Submit" */
  submitLabel?: ReactNode;
  /** @default "Cancel" */
  cancelLabel?: ReactNode;
  /** Class on the root. */
  className?: string;
  /** System styles on the root. */
  sx?: SxProps<Theme>;
}

/**
 * FabricWizard — a form split into steps, with a stepper, Back and Continue, and
 * an optional review step.
 *
 * Continue checks only the current step's `fields`, so people fix problems where
 * they are. Finished steps in the stepper can be clicked to go back. Pressing
 * Enter in a field moves to the next step rather than submitting early. Focus
 * moves to each new step's heading, and the step number is announced.
 *
 * @example
 * ```tsx
 * <FabricWizard
 *   form={form}
 *   steps={[
 *     { id: "company", label: "Company", fields: ["name", "size"], content: <CompanyFields /> },
 *     { id: "billing", label: "Billing", fields: ["email", "plan"], content: <BillingFields /> },
 *   ]}
 *   review={(values) => <Summary values={values} />}
 *   onSubmit={(values) => api.createWorkspace(values)}
 * />
 * ```
 */
export function FabricWizard<
  T extends FieldValues,
  // biome-ignore lint/suspicious/noExplicitAny: matches React Hook Form's own default for the context type
  TContext = any,
  TOutput extends FieldValues = T,
>({
  form,
  steps,
  onSubmit,
  review,
  reviewLabel = "Review",
  reviewDescription = "Check your answers before you submit.",
  step,
  onStepChange,
  onCancel,
  nextLabel = "Continue",
  backLabel = "Back",
  submitLabel = "Submit",
  cancelLabel = "Cancel",
  className,
  sx,
}: Readonly<FabricWizardProps<T, TContext, TOutput>>) {
  const baseId = useId();
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const firstRender = useRef(true);
  const [ownStep, setOwnStep] = useState(0);
  const [reached, setReached] = useState(0);
  const values = useWatch({ control: form.control }) as T;

  const all = review
    ? [
        ...steps,
        {
          id: "__review",
          label: reviewLabel,
          description: reviewDescription,
          content: typeof review === "function" ? review(values) : review,
        } as FabricWizardStep<T>,
      ]
    : steps;
  const index = Math.min(step ?? ownStep, all.length - 1);
  const current = all[index];
  const last = index === all.length - 1;
  const submitting = form.formState.isSubmitting;

  const go = (next: number) => {
    setOwnStep(next);
    setReached((r) => Math.max(r, next));
    onStepChange?.(next);
  };

  // Move focus to the new step so keyboard and screen-reader users start at the top.
  // biome-ignore lint/correctness/useExhaustiveDependencies: runs when the step changes
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [index]);

  const next = async () => {
    const ok = current.fields?.length
      ? await form.trigger(current.fields, { shouldFocus: true })
      : true;
    if (ok) go(index + 1);
  };

  const submit = form.handleSubmit(async (v) => {
    try {
      await onSubmit(v);
    } catch (error) {
      form.setError("root.submit", {
        type: "submit",
        message:
          error instanceof Error && error.message
            ? error.message
            : "Something went wrong and this wasn't submitted. Try again.",
      });
    }
  });

  return (
    <FormProvider {...form}>
      <Box
        component="form"
        noValidate
        className={className}
        aria-labelledby={`${baseId}-heading`}
        onSubmit={(e) => {
          e.preventDefault();
          if (!last) {
            void next();
            return;
          }
          form.clearErrors("root");
          void submit(e);
        }}
        sx={[
          { display: "flex", flexDirection: "column", gap: `${spacing.xl}px`, minWidth: 0 },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        <Box sx={{ display: { xs: "none", sm: "block" } }}>
          <FabricStepper
            activeStep={index}
            steps={all.map((s, i) => ({
              key: s.id,
              label: s.label,
              completed: i !== index && i <= reached,
              disabled: i > reached,
            }))}
            onStepClick={(i) => {
              if (i <= reached && i !== index) go(i);
            }}
          />
        </Box>
        <Box sx={{ display: { xs: "block", sm: "none" } }}>
          <LinearProgress
            variant="determinate"
            value={((index + 1) / all.length) * 100}
            aria-hidden
            sx={{ height: 4, borderRadius: `${radii.full}px` }}
          />
        </Box>

        <Box
          component="section"
          aria-labelledby={`${baseId}-heading`}
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: `${spacing.xl}px`,
            p: { xs: `${spacing.lg}px`, sm: `${spacing.xl}px` },
            borderRadius: `${radii.xl}px`,
            border: "1px solid var(--mui-palette-divider)",
            backgroundColor: "var(--mui-palette-background-paper)",
          }}
        >
          <Box>
            <Box
              sx={{
                fontSize: "0.75rem",
                fontWeight: fontWeight.semiBold,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: "var(--mui-palette-text-secondary)",
              }}
            >
              Step {index + 1} of {all.length}
            </Box>
            <Box
              component="h2"
              id={`${baseId}-heading`}
              ref={headingRef}
              tabIndex={-1}
              sx={{
                m: 0,
                mt: `${spacing.xs}px`,
                fontSize: "1.25rem",
                lineHeight: 1.35,
                fontWeight: fontWeight.semiBold,
                color: "var(--mui-palette-text-primary)",
                outline: "none",
              }}
            >
              <Box
                component="span"
                sx={{
                  position: "absolute",
                  width: 1,
                  height: 1,
                  overflow: "hidden",
                  clip: "rect(0 0 0 0)",
                }}
              >
                {`Step ${index + 1} of ${all.length}: `}
              </Box>
              {current.label}
            </Box>
            {current.description && (
              <Box
                sx={{
                  mt: `${spacing.xs}px`,
                  fontSize: "0.875rem",
                  color: "var(--mui-palette-text-secondary)",
                }}
              >
                {current.description}
              </Box>
            )}
          </Box>
          {last && <FabricFormErrorSummary form={form as unknown as UseFormReturn<FieldValues>} />}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: `${spacing.xlsm}px`,
              ...fillFieldsSx,
            }}
          >
            {current.content}
          </Box>
        </Box>

        <Box
          sx={{ display: "flex", alignItems: "center", gap: `${spacing.sm}px`, flexWrap: "wrap" }}
        >
          {onCancel && (
            <FabricButton type="button" variant="text" onClick={onCancel} disabled={submitting}>
              {cancelLabel}
            </FabricButton>
          )}
          <Box sx={{ ml: "auto", display: "flex", gap: `${spacing.sm}px` }}>
            {index > 0 && (
              <FabricButton
                type="button"
                variant="outlined"
                onClick={() => go(index - 1)}
                disabled={submitting}
              >
                {backLabel}
              </FabricButton>
            )}
            {last ? (
              <FabricButton type="submit" variant="contained" loading={submitting}>
                {submitLabel}
              </FabricButton>
            ) : (
              <FabricButton type="button" variant="contained" onClick={() => void next()}>
                {nextLabel}
              </FabricButton>
            )}
          </Box>
        </Box>
      </Box>
    </FormProvider>
  );
}
