/**
 * FabricDialog — the design-system modal dialog.
 *
 * Extends MUI `Dialog` with a data-driven `actions` API, first-class
 * `title` / `subtitle` / `titleIcon` slots, and an optional `confirmDelete`
 * mode gated behind typing "DELETE". The confirm-delete input is
 * uncontrolled by default and switches to controlled when both
 * `deleteConfirmValue` and `onDeleteConfirmValueChange` are set, so a parent
 * form can own the value.
 *
 * The look is split across two layers. The theme
 * (`MuiDialog*` overrides) owns the panel radius and shadow, title typography,
 * and the body / header / footer padding. This component owns what the theme
 * cannot express: the bordered close button inside the title row and the
 * optional tinted `titleIcon` circle (`titleIconTone`). Every dimension routes
 * through `@fabric-kit/design-tokens`. `onClose`
 * preserves MUI's `(event, reason) => void` signature — consumers can still
 * distinguish backdrop dismissal from explicit close. ARIA linkage is wired
 * via `useId()`: the dialog root gets `aria-labelledby` on the title and
 * `aria-describedby` on the subtitle when either is set.
 *
 * @example
 * ```tsx
 * <FabricDialog
 *   open={open}
 *   onClose={() => setOpen(false)}
 *   title="Delete item?"
 *   subtitle="This action cannot be undone."
 *   actions={[
 *     { children: 'Cancel', variant: 'text', onClick: () => setOpen(false) },
 *     { children: 'Delete', variant: 'contained', color: 'error', onClick: confirmDelete },
 *   ]}
 * />
 * ```
 */

