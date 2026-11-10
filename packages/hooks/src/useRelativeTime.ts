import { useEffect, useState } from "react";
import {
  type DateInput,
  type FormatRelativeTimeOptions,
  formatRelativeTime,
  relativeTimeRefreshMs,
  toDate,
} from "./format";

/**
 * "3 minutes ago" text that keeps itself current: it re-renders every 10 seconds
 * for recent times and less often as the time gets older.
 *
 * @example
 * ```tsx
 * const ago = useRelativeTime(comment.createdAt);
 * <time dateTime={comment.createdAt}>{ago}</time>
 * ```
 */
export function useRelativeTime(
  date: DateInput,
  options: Omit<FormatRelativeTimeOptions, "now"> = {},
): string {
  const time = toDate(date).getTime();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    setNow(Date.now());
    let id: ReturnType<typeof setTimeout>;
    const tick = () => {
      const current = Date.now();
      setNow(current);
      id = setTimeout(tick, relativeTimeRefreshMs(time, current));
    };
    id = setTimeout(tick, relativeTimeRefreshMs(time));
    return () => clearTimeout(id);
  }, [time]);

  const { locale, numeric, style } = options;
  return formatRelativeTime(time, { locale, numeric, style, now });
}
