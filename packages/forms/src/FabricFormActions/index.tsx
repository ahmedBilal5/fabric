import { FabricButton } from "@fabric-kit/components";
import { fontWeight, radii, shadows, spacing, zIndex } from "@fabric-kit/design-tokens";
import { Box } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import type { ReactNode } from "react";
import { useFormContext } from "react-hook-form";

export interface FabricFormActionsProps {
  /** Label of the submit button. @default "Save" */
  submitLabel?: ReactNode;
  /** Shows a Cancel button that calls this. */
  onCancel?: () => void;
  /** Label of the cancel button. @default "Cancel" */
  cancelLabel?: ReactNode;
  /** Content on the opposite side, e.g. a Delete button or "Last saved 2 min ago". */
  start?: ReactNode;
  /** Replace the buttons entirely. */
  children?: ReactNode;
  /**
   * Stick to the bottom of the scrolling area, with "Unsaved changes" shown once the
   * form is edited. Use it on long forms so Save is always in reach.
   * @default false
   */
  sticky?: boolean;
  /** Disable Save until something changes. @default false */
  disableUntilDirty?: boolean;
  /** Text shown in a sticky bar while there are unsaved changes. @default "Unsaved changes" */
  dirtyMessage?: ReactNode;
  /** Put the buttons at the start instead of the end. @default "end" */
  align?: "start" | "end";
  /** Class on the root. */
  className?: string;
  /** System styles on the root. */
  sx?: SxProps<Theme>;
}

/**
 * FabricFormActions — the Save and Cancel buttons at the end of a form.
 *
 * Inside `FabricForm` it reads the form's state: Save shows a spinner while the
 * submit runs, and a sticky bar says when there are unsaved changes. The primary
 * button comes last, where people look for it.
 */
export function FabricFormActions({
  submitLabel = "Save",
  onCancel,
  cancelLabel = "Cancel",
  start,
  children,
  sticky = false,
  disableUntilDirty = false,
  dirtyMessage = "Unsaved changes",
  align = "end",
  className,
  sx,
}: Readonly<FabricFormActionsProps>) {
  const form = useFormContext();
  const submitting = form?.formState.isSubmitting ?? false;
  const dirty = form?.formState.isDirty ?? false;
  const disabled = form?.formState.disabled ?? false;

  const buttons = children ?? (
    <>
      {onCancel && (
        <FabricButton type="button" variant="outlined" onClick={onCancel} disabled={submitting}>
          {cancelLabel}
        </FabricButton>
      )}
      <FabricButton
        type="submit"
        variant="contained"
        loading={submitting}
        disabled={disabled || (disableUntilDirty && !dirty)}
      >
        {submitLabel}
      </FabricButton>
    </>
  );

  const status =
    sticky && dirty && !start ? (
      <Box
        aria-live="polite"
        sx={{
          display: "flex",
          alignItems: "center",
          gap: `${spacing.sm}px`,
          fontSize: "0.875rem",
          fontWeight: fontWeight.medium,
          color: "var(--mui-palette-text-secondary)",
        }}
      >
        <Box
          aria-hidden
          sx={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: "var(--mui-palette-warning-main)",
          }}
        />
        {dirtyMessage}
      </Box>
    ) : null;

  return (
    <Box
      className={className}
      sx={[
        {
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: `${spacing.md}px`,
          justifyContent: align === "start" ? "flex-start" : "space-between",
        },
        sticky && {
          position: "sticky",
          bottom: 0,
          zIndex: zIndex.sticky,
          mx: { xs: `-${spacing.lg}px`, sm: 0 },
          px: { xs: `${spacing.lg}px`, sm: `${spacing.xl}px` },
          py: `${spacing.md}px`,
          borderTop: "1px solid var(--mui-palette-divider)",
          borderRadius: { xs: 0, sm: `${radii.xl}px ${radii.xl}px 0 0` },
          backgroundColor: "var(--mui-palette-background-paper)",
          boxShadow: shadows.dropdown,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {align === "end" && <Box sx={{ minWidth: 0 }}>{start ?? status}</Box>}
      <Box sx={{ display: "flex", gap: `${spacing.sm}px`, ml: align === "end" ? "auto" : 0 }}>
        {buttons}
      </Box>
      {align === "start" && start}
    </Box>
  );
}
