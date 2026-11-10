/**
 * FabricEmptyState — what to show where content would be: an empty list, a search
 * with no results, a page that failed to load, or a feature nobody has used yet.
 *
 * A centered column of an illustration (or icon), a title, a description and up to
 * two actions. `variant` picks a default icon for the common cases; pass
 * `illustration` to use your own art. `size="sm"` fits inside a card, a table or a
 * panel; `size="md"` (default) fills a page section.
 *
 * @example
 * ```tsx
 * <FabricEmptyState
 *   variant="no-results"
 *   title="No invoices match “Northwind”"
 *   description="Try a different name or clear the filters."
 *   actions={<FabricButton onClick={clearFilters}>Clear filters</FabricButton>}
 * />
 * ```
 */

import { iconSize, radii, spacing } from "@fabric-kit/design-tokens";
import ErrorOutlined from "@fabric-kit/icons/ErrorOutlined";
import InboxOutlined from "@fabric-kit/icons/InboxOutlined";
import SearchOff from "@fabric-kit/icons/SearchOff";
import { FabricFlex, FabricInline, FabricStack, FabricText } from "@fabric-kit/primitives";
import type { SxProps, Theme } from "@mui/material/styles";
import { forwardRef, type HTMLAttributes, memo, type ReactNode } from "react";

/**
 * The situation the empty state describes. Sets the default icon:
 * - `empty`: nothing here yet (an inbox).
 * - `no-results`: a search or filter matched nothing (a crossed-out magnifier).
 * - `error`: the content failed to load (an error mark, in the error color).
 */
export type FabricEmptyStateVariant = "empty" | "no-results" | "error";

/** `sm` for cards, tables and panels; `md` for a page or a large section. */
export type FabricEmptyStateSize = "sm" | "md";

export interface FabricEmptyStateProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title" | "color"> {
  /** What the user sees: the main message, e.g. "No invoices yet". */
  title: ReactNode;
  /** One or two sentences on why it's empty or what to do next. */
  description?: ReactNode;
  /** The situation, which picks the default icon. @default "empty" */
  variant?: FabricEmptyStateVariant;
  /**
   * Your own illustration or icon, shown instead of the variant's icon. Pass `null`
   * to show no image at all. Large art is constrained to the size's illustration box.
   */
  illustration?: ReactNode;
  /** Buttons or links under the description. Put the primary action first. */
  actions?: ReactNode;
  /** Overall scale. @default "md" */
  size?: FabricEmptyStateSize;
  /** Heading element for the title, to fit the page's heading outline. @default "h2" */
  titleComponent?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p";
  /** System styles on the root. */
  sx?: SxProps<Theme>;
}

const VARIANT_ICON: Record<FabricEmptyStateVariant, ReactNode> = {
  empty: <InboxOutlined />,
  "no-results": <SearchOff />,
  error: <ErrorOutlined />,
};

const SIZES = {
  sm: {
    padding: spacing.xl,
    gap: "sm",
    badge: spacing["3xl"],
    icon: iconSize.xl,
    title: "headingXs",
    maxWidth: 360,
  },
  md: {
    padding: spacing["3xl"],
    gap: "md",
    badge: spacing["4xl"],
    icon: iconSize["3xl"],
    title: "headingMd",
    maxWidth: 480,
  },
} as const;

const FabricEmptyStateImpl = forwardRef<HTMLDivElement, FabricEmptyStateProps>(
  function FabricEmptyState(
    {
      title,
      description,
      variant = "empty",
      illustration,
      actions,
      size = "md",
      titleComponent = "h2",
      sx,
      ...rest
    },
    ref,
  ) {
    const s = SIZES[size];
    const isError = variant === "error";
    const custom = illustration !== undefined;

    return (
      <FabricStack
        ref={ref}
        align="center"
        gap={s.gap}
        sx={[
          {
            padding: `${s.padding}px`,
            textAlign: "center",
            width: "100%",
            boxSizing: "border-box",
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
        {...rest}
      >
        {custom ? (
          illustration && (
            <FabricFlex
              aria-hidden
              justify="center"
              sx={{
                mb: `${spacing.xs}px`,
                maxWidth: "100%",
                "& img, & svg": { maxWidth: "100%", height: "auto" },
              }}
            >
              {illustration}
            </FabricFlex>
          )
        ) : (
          <FabricFlex
            aria-hidden
            align="center"
            justify="center"
            sx={{
              mb: `${spacing.xs}px`,
              width: s.badge,
              height: s.badge,
              borderRadius: `${radii.full}px`,
              backgroundColor: isError
                ? "var(--mui-palette-semantic-error-bg)"
                : "var(--mui-palette-action-hover)",
              color: isError
                ? "var(--mui-palette-error-main)"
                : "var(--mui-palette-text-secondary)",
              "& svg": { fontSize: s.icon },
            }}
          >
            {VARIANT_ICON[variant]}
          </FabricFlex>
        )}

        <FabricText
          component={titleComponent}
          textVariant={s.title}
          color="text.primary"
          sx={{ m: 0, maxWidth: s.maxWidth }}
        >
          {title}
        </FabricText>

        {description && (
          <FabricText
            component="div"
            textVariant={size === "sm" ? "bodySm" : "bodyMd"}
            color="text.secondary"
            sx={{ m: 0, maxWidth: s.maxWidth }}
          >
            {description}
          </FabricText>
        )}

        {actions && (
          <FabricInline gap="sm" sx={{ mt: `${spacing.sm}px`, justifyContent: "center" }}>
            {actions}
          </FabricInline>
        )}
      </FabricStack>
    );
  },
);

FabricEmptyStateImpl.displayName = "FabricEmptyState";

/** A centered message for an empty list, a search with no results or a failed load. */
export const FabricEmptyState = memo(FabricEmptyStateImpl);
