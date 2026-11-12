/**
 * FabricFormPage — a whole page for creating or editing one record: a page
 * header, the form in sections, a sticky Save bar, and a warning before unsaved
 * changes are lost.
 *
 * Pass `view` to get read-only and edit modes: the page opens showing the record
 * with an Edit button, and Save or Cancel brings it back. Leave `view` out for
 * create pages and always-editable settings.
 *
 * Saving stays yours: `onSubmit` gets the valid values. Throw to show the
 * message at the top of the form. After a successful save the form is reset to
 * the saved values, so it's no longer "unsaved".
 *
 * @example
 * ```tsx
 * <FabricFormPage
 *   title="Northwind Traders"
 *   breadcrumbs={[{ label: "Customers", href: "/customers" }, { label: "Northwind Traders" }]}
 *   form={form}
 *   onSubmit={(values) => api.updateCustomer(id, values)}
 *   view={<FabricKeyValueList items={summary} columns={2} />}
 * >
 *   <FabricFormSection title="Company">…</FabricFormSection>
 *   <FabricFormSection title="Billing">…</FabricFormSection>
 * </FabricFormPage>
 * ```
 */

import { FabricButton } from "@fabric-kit/components";
import { radii, spacing } from "@fabric-kit/design-tokens";
import { FabricForm, FabricFormActions, useUnsavedChanges } from "@fabric-kit/forms";
import EditIcon from "@fabric-kit/icons/Edit";
import { FabricPageHeader, type FabricPageHeaderProps } from "@fabric-kit/layout";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import type { SxProps, Theme } from "@mui/material/styles";
import { type ReactNode, useState } from "react";
import type { FieldValues, UseFormReturn } from "react-hook-form";

export interface FabricFormPageProps<
  T extends FieldValues,
  // biome-ignore lint/suspicious/noExplicitAny: matches React Hook Form's own default for the context type
  TContext = any,
  TOutput extends FieldValues = T,
> extends Omit<FabricPageHeaderProps, "tabs" | "sx" | "divider" | "onSubmit" | "children"> {
  /** The form from `useForm`. */
  form: UseFormReturn<T, TContext, TOutput>;
  /** Saves the values. Throw to show the error at the top of the form. */
  onSubmit: (values: TOutput) => unknown;
  /** The form's sections. */
  children: ReactNode;
  /** Read-only view of the record. When set, the page opens in view mode with an Edit button. */
  view?: ReactNode;
  /** The mode, to control it (e.g. from the URL). */
  mode?: "view" | "edit";
  /** Called when the mode changes. */
  onModeChange?: (mode: "view" | "edit") => void;
  /** Called after Cancel (once any unsaved changes are discarded), e.g. to go back. */
  onCancel?: () => void;
  /** Called after a successful save. */
  onSaved?: (values: TOutput) => void;
  /** @default "Edit" */
  editLabel?: ReactNode;
  /** @default "Save changes" */
  submitLabel?: ReactNode;
  /** @default "Cancel" */
  cancelLabel?: ReactNode;
  /** Keep the Save bar at the bottom of the screen. @default true */
  stickyActions?: boolean;
  /** Warn before leaving with unsaved changes. @default true */
  warnOnLeave?: boolean;
  /** Side panel next to the form from `lg` up: help text, a preview, a checklist. */
  aside?: ReactNode;
  /** Field labels by path, to prefix messages in the error summary. */
  errorLabels?: Record<string, string>;
  /** Show placeholders while the record loads. */
  loading?: boolean;
  /** Most width of the form column. @default 880 */
  maxWidth?: number;
  /** System styles on the root. */
  sx?: SxProps<Theme>;
}

/** A page for creating or editing a record, with view and edit modes and a Save bar. */
export function FabricFormPage<
  T extends FieldValues,
  // biome-ignore lint/suspicious/noExplicitAny: matches React Hook Form's own default for the context type
  TContext = any,
  TOutput extends FieldValues = T,
>({
  form,
  onSubmit,
  children,
  view,
  mode,
  onModeChange,
  onCancel,
  onSaved,
  editLabel = "Edit",
  submitLabel = "Save changes",
  cancelLabel = "Cancel",
  stickyActions = true,
  warnOnLeave = true,
  aside,
  errorLabels,
  loading = false,
  maxWidth = 880,
  sx,
  ...header
}: Readonly<FabricFormPageProps<T, TContext, TOutput>>) {
  const [ownMode, setOwnMode] = useState<"view" | "edit">(view ? "view" : "edit");
  const current = view ? (mode ?? ownMode) : "edit";
  const editing = current === "edit";
  const { confirmLeave } = useUnsavedChanges(warnOnLeave && editing && form.formState.isDirty);

  const setMode = (next: "view" | "edit") => {
    setOwnMode(next);
    onModeChange?.(next);
  };

  const cancel = async () => {
    if (!(await confirmLeave())) return;
    form.reset();
    if (view) setMode("view");
    onCancel?.();
  };

  const save = async (values: TOutput) => {
    await onSubmit(values);
    // The saved values are the new baseline, so nothing is "unsaved" any more.
    form.reset(form.getValues());
    if (view) setMode("view");
    onSaved?.(values);
  };

  const editButton = view && !editing && !loading && (
    <FabricButton variant="contained" startIcon={<EditIcon />} onClick={() => setMode("edit")}>
      {editLabel}
    </FabricButton>
  );

  const body = loading ? (
    <Box
      sx={{
        display: "grid",
        gap: `${spacing.lg}px`,
        p: `${spacing.xl}px`,
        borderRadius: `${radii.xl}px`,
        border: "1px solid var(--mui-palette-divider)",
      }}
    >
      {[40, 100, 100, 60].map((w, i) => (
        <Skeleton
          key={i}
          variant={i === 0 ? "text" : "rounded"}
          width={`${w}%`}
          height={i === 0 ? 28 : 40}
        />
      ))}
    </Box>
  ) : editing ? (
    <FabricForm form={form} onSubmit={save} errorLabels={errorLabels}>
      {children}
      <FabricFormActions
        sticky={stickyActions}
        submitLabel={submitLabel}
        cancelLabel={cancelLabel}
        onCancel={view || onCancel ? () => void cancel() : undefined}
      />
    </FabricForm>
  ) : (
    view
  );

  return (
    <Box
      sx={[
        { display: "flex", flexDirection: "column", gap: `${spacing.xl}px`, minWidth: 0 },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <FabricPageHeader
        {...header}
        actions={
          (header.actions || editButton) && (
            <>
              {!editing && header.actions}
              {editButton}
            </>
          )
        }
        moreActions={editing ? undefined : header.moreActions}
      />
      <Box
        sx={{
          display: "grid",
          gap: `${spacing.xl}px`,
          alignItems: "start",
          gridTemplateColumns: {
            xs: "minmax(0, 1fr)",
            lg: aside
              ? `minmax(0, ${maxWidth}px) minmax(240px, 320px)`
              : `minmax(0, ${maxWidth}px)`,
          },
        }}
      >
        <Box sx={{ minWidth: 0 }}>{body}</Box>
        {aside && (
          <Box
            component="aside"
            sx={{ minWidth: 0, position: { lg: "sticky" }, top: { lg: spacing.lg } }}
          >
            {aside}
          </Box>
        )}
      </Box>
    </Box>
  );
}
