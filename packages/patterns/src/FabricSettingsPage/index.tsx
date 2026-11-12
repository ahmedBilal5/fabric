/**
 * FabricSettingsPage — a settings screen: a page header, a list of sections on
 * the left, and the chosen section's settings on the right.
 *
 * Build each section from `FabricSettingsGroup` cards holding
 * `FabricSettingsRow`s: a label and description on the left, the control on the
 * right. On phones the section list becomes a row of buttons above the content,
 * and each row stacks.
 *
 * Settings that apply immediately (switches, selects) save as people change
 * them; for a group that needs a Save button, put a `FabricForm` inside the
 * group and use its `footer`.
 *
 * @example
 * ```tsx
 * <FabricSettingsPage
 *   title="Settings"
 *   sections={[
 *     { id: "profile", label: "Profile", icon: <PersonIcon />, content: <ProfileSettings /> },
 *     { id: "notifications", label: "Notifications", icon: <NotificationsIcon />, content: <NotificationSettings /> },
 *   ]}
 * />
 * ```
 */

import { fontWeight, radii, spacing } from "@fabric-kit/design-tokens";
import { FabricPageHeader, type FabricPageHeaderProps } from "@fabric-kit/layout";
import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";
import { type KeyboardEvent, type ReactNode, useId, useRef, useState } from "react";

/** One section of a settings page. */
export interface FabricSettingsSection {
  /** Stable id, also usable in the URL. */
  id: string;
  /** Name in the list and heading of the section. */
  label: ReactNode;
  /** Icon before the name in the list. */
  icon?: ReactNode;
  /** One line under the section heading. */
  description?: ReactNode;
  /** The section's settings, usually `FabricSettingsGroup`s. */
  content: ReactNode;
}

export interface FabricSettingsPageProps
  extends Omit<FabricPageHeaderProps, "tabs" | "sx" | "divider" | "children"> {
  /** The sections, in list order. */
  sections: FabricSettingsSection[];
  /** The open section, to control it (e.g. from the URL). */
  section?: string;
  /** Called when the person opens another section. */
  onSectionChange?: (id: string) => void;
  /** Accessible name of the section list. @default "Settings sections" */
  navLabel?: string;
  /** Width of the section list from `md` up. @default 220 */
  navWidth?: number;
  /** System styles on the root. */
  sx?: SxProps<Theme>;
}

