/**
 * FabricBreadcrumbs — the design-system breadcrumb trail.
 *
 * Data-driven wrapper over MUI `Breadcrumbs`. Accepts an `items` array where
 * the last item is auto-rendered as the current-page indicator (non-link,
 * bold) and preceding items render as `Link`s. Keys are stable
 * (`item.key ?? index`), and router integration stays in your app via a
 * `LinkComponent` per item.
 *
 * Defaults `separator` to a chevron icon. Preserves
 * MUI's `maxItems` / `itemsBeforeCollapse` / `itemsAfterCollapse` collapse-
 * with-ellipsis surface. All standard MUI Breadcrumbs props pass through.
 *
 *
 * @example
 * ```tsx
 * <FabricBreadcrumbs
 *   items={[
 *     { label: 'Home', href: '/' },
 *     { label: 'Products', href: '/products' },
 *     { label: 'Details' },
 *   ]}
 * />
 * ```
 */

import NavigateNextIcon from "@fabric-kit/icons/NavigateNext";
import {
  Breadcrumbs,
  type BreadcrumbsProps,
  Link,
  type LinkProps,
  Typography,
} from "@mui/material";
import React, { type ElementType, forwardRef, memo, type ReactNode } from "react";

export interface FabricBreadcrumbItem {
  /** Displayed label. */
  label: ReactNode;
  /** `href` for a plain anchor. Ignored if `LinkComponent` is set. */
  href?: string;
  /** Click handler — use for imperative navigation (router push, tab open). */
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  /**
   * Component override for this specific link — typically a react-router
   * `Link`. Any extra props (`to`, `state`, `replace`) go through `linkProps`.
   */
  LinkComponent?: ElementType;
  /** Extra props forwarded to the link (e.g. `to` for react-router). */
  linkProps?: Record<string, unknown>;
  /** Stable React key. Falls back to array index. */
  key?: string | number;
  /**
   * Force this item to render as the current-page indicator (no link).
   * By default only the last item is treated as current.
   */
  current?: boolean;
  /** Optional icon rendered before the label. */
  icon?: ReactNode;
}

export interface FabricBreadcrumbsProps extends Omit<BreadcrumbsProps, "children"> {
  /** Ordered breadcrumb trail. Last item renders as the current page. */
  items: FabricBreadcrumbItem[];
  /** Extra props forwarded to every non-current `Link`. */
  linkProps?: Partial<LinkProps>;
}

const FabricBreadcrumbsImpl = forwardRef<HTMLElement, FabricBreadcrumbsProps>(
  function FabricBreadcrumbs(
    { items, separator = <NavigateNextIcon fontSize="small" />, linkProps, ...rest },
    ref,
  ) {
    const lastIndex = items.length - 1;
    return (
      <Breadcrumbs ref={ref} separator={separator} {...rest}>
        {items.map((item, index) => {
          const isCurrent = item.current ?? index === lastIndex;
          const key = item.key ?? index;
          const content = item.icon ? (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              {item.icon}
              {item.label}
            </span>
          ) : (
            item.label
          );
          if (isCurrent) {
            return (
              <Typography
                key={key}
                color="text.primary"
                sx={{ fontWeight: 600 }}
                aria-current="page"
              >
                {content}
              </Typography>
            );
          }
          return (
            <Link
              key={key}
              underline="hover"
              color="inherit"
              href={item.href}
              onClick={item.onClick}
              component={item.LinkComponent as ElementType | undefined}
              {...linkProps}
              {...(item.linkProps as Record<string, unknown>)}
            >
              {content}
            </Link>
          );
        })}
      </Breadcrumbs>
    );
  },
);

FabricBreadcrumbsImpl.displayName = "FabricBreadcrumbs";

export const FabricBreadcrumbs = memo(FabricBreadcrumbsImpl);
