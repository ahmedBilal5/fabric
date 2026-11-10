/**
 * FabricRelativeTime — "3 minutes ago" that keeps itself up to date, inside a real
 * `<time>` element. Hover or focus shows the exact date and time.
 *
 * Re-renders every 10 seconds for recent times and less often as they get older, so a
 * long list of timestamps stays cheap. Formatting uses the browser's `Intl`, so pass
 * `locale` to match your app's language.
 *
 * @example
 * ```tsx
 * <FabricRelativeTime date={comment.createdAt} />
 * <FabricRelativeTime date={job.finishedAt} style="short" />  // "3 min. ago"
 * ```
 */

import { type DateInput, formatDate, toDate, useRelativeTime } from "@fabric-kit/hooks";
import { type SxProps, styled, type Theme } from "@mui/material/styles";
import { forwardRef, type HTMLAttributes, memo } from "react";
import { FabricTooltip } from "../FabricTooltip";

export interface FabricRelativeTimeProps
  extends Omit<HTMLAttributes<HTMLTimeElement>, "children" | "style"> {
  /** The moment to describe: a `Date`, a timestamp in ms, or an ISO string. */
  date: DateInput;
  /** BCP 47 locale for the text, e.g. `"de"`. Defaults to the browser's. */
  locale?: string;
  /** Word length: `"long"` ("3 minutes ago"), `"short"` ("3 min. ago") or `"narrow"`. @default "long" */
  style?: Intl.RelativeTimeFormatStyle;
  /** `"auto"` allows words such as "yesterday"; `"always"` keeps numbers ("1 day ago"). @default "auto" */
  numeric?: Intl.RelativeTimeFormatNumeric;
  /** Show the exact date and time on hover and focus. @default true */
  tooltip?: boolean;
  /** System styles on the `<time>` element. It inherits font and color by default. */
  sx?: SxProps<Theme>;
}

const Time = styled("time")({ font: "inherit", color: "inherit" });

const FabricRelativeTimeImpl = forwardRef<HTMLTimeElement, FabricRelativeTimeProps>(
  function FabricRelativeTime({ date, locale, style, numeric, tooltip = true, ...rest }, ref) {
    const text = useRelativeTime(date, { locale, style, numeric });
    const d = toDate(date);
    const full = formatDate(d, { dateStyle: "full", timeStyle: "short" }, { locale });

    const node = (
      <Time
        ref={ref}
        dateTime={d.toISOString()}
        // Keyboard users reach the exact time through focus; screen readers read it from the label.
        tabIndex={tooltip ? 0 : undefined}
        aria-label={tooltip ? `${text} (${full})` : undefined}
        {...rest}
      >
        {text}
      </Time>
    );

    return tooltip ? (
      <FabricTooltip title={full} placement="top">
        {node}
      </FabricTooltip>
    ) : (
      node
    );
  },
);

FabricRelativeTimeImpl.displayName = "FabricRelativeTime";

/** "3 minutes ago" text that updates itself, with the exact time on hover. */
export const FabricRelativeTime = memo(FabricRelativeTimeImpl);
