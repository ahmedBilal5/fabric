import { useEffect, useRef } from "react";

/**
 * A key combination such as `"mod+k"`, `"shift+?"`, `"escape"` or `"ctrl+alt+n"`.
 * `mod` is ⌘ on macOS and Ctrl elsewhere. Modifiers: `mod`, `ctrl`, `meta`, `alt`
 * (or `option`), `shift`. The key is a character (`k`, `/`, `?`) or a key name
 * (`escape`, `enter`, `arrowup`, `f2`), case-insensitive.
 */
export type Hotkey = string;

interface ParsedHotkey {
  key: string;
  ctrl: boolean;
  meta: boolean;
  alt: boolean;
  shift: boolean;
}

const ALIASES: Record<string, string> = {
  esc: "escape",
  return: "enter",
  space: " ",
  up: "arrowup",
  down: "arrowdown",
  left: "arrowleft",
  right: "arrowright",
  del: "delete",
  plus: "+",
};

/** Whether this browser runs on Apple hardware, where `mod` means ⌘. */
export function isApplePlatform(): boolean {
  if (typeof navigator === "undefined") return false;
  const platform =
    (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform ??
    navigator.platform;
  return /mac|iphone|ipad|ipod/i.test(platform ?? "");
}

/** Parses `"mod+shift+k"` into its key and modifiers. */
export function parseHotkey(hotkey: Hotkey, apple = isApplePlatform()): ParsedHotkey {
  // Split on "+" but keep a literal "+" key ("ctrl++" or "plus").
  const parts = hotkey
    .toLowerCase()
    .replace(/\+\+$/, "+plus")
    .split("+")
    .map((p) => p.trim())
    .filter(Boolean);
  const parsed: ParsedHotkey = { key: "", ctrl: false, meta: false, alt: false, shift: false };
  for (const part of parts) {
    if (part === "mod") {
      if (apple) parsed.meta = true;
      else parsed.ctrl = true;
    } else if (part === "ctrl" || part === "control") parsed.ctrl = true;
    else if (part === "meta" || part === "cmd" || part === "command") parsed.meta = true;
    else if (part === "alt" || part === "option") parsed.alt = true;
    else if (part === "shift") parsed.shift = true;
    else parsed.key = ALIASES[part] ?? part;
  }
  return parsed;
}

/** Whether a keyboard event matches a hotkey. */
export function matchesHotkey(
  event: Pick<KeyboardEvent, "key" | "ctrlKey" | "metaKey" | "altKey" | "shiftKey">,
  hotkey: Hotkey,
  apple = isApplePlatform(),
): boolean {
  const h = parseHotkey(hotkey, apple);
  const key = event.key.toLowerCase();
  if (key !== h.key) return false;
  if (event.ctrlKey !== h.ctrl || event.metaKey !== h.meta || event.altKey !== h.alt) return false;
  // Characters such as "?" already need Shift, so only enforce Shift when it was asked
  // for or when the key is a named key (Escape, Enter, arrows…).
  const isCharacter = h.key.length === 1;
  if (h.shift) return event.shiftKey;
  return isCharacter ? true : !event.shiftKey;
}

/** Formats a hotkey for display: `"mod+k"` → `"⌘K"` on macOS, `"Ctrl+K"` elsewhere. */
export function formatHotkey(hotkey: Hotkey, apple = isApplePlatform()): string {
  const h = parseHotkey(hotkey, apple);
  const names: Record<string, string> = {
    escape: "Esc",
    enter: "Enter",
    " ": "Space",
    arrowup: "↑",
    arrowdown: "↓",
    arrowleft: "←",
    arrowright: "→",
    delete: "Del",
    backspace: "Backspace",
    tab: "Tab",
  };
  const key =
    names[h.key] ??
    (h.key.length === 1 ? h.key.toUpperCase() : h.key[0].toUpperCase() + h.key.slice(1));
  if (apple) {
    return `${h.ctrl ? "⌃" : ""}${h.alt ? "⌥" : ""}${h.shift ? "⇧" : ""}${h.meta ? "⌘" : ""}${key}`;
  }
  return [h.ctrl && "Ctrl", h.alt && "Alt", h.shift && "Shift", h.meta && "Win", key]
    .filter(Boolean)
    .join("+");
}

export interface UseHotkeysOptions {
  /** Turn the shortcut off without unmounting. @default true */
  enabled?: boolean;
  /** Call `preventDefault()` on a match, e.g. to stop the browser's own ⌘K. @default true */
  preventDefault?: boolean;
  /**
   * Also fire while focus is in a text input, textarea, select or contenteditable.
   * Off by default so typing "?" in a field doesn't open a help dialog. Shortcuts with
   * Ctrl, ⌘ or Alt always fire.
   */
  enableInInputs?: boolean;
  /** Element to listen on. @default window */
  target?: EventTarget | null;
}

function isTypingTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el || typeof el.tagName !== "string") return false;
  const tag = el.tagName.toLowerCase();
  return tag === "input" || tag === "textarea" || tag === "select" || el.isContentEditable;
}

/**
 * Runs `handler` when the user presses one of `hotkeys`. The handler can change
 * between renders without re-registering the listener.
 *
 * @example
 * ```tsx
 * useHotkeys("mod+k", () => palette.onOpen());
 * useHotkeys(["shift+?", "f1"], () => help.onOpen());
 * ```
 */
export function useHotkeys(
  hotkeys: Hotkey | Hotkey[],
  handler: (event: KeyboardEvent) => void,
  { enabled = true, preventDefault = true, enableInInputs = false, target }: UseHotkeysOptions = {},
): void {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;
  const keys = Array.isArray(hotkeys) ? hotkeys.join("|") : hotkeys;

  useEffect(() => {
    if (!enabled) return;
    const el = target === undefined ? (typeof window === "undefined" ? null : window) : target;
    if (!el) return;
    const list = keys.split("|");
    const apple = isApplePlatform();
    const onKeyDown = (e: Event) => {
      const event = e as KeyboardEvent;
      if (event.isComposing) return;
      const hit = list.some((k) => matchesHotkey(event, k, apple));
      if (!hit) return;
      const hasCommandModifier = event.ctrlKey || event.metaKey || event.altKey;
      if (!enableInInputs && !hasCommandModifier && isTypingTarget(event.target)) return;
      if (preventDefault) event.preventDefault();
      handlerRef.current(event);
    };
    el.addEventListener("keydown", onKeyDown);
    return () => el.removeEventListener("keydown", onKeyDown);
  }, [keys, enabled, preventDefault, enableInInputs, target]);
}
