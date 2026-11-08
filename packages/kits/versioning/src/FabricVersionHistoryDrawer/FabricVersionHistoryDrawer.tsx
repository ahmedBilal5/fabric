import {
  FabricButton,
  FabricDialog,
  FabricDivider,
  FabricDrawer,
  FabricMenu,
  type FabricMenuItem,
} from "@fabric-kit/components";
import CheckIcon from "@fabric-kit/icons/Check";
import ContentCopyIcon from "@fabric-kit/icons/ContentCopy";
import DeleteIcon from "@fabric-kit/icons/Delete";
import EditIcon from "@fabric-kit/icons/Edit";
import HistoryIcon from "@fabric-kit/icons/History";
import RestoreIcon from "@fabric-kit/icons/Restore";
import VisibilityIcon from "@fabric-kit/icons/Visibility";
import { FabricCenter, FabricInline, FabricStack, FabricText } from "@fabric-kit/primitives";
import { forwardRef, type MouseEvent, memo, useCallback, useMemo, useRef, useState } from "react";
import { groupVersions } from "../helpers";
import type {
  FabricVersion,
  FabricVersionHistoryDrawerProps,
  FabricVersionHistoryLabels,
} from "../types";
import { VersionTimeline } from "./VersionTimeline";

const DRAWER_WIDTH = { xs: "88vw", sm: 340, md: 360 } as const;

const DEFAULT_LABELS: Required<FabricVersionHistoryLabels> = {
  title: "Version history",
  done: "Done",
  actions: "Version actions",
  rename: "Rename",
  renameField: "Version name",
  preview: "Preview",
  restore: "Restore",
  duplicate: "Duplicate",
  delete: "Delete",
  cancel: "Cancel",
  restoreTitle: "Restore this version?",
  restoreBody:
    "The document will be replaced with this version. Your current version stays in the history.",
  deleteTitle: "Delete this version?",
  deleteBody: "This version will be removed from the history. This can't be undone.",
  previewTitle: "Preview",
  untitled: "Untitled version",
  unknownAuthor: "Unknown",
  empty: "No versions yet. Versions appear here as the document is saved.",
  autosaved: (count) => `${count} autosaved version${count === 1 ? "" : "s"}`,
};

type PendingAction = "restore" | "delete" | "duplicate" | "rename";

