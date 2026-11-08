/**
 * FabricAvatarGroup — stacked avatars for "shared with N users" cells.
 *
 * Extends MUI `AvatarGroup` with a `list` prop that describes each avatar
 * declaratively, plus a custom `renderSurplus` that shows the names of
 * hidden users in a tooltip on the `+N` chip.
 *
 *   - Each item renders as a `FabricAvatar`, so `name` gives initials, a
 *     consistent color and `alt` text.
 *   - The surplus tooltip lists hidden users' names, capped by
 *     `surplusTooltipLimit` (default 10), and works whether or not `max` is set.
 *   - Items without a tooltip render without a `<Tooltip>` wrapper.
 *
 * @example
 * ```tsx
 * <FabricAvatarGroup
 *   max={4}
 *   list={teamMembers.map((m) => ({
 *     name: m.fullName,
 *     image: m.avatarUrl ? <img src={m.avatarUrl} alt="" /> : undefined,
 *     tooltip: m.role,
 *   }))}
 * />
 * ```
 */

import AvatarGroup, { type AvatarGroupProps } from "@mui/material/AvatarGroup";
import Tooltip from "@mui/material/Tooltip";
import React, { forwardRef, memo, type ReactNode, useMemo } from "react";
import { FabricAvatar } from "../FabricAvatar";

export interface FabricAvatarItem {
  /** Person / entity name — used for tooltip fallback, initials, `alt`. */
  name?: string;
  /** Image node (typically an `<img>` or `<Icon>`). Wins over `initials`. */
  image?: ReactNode;
  /** Explicit two-letter override (uses `name`-derived initials otherwise). */
  initials?: string;
  /** Tooltip content on hover. Falls back to `name` when unset. */
  tooltip?: ReactNode;
  /** Screen-reader label. Falls back to `name` when unset. */
  alt?: string;
}

export interface FabricAvatarGroupProps
  extends Omit<AvatarGroupProps, "children" | "renderSurplus"> {
  list: FabricAvatarItem[];
  /**
   * How many names to include in the surplus `+N` tooltip before switching
   * to a "N more…" line. Default 10.
   */
  surplusTooltipLimit?: number;
  /**
   * Text for the overflow line when the surplus tooltip is capped.
   * Default: `(count) => \`${count} more users…\``.
   */
  surplusOverflowText?: (count: number) => string;
}

function itemTooltipText(item: FabricAvatarItem): ReactNode {
  return item.tooltip ?? item.name ?? null;
}

const FabricAvatarGroupImpl = forwardRef<HTMLDivElement, FabricAvatarGroupProps>(
  function FabricAvatarGroup(
    {
      list,
      max,
      surplusTooltipLimit = 10,
      surplusOverflowText = (count) => `${count} more users…`,
      ...rest
    },
    ref,
  ) {
    // MUI's default `max` is 5 when unset; match it so surplus math lines up.
    const effectiveMax = max ?? 5;

    const surplusTooltip = useMemo(() => {
      if (list.length <= effectiveMax) return null;
      const hidden = list.slice(effectiveMax - 1);
      const names = hidden
        .map((item) => itemTooltipText(item))
        .filter((v): v is ReactNode => v !== null && v !== undefined && v !== "");
      if (names.length === 0) return null;
      const shown = names.slice(0, surplusTooltipLimit);
      const overflowCount = names.length - shown.length;
      return (
        <div style={{ whiteSpace: "pre" }}>
          {shown.map((n, i) => (
            <React.Fragment key={i}>
              {n}
              {i < shown.length - 1 || overflowCount > 0 ? "\n" : ""}
            </React.Fragment>
          ))}
          {overflowCount > 0 ? surplusOverflowText(overflowCount) : null}
        </div>
      );
    }, [list, effectiveMax, surplusTooltipLimit, surplusOverflowText]);

    return (
      <AvatarGroup
        ref={ref}
        max={max}
        renderSurplus={(surplus) => {
          const chip = <FabricAvatar>+{surplus}</FabricAvatar>;
          return surplusTooltip ? <Tooltip title={surplusTooltip}>{chip}</Tooltip> : chip;
        }}
        {...rest}
      >
        {list.map((item, index) => {
          const tooltipContent = itemTooltipText(item);
          const avatar = (
            <FabricAvatar key={index} name={item.name} alt={item.alt}>
              {item.image ?? item.initials}
            </FabricAvatar>
          );
          return tooltipContent ? (
            <Tooltip key={index} title={tooltipContent}>
              {avatar}
            </Tooltip>
          ) : (
            <React.Fragment key={index}>{avatar}</React.Fragment>
          );
        })}
      </AvatarGroup>
    );
  },
);

FabricAvatarGroupImpl.displayName = "FabricAvatarGroup";

export const FabricAvatarGroup = memo(FabricAvatarGroupImpl);
