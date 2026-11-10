import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * Returns `value` once it has stopped changing for `delay` milliseconds. Use it to
 * search as the user types without a request per keystroke.
 *
 * @example
 * ```tsx
 * const [query, setQuery] = useState("");
 * const debounced = useDebounce(query, 300);
 * useEffect(() => { if (debounced) search(debounced); }, [debounced]);
 * ```
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

/** A debounced function, with ways to cancel or run the pending call now. */
export interface DebouncedCallback<A extends unknown[]> {
  (...args: A): void;
  /** Drops the pending call. */
  cancel: () => void;
  /** Runs the pending call now, if there is one. */
  flush: () => void;
}

/**
 * Returns a stable function that runs `callback` only after calls stop for `delay`
 * milliseconds, with the latest arguments. The pending call is cancelled on unmount.
 * `callback` can change between renders; the latest one runs.
 *
 * @example
 * ```tsx
 * const save = useDebouncedCallback((text: string) => api.saveDraft(text), 800);
 * <FabricTextField onChange={(e) => save(e.target.value)} />
 * ```
 */
export function useDebouncedCallback<A extends unknown[]>(
  callback: (...args: A) => void,
  delay = 300,
): DebouncedCallback<A> {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pending = useRef<A | null>(null);

  const cancel = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    pending.current = null;
  }, []);

  const flush = useCallback(() => {
    const args = pending.current;
    cancel();
    if (args) callbackRef.current(...args);
  }, [cancel]);

  useEffect(() => cancel, [cancel]);

  return useMemo(() => {
    const fn = ((...args: A) => {
      pending.current = args;
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(flush, delay);
    }) as DebouncedCallback<A>;
    fn.cancel = cancel;
    fn.flush = flush;
    return fn;
  }, [delay, cancel, flush]);
}
