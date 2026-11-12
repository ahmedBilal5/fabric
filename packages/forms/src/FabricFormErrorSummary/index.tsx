import { fontWeight, radii, spacing } from "@fabric-kit/design-tokens";
import ErrorIcon from "@fabric-kit/icons/Error";
import { Box } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import { type ReactNode, useEffect, useRef } from "react";
import { type FieldValues, type UseFormReturn, useFormContext } from "react-hook-form";
import { type FabricFormErrorItem, flattenErrors } from "../internal/flattenErrors";

export type { FabricFormErrorItem } from "../internal/flattenErrors";
export { flattenErrors } from "../internal/flattenErrors";

export interface FabricFormErrorSummaryProps {
  /** The form. Optional inside `FabricForm` or a `FormProvider`. */
  form?: UseFormReturn<FieldValues>;
  /** Heading. Receives the number of problems. @default "Fix N problems to continue" */
  title?: ReactNode | ((count: number) => ReactNode);
  /** Field labels by path, to prefix each message ("Email: Enter a valid email"). */
  labels?: Record<string, string>;
  /** Move focus to the summary when it appears. Use it on long forms. @default false */
  focusOnShow?: boolean;
  /** System styles on the root. */
  sx?: SxProps<Theme>;
}

const defaultTitle = (count: number) =>
  count === 1 ? "Fix 1 problem to continue" : `Fix ${count} problems to continue`;

/**
 * FabricFormErrorSummary — a box listing every problem after a failed submit,
 * each linked to its field.
 *
 * It appears once the form has been submitted with errors and updates as they're
 * fixed. Clicking a message focuses that field. Form-wide errors, such as a
 * failed save, show at the top. It's announced to screen readers when it appears.
 */
export function FabricFormErrorSummary({
  form,
  title = defaultTitle,
  labels,
  focusOnShow = false,
  sx,
}: Readonly<FabricFormErrorSummaryProps>) {
  const context = useFormContext();
  const methods = form ?? context;
  if (!methods) throw new Error("FabricFormErrorSummary needs `form` or a FormProvider.");
  const { errors, submitCount } = methods.formState;
  const items: FabricFormErrorItem[] = submitCount > 0 ? flattenErrors(errors) : [];
  const ref = useRef<HTMLDivElement | null>(null);
  const visible = items.length > 0;

  // Refocus on every failed submit, not only the first.
  // biome-ignore lint/correctness/useExhaustiveDependencies: submitCount is the trigger
  useEffect(() => {
    if (visible && focusOnShow) ref.current?.focus();
  }, [visible, focusOnShow, submitCount]);

  // Composite fields register under their parent path ("range", not "range.start"),
  // so walk up until something takes focus.
  const focusField = (name: string) => {
    const before = document.activeElement;
    const parts = name.split(".");
    for (let n = parts.length; n > 0; n--) {
      methods.setFocus(parts.slice(0, n).join("."));
      if (document.activeElement !== before) return;
    }
  };

  if (!visible) return null;
  const fieldItems = items.filter((i) => i.name !== "root");
  const rootItems = items.filter((i) => i.name === "root");
  const heading =
    fieldItems.length === 0
      ? rootItems[0].message
      : typeof title === "function"
        ? title(fieldItems.length)
        : title;

  return (
    <Box
      ref={ref}
      role="alert"
      tabIndex={-1}
      sx={[
        {
          display: "grid",
          gridTemplateColumns: "20px minmax(0, 1fr)",
          columnGap: `${spacing.md}px`,
          p: `${spacing.lg}px`,
          borderRadius: `${radii.lg}px`,
          border: "1px solid rgba(var(--mui-palette-error-mainChannel) / 0.4)",
          backgroundColor: "rgba(var(--mui-palette-error-mainChannel) / 0.06)",
          outline: "none",
          "&:focus-visible": {
            boxShadow: "0 0 0 3px rgba(var(--mui-palette-error-mainChannel) / 0.25)",
          },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <ErrorIcon sx={{ fontSize: 20, color: "var(--mui-palette-error-main)", mt: "1px" }} />
      <Box sx={{ minWidth: 0 }}>
        <Box
          sx={{
            fontSize: "0.875rem",
            fontWeight: fontWeight.semiBold,
            color: "var(--mui-palette-text-primary)",
            lineHeight: 1.45,
          }}
        >
          {heading}
        </Box>
        {fieldItems.length > 0 && rootItems.length > 0 && (
          <Box
            sx={{
              mt: `${spacing.xs}px`,
              fontSize: "0.875rem",
              color: "var(--mui-palette-text-primary)",
            }}
          >
            {rootItems[0].message}
          </Box>
        )}
        {fieldItems.length > 0 && (
          <Box
            component="ul"
            sx={{
              m: 0,
              mt: `${spacing.sm}px`,
              pl: "18px",
              display: "grid",
              gap: `${spacing.xs}px`,
            }}
          >
            {fieldItems.map((item) => (
              <Box
                component="li"
                key={item.name}
                sx={{ fontSize: "0.875rem", color: "var(--mui-palette-error-main)" }}
              >
                <Box
                  component="button"
                  type="button"
                  onClick={() => focusField(item.name)}
                  sx={{
                    p: 0,
                    border: 0,
                    background: "none",
                    font: "inherit",
                    color: "inherit",
                    textAlign: "left",
                    cursor: "pointer",
                    textDecoration: "underline",
                    textUnderlineOffset: "2px",
                    "&:hover": { textDecorationThickness: "2px" },
                    "&:focus-visible": {
                      outline: "2px solid var(--mui-palette-error-main)",
                      outlineOffset: "2px",
                      borderRadius: `${radii.sm}px`,
                    },
                  }}
                >
                  {labels?.[item.name] ? `${labels[item.name]}: ${item.message}` : item.message}
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}
