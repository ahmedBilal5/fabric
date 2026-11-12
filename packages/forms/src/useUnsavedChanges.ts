import { useMaybeConfirm } from "@fabric-kit/components";
import { type ReactNode, useCallback, useEffect, useRef } from "react";

export interface UseUnsavedChangesOptions {
  /** Dialog title when asking to leave. @default "Discard unsaved changes?" */
  title?: ReactNode;
  /** Dialog text. @default "Your changes to this page will be lost." */
  description?: ReactNode;
  /** Leave button label. @default "Discard changes" */
  confirmLabel?: ReactNode;
  /** Stay button label. @default "Keep editing" */
  cancelLabel?: ReactNode;
}

export interface UseUnsavedChangesResult {
  /**
   * Asks before leaving when there are unsaved changes; resolves `true` when it's
   * fine to go. Call it before Cancel, closing a drawer, or from your router's
   * navigation blocker.
   */
  confirmLeave: () => Promise<boolean>;
}

/**
 * Warns before unsaved changes are lost.
 *
 * While `when` is true, closing or reloading the tab shows the browser's own
 * "Leave site?" prompt. For in-app navigation, call `confirmLeave()`: it opens a
 * Fabric confirm dialog (with a `FabricConfirmProvider` above) or falls back to
 * `window.confirm`. Router-agnostic: wire it to React Router's `useBlocker`, Next's
 * router events, or your own links.
 *
 * @example
 * ```tsx
 * const { confirmLeave } = useUnsavedChanges(form.formState.isDirty);
 * <FabricButton onClick={async () => { if (await confirmLeave()) navigate(-1); }}>Cancel</FabricButton>
 * ```
 */
export function useUnsavedChanges(
  when: boolean,
  {
    title = "Discard unsaved changes?",
    description = "Your changes to this page will be lost.",
    confirmLabel = "Discard changes",
    cancelLabel = "Keep editing",
  }: UseUnsavedChangesOptions = {},
): UseUnsavedChangesResult {
  const confirm = useMaybeConfirm();
  const latest = useRef({ when, title, description, confirmLabel, cancelLabel, confirm });
  latest.current = { when, title, description, confirmLabel, cancelLabel, confirm };

  useEffect(() => {
    if (!when) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      // Older browsers need a return value to show the prompt.
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [when]);

  const confirmLeave = useCallback(async () => {
    const o = latest.current;
    if (!o.when) return true;
    if (o.confirm) {
      return o.confirm({
        title: o.title,
        description: o.description,
        confirmLabel: o.confirmLabel,
        cancelLabel: o.cancelLabel,
        danger: true,
      });
    }
    const text = [o.title, o.description].filter((x) => typeof x === "string").join("\n\n");
    return window.confirm(text || "Discard unsaved changes?");
  }, []);

  return { confirmLeave };
}
