/**
 * FabricSystemPage — a whole page for when the app can't show what was asked for:
 * page not found (404), forbidden (403), no access to a workspace, a server error
 * (500) and planned maintenance.
 *
 * Each `kind` comes with a status code or icon, a plain-language title and
 * description, and sensible actions (go home, go back, try again, request access).
 * Override any of them. The page centers itself in its container; set `fullHeight` to
 * fill the viewport when it is the only thing on screen.
 *
 * @example
 * ```tsx
 * // In your router's catch-all route
 * <FabricSystemPage kind="not-found" homeHref="/dashboard" />
 *
 * // In an error boundary
 * <FabricSystemPage kind="server-error" onRetry={resetErrorBoundary} reference={errorId} />
 * ```
 */

import { FabricButton, FabricEmptyState } from "@fabric-kit/components";
import { fontFamily, iconSize, radii, spacing } from "@fabric-kit/design-tokens";
import Construction from "@fabric-kit/icons/Construction";
import LockOutlined from "@fabric-kit/icons/LockOutlined";
import { FabricFlex, FabricText } from "@fabric-kit/primitives";
import type { SxProps, Theme } from "@mui/material/styles";
import { forwardRef, type HTMLAttributes, memo, type ReactNode } from "react";

/**
 * Which system page to show:
 * - `not-found`: 404, the address doesn't match a page.
 * - `forbidden`: 403, the page exists but this user may not see it.
 * - `no-access`: the user isn't a member of this workspace or project yet.
 * - `server-error`: 500, something failed on our side.
 * - `maintenance`: the app is down for planned work.
 */
export type FabricSystemPageKind =
  | "not-found"
  | "forbidden"
  | "no-access"
  | "server-error"
  | "maintenance";

export interface FabricSystemPageProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** Which page to show. Sets the default code, title, description and actions. */
  kind: FabricSystemPageKind;
  /** Replaces the default title. */
  title?: ReactNode;
  /** Replaces the default description. */
  description?: ReactNode;
  /** Replaces the default actions. Pass `null` for none. */
  actions?: ReactNode;
  /** Replaces the status code or icon above the title. Pass `null` for none. */
  illustration?: ReactNode;
  /** Where "Go to home" leads. @default "/" */
  homeHref?: string;
  /** Runs for "Go to home" instead of following `homeHref`, e.g. your router's navigate. */
  onHome?: () => void;
  /** Runs for "Try again" on `server-error`. Defaults to reloading the page. */
  onRetry?: () => void;
  /** Shows "Request access" on `forbidden` and `no-access`. */
  onRequestAccess?: () => void;
  /** An error or request ID shown small under the description, for support requests. */
  reference?: ReactNode;
  /** Extra line under the description, e.g. "We expect to be back by 14:00 UTC." */
  meta?: ReactNode;
  /** Fill the viewport height instead of the container's. @default false */
  fullHeight?: boolean;
  /** Heading element for the title. @default "h1" */
  titleComponent?: "h1" | "h2";
  /** System styles on the root. */
  sx?: SxProps<Theme>;
}

interface KindDefaults {
  code?: string;
  icon?: ReactNode;
  title: string;
  description: string;
}

const DEFAULTS: Record<FabricSystemPageKind, KindDefaults> = {
  "not-found": {
    code: "404",
    title: "Page not found",
    description: "The link may be broken, or the page may have moved or been deleted.",
  },
  forbidden: {
    code: "403",
    title: "You don't have permission to view this page",
    description: "Ask an admin for access, or sign in with a different account.",
  },
  "no-access": {
    icon: <LockOutlined />,
    title: "You don't have access yet",
    description:
      "You aren't a member of this workspace. Request access and an admin will review it.",
  },
  "server-error": {
    code: "500",
    title: "Something went wrong",
    description:
      "We couldn't load this page because of a problem on our side. Try again in a moment.",
  },
  maintenance: {
    icon: <Construction />,
    title: "We're doing some maintenance",
    description: "The app is briefly unavailable while we make improvements.",
  },
};

