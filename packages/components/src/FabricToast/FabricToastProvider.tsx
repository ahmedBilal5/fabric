/**
 * FabricToastProvider and useToast: show a toast with one call, instead of keeping a
 * snackbar's open state and message in every component that reports something.
 *
 * Mount `FabricToastProvider` once near the root of the app. Anywhere below it,
 * `useToast()` returns a `toast` function with `success`, `info`, `warning` and
 * `error` shortcuts. Toasts queue and show one at a time, each for its duration.
 * A toast can carry one action button, such as Undo.
 *
 * @example
 * ```tsx
 * const toast = useToast();
 *
 * toast.success("Invoice sent");
 * toast.error("Couldn't save", { message: "Check your connection and try again." });
 * toast({
 *   title: "3 invoices deleted",
 *   action: { label: "Undo", onClick: restoreInvoices },
 * });
 * ```
 */

import { spacing } from "@fabric-kit/design-tokens";
import type { AlertColor, SnackbarCloseReason } from "@mui/material";
import {
  createContext,
  type ReactNode,
  type SyntheticEvent,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { FabricButton } from "../FabricButton/FabricButton";
import { FabricSnackbar } from "../FabricSnackbar";

/** A button shown on the toast. Clicking it runs `onClick` and closes the toast. */
export interface FabricToastAction {
  /** Button label, e.g. "Undo" or "View". */
  label: ReactNode;
  /** Runs when the button is clicked. */
  onClick: () => void;
}

/** What a toast shows. */
export interface FabricToastOptions {
  /** Bold first line. Keep it short: "Invoice sent". */
  title?: ReactNode;
  /** Detail under the title. */
  message?: ReactNode;
  /** Color and icon. @default "success" */
  severity?: AlertColor;
  /**
   * Milliseconds before the toast hides by itself. `null` keeps it until the user
   * closes it. Defaults to the provider's `duration`, and to at least 10 seconds when
   * the toast has an action so there is time to use it.
   */
  duration?: number | null;
  /** One action button, such as Undo. */
  action?: FabricToastAction;
  /** Runs when the toast closes, whether it timed out, was closed or its action was used. */
  onClose?: () => void;
}

/** Text for a shortcut: the title, plus any other options. */
type ToastShortcut = (
  title: ReactNode,
  options?: Omit<FabricToastOptions, "title" | "severity">,
) => number;

/** Shows a toast and returns its id, which `toast.dismiss(id)` accepts. */
export interface FabricToastFn {
  (options: FabricToastOptions): number;
  success: ToastShortcut;
  info: ToastShortcut;
  warning: ToastShortcut;
  error: ToastShortcut;
  /** Closes a toast by id, or the one on screen and every queued toast when called without one. */
  dismiss: (id?: number) => void;
}

export interface FabricToastProviderProps {
  children?: ReactNode;
  /** Default time on screen in milliseconds. @default 5000 */
  duration?: number;
  /** Vertical position. @default "bottom" */
  vertical?: "top" | "bottom";
  /** Horizontal position. @default "center" */
  horizontal?: "left" | "center" | "right";
  /** Extra space above a top-anchored toast, e.g. to clear a fixed app bar. */
  topOffset?: number;
  /** Most toasts kept waiting; the oldest waiting toast is dropped beyond this. @default 5 */
  maxQueue?: number;
}

interface QueuedToast extends FabricToastOptions {
  id: number;
}

const ToastContext = createContext<FabricToastFn | null>(null);

const ACTION_MIN_DURATION = 10000;

/**
 * Hosts the toasts for `useToast`. Mount it once, inside the theme provider and above
 * every component that shows toasts.
 */
export function FabricToastProvider({
  children,
  duration = 5000,
  vertical = "bottom",
  horizontal = "center",
  topOffset,
  maxQueue = 5,
}: FabricToastProviderProps) {
  const [queue, setQueue] = useState<QueuedToast[]>([]);
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState<QueuedToast | null>(null);
  const nextId = useRef(0);
  const shownRef = useRef(shown);
  shownRef.current = shown;

  const show = useCallback(
    (options: FabricToastOptions) => {
      nextId.current += 1;
      const id = nextId.current;
      setQueue((q) => {
        const next = [...q, { ...options, id }];
        // Drop the oldest waiting toasts, never the one on screen.
        const onScreen = next[0]?.id === shownRef.current?.id ? 1 : 0;
        const overflow = next.length - onScreen - maxQueue;
        return overflow > 0
          ? [...next.slice(0, onScreen), ...next.slice(onScreen + overflow)]
          : next;
      });
      return id;
    },
    [maxQueue],
  );

  const dismiss = useCallback((id?: number) => {
    const current = shownRef.current;
    if (id === undefined || id === current?.id) setOpen(false);
    setQueue((q) =>
      id === undefined
        ? q.filter((t) => t.id === current?.id)
        : q.filter((t) => t.id !== id || t.id === current?.id),
    );
  }, []);

  const toast = useMemo<FabricToastFn>(() => {
    const fn = ((options: FabricToastOptions) => show(options)) as FabricToastFn;
    const shortcut =
      (severity: AlertColor): ToastShortcut =>
      (title, options) =>
        show({ ...options, title, severity });
    fn.success = shortcut("success");
    fn.info = shortcut("info");
    fn.warning = shortcut("warning");
    fn.error = shortcut("error");
    fn.dismiss = dismiss;
    return fn;
  }, [show, dismiss]);

  // Show the next toast when the screen is free.
  useEffect(() => {
    if (!open && !shown && queue.length > 0) {
      setShown(queue[0]);
      setOpen(true);
    }
  }, [queue, open, shown]);

  const handleClose = (_event: Event | SyntheticEvent | null, reason: SnackbarCloseReason) => {
    // A click elsewhere on the page shouldn't throw away a message.
    if (reason === "clickaway") return;
    setOpen(false);
  };

  const handleExited = () => {
    shown?.onClose?.();
    setQueue((q) => q.filter((t) => t.id !== shown?.id));
    setShown(null);
  };

  const hideAfter =
    shown?.duration === null
      ? null
      : shown?.action
        ? Math.max(shown.duration ?? duration, ACTION_MIN_DURATION)
        : (shown?.duration ?? duration);

  // FabricAlert adds the Close button next to this action.
  const actionSlot = shown?.action ? (
    <FabricButton
      size="small"
      variant="text"
      sx={{ ml: `${spacing.sm}px` }}
      onClick={() => {
        shown.action?.onClick();
        setOpen(false);
      }}
    >
      {shown.action.label}
    </FabricButton>
  ) : undefined;

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <FabricSnackbar
        key={shown?.id ?? "idle"}
        open={open}
        onClose={handleClose}
        autoHideDuration={hideAfter}
        severity={shown?.severity ?? "success"}
        title={shown?.title}
        vertical={vertical}
        horizontal={horizontal}
        topOffset={topOffset}
        alertProps={{ action: actionSlot }}
        slotProps={{ transition: { onExited: handleExited } }}
      >
        {shown?.message}
      </FabricSnackbar>
    </ToastContext.Provider>
  );
}

/**
 * Returns `toast(options)` with `success`, `info`, `warning`, `error` and `dismiss`
 * helpers. Needs a `FabricToastProvider` above the calling component.
 */
export function useToast(): FabricToastFn {
  const toast = useContext(ToastContext);
  if (!toast) {
    throw new Error("useToast needs a <FabricToastProvider> above this component.");
  }
  return toast;
}
