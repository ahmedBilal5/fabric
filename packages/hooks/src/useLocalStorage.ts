import { useCallback, useEffect, useRef, useState } from "react";

const SAME_TAB_EVENT = "fabric:local-storage";

export interface UseLocalStorageOptions<T> {
  /** Turns the value into a string. @default JSON.stringify */
  serialize?: (value: T) => string;
  /** Reads the stored string back. @default JSON.parse */
  deserialize?: (raw: string) => T;
}

function storage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    // Blocked storage (privacy settings, sandboxed iframes) throws on access.
    return null;
  }
}

/**
 * State that persists in `localStorage` under `key`, like `useState`. It stays in
 * sync across components using the same key and across browser tabs, and falls back
 * to in-memory state when storage is unavailable (private mode, SSR, blocked
 * storage). Use it for preferences such as a collapsed sidebar or a chosen view, not
 * for data that must not be lost.
 *
 * @returns `[value, setValue, remove]`. `remove` deletes the key and returns to `initialValue`.
 *
 * @example
 * ```tsx
 * const [density, setDensity] = useLocalStorage<"compact" | "comfortable">("grid-density", "comfortable");
 * ```
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  { serialize = JSON.stringify, deserialize = JSON.parse }: UseLocalStorageOptions<T> = {},
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const initialRef = useRef(initialValue);
  const codec = useRef({ serialize, deserialize });
  codec.current = { serialize, deserialize };

  const read = useCallback((): T => {
    const raw = storage()?.getItem(key);
    if (raw === null || raw === undefined) return initialRef.current;
    try {
      return codec.current.deserialize(raw);
    } catch {
      return initialRef.current;
    }
  }, [key]);

  const [value, setValue] = useState<T>(read);
  const valueRef = useRef(value);
  valueRef.current = value;

  // Re-read when the key changes.
  useEffect(() => setValue(read()), [read]);

  // Follow writes from other tabs and from other hooks in this tab.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onStorage = (e: Event) => {
      const changedKey = e instanceof StorageEvent ? e.key : (e as CustomEvent<string>).detail;
      if (changedKey === key || changedKey === null) setValue(read());
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener(SAME_TAB_EVENT, onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(SAME_TAB_EVENT, onStorage);
    };
  }, [key, read]);

  const notify = useCallback(() => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(SAME_TAB_EVENT, { detail: key }));
    }
  }, [key]);

  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      const resolved =
        typeof next === "function" ? (next as (prev: T) => T)(valueRef.current) : next;
      valueRef.current = resolved;
      setValue(resolved);
      try {
        storage()?.setItem(key, codec.current.serialize(resolved));
      } catch {
        // Quota exceeded or blocked: keep the in-memory value.
      }
      notify();
    },
    [key, notify],
  );

  const remove = useCallback(() => {
    try {
      storage()?.removeItem(key);
    } catch {
      // Ignore blocked storage.
    }
    valueRef.current = initialRef.current;
    setValue(initialRef.current);
    notify();
  }, [key, notify]);

  return [value, set, remove];
}
