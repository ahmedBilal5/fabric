import { FabricBadge, FabricIconButton } from "@fabric-kit/components";
import { fontWeight, radii, spacing, textVariant } from "@fabric-kit/design-tokens";
import DarkModeOutlinedIcon from "@fabric-kit/icons/DarkModeOutlined";
import LightModeOutlinedIcon from "@fabric-kit/icons/LightModeOutlined";
import MenuIcon from "@fabric-kit/icons/Menu";
import Notifications from "@fabric-kit/icons/Notifications";
import { FabricFlex, FabricText, Hide } from "@fabric-kit/primitives";
import { useBreakpoint, useSafeThemeMode } from "@fabric-kit/theme";
import { Tooltip } from "@mui/material";
import React, { useState } from "react";
import type { FabricTopBarProps } from "../types";
import { TOPBAR_ACTION_SX, TOPBAR_HEIGHT } from "../types";
import { FabricAppSwitcher } from "./FabricAppSwitcher";
import { FabricUserMenu } from "./FabricUserMenu";

/** Clickable icon button with optional badge, used internally by FabricTopBar. */
function IconSlot({
  onClick,
  children,
  testId,
  badge,
  title,
}: {
  onClick?: () => void;
  children: React.ReactNode;
  testId?: string;
  badge?: number;
  title: string;
}) {
  const content = (
    <FabricIconButton
      onClick={onClick}
      data-testid={testId}
      aria-label={title}
      sx={{
        ...TOPBAR_ACTION_SX,
        "&:hover": { bgcolor: "var(--mui-palette-action-hover)" },
      }}
    >
      {children}
    </FabricIconButton>
  );

  let result = content;

  // The design count: a small grey pill inside the button's top-right corner.
  if (badge != null && badge > 0) {
    result = (
      <FabricBadge
        badgeContent={badge}
        sx={{
          "& .MuiBadge-badge": {
            ...textVariant.uiXxs,
            fontWeight: fontWeight.semiBold,
            letterSpacing: "0.5px",
            top: 0,
            right: 0,
            transform: "none",
            minWidth: 14,
            height: 14,
            padding: "1px",
            borderRadius: `${radii.full}px`,
            bgcolor: "var(--mui-palette-appShell-badgeBg)",
            color: "var(--mui-palette-text-primary)",
          },
        }}
      >
        {result}
      </FabricBadge>
    );
  }

  if (title) {
    return <Tooltip title={title}>{result}</Tooltip>;
  }

  return result;
}

/**
 * Application top bar with title, search slot, notification bell, app switcher, and user menu.
 *
 * On mobile the hamburger icon appears when `onSidebarToggle` is provided.
 * Search is hidden below the `md` breakpoint.
 *
 * @example
 * ```tsx
 * <FabricTopBar
 *   appTitle="Acme Console"
 *   user={currentUser}
 *   notificationCount={5}
 *   onNotificationClick={() => setDrawerOpen(true)}
 *   appSwitcherItems={apps}
 *   actions={[{ id: "help", label: "Help", icon: <HelpOutline />, onClick: openHelp }]}
 *   renderSearch={() => <FabricGlobalSearch onSearch={search} />}
 * />
 * ```
 */
export const FabricTopBar = React.forwardRef<HTMLDivElement, FabricTopBarProps>(
  function FabricTopBar(
    {
      appTitle,
      renderSearch,
      user,
      onUserMenuAction,
      notificationCount,
      onNotificationClick,
      appSwitcherItems,
      actions,
      showNotifications = true,
      showThemeToggle = true,
      themeMode,
      onThemeToggleClick,
      onSidebarToggle,
      sx,
    },
    ref,
  ) {
    const isMobile = useBreakpoint("down", "md");
    const themeContext = useSafeThemeMode();
    const [internalMode, setInternalMode] = useState<"light" | "dark">("light");

    const activeMode = themeMode ?? themeContext?.resolvedMode ?? internalMode;
    const isDark = activeMode === "dark";

    const handleThemeToggle = () => {
      if (onThemeToggleClick) {
        onThemeToggleClick();
      } else if (themeContext) {
        themeContext.setMode(isDark ? "light" : "dark");
      } else {
        setInternalMode(isDark ? "light" : "dark");
      }
    };

    return (
      <FabricFlex
        ref={ref}
        align="center"
        justify="space-between"
        sx={{
          boxSizing: "border-box",
          height: TOPBAR_HEIGHT,
          px: `${spacing.sm}px`,
          bgcolor: "var(--mui-palette-background-paper)",
          borderBottom: "1px solid var(--mui-palette-divider)",
          boxShadow: "0px 4px 12px -2px rgba(42, 36, 32, 0.08)",
          flexShrink: 0,
          ...sx,
        }}
      >
        {/* Left section — hamburger (mobile) + title + search */}
        <FabricFlex align="center" gap="sm" sx={{ flex: 1, minWidth: 0 }}>
          {isMobile && onSidebarToggle && (
            <IconSlot onClick={onSidebarToggle} testId="sidebar-toggle" title="Toggle navigation">
              <MenuIcon />
            </IconSlot>
          )}

          <FabricText
            textVariant="headingSm"
            truncate
            sx={{
              px: `${spacing.lg}px`,
              color: "var(--mui-palette-text-primary)",
            }}
          >
            {appTitle}
          </FabricText>

          <Hide below="md">
            {renderSearch && (
              <FabricFlex sx={{ flex: 1, maxWidth: 600, mx: 2 }}>{renderSearch()}</FabricFlex>
            )}
          </Hide>
        </FabricFlex>

        {/* Right section — action icons */}
        <FabricFlex align="center" gap="sm" sx={{ px: `${spacing.lg}px`, flexShrink: 0 }}>
          {actions?.map((action) => (
            <IconSlot
              key={action.id}
              onClick={action.onClick}
              testId={`topbar-action-${action.id}`}
              badge={action.badge}
              title={action.label}
            >
              {action.icon}
            </IconSlot>
          ))}

          {showThemeToggle && (
            <IconSlot
              onClick={handleThemeToggle}
              testId="theme-toggle"
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
            </IconSlot>
          )}

          {showNotifications && (
            <IconSlot
              onClick={onNotificationClick}
              testId="notification-bell"
              badge={notificationCount}
              title="Notifications"
            >
              <Notifications />
            </IconSlot>
          )}

          {appSwitcherItems && appSwitcherItems.length > 0 && (
            <FabricAppSwitcher items={appSwitcherItems} />
          )}

          <FabricUserMenu user={user} onAction={onUserMenuAction} />
        </FabricFlex>
      </FabricFlex>
    );
  },
);