/** A settings screen with a section list and grouped setting rows. */
export function FabricSettingsPage({
  sections,
  section,
  onSectionChange,
  navLabel = "Settings sections",
  navWidth = 220,
  sx,
  ...header
}: Readonly<FabricSettingsPageProps>) {
  const baseId = useId();
  const [own, setOwn] = useState(sections[0]?.id ?? "");
  const currentId = section ?? own;
  const current = sections.find((s) => s.id === currentId) ?? sections[0];
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  const open = (id: string, focusHeading = false) => {
    setOwn(id);
    onSectionChange?.(id);
    if (focusHeading) requestAnimationFrame(() => headingRef.current?.focus());
  };

  // Arrow keys move through the list, as in a vertical tab list.
  const onKeyDown = (i: number) => (e: KeyboardEvent<HTMLButtonElement>) => {
    const step =
      e.key === "ArrowDown" || e.key === "ArrowRight"
        ? 1
        : e.key === "ArrowUp" || e.key === "ArrowLeft"
          ? -1
          : 0;
    if (!step) return;
    e.preventDefault();
    buttons.current[(i + step + sections.length) % sections.length]?.focus();
  };

  return (
    <Box
      sx={[
        { display: "flex", flexDirection: "column", gap: `${spacing.xl}px`, minWidth: 0 },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <FabricPageHeader {...header} />
      <Box
        sx={{
          display: "grid",
          gap: { xs: `${spacing.lg}px`, md: `${spacing["2xl"]}px` },
          alignItems: "start",
          gridTemplateColumns: { xs: "minmax(0, 1fr)", md: `${navWidth}px minmax(0, 1fr)` },
        }}
      >
        <Box
          component="nav"
          aria-label={navLabel}
          sx={{
            position: { md: "sticky" },
            top: { md: spacing.lg },
            display: "flex",
            flexDirection: { xs: "row", md: "column" },
            gap: "2px",
            overflowX: { xs: "auto", md: "visible" },
            mx: { xs: `-${spacing.lg}px`, md: 0 },
            px: { xs: `${spacing.lg}px`, md: 0 },
            pb: { xs: "2px", md: 0 },
            scrollbarWidth: "none",
          }}
        >
          {sections.map((s, i) => {
            const active = s.id === current?.id;
            return (
              <Box
                key={s.id}
                component="button"
                type="button"
                ref={(el: HTMLButtonElement | null) => {
                  buttons.current[i] = el;
                }}
                aria-current={active ? "page" : undefined}
                aria-controls={`${baseId}-panel`}
                onClick={() => open(s.id, true)}
                onKeyDown={onKeyDown(i)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: `${spacing.sm + 2}px`,
                  flexShrink: 0,
                  px: `${spacing.md}px`,
                  py: `${spacing.sm}px`,
                  border: 0,
                  borderRadius: `${radii.lg}px`,
                  font: "inherit",
                  fontSize: "0.875rem",
                  fontWeight: active ? fontWeight.semiBold : fontWeight.medium,
                  textAlign: "left",
                  whiteSpace: "nowrap",
                  cursor: "pointer",
                  color: active
                    ? "var(--mui-palette-primary-main)"
                    : "var(--mui-palette-text-secondary)",
                  backgroundColor: active
                    ? "rgba(var(--mui-palette-primary-mainChannel) / 0.1)"
                    : "transparent",
                  "& svg": { fontSize: 20 },
                  "&:hover": {
                    backgroundColor: active
                      ? "rgba(var(--mui-palette-primary-mainChannel) / 0.14)"
                      : "var(--mui-palette-action-hover)",
                    color: active ? undefined : "var(--mui-palette-text-primary)",
                  },
                  "&:focus-visible": {
                    outline: "2px solid var(--mui-palette-primary-main)",
                    outlineOffset: "1px",
                  },
                }}
              >
                {s.icon}
                {s.label}
              </Box>
            );
          })}
        </Box>

        {current && (
          <Box
            id={`${baseId}-panel`}
            component="section"
            aria-labelledby={`${baseId}-heading`}
            sx={{ display: "flex", flexDirection: "column", gap: `${spacing.lg}px`, minWidth: 0 }}
          >
            <Box>
              <Box
                component="h2"
                id={`${baseId}-heading`}
                ref={headingRef}
                tabIndex={-1}
                sx={{
                  m: 0,
                  fontSize: "1.125rem",
                  lineHeight: 1.4,
                  fontWeight: fontWeight.semiBold,
                  color: "var(--mui-palette-text-primary)",
                  outline: "none",
                }}
              >
                {current.label}
              </Box>
              {current.description && (
                <Box
                  sx={{
                    mt: `${spacing.xs}px`,
                    fontSize: "0.875rem",
                    color: "var(--mui-palette-text-secondary)",
                  }}
                >
                  {current.description}
                </Box>
              )}
            </Box>
            {current.content}
          </Box>
        )}
      </Box>
    </Box>
  );
}

export interface FabricSettingsGroupProps {
  /** Group heading, e.g. "Email notifications". */
  title?: ReactNode;
  /** One line under the heading. */
  description?: ReactNode;
  /** `FabricSettingsRow`s, or any content. Rows are separated by lines. */
  children: ReactNode;
  /** Bottom bar, e.g. a Save button for a group that doesn't save on change. */
  footer?: ReactNode;
  /** Red border and heading, for "Danger zone" groups (delete workspace, transfer ownership). */
  danger?: boolean;
  /** System styles on the root. */
  sx?: SxProps<Theme>;
}

/** A card of related settings, with an optional heading and footer. */
export function FabricSettingsGroup({
  title,
  description,
  children,
  footer,
  danger = false,
  sx,
}: Readonly<FabricSettingsGroupProps>) {
  const headingId = useId();
  const tone = danger ? "var(--mui-palette-error-main)" : "var(--mui-palette-divider)";
  return (
    <Box
      component="section"
      aria-labelledby={title ? headingId : undefined}
      sx={[
        {
          borderRadius: `${radii.xl}px`,
          border: `1px solid ${tone}`,
          backgroundColor: "var(--mui-palette-background-paper)",
          overflow: "hidden",
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {(title || description) && (
        <Box
          sx={{
            px: { xs: `${spacing.lg}px`, sm: `${spacing.xl}px` },
            pt: `${spacing.lg + 4}px`,
            pb: `${spacing.xs}px`,
          }}
        >
          {title && (
            <Box
              component="h3"
              id={headingId}
              sx={{
                m: 0,
                fontSize: "0.9375rem",
                fontWeight: fontWeight.semiBold,
                color: danger ? "var(--mui-palette-error-main)" : "var(--mui-palette-text-primary)",
              }}
            >
              {title}
            </Box>
          )}
          {description && (
            <Box
              sx={{ mt: "2px", fontSize: "0.8125rem", color: "var(--mui-palette-text-secondary)" }}
            >
              {description}
            </Box>
          )}
        </Box>
      )}
      <Box
        sx={{
          px: { xs: `${spacing.lg}px`, sm: `${spacing.xl}px` },
          "& > * + *": { borderTop: "1px solid var(--mui-palette-divider)" },
        }}
      >
        {children}
      </Box>
      {footer && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            gap: `${spacing.sm}px`,
            px: { xs: `${spacing.lg}px`, sm: `${spacing.xl}px` },
            py: `${spacing.md}px`,
            borderTop: "1px solid var(--mui-palette-divider)",
            backgroundColor: "var(--mui-palette-action-hover)",
          }}
        >
          {footer}
        </Box>
      )}
    </Box>
  );
}

export interface FabricSettingsRowProps {
  /** The setting's name. */
  label: ReactNode;
  /** What it does, in a sentence. */
  description?: ReactNode;
  /** Id of the control, so clicking the label focuses it. */
  htmlFor?: string;
  /** The control: a switch, select, button or field. */
  children?: ReactNode;
  /** Put the control under the text instead of beside it, for wide controls. @default false */
  stacked?: boolean;
  /** System styles on the root. */
  sx?: SxProps<Theme>;
}

/** One setting: a label and description, with its control on the right. */
export function FabricSettingsRow({
  label,
  description,
  htmlFor,
  children,
  stacked = false,
  sx,
}: Readonly<FabricSettingsRowProps>) {
  return (
    <Box
      sx={[
        {
          display: "grid",
          gridTemplateColumns: stacked
            ? "minmax(0, 1fr)"
            : { xs: "minmax(0, 1fr)", sm: "minmax(0, 1fr) auto" },
          alignItems: "center",
          columnGap: `${spacing.xl}px`,
          rowGap: `${spacing.sm + 2}px`,
          py: `${spacing.lg}px`,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Box sx={{ minWidth: 0 }}>
        <Box
          component={htmlFor ? "label" : "div"}
          htmlFor={htmlFor}
          sx={{
            display: "block",
            fontSize: "0.875rem",
            fontWeight: fontWeight.medium,
            color: "var(--mui-palette-text-primary)",
            cursor: htmlFor ? "pointer" : undefined,
          }}
        >
          {label}
        </Box>
        {description && (
          <Box
            sx={{
              mt: "2px",
              fontSize: "0.8125rem",
              lineHeight: 1.5,
              color: "var(--mui-palette-text-secondary)",
              maxWidth: "60ch",
            }}
          >
            {description}
          </Box>
        )}
      </Box>
      {children != null && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: { xs: "flex-start", sm: stacked ? "flex-start" : "flex-end" },
            minWidth: 0,
          }}
        >
          {children}
        </Box>
      )}
    </Box>
  );
}
