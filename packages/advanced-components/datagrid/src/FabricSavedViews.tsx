import {
  FabricButton,
  FabricDialog,
  FabricMenu,
  type FabricMenuItem,
  FabricTextField,
} from "@fabric-kit/components";
import { fontWeight, spacing } from "@fabric-kit/design-tokens";
import ArrowDropDown from "@fabric-kit/icons/ArrowDropDown";
import BookmarkBorder from "@fabric-kit/icons/BookmarkBorder";
import Check from "@fabric-kit/icons/Check";
import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";
import { type FormEvent, useId, useState } from "react";
import type { FabricSavedView } from "./useSavedViews";

export interface FabricSavedViewsProps<T = unknown> {
  /** All views, default ones first. `useSavedViews` returns them in this order. */
  views: FabricSavedView<T>[];
  /** The id of the view in use. */
  activeId: string;
  /** Switch to a view. */
  onSelect: (id: string) => void;
  /** The grid's settings differ from the active view: shows "Edited" and enables saving. */
  modified?: boolean;
  /** "Save changes": overwrite the active view. Offered for the user's own views. */
  onSave?: () => void;
  /** "Save as new view": create a view with this name. */
  onSaveAs?: (name: string) => void;
  /** "Rename view". Offered for the user's own views. */
  onRename?: (id: string, name: string) => void;
  /** "Delete view". Offered for the user's own views. Consider an undo toast. */
  onDelete?: (id: string) => void;
  /** "Discard changes": go back to the active view's saved settings. */
  onDiscard?: () => void;
  /** Accessible name of the menu button. @default "Views" */
  label?: string;
  /** Class on the trigger button. */
  className?: string;
  /** System styles on the trigger button. */
  sx?: SxProps<Theme>;
}

type DialogMode = { kind: "create" } | { kind: "rename"; id: string } | null;

/**
 * FabricSavedViews — a menu for named grid views: switch between "All invoices",
 * "Overdue" and the user's own views, save changes, save as a new view, rename and
 * delete.
 *
 * It only shows views and reports choices. `useSavedViews` holds the list, and your
 * code applies a view's settings to the grid (for MUI X, `apiRef.current.restoreState`).
 *
 * @example
 * ```tsx
 * <FabricSavedViews
 *   views={views.views}
 *   activeId={views.activeView.id}
 *   modified={views.isModified(gridState)}
 *   onSelect={(id) => views.select(id)}
 *   onSave={() => views.update(gridState)}
 *   onSaveAs={(name) => views.create(name, gridState)}
 *   onRename={views.rename}
 *   onDelete={views.remove}
 * />
 * ```
 */
export function FabricSavedViews<T>({
  views,
  activeId,
  onSelect,
  modified = false,
  onSave,
  onSaveAs,
  onRename,
  onDelete,
  onDiscard,
  label = "Views",
  className,
  sx,
}: Readonly<FabricSavedViewsProps<T>>) {
  const menuId = useId();
  const fieldId = useId();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [dialog, setDialog] = useState<DialogMode>(null);
  const [name, setName] = useState("");

  const active = views.find((v) => v.id === activeId) ?? views[0];
  const own = active && !active.builtIn;
  const close = () => setAnchor(null);
  const run = (fn: () => void) => () => {
    close();
    fn();
  };

  const items: FabricMenuItem[] = views.map((v, i) => ({
    label: v.name,
    selected: v.id === active?.id,
    icon: v.id === active?.id ? <Check fontSize="small" /> : <span />,
    onClick: run(() => onSelect(v.id)),
    divideAfter: i === views.length - 1,
  }));
  if (modified && own && onSave) items.push({ label: "Save changes", onClick: run(onSave) });
  if (modified && onDiscard) items.push({ label: "Discard changes", onClick: run(onDiscard) });
  if (onSaveAs) {
    items.push({
      label: "Save as new view…",
      onClick: run(() => {
        setName("");
        setDialog({ kind: "create" });
      }),
    });
  }
  if (own && onRename) {
    items.push({
      label: "Rename view…",
      onClick: run(() => {
        setName(active.name);
        setDialog({ kind: "rename", id: active.id });
      }),
    });
  }
  if (own && onDelete) {
    items.push({
      label: "Delete view",
      onClick: run(() => onDelete(active.id)),
      sx: { color: "var(--mui-palette-error-main)" },
    });
  }

  const trimmed = name.trim();
  const duplicate = views.some(
    (v) =>
      v.name.toLocaleLowerCase() === trimmed.toLocaleLowerCase() &&
      !(dialog?.kind === "rename" && v.id === dialog.id),
  );
  const valid = trimmed.length > 0 && !duplicate;

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    if (!valid || !dialog) return;
    if (dialog.kind === "create") onSaveAs?.(trimmed);
    else onRename?.(dialog.id, trimmed);
    setDialog(null);
  };

  return (
    <>
      <FabricButton
        variant="outlined"
        startIcon={<BookmarkBorder />}
        endIcon={<ArrowDropDown />}
        aria-haspopup="menu"
        aria-expanded={anchor ? true : undefined}
        aria-controls={anchor ? menuId : undefined}
        aria-label={`${label}: ${active?.name ?? ""}${modified ? ", edited" : ""}`}
        onClick={(e) => setAnchor(e.currentTarget)}
        className={className}
        sx={sx}
      >
        <Box
          component="span"
          sx={{ maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
        >
          {active?.name}
        </Box>
        {modified && (
          <Box
            component="span"
            sx={{
              ml: `${spacing.sm}px`,
              fontWeight: fontWeight.regular,
              color: "var(--mui-palette-text-secondary)",
            }}
          >
            Edited
          </Box>
        )}
      </FabricButton>
      <FabricMenu
        id={menuId}
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={close}
        items={items}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
      />
      <FabricDialog
        open={dialog != null}
        onClose={() => setDialog(null)}
        title={dialog?.kind === "rename" ? "Rename view" : "Save as new view"}
        maxWidth="xs"
        fullWidth
        content={
          <form id={`${fieldId}-form`} onSubmit={submit}>
            <FabricTextField
              id={fieldId}
              label="View name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              fullWidth
              error={duplicate && trimmed.length > 0}
              helperText={
                duplicate && trimmed.length > 0 ? "A view with this name already exists." : " "
              }
              slotProps={{ htmlInput: { maxLength: 80 } }}
            />
          </form>
        }
        actions={[
          { label: "Cancel", variant: "outlined", onClick: () => setDialog(null) },
          {
            label: dialog?.kind === "rename" ? "Rename" : "Save view",
            variant: "contained",
            disabled: !valid,
            onClick: () => submit(),
          },
        ]}
      />
    </>
  );
}