import { iconSize, radii, spacing } from "@fabric-kit/design-tokens";
import CloseIcon from "@fabric-kit/icons/Close";
import {
  FabricDivider,
  FabricFlex,
  FabricGrow,
  FabricStack,
  FabricText,
} from "@fabric-kit/primitives";
import {
  Dialog,
  DialogActions,
  DialogContent,
  type DialogProps,
  DialogTitle,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import React, { forwardRef, memo, type ReactNode, useId, useMemo, useState } from "react";
import { FabricButton, type FabricButtonProps } from "../FabricButton/FabricButton";
import { FabricTextField } from "../FabricTextField/FabricTextField";

export interface FabricDialogAction extends Omit<FabricButtonProps, "onClick"> {
  /** Button label. Optional for icon-only actions: pass the icon as `children` and an accessible `tooltip` or `aria-label`. */
  label?: ReactNode;
  /** Click handler. Receives the MUI standard mouse event. */
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

/** Tint of the circle behind `titleIcon`: `info` (blue) or `attention` (orange). */
export type FabricDialogTitleIconTone = "info" | "attention";

export interface FabricDialogProps extends Omit<DialogProps, "title" | "content"> {
  /** Dialog title. Accepts rich content. */
  title?: ReactNode;
  /** Optional subtitle rendered below the title. */
  subtitle?: ReactNode;
  /** Icon rendered before the title. */
  titleIcon?: ReactNode;
  /**
   * Wraps `titleIcon` in a 36px tinted circle. Pass an uncoloured icon: the circle
   * sets the icon colour. Omit for a bare icon.
   */
  titleIconTone?: FabricDialogTitleIconTone;
  /** Render the close (X) button in the header. Defaults to `true`. */
  closable?: boolean;
  /** MUI-standard close handler. Fires for the X button, backdrop click, and Escape. */
  onClose?: DialogProps["onClose"];
  /** Footer action buttons. Each entry supports the full `FabricButton` surface. */
  actions?: FabricDialogAction[];
  /** Render dividers above the content and above the actions. */
  dividers?: boolean;
  /**
   * Gate the destructive action behind typing "DELETE". When set, the matching
   * action (label === "delete" or color === "error") is disabled until the
   * text field value normalizes to "DELETE".
   */
  confirmDelete?: boolean;
  /** Controlled confirm-delete value. Pair with `onDeleteConfirmValueChange`. */
  deleteConfirmValue?: string;
  /** Controlled confirm-delete change handler. Pair with `deleteConfirmValue`. */
  onDeleteConfirmValueChange?: (value: string) => void;
  /** Label for the confirm-delete text field. Defaults to `'Type "DELETE" to confirm'`. */
  deleteConfirmLabel?: ReactNode;
  /** Content passed as `content` prop or via `children`. `children` renders after `content`. */
  content?: ReactNode;
  /** Style overrides for the Paper slot. Merged into `slotProps.paper.sx`; consumer keys win. */
  paperSx?: SxProps<Theme>;
  /** Automatically go full-screen below the `sm` breakpoint (600px). @default true */
  responsiveFullScreen?: boolean;
}

// Baked-in paper visual. Radius and shadow come from the theme's `MuiDialog` override.
// Consumer overrides via `paperSx` or `slotProps.paper.sx` win on any key they spell out.
const DS_PAPER_SX = {
  backgroundImage: "none",
} as const;

// Colors are MUI CSS variables so the circle follows light / dark mode.
const TITLE_ICON_TONE_SX = {
  info: {
    backgroundColor: "var(--mui-palette-info-light)",
    color: "var(--mui-palette-info-main)",
  },
  attention: {
    backgroundColor: "var(--mui-palette-semantic-cancelled-bg)",
    color: "var(--mui-palette-semantic-cancelled-main)",
  },
} as const;

// 32px circle: the close button is an 8px pad around a 16px icon with a 1px stroke inside.
const CLOSE_BUTTON_SX = {
  flexShrink: 0,
  width: iconSize["3xl"],
  height: iconSize["3xl"],
  padding: 0,
  border: "1px solid var(--mui-palette-divider)",
  color: "var(--mui-palette-text-primary)",
  "& svg": { fontSize: iconSize.sm },
} as const;

function normalizeDeleteInput(value: string): string {
  return value.trim().toUpperCase();
}

function isDeleteAction(action: FabricDialogAction): boolean {
  if (action.color === "error") return true;
  const label = action.label;
  return typeof label === "string" && label.trim().toLowerCase() === "delete";
}

const FabricDialogImpl = forwardRef<HTMLDivElement, FabricDialogProps>(function FabricDialog(
  {
    title,
    subtitle,
    titleIcon,
    titleIconTone,
    closable = true,
    onClose,
    actions,
    dividers,
    confirmDelete,
    deleteConfirmValue,
    onDeleteConfirmValueChange,
    deleteConfirmLabel = 'Type "DELETE" to confirm',
    content,
    children,
    paperSx,
    responsiveFullScreen = true,
    slotProps,
    "aria-labelledby": ariaLabelledByProp,
    "aria-describedby": ariaDescribedByProp,
    fullScreen: fullScreenProp,
    ...rest
  },
  ref,
) {
  // hooks
  const muiTheme = useTheme();
  const isBelowSm = useMediaQuery(muiTheme.breakpoints.down("sm"), { noSsr: true });
  const fullScreen = fullScreenProp ?? (responsiveFullScreen && isBelowSm);
  const titleId = useId();
  const subtitleId = useId();
  const [uncontrolledDelete, setUncontrolledDelete] = useState("");
  const mergedSlotProps = useMemo(() => {
    const consumerPaper = (slotProps?.paper as { sx?: object } | undefined) ?? {};
    const consumerPaperSx = (consumerPaper as { sx?: object }).sx ?? {};
    return {
      ...slotProps,
      paper: {
        ...consumerPaper,
        sx: {
          ...DS_PAPER_SX,
          ...(paperSx as object),
          ...(consumerPaperSx as object),
        },
      },
    };
  }, [slotProps, paperSx]);

  // state (derived)
  const hasTitle = title !== undefined && title !== null;
  const hasSubtitle = subtitle !== undefined && subtitle !== null;
  const isDeleteControlled =
    deleteConfirmValue !== undefined && onDeleteConfirmValueChange !== undefined;
  const deleteValue = isDeleteControlled ? deleteConfirmValue : uncontrolledDelete;
  const deleteConfirmed =
    confirmDelete === true && normalizeDeleteInput(deleteValue ?? "") === "DELETE";
  const resolvedLabelledBy = ariaLabelledByProp ?? (hasTitle ? titleId : undefined);
  const resolvedDescribedBy = ariaDescribedByProp ?? (hasSubtitle ? subtitleId : undefined);
  const resolvedActions = confirmDelete
    ? actions?.map((action) =>
        isDeleteAction(action) ? { ...action, disabled: !deleteConfirmed } : action,
      )
    : actions;

  // functions
  const handleDeleteChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = event.target.value;
    if (isDeleteControlled) {
      onDeleteConfirmValueChange?.(next);
    } else {
      setUncontrolledDelete(next);
    }
  };

  return (
    <Dialog
      ref={ref}
      onClose={onClose}
      fullScreen={fullScreen}
      slotProps={mergedSlotProps}
      aria-labelledby={resolvedLabelledBy}
      aria-describedby={resolvedDescribedBy}
      {...rest}
    >
      {(hasTitle || closable) && (
        <DialogTitle>
          <FabricFlex align="center" gap="lg">
            {titleIcon &&
              (titleIconTone ? (
                <FabricFlex
                  align="center"
                  justify="center"
                  sx={{
                    flexShrink: 0,
                    padding: `${spacing.xs}px`,
                    borderRadius: `${radii.full}px`,
                    "& svg": { fontSize: iconSize["2xl"] },
                    ...TITLE_ICON_TONE_SX[titleIconTone],
                  }}
                >
                  {titleIcon}
                </FabricFlex>
              ) : (
                titleIcon
              ))}
            <FabricGrow>
              <FabricStack gap="xs">
                {hasTitle && (
                  <FabricText id={titleId} variant="inherit" component="span">
                    {title}
                  </FabricText>
                )}
                {hasSubtitle && (
                  <FabricText
                    id={subtitleId}
                    variant="body2"
                    color="text.secondary"
                    sx={{ textTransform: "none" }}
                  >
                    {subtitle}
                  </FabricText>
                )}
              </FabricStack>
            </FabricGrow>
            {closable && onClose && (
              <IconButton
                aria-label="close"
                onClick={(event) => onClose(event, "escapeKeyDown")}
                sx={CLOSE_BUTTON_SX}
              >
                <CloseIcon />
              </IconButton>
            )}
          </FabricFlex>
        </DialogTitle>
      )}

      {dividers && <FabricDivider />}

      <DialogContent>
        {content}
        {children}
        {confirmDelete && (
          <FabricTextField
            fullWidth
            size="small"
            label={deleteConfirmLabel}
            value={deleteValue ?? ""}
            onChange={handleDeleteChange}
            sx={{ mt: `${spacing.lg}px` }}
          />
        )}
      </DialogContent>

      {resolvedActions?.length ? (
        <>
          {dividers && <FabricDivider />}
          <DialogActions>
            {resolvedActions.map(({ label, children: actionChildren, onClick, ...btnProps }, i) => (
              <FabricButton key={i} onClick={onClick} {...btnProps}>
                {label ?? actionChildren}
              </FabricButton>
            ))}
          </DialogActions>
        </>
      ) : null}
    </Dialog>
  );
});

FabricDialogImpl.displayName = "FabricDialog";

export const FabricDialog = memo(FabricDialogImpl);
