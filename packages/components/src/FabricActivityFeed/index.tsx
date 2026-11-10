/**
 * FabricActivityFeed — a dated list of what happened to a record: who did what, to
 * what, and when. "Jane Doe changed the status to Paid · 3 minutes ago".
 *
 * Each event has an actor (shown as an avatar, or an icon for system events), an
 * action, an optional target and an optional block of content such as a comment or a
 * before/after value. Events are grouped under "Today", "Yesterday" and dated
 * headings. Times update themselves and show the exact time on hover.
 *
 * The feed only renders what it's given. Pass `onLoadMore` and `hasMore` for paging;
 * your code fetches the events.
 *
 * @example
 * ```tsx
 * <FabricActivityFeed
 *   items={[
 *     { id: 1, actor: { name: "Jane Doe" }, action: "changed the status to", target: "Paid", date: paidAt },
 *     { id: 2, actor: { name: "System" }, icon: <Sync />, action: "synced with Northwind", date: syncedAt },
 *   ]}
 * />
 * ```
 */

import { fontWeight, spacing } from "@fabric-kit/design-tokens";
import { type DateInput, formatDate, toDate } from "@fabric-kit/hooks";
import { FabricStack, FabricText } from "@fabric-kit/primitives";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import type { SxProps, Theme } from "@mui/material/styles";
import {
  forwardRef,
  type HTMLAttributes,
  isValidElement,
  type Key,
  memo,
  type ReactNode,
  useId,
} from "react";
import { FabricAvatar } from "../FabricAvatar";
import { FabricButton } from "../FabricButton";
import { FabricRelativeTime } from "../FabricRelativeTime";
import type { FabricStatusColor } from "../FabricStatus";

/** Who did it: a person (shown as an avatar) or any node of your own. */
export interface FabricActivityActor {
  /** Display name, also used for the avatar's initials. */
  name: string;
  /** Avatar image URL. */
  avatarSrc?: string;
}

export interface FabricActivityItem {
  /** Stable, unique key. */
  id: Key;
  /** Who did it. A string or `{ name, avatarSrc }` shows an avatar; any other node is shown as is. */
  actor: FabricActivityActor | string | ReactNode;
  /** What they did, e.g. "changed the status to". */
  action: ReactNode;
  /** What it was done to, shown emphasized after the action, e.g. "Paid" or "INV-2041". */
  target?: ReactNode;
  /** When it happened. */
  date: DateInput;
  /** Icon in the marker instead of the avatar, e.g. for system events. */
  icon?: ReactNode;
  /** Tints the icon marker with a status color. Only applies with `icon`. */
  color?: FabricStatusColor;
  /** Extra content under the line: a comment, a diff, an attachment. */
  content?: ReactNode;
}

export interface FabricActivityFeedProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** Events, newest first (or in whichever order you want them shown). */
  items: FabricActivityItem[];
  /** Group events under "Today", "Yesterday" and dated headings. @default true */
  groupByDay?: boolean;
  /** Heading element for day groups, to fit the page outline. @default "h3" */
  dayHeadingComponent?: "h2" | "h3" | "h4" | "h5" | "h6";
  /** BCP 47 locale for dates and times. Defaults to the browser's. */
  locale?: string;
  /** Show placeholder rows instead of items. @default false */
  loading?: boolean;
  /** Shown when there are no items and `loading` is false. */
  emptyState?: ReactNode;
  /** Show a "Show more" button that calls `onLoadMore`. */
  hasMore?: boolean;
  /** Called by "Show more". */
  onLoadMore?: () => void;
  /** Puts "Show more" in its loading state. */
  loadingMore?: boolean;
  /** Label of the load-more button. @default "Show more" */
  loadMoreLabel?: ReactNode;
  /** Tighter rows and smaller avatars, for side panels. @default false */
  dense?: boolean;
  /** System styles on the root. */
  sx?: SxProps<Theme>;
}

const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

function dayLabel(d: Date, locale?: string) {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  const cap = (s: string) => s.charAt(0).toLocaleUpperCase(locale) + s.slice(1);
  if (dayKey(d) === dayKey(today)) return cap(rtf.format(0, "day"));
  if (dayKey(d) === dayKey(yesterday)) return cap(rtf.format(-1, "day"));
  const sameYear = d.getFullYear() === today.getFullYear();
  return formatDate(
    d,
    sameYear
      ? { weekday: "long", month: "long", day: "numeric" }
      : { year: "numeric", month: "long", day: "numeric" },
    { locale },
  );
}

const isActor = (a: unknown): a is FabricActivityActor =>
  typeof a === "object" && a !== null && !isValidElement(a) && "name" in a;

function Marker({ item, size }: { item: FabricActivityItem; size: number }) {
  if (item.icon) {
    const tint = item.color
      ? `var(--mui-palette-semantic-${item.color}-main)`
      : "var(--mui-palette-text-secondary)";
    return (
      <Box
        aria-hidden
        sx={{
          width: size,
          height: size,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: tint,
          backgroundColor: "var(--mui-palette-background-paper)",
          boxShadow: "inset 0 0 0 1px var(--mui-palette-divider)",
          "& svg": { fontSize: size * 0.58 },
        }}
      >
        {item.icon}
      </Box>
    );
  }
  if (typeof item.actor === "string") {
    return <FabricAvatar name={item.actor} size={size} aria-hidden />;
  }
  if (isActor(item.actor)) {
    return (
      <FabricAvatar name={item.actor.name} src={item.actor.avatarSrc} size={size} aria-hidden />
    );
  }
  return <Box aria-hidden sx={{ width: size, height: size }} />;
}

