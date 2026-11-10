import { useCallback, useEffect, useRef, useState } from "react";

export interface UseClipboardOptions {
  /** Milliseconds `copied` stays true after a copy. @default 2000 */
  timeout?: number;
}

export interface Clipboard {
  /** Copies text. Resolves to `true` on success. */
  copy: (text: string) => Promise<boolean>;
  /** True for `timeout` ms after a successful copy, for "Copied" feedback. */
  copied: boolean;
  /** The last copy error, or `null`. */
  error: Error | null;
  /** Clears `copied` and `error`. */
  reset: () => void;
}

/**
 * Copies text to the clipboard and tracks a short "Copied" state for feedback.
 * Uses the async Clipboard API and falls back to a hidden textarea where it isn't
 * available (older browsers, non-secure origins).
 *
 * @example
 * ```tsx
 * const { copy, copied } = useClipboard();
 * <FabricButton onClick={() => copy(apiKey)}>{copied ? "Copied" : "Copy"}</FabricButton>
 * ```
 */
export function useClipboard({ timeout = 2000 }: UseClipboardOptions = {}): Clipboard {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const reset = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    setCopied(false);
    setError(null);
  }, []);

  const copy = useCallback(
    async (text: string) => {
      try {
        await writeText(text);
        setError(null);
        setCopied(true);
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => setCopied(false), timeout);
        return true;
      } catch (e) {
        setCopied(false);
        setError(e instanceof Error ? e : new Error(String(e)));
        return false;
      }
    },
    [timeout],
  );

  return { copy, copied, error, reset };
}

async function writeText(text: string): Promise<void> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Permission denied or not focused: try the fallback below.
    }
  }
  if (typeof document === "undefined") throw new Error("Clipboard is not available.");
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.select();
  const ok = document.execCommand("copy");
  document.body.removeChild(area);
  if (!ok) throw new Error("Copy was blocked by the browser.");
}
