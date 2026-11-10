/**
 * FabricPageHeader — the top of a page: where you are, what this page is, its status,
 * and what you can do here.
 *
 * Slots, top to bottom: breadcrumbs; a row with an optional back button and icon, the
 * title with a status next to it, a description and a meta line, and on the right the
 * page's actions plus an overflow menu; then optional tabs. On narrow screens the
 * actions wrap under the title.
 *
 * @example
 * ```tsx
 * <FabricPageHeader
 *   breadcrumbs={[{ label: "Invoices", href: "/invoices" }, { label: "INV-1042" }]}
 *   title="INV-1042"
 *   status={<FabricTag variant="color" color="warning" label="Overdue" />}
 *   meta="Acme · Due 12 March 2026"
 *   actions={<FabricButton variant="contained">Record payment</FabricButton>}
 *   moreActions={[{ label: "Duplicate" }, { label: "Delete", divideAfter: false }]}
 * />
 * ```
 */

import {
  type FabricBreadcrumbItem,
  FabricBreadcrumbs,
  FabricIconButton,
  FabricMenuButton,
  type FabricMenuItem,
  type FabricTabItem,
  FabricTabs,
} from "@fabric-kit/components";
import { spacing, zIndex } from "@fabric-kit/design-tokens";
import ArrowBack from "@fabric-kit/icons/ArrowBack";
import MoreHoriz from "@fabric-kit/icons/MoreHoriz";
import { FabricFlex, FabricInline, FabricStack, FabricText } from "@fabric-kit/primitives";
import type { SxProps, Theme } from "@mui/material/styles";
import { forwardRef, type HTMLAttributes, memo, type ReactNode, type SyntheticEvent } from "react";

/** Tabs under the header, for pages split into sections ("Overview", "Activity"). */
export interface FabricPageHeaderTabs {
  /** Tab definitions, as for `FabricTabs`. */
  items: FabricTabItem[];
  /** The selected tab's value. */
  value: string;
  /** Called with the new tab's value. */
  onChange: (event: SyntheticEvent, value: string) => void;
}

export interface FabricPageHeaderProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  /** The page title. */
  title: ReactNode;
  /** One line on what the page is for. */
  description?: ReactNode;
  /** Trail back to parent pages. The last item is the current page. */
  breadcrumbs?: FabricBreadcrumbItem[];
  /** Shows a back button before the title. Use it when there are no breadcrumbs. */
  onBack?: () => void;
  /** Accessible name of the back button. @default "Back" */
  backLabel?: string;
  /** Icon or avatar before the title, e.g. a customer's logo. */
  icon?: ReactNode;
  /** Status next to the title, usually a `FabricTag` or `FabricProgressChip`. */
  status?: ReactNode;
  /** Small secondary line under the title: owner, dates, IDs. */
  meta?: ReactNode;
  /** Page actions on the right, primary action last. Usually one or two buttons. */
  actions?: ReactNode;
  /** Less common actions, in a "More actions" menu after `actions`. */
  moreActions?: FabricMenuItem[];
  /** Accessible name of the overflow menu button. @default "More actions" */
  moreActionsLabel?: string;
  /** Tabs under the header. */
  tabs?: FabricPageHeaderTabs;
  /** Line under the header when there are no tabs. @default false */
  divider?: boolean;
  /** Keep the header at the top of the scroll container. @default false */
  sticky?: boolean;
  /** Heading element for the title. @default "h1" */
  titleComponent?: "h1" | "h2" | "h3";
  /** System styles on the root `<header>`. */
  sx?: SxProps<Theme>;
}

const FabricPageHeaderImpl = forwardRef<HTMLElement, FabricPageHeaderProps>(
  function FabricPageHeader(
    {
      title,
      description,
      breadcrumbs,
      onBack,
      backLabel = "Back",
      icon,
      status,
      meta,
      actions,
      moreActions,
      moreActionsLabel = "More actions",
      tabs,
      divider = false,
      sticky = false,
      titleComponent = "h1",
      sx,
      ...rest
    },
    ref,
  ) {
    const hasActions = Boolean(actions) || Boolean(moreActions?.length);

    return (
      <FabricStack
        ref={ref}
        component="header"
        gap="md"
        sx={[
          {
            pt: `${spacing.lg}px`,
            pb: tabs ? 0 : `${spacing.lg}px`,
            ...(divider && !tabs && { borderBottom: "1px solid var(--mui-palette-divider)" }),
            ...(sticky && {
              position: "sticky",
              top: 0,
              zIndex: zIndex.sticky,
              backgroundColor: "var(--mui-palette-background-default)",
            }),
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
        {...rest}
      >
        {breadcrumbs && breadcrumbs.length > 0 && <FabricBreadcrumbs items={breadcrumbs} />}

        <FabricFlex
          align="flex-start"
          gap="md"
          sx={{ flexWrap: "wrap", rowGap: `${spacing.md}px` }}
        >
          <FabricFlex align="flex-start" gap="md" sx={{ flex: "1 1 320px", minWidth: 0 }}>
            {onBack && (
              <FabricIconButton aria-label={backLabel} onClick={onBack} sx={{ mt: "2px" }}>
                <ArrowBack />
              </FabricIconButton>
            )}
            {icon && (
              <FabricFlex aria-hidden align="center" sx={{ flexShrink: 0, mt: "2px" }}>
                {icon}
              </FabricFlex>
            )}
            <FabricStack gap="xs" sx={{ minWidth: 0 }}>
              <FabricInline gap="sm" sx={{ rowGap: `${spacing.xs}px` }}>
                <FabricText
                  component={titleComponent}
                  textVariant="headingXl"
                  color="text.primary"
                  sx={{ m: 0, overflowWrap: "anywhere" }}
                >
                  {title}
                </FabricText>
                {status}
              </FabricInline>
              {description && (
                <FabricText component="div" textVariant="bodyMd" color="text.secondary">
                  {description}
                </FabricText>
              )}
              {meta && (
                <FabricText component="div" textVariant="bodySm" color="text.secondary">
                  {meta}
                </FabricText>
              )}
            </FabricStack>
          </FabricFlex>

          {hasActions && (
            <FabricInline gap="sm" sx={{ flexShrink: 0, ml: "auto" }}>
              {actions}
              {moreActions && moreActions.length > 0 && (
                <FabricMenuButton
                  items={moreActions}
                  icon={<MoreHoriz />}
                  tooltip={moreActionsLabel}
                  triggerButtonProps={{ "aria-label": moreActionsLabel }}
                />
              )}
            </FabricInline>
          )}
        </FabricFlex>

        {tabs && (
          <FabricTabs
            tabs={tabs.items}
            value={tabs.value}
            onChange={tabs.onChange}
            borderBottom
            aria-label={typeof title === "string" ? `${title} sections` : undefined}
          />
        )}
      </FabricStack>
    );
  },
);

FabricPageHeaderImpl.displayName = "FabricPageHeader";

/** The top of a page: breadcrumbs, title, status, actions and optional tabs. */
export const FabricPageHeader = memo(FabricPageHeaderImpl);