function Event({
  item,
  last,
  dense,
  locale,
}: {
  item: FabricActivityItem;
  last: boolean;
  dense: boolean;
  locale?: string;
}) {
  const size = dense ? 24 : 32;
  const actorNode =
    typeof item.actor === "string"
      ? item.actor
      : isActor(item.actor)
        ? item.actor.name
        : item.actor;
  return (
    <Box
      component="li"
      sx={{
        position: "relative",
        display: "grid",
        gridTemplateColumns: `${size}px minmax(0, 1fr)`,
        columnGap: `${spacing.md}px`,
        pb: last ? 0 : `${dense ? spacing.md : spacing.lg}px`,
        // The line that joins markers.
        ...(!last && {
          "&::before": {
            content: '""',
            position: "absolute",
            left: size / 2 - 0.5,
            top: size + 4,
            bottom: 4,
            width: "1px",
            backgroundColor: "var(--mui-palette-divider)",
          },
        }),
      }}
    >
      <Marker item={item} size={size} />
      <Box sx={{ minWidth: 0, pt: dense ? "2px" : "6px" }}>
        <FabricText
          component="p"
          sx={{ m: 0, fontSize: dense ? "0.8125rem" : "0.875rem", lineHeight: 1.5 }}
        >
          <Box component="span" sx={{ fontWeight: fontWeight.semiBold }}>
            {actorNode}
          </Box>{" "}
          <Box component="span" sx={{ color: "var(--mui-palette-text-secondary)" }}>
            {item.action}
          </Box>
          {item.target != null && (
            <>
              {" "}
              <Box component="span" sx={{ fontWeight: fontWeight.medium }}>
                {item.target}
              </Box>
            </>
          )}
          <Box
            component="span"
            aria-hidden
            sx={{ color: "var(--mui-palette-text-disabled)", mx: `${spacing.xs}px` }}
          >
            ·
          </Box>
          <FabricRelativeTime
            date={item.date}
            locale={locale}
            sx={{ color: "var(--mui-palette-text-secondary)" }}
          />
        </FabricText>
        {item.content != null && (
          <Box
            sx={{
              mt: `${spacing.sm}px`,
              fontSize: "0.875rem",
              color: "var(--mui-palette-text-primary)",
            }}
          >
            {item.content}
          </Box>
        )}
      </Box>
    </Box>
  );
}

const listSx = { listStyle: "none", m: 0, p: 0 } as const;

const FabricActivityFeedImpl = forwardRef<HTMLDivElement, FabricActivityFeedProps>(
  function FabricActivityFeed(
    {
      items,
      groupByDay = true,
      dayHeadingComponent = "h3",
      locale,
      loading = false,
      emptyState,
      hasMore = false,
      onLoadMore,
      loadingMore = false,
      loadMoreLabel = "Show more",
      dense = false,
      sx,
      ...rest
    },
    ref,
  ) {
    const baseId = useId();

    let body: ReactNode;
    if (loading) {
      body = (
        <Box component="ul" aria-busy="true" aria-label="Loading activity" sx={listSx}>
          {[0, 1, 2].map((i) => (
            <Box
              component="li"
              key={i}
              sx={{ display: "flex", gap: `${spacing.md}px`, pb: `${spacing.lg}px` }}
            >
              <Skeleton variant="circular" width={dense ? 24 : 32} height={dense ? 24 : 32} />
              <Box sx={{ flex: 1, pt: "6px" }}>
                <Skeleton variant="text" width={`${70 - i * 12}%`} />
              </Box>
            </Box>
          ))}
        </Box>
      );
    } else if (items.length === 0) {
      body = emptyState ?? null;
    } else if (!groupByDay) {
      body = (
        <Box component="ol" sx={listSx}>
          {items.map((item, i) => (
            <Event
              key={item.id}
              item={item}
              last={i === items.length - 1}
              dense={dense}
              locale={locale}
            />
          ))}
        </Box>
      );
    } else {
      const groups: { key: string; date: Date; items: FabricActivityItem[] }[] = [];
      for (const item of items) {
        const d = toDate(item.date);
        const k = dayKey(d);
        const g = groups[groups.length - 1];
        if (g && g.key === k) g.items.push(item);
        else groups.push({ key: k, date: d, items: [item] });
      }
      body = (
        <FabricStack gap={dense ? "md" : "lg"}>
          {groups.map((g) => {
            const headingId = `${baseId}-${g.key}`;
            return (
              <section key={g.key} aria-labelledby={headingId}>
                <FabricText
                  id={headingId}
                  component={dayHeadingComponent}
                  sx={{
                    m: 0,
                    mb: `${spacing.md}px`,
                    fontSize: "0.75rem",
                    fontWeight: fontWeight.semiBold,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    color: "var(--mui-palette-text-secondary)",
                  }}
                >
                  {dayLabel(g.date, locale)}
                </FabricText>
                <Box component="ol" sx={listSx}>
                  {g.items.map((item, i) => (
                    <Event
                      key={item.id}
                      item={item}
                      last={i === g.items.length - 1}
                      dense={dense}
                      locale={locale}
                    />
                  ))}
                </Box>
              </section>
            );
          })}
        </FabricStack>
      );
    }

    return (
      <Box ref={ref} sx={sx} {...rest}>
        {body}
        {hasMore && onLoadMore && !loading && (
          <Box sx={{ mt: `${spacing.md}px` }}>
            <FabricButton variant="text" onClick={onLoadMore} loading={loadingMore}>
              {loadMoreLabel}
            </FabricButton>
          </Box>
        )}
      </Box>
    );
  },
);

FabricActivityFeedImpl.displayName = "FabricActivityFeed";

/** A dated list of events: who did what, to what, and when. */
export const FabricActivityFeed = memo(FabricActivityFeedImpl);
