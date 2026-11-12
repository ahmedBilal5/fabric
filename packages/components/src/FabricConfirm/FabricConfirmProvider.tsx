/**
 * FabricConfirmProvider and useConfirm: ask the user to confirm an action with one
 * `await`, instead of wiring a dialog's open state, buttons and callbacks by hand.
 *
 * Mount `FabricConfirmProvider` once near the root of the app. Anywhere below it,
 * `useConfirm()` returns a function that opens a FabricDialog and resolves to `true`
 * when the user confirms, or `false` when they cancel, press Escape, click the
 * backdrop or close the dialog. Requests made while a dialog is open wait their turn.
 *
 * @example
 * ```tsx
 * const confirm = useConfirm();
 *
 * async function handleDelete() {
 *   const ok = await confirm({
 *     title: "Delete 3 invoices?",
 *     description: "They move to the trash for 30 days.",
 *     confirmLabel: "Delete",
 *     danger: true,
 *   });
 *   if (ok) await deleteInvoices();
 * }
 * ```
 */

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { FabricDialog, type FabricDialogAction } from "../FabricDialog/FabricDialog";

/** What to ask. Every text field accepts rich content. */
export interface FabricConfirmOptions {
  /** Dialog title, phrased as the question: "Delete 3 invoices?". */
  title: ReactNode;
  /** Optional detail under the title: the consequence of confirming. */
  description?: ReactNode;
  /** Label of the confirm button. @default "Confirm" */
  confirmLabel?: ReactNode;
  /** Label of the cancel button. @default "Cancel" */
  cancelLabel?: ReactNode;
  /**
   * Marks a destructive action: the confirm button turns red and focus starts on
   * Cancel, so pressing Enter by accident does not destroy anything.
   */
  danger?: boolean;
  /**
   * Require typing "DELETE" before the confirm button enables. Use it for actions
   * that cannot be undone. Implies `danger`.
   */
  typeToConfirm?: boolean;
  /** Icon shown before the title. */
  icon?: ReactNode;
  /** Hide the Cancel button, for a dialog that only acknowledges. @default false */
  hideCancel?: boolean;
}

/** Opens a confirmation dialog and resolves to `true` when the user confirms. */
export type FabricConfirmFn = (options: FabricConfirmOptions) => Promise<boolean>;

export interface FabricConfirmProviderProps {
  children?: ReactNode;
  /** Defaults applied to every request; each request's options win. */
  defaultOptions?: Partial<FabricConfirmOptions>;
}

interface PendingConfirm {
  id: number;
  options: FabricConfirmOptions;
  resolve: (confirmed: boolean) => void;
}

const ConfirmContext = createContext<FabricConfirmFn | null>(null);

/**
 * Hosts the confirmation dialog for `useConfirm`. Mount it once, inside the theme
 * provider and above every component that asks for confirmation.
 */
export function FabricConfirmProvider({ children, defaultOptions }: FabricConfirmProviderProps) {
  const [queue, setQueue] = useState<PendingConfirm[]>([]);
  const [open, setOpen] = useState(false);
  // The request on screen stays rendered while the dialog animates out.
  const [shown, setShown] = useState<PendingConfirm | null>(null);
  const nextId = useRef(0);
  const queueRef = useRef(queue);
  queueRef.current = queue;

  const confirm = useCallback<FabricConfirmFn>(
    (options) =>
      new Promise<boolean>((resolve) => {
        nextId.current += 1;
        const id = nextId.current;
        setQueue((q) => [...q, { id, options: { ...defaultOptions, ...options }, resolve }]);
      }),
    [defaultOptions],
  );

  // Show the next request when the dialog is free.
  useEffect(() => {
    if (!open && !shown && queue.length > 0) {
      setShown(queue[0]);
      setOpen(true);
    }
  }, [queue, open, shown]);

  // Settle every waiting request if the provider unmounts, so no caller hangs.
  useEffect(
    () => () => {
      for (const pending of queueRef.current) pending.resolve(false);
    },
    [],
  );

  const settle = (confirmed: boolean) => {
    if (!shown || !open) return;
    shown.resolve(confirmed);
    setOpen(false);
  };

  const handleExited = () => {
    setQueue((q) => q.slice(1));
    setShown(null);
  };

  const o = shown?.options;
  const danger = Boolean(o?.danger || o?.typeToConfirm);
  const actions: FabricDialogAction[] = [];
  if (o && !o.hideCancel) {
    actions.push({
      label: o.cancelLabel ?? "Cancel",
      variant: "outlined",
      autoFocus: danger,
      onClick: () => settle(false),
    });
  }
  if (o) {
    actions.push({
      label: o.confirmLabel ?? "Confirm",
      variant: "contained",
      color: danger ? "error" : "primary",
      autoFocus: !danger,
      onClick: () => settle(true),
    });
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {/* A fresh dialog per request, so text typed for `typeToConfirm` never carries over. */}
      <FabricDialog
        key={shown?.id ?? "idle"}
        open={open}
        onClose={() => settle(false)}
        title={o?.title}
        subtitle={o?.description}
        titleIcon={o?.icon}
        actions={actions}
        confirmDelete={o?.typeToConfirm}
        maxWidth="xs"
        fullWidth
        role="alertdialog"
        slotProps={{ transition: { onExited: handleExited } }}
      />
    </ConfirmContext.Provider>
  );
}

/**
 * Returns `confirm(options)`, which opens a confirmation dialog and resolves to
 * `true` when the user confirms and `false` otherwise. Needs a
 * `FabricConfirmProvider` above the calling component.
 */
export function useConfirm(): FabricConfirmFn {
  const confirm = useContext(ConfirmContext);
  if (!confirm) {
    throw new Error("useConfirm needs a <FabricConfirmProvider> above this component.");
  }
  return confirm;
}

/**
 * Like `useConfirm`, but returns `null` instead of throwing when there's no
 * `FabricConfirmProvider`. For components that can fall back to `window.confirm`.
 */
export function useMaybeConfirm(): FabricConfirmFn | null {
  return useContext(ConfirmContext);
}