const FabricVersionHistoryDrawerImpl = forwardRef<HTMLDivElement, FabricVersionHistoryDrawerProps>(
  function FabricVersionHistoryDrawer(
    {
      open,
      onClose,
      versions,
      onRestore,
      onDuplicate,
      onDelete,
      onRename,
      renderPreview,
      readOnly = false,
      labels: labelOverrides,
      onError,
      sx,
      ...rest
    },
    ref,
  ) {
    const labels = useMemo(() => ({ ...DEFAULT_LABELS, ...labelOverrides }), [labelOverrides]);
    const groups = useMemo(() => groupVersions(versions), [versions]);

    const [menu, setMenu] = useState<{ anchor: HTMLElement; version: FabricVersion } | null>(null);
    const [confirm, setConfirm] = useState<{
      kind: "restore" | "delete";
      version: FabricVersion;
    } | null>(null);
    const [preview, setPreview] = useState<FabricVersion | null>(null);
    const [renamingId, setRenamingId] = useState<string | null>(null);
    const [pending, setPending] = useState<PendingAction | null>(null);
    const latest = useRef({ onRestore, onDuplicate, onDelete, onRename, onError });
    latest.current = { onRestore, onDuplicate, onDelete, onRename, onError };

    const can = useMemo(
      () => ({
        rename: (v: FabricVersion) => !readOnly && Boolean(onRename) && v.status === "published",
        preview: () => Boolean(renderPreview),
        restore: (v: FabricVersion) => !readOnly && Boolean(onRestore) && !v.isCurrent,
        duplicate: () => !readOnly && Boolean(onDuplicate),
        delete: (v: FabricVersion) => !readOnly && Boolean(onDelete) && !v.isCurrent,
      }),
      [readOnly, onRename, renderPreview, onRestore, onDuplicate, onDelete],
    );

    const hasActions = useCallback(
      (v: FabricVersion) =>
        can.rename(v) || can.preview() || can.restore(v) || can.duplicate() || can.delete(v),
      [can],
    );

    /** Runs an action handler, tracking its pending state. Returns true on success. */
    const run = useCallback(async (kind: PendingAction, action: () => Promise<void> | void) => {
      setPending(kind);
      try {
        await action();
        return true;
      } catch (error) {
        latest.current.onError?.(error);
        return false;
      } finally {
        setPending(null);
      }
    }, []);

    const openActions = useCallback((event: MouseEvent<HTMLElement>, version: FabricVersion) => {
      setMenu({ anchor: event.currentTarget, version });
    }, []);

    const commitRename = useCallback(
      async (version: FabricVersion, label: string) => {
        const handler = latest.current.onRename;
        if (!handler || label === version.label) {
          setRenamingId(null);
          return;
        }
        if (await run("rename", () => handler(version, label))) setRenamingId(null);
      },
      [run],
    );

    const confirmAction = async () => {
      if (!confirm) return;
      const handler =
        confirm.kind === "restore" ? latest.current.onRestore : latest.current.onDelete;
      if (!handler) return;
      if (await run(confirm.kind, () => handler(confirm.version))) setConfirm(null);
    };

    const menuItems: FabricMenuItem[] = [];
    if (menu) {
      const v = menu.version;
      const close = () => setMenu(null);
      if (can.preview()) {
        menuItems.push({
          label: labels.preview,
          icon: <VisibilityIcon fontSize="small" />,
          onClick: () => {
            close();
            setPreview(v);
          },
        });
      }
      if (can.rename(v)) {
        menuItems.push({
          label: labels.rename,
          icon: <EditIcon fontSize="small" />,
          onClick: () => {
            close();
            setRenamingId(v.id);
          },
        });
      }
      if (can.restore(v)) {
        menuItems.push({
          label: labels.restore,
          icon: <RestoreIcon fontSize="small" />,
          onClick: () => {
            close();
            setConfirm({ kind: "restore", version: v });
          },
        });
      }
      if (can.duplicate()) {
        menuItems.push({
          label: labels.duplicate,
          icon: <ContentCopyIcon fontSize="small" />,
          onClick: () => {
            close();
            const handler = latest.current.onDuplicate;
            if (handler) void run("duplicate", () => handler(v));
          },
        });
      }
      if (can.delete(v)) {
        if (menuItems.length > 0) menuItems[menuItems.length - 1].divideAfter = true;
        menuItems.push({
          label: labels.delete,
          icon: <DeleteIcon fontSize="small" />,
          onClick: () => {
            close();
            setConfirm({ kind: "delete", version: v });
          },
          sx: { color: "error.main", "& .MuiListItemIcon-root": { color: "error.main" } },
        });
      }
    }

    return (
      <FabricDrawer
        ref={ref}
        open={open}
        onClose={onClose}
        anchor="right"
        sx={[
          { "& .MuiDrawer-paper": { width: DRAWER_WIDTH, maxWidth: "100vw", p: 2 } },
          ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
        ]}
        {...rest}
      >
        <FabricStack gap="md" sx={{ height: "100%", minHeight: 0 }}>
          <FabricInline gap="sm" align="center" sx={{ justifyContent: "space-between" }}>
            <FabricText textVariant="headingSm" component="h2" sx={{ m: 0 }}>
              {labels.title}
            </FabricText>
            <FabricButton variant="text" size="small" startIcon={<CheckIcon />} onClick={onClose}>
              {labels.done}
            </FabricButton>
          </FabricInline>
          <FabricDivider />
          <FabricStack
            sx={{ flex: 1, minHeight: 0, overflowY: "auto" }}
            aria-busy={pending !== null}
          >
            {versions.length === 0 ? (
              <FabricCenter sx={{ flexDirection: "column", gap: 1, py: 6, textAlign: "center" }}>
                <HistoryIcon sx={{ fontSize: 32, color: "text.disabled" }} />
                <FabricText textVariant="bodyMd" color="text.secondary">
                  {labels.empty}
                </FabricText>
              </FabricCenter>
            ) : (
              <VersionTimeline
                groups={groups}
                labels={labels}
                hasActions={hasActions}
                canRename={can.rename}
                renamingId={renamingId}
                onRenameStart={(v) => setRenamingId(v.id)}
                onRenameCommit={commitRename}
                onRenameCancel={() => setRenamingId(null)}
                onOpenActions={openActions}
              />
            )}
          </FabricStack>
        </FabricStack>

        <FabricMenu
          anchorEl={menu?.anchor ?? null}
          open={Boolean(menu)}
          onClose={() => setMenu(null)}
          items={menuItems}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
        />

        <FabricDialog
          open={Boolean(confirm)}
          onClose={() => setConfirm(null)}
          title={confirm?.kind === "delete" ? labels.deleteTitle : labels.restoreTitle}
          titleIcon={confirm?.kind === "delete" ? <DeleteIcon /> : <RestoreIcon />}
          titleIconTone="attention"
          actions={[
            { label: labels.cancel, onClick: () => setConfirm(null), variant: "outlined" },
            {
              label: confirm?.kind === "delete" ? labels.delete : labels.restore,
              onClick: () => void confirmAction(),
              variant: "contained",
              color: confirm?.kind === "delete" ? "error" : "primary",
              loading: pending === "restore" || pending === "delete",
            },
          ]}
        >
          <FabricText textVariant="bodyMd">
            {confirm?.kind === "delete" ? labels.deleteBody : labels.restoreBody}
          </FabricText>
        </FabricDialog>

        {renderPreview && (
          <FabricDialog
            open={Boolean(preview)}
            onClose={() => setPreview(null)}
            title={preview ? preview.label || labels.previewTitle : labels.previewTitle}
            maxWidth="md"
            fullWidth
            dividers
          >
            {preview ? renderPreview(preview) : null}
          </FabricDialog>
        )}
      </FabricDrawer>
    );
  },
);

FabricVersionHistoryDrawerImpl.displayName = "FabricVersionHistoryDrawer";

/**
 * A right-hand drawer listing a document's versions on a timeline: published
 * versions with their names, and runs of autosaved drafts collapsed into groups.
 * Each version gets a menu for preview, rename, restore, duplicate and delete;
 * an action appears only when you pass its handler.
 *
 * @example
 * ```tsx
 * <FabricVersionHistoryDrawer
 *   open={open}
 *   onClose={() => setOpen(false)}
 *   versions={versions}
 *   onRestore={(v) => api.restore(doc.id, v.id)}
 *   onRename={(v, label) => api.rename(v.id, label)}
 *   renderPreview={(v) => <DocumentPreview versionId={v.id} />}
 * />
 * ```
 */
export const FabricVersionHistoryDrawer = memo(FabricVersionHistoryDrawerImpl);
