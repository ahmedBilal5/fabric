import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/** A named set of grid settings: filters, sorting, visible columns and so on. */
export interface FabricSavedView<T> {
  /** Stable, unique id. */
  id: string;
  /** Name shown in the views menu. */
  name: string;
  /** The grid settings, e.g. from `apiRef.current.exportState()`. */
  state: T;
  /** Shipped with the app: can be switched to but not renamed, overwritten or deleted. */
  builtIn?: boolean;
}

export interface UseSavedViewsOptions<T> {
  /** Views that ship with the app, such as "All invoices" and "Overdue". At least one. */
  defaultViews: FabricSavedView<T>[];
  /** Remember the user's views and the active view in `localStorage` under this key. */
  storageKey?: string;
  /** The user's views to start with, e.g. loaded from your server. Ignored when storage has some. */
  initialViews?: FabricSavedView<T>[];
  /** The view to open first. Defaults to the stored one, then the first default view. */
  initialViewId?: string;
  /** Called with the user's views after every change, to save them on your server. */
  onViewsChange?: (views: FabricSavedView<T>[]) => void;
}

export interface SavedViews<T> {
  /** Default views first, then the user's, in creation order. */
  views: FabricSavedView<T>[];
  /** The view in use. */
  activeView: FabricSavedView<T>;
  /** Switches views. Apply `activeView.state` to the grid afterwards. */
  select: (id: string) => void;
  /** Saves `state` into a user view (the active one by default). Built-in views are left alone. */
  update: (state: T, id?: string) => void;
  /** Creates a user view, makes it active and returns it. */
  create: (name: string, state: T) => FabricSavedView<T>;
  /** Renames a user view. */
  rename: (id: string, name: string) => void;
  /** Deletes a user view. If it was active, the first default view becomes active. */
  remove: (id: string) => void;
  /** True when `state` differs from the active view's saved state. */
  isModified: (state: T) => boolean;
}

interface Stored<T> {
  views: FabricSavedView<T>[];
  activeId?: string;
}

function read<T>(key: string | undefined): Stored<T> | null {
  if (!key) return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Stored<T>) : null;
  } catch {
    return null;
  }
}

/** JSON with sorted object keys, so key order doesn't count as a change. */
function stable(value: unknown): string {
  return JSON.stringify(value, (_k, v) =>
    v && typeof v === "object" && !Array.isArray(v)
      ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => a.localeCompare(b)))
      : v,
  );
}

/** True when two view states are the same, ignoring object key order. */
export function viewStatesEqual<T>(a: T, b: T): boolean {
  return stable(a) === stable(b);
}

let counter = 0;
const newId = () => `view-${Date.now().toString(36)}-${(counter++).toString(36)}`;

/**
 * State for saved grid views: built-in views plus the ones the user saves, renames
 * and deletes. Pair it with `FabricSavedViews` for the menu, and with the grid's
 * `exportState()` / `restoreState()` to read and apply settings.
 *
 * Views live in memory, in `localStorage` (`storageKey`), or on your server
 * (`initialViews` + `onViewsChange`). The hook never calls an API itself.
 *
 * @example
 * ```tsx
 * const views = useSavedViews({
 *   storageKey: "invoices-views",
 *   defaultViews: [{ id: "all", name: "All invoices", state: {}, builtIn: true }],
 * });
 * ```
 */
export function useSavedViews<T>({
  defaultViews,
  storageKey,
  initialViews = [],
  initialViewId,
  onViewsChange,
}: UseSavedViewsOptions<T>): SavedViews<T> {
  const [stored, setStored] = useState<Stored<T>>(() => {
    const fromStorage = read<T>(storageKey);
    return {
      views: fromStorage?.views ?? initialViews,
      activeId: initialViewId ?? fromStorage?.activeId,
    };
  });

  const builtIns = useMemo(
    () => defaultViews.map((v) => ({ ...v, builtIn: true })),
    [defaultViews],
  );
  const views = useMemo(() => [...builtIns, ...stored.views], [builtIns, stored.views]);
  const activeView = views.find((v) => v.id === stored.activeId) ?? views[0];
  if (!activeView) throw new Error("useSavedViews needs at least one view in defaultViews.");

  // Persist, and report changes to the user's views (not to the active id).
  const onChange = useRef(onViewsChange);
  onChange.current = onViewsChange;
  const lastViews = useRef(stored.views);
  useEffect(() => {
    if (storageKey) {
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(stored));
      } catch {
        // Storage can be full or blocked; views still work for this session.
      }
    }
    if (lastViews.current !== stored.views) {
      lastViews.current = stored.views;
      onChange.current?.(stored.views);
    }
  }, [stored, storageKey]);

  const select = useCallback((id: string) => setStored((s) => ({ ...s, activeId: id })), []);

  const update = useCallback(
    (state: T, id?: string) =>
      setStored((s) => {
        const target = id ?? s.activeId;
        if (!s.views.some((v) => v.id === target)) return s;
        return { ...s, views: s.views.map((v) => (v.id === target ? { ...v, state } : v)) };
      }),
    [],
  );

  const create = useCallback((name: string, state: T) => {
    const view: FabricSavedView<T> = { id: newId(), name: name.trim(), state };
    setStored((s) => ({ views: [...s.views, view], activeId: view.id }));
    return view;
  }, []);

  const rename = useCallback(
    (id: string, name: string) =>
      setStored((s) => ({
        ...s,
        views: s.views.map((v) => (v.id === id ? { ...v, name: name.trim() } : v)),
      })),
    [],
  );

  const remove = useCallback(
    (id: string) =>
      setStored((s) => ({
        views: s.views.filter((v) => v.id !== id),
        activeId: s.activeId === id ? undefined : s.activeId,
      })),
    [],
  );

  const isModified = useCallback(
    (state: T) => !viewStatesEqual(state, activeView.state),
    [activeView],
  );

  return { views, activeView, select, update, create, rename, remove, isModified };
}