function StatusCode({ code }: { code: string }) {
  return (
    <FabricText
      component="span"
      textVariant="displayLg"
      sx={{
        display: "block",
        lineHeight: 1,
        fontVariantNumeric: "tabular-nums",
        color: "var(--mui-palette-primary-main)",
        opacity: 0.85,
      }}
    >
      {code}
    </FabricText>
  );
}

function IconBadge({ icon }: { icon: ReactNode }) {
  return (
    <FabricFlex
      align="center"
      justify="center"
      sx={{
        width: spacing.xlxl,
        height: spacing.xlxl,
        borderRadius: `${radii.full}px`,
        backgroundColor: "rgba(var(--mui-palette-primary-mainChannel) / 0.1)",
        color: "var(--mui-palette-primary-main)",
        "& svg": { fontSize: iconSize["3xl"] * 1.25 },
      }}
    >
      {icon}
    </FabricFlex>
  );
}

const FabricSystemPageImpl = forwardRef<HTMLDivElement, FabricSystemPageProps>(
  function FabricSystemPage(
    {
      kind,
      title,
      description,
      actions,
      illustration,
      homeHref = "/",
      onHome,
      onRetry,
      onRequestAccess,
      reference,
      meta,
      fullHeight = false,
      titleComponent = "h1",
      sx,
      ...rest
    },
    ref,
  ) {
    const d = DEFAULTS[kind];

    const home = (variant: "contained" | "outlined") => (
      <FabricButton variant={variant} {...(onHome ? { onClick: onHome } : { href: homeHref })}>
        Go to home
      </FabricButton>
    );

    let defaultActions: ReactNode = null;
    switch (kind) {
      case "not-found":
        defaultActions = (
          <>
            {home("contained")}
            <FabricButton variant="outlined" onClick={() => window.history.back()}>
              Go back
            </FabricButton>
          </>
        );
        break;
      case "forbidden":
      case "no-access":
        defaultActions = onRequestAccess ? (
          <>
            <FabricButton variant="contained" onClick={onRequestAccess}>
              Request access
            </FabricButton>
            {home("outlined")}
          </>
        ) : (
          home("contained")
        );
        break;
      case "server-error":
        defaultActions = (
          <>
            <FabricButton variant="contained" onClick={onRetry ?? (() => window.location.reload())}>
              Try again
            </FabricButton>
            {home("outlined")}
          </>
        );
        break;
      case "maintenance":
        defaultActions = null;
        break;
    }

    const defaultIllustration = d.code ? <StatusCode code={d.code} /> : <IconBadge icon={d.icon} />;

    const body = (
      <>
        {description ?? d.description}
        {meta && <div>{meta}</div>}
        {reference && (
          <FabricText
            component="div"
            textVariant="bodySm"
            color="text.secondary"
            sx={{ mt: `${spacing.sm}px`, fontFamily: fontFamily.mono }}
          >
            Reference: {reference}
          </FabricText>
        )}
      </>
    );

    return (
      <FabricFlex
        ref={ref}
        align="center"
        justify="center"
        sx={[
          {
            width: "100%",
            minHeight: fullHeight ? "100dvh" : "100%",
            boxSizing: "border-box",
            padding: `${spacing.xl}px`,
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
        {...rest}
      >
        <FabricEmptyState
          title={title ?? d.title}
          description={body}
          illustration={illustration === undefined ? defaultIllustration : illustration}
          actions={actions === undefined ? defaultActions : actions}
          titleComponent={titleComponent}
          sx={{ maxWidth: 560 }}
        />
      </FabricFlex>
    );
  },
);

FabricSystemPageImpl.displayName = "FabricSystemPage";

/** A whole page for 404, 403, no access, server errors and maintenance. */
export const FabricSystemPage = memo(FabricSystemPageImpl);
