import { useCallback, useMemo, useState } from "react";

/** Open state plus stable handlers for a dialog, drawer, menu or any show/hide UI. */
export interface Disclosure {
  /** Whether the thing is open. */
  open: boolean;
  /** Opens it. Stable across renders. */
  onOpen: () => void;
  /** Closes it. Stable across renders. */
  onClose: () => void;
  /** Flips it. Stable across renders. */
  onToggle: () => void;
  /** Sets it directly. */
  setOpen: (open: boolean) => void;
}

/**
 * Open/close state with stable handlers, so you can pass `onClose` straight to a
 * dialog without wrapping it in a new function each render.
 *
 * @example
 * ```tsx
 * const filters = useDisclosure();
 * <FabricButton onClick={filters.onOpen}>Filters</FabricButton>
 * <FabricDrawer open={filters.open} onClose={filters.onClose}>…</FabricDrawer>
 * ```
 */
export function useDisclosure(initialOpen = false): Disclosure {
  const [open, setOpen] = useState(initialOpen);
  const onOpen = useCallback(() => setOpen(true), []);
  const onClose = useCallback(() => setOpen(false), []);
  const onToggle = useCallback(() => setOpen((o) => !o), []);
  return useMemo(
    () => ({ open, onOpen, onClose, onToggle, setOpen }),
    [open, onOpen, onClose, onToggle],
  );
}
