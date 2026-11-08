import { iconSize, radii } from "@fabric-kit/design-tokens";
import type React from "react";

/* ------------------------------------------------------------------ */
/*  Navigation                                                         */
/* ------------------------------------------------------------------ */

/** A single sidebar navigation entry. */
export interface NavigationItem {
  /** Stable identifier used for selection tracking. */
  key: string;
  /** Display label shown next to the icon when the sidebar is expanded. */
  label: string;
  /** Icon element rendered in the sidebar (MUI icon, img, SVG, etc.). */
  icon: React.ReactNode;
  /** When provided the item renders as a link via `linkComponent`. */
  path?: string;
  /** Click handler for items without a `path`. */
  onClick?: () => void;
  /** Test ID forwarded to the DOM element. */
  testId?: string;
  /** Per-item style overrides for the row container. */
  sx?: object;
}

/* ------------------------------------------------------------------ */
/*  Workspace switcher                                                 */
/* ------------------------------------------------------------------ */

/** An entry in the sidebar workspace dropdown. */
export interface WorkspaceItem {
  id: string;
  name: string;
  icon: React.ReactNode;
  /** Draws a separator line after this entry in the workspace dropdown. */
  divideAfter?: boolean;
}

/* ------------------------------------------------------------------ */
/*  User / identity                                                    */
/* ------------------------------------------------------------------ */

/** Minimal user info for the top bar avatar and menu. */
export interface UserInfo {
  firstName: string;
  lastName: string;
  email: string;
  profilePic?: string;
}

/* ------------------------------------------------------------------ */
/*  App switcher                                                       */
/* ------------------------------------------------------------------ */

/** An entry in the top bar app-switcher grid menu. */
export interface AppSwitcherItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  /** Draws a separator line after this entry, e.g. between groups in the app menu. */
  divideAfter?: boolean;
}

/* ------------------------------------------------------------------ */
/*  FabricSidebar                                                      */
/* ------------------------------------------------------------------ */

export interface FabricSidebarProps {
  /** Whether the sidebar is expanded. */
  open: boolean;
  /** Called when the user clicks the collapse/expand toggle. */
  onToggle: () => void;
  /** Navigation items rendered in the sidebar body. */
  items: NavigationItem[];
  /** `key` of the currently-selected navigation item. */
  selectedKey?: string;
  /** Workspace entries for the header dropdown. Omit to hide the selector. */
  workspaceItems?: WorkspaceItem[];
  /** Called when the user picks a workspace. */
  onWorkspaceChange?: (id: string) => void;
  /** Whether the workspace dropdown is interactive. @default false */
  showWorkspaceSelector?: boolean;
  /** Custom logo element rendered in the sidebar header. */
  logo?: React.ReactNode;
  /**
   * Component used to render navigation items that have a `path`.
   * Must accept a `to` prop and render an `<a>`.
   * @default 'a'
   */
  linkComponent?: React.ElementType;
  /** Pixel offset from the top (e.g. for a fixed FabricBanner). @default 0 */
  bannerOffset?: number;
  /** Additional props spread onto the root element. */
  sx?: object;
}

/* ------------------------------------------------------------------ */
/*  FabricTopBar                                                       */
/* ------------------------------------------------------------------ */

/** A custom icon button in the top bar's action area. */
export interface FabricTopBarAction {
  /** Stable key, also used for the `data-testid` (`topbar-action-<id>`). */
  id: string;
  /** Accessible label, shown as the tooltip. */
  label: string;
  /** Icon element, e.g. `<HelpOutline />`. */
  icon: React.ReactNode;
  /** Click handler. */
  onClick?: () => void;
  /** Count shown as a badge. Hidden when 0 or undefined. */
  badge?: number;
}

export interface FabricTopBarProps {
  /** Application title displayed on the left side. */
  appTitle: string;
  /** Render-prop slot for the global search bar. */
  renderSearch?: () => React.ReactNode;
  /** Current user info for the avatar and menu. */
  user?: UserInfo;
  /** Called when the user selects a menu action (e.g. `'signout'`, `'profile'`). */
  onUserMenuAction?: (action: string) => void;
  /** Unread notification count shown on the bell badge. */
  notificationCount?: number;
  /** Called when the user clicks the notification bell. */
  onNotificationClick?: () => void;
  /** Items for the app-switcher grid menu. */
  appSwitcherItems?: AppSwitcherItem[];
  /**
   * Extra icon buttons rendered before the theme toggle, e.g. help, cart or
   * an environment switch. Each gets a tooltip and an optional count badge.
   */
  actions?: FabricTopBarAction[];
  /** Show the notification bell. @default true */
  showNotifications?: boolean;
  /** Show the light/dark mode toggle icon. @default true */
  showThemeToggle?: boolean;
  /** Current theme mode override ('light' | 'dark'). If omitted, reads from useThemeMode(). */
  themeMode?: "light" | "dark";
  /** Called when the theme toggle icon is clicked. If omitted, toggles theme via useThemeMode(). */
  onThemeToggleClick?: () => void;
  /** Called when the hamburger menu icon is clicked (mobile only). */
  onSidebarToggle?: () => void;
  /** Additional props spread onto the root element. */
  sx?: object;
}

/* ------------------------------------------------------------------ */
/*  FabricAppShell                                                     */
/* ------------------------------------------------------------------ */

export interface FabricAppShellProps {
  /** Sidebar props (rendered via FabricSidebar). */
  sidebarProps: FabricSidebarProps;
  /** Top bar props (rendered via FabricTopBar). */
  topBarProps: Omit<FabricTopBarProps, "onSidebarToggle">;
  /** Page content. */
  children: React.ReactNode;
  /** Slot rendered above the shell (e.g. a FabricBanner). */
  bannerSlot?: React.ReactNode;
  /** Slot rendered below the page content for the footer. */
  footerSlot?: React.ReactNode;
  /** Control sidebar open state externally. Uses internal state when omitted. */
  sidebarOpen?: boolean;
  /** Called when sidebar open state changes. */
  onSidebarOpenChange?: (open: boolean) => void;
}

/* ------------------------------------------------------------------ */
/*  FabricBanner                                                       */
/* ------------------------------------------------------------------ */

/** Visual tone of a {@link FabricBannerProps | FabricBanner}. */
export type FabricBannerSeverity = "info" | "success" | "warning" | "error";

export interface FabricBannerProps {
  /** Banner text. Truncated to one line. */
  message: React.ReactNode;
  /** Color and default icon. @default 'info' */
  severity?: FabricBannerSeverity;
  /** Custom leading icon. Pass `null` to hide the icon. */
  icon?: React.ReactNode | null;
  /** Optional call-to-action button on the trailing side. */
  action?: {
    label: React.ReactNode;
    onClick: () => void;
    /** Shows a spinner and disables the button. */
    loading?: boolean;
  };
  /** When true, banner is position: fixed at the viewport top. @default true */
  fixed?: boolean;
  /** Reports the measured banner height, e.g. to offset a fixed layout. */
  onHeightChange?: (height: number) => void;
  /** Override styles. */
  sx?: object;
}

/* ------------------------------------------------------------------ */
/*  FabricNotificationDrawer                                           */
/* ------------------------------------------------------------------ */

/** Notification type determines which action buttons appear. */
export type NotificationType = "readonly" | "actionable" | "approval" | "onboarding";

/** A single notification entry. */
export interface NotificationItem {
  /** Unique identifier. */
  id: string | number;
  /** Sender info for the avatar and name. */
  sender: {
    name: string;
    avatar?: string;
    id?: string;
  };
  /** Notification body text. */
  content: string;
  /** Optional context label shown after content (e.g. entity name). */
  context?: string;
  /** Creation timestamp (ISO string or Date). */
  timestamp: string | Date;
  /** Whether the notification has been read. */
  isRead: boolean;
  /** Determines which action buttons appear. */
  type: NotificationType;
  /** Action already taken on this notification (e.g. 'approved', 'denied', 'skip'). */
  actionPerformed?: string | null;
  /** URL to navigate to when clicked. */
  url?: string | null;
}

export interface FabricNotificationDrawerProps {
  /** Whether the drawer is open. */
  open: boolean;
  /** Called when the drawer should close. */
  onClose: () => void;
  /** Notification items to display. */
  items: NotificationItem[];
  /** Shows a full-height spinner when true and items is empty. @default false */
  loading?: boolean;
  /** Enables infinite scroll — when true, triggers `onLoadMore` at the bottom. */
  hasMore?: boolean;
  /** Called when the user scrolls to the bottom and `hasMore` is true. */
  onLoadMore?: () => void;
  /** Called when "Mark All As Read" is clicked in the header menu. */
  onMarkAllRead?: () => void;
  /** Called when a notification is clicked (for navigation or marking read). */
  onItemClick?: (item: NotificationItem) => void;
  /** Called when the user clicks an action button (Accept, Deny, Skip, Start). */
  onAction?: (itemId: string | number, action: string) => void;
  /** IDs of items currently processing an action (shows spinner on those items). */
  actionLoadingIds?: (string | number)[];
  /** Called when "View All" is clicked. */
  onViewAll?: () => void;
  /** Called when the settings icon is clicked. */
  onSettings?: () => void;
  /** Called when a sender name/avatar is clicked. */
  onSenderClick?: (senderId: string) => void;
  /** Called when "Sort By Unread" is selected. */
  onSortByUnread?: () => void;
  /** Called when "Sort By Date" is selected. */
  onSortByDate?: () => void;
  /** Drawer width. @default 420 on desktop, full-screen on mobile */
  width?: number | string;
  /** Override styles on the drawer content wrapper. */
  sx?: object;
}

/* ------------------------------------------------------------------ */
/*  FabricFooter                                                       */
/* ------------------------------------------------------------------ */

export interface FabricFooterLink {
  /** Display label for the link. */
  label: string;
  /** Destination URL. */
  href?: string;
  /** Click handler (used when navigating via SPA router or custom action). */
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  /** Target window/tab. Defaults to '_blank' for external URLs. */
  target?: string;
  /** Rel attribute. Defaults to 'noopener noreferrer' for external URLs. */
  rel?: string;
  /** Optional data-testid attribute. */
  testId?: string;
}

export interface FabricFooterProps {
  /** Navigation or policy links shown before the copyright line. @default [] */
  links?: FabricFooterLink[];
  /** Company name for the copyright notice. Omit to hide the copyright line. */
  companyName?: string;
  /** Copyright year. Defaults to current calendar year. */
  copyrightYear?: number | string;
  /** Custom copyright text override. Overrides default copyright notice. */
  copyrightText?: string;
  /** Optional logo or branding slot rendered on the trailing side. */
  logoSlot?: React.ReactNode;
  /** When true, positions the footer absolutely at the bottom of its container. */
  isAbsolute?: boolean;
  /** Max width of the inner content container. @default 1440 */
  maxWidth?: number | string;
  /** Additional style overrides on the footer container. */
  sx?: object;
  /** Optional data-testid attribute. @default 'fabric-footer' */
  testId?: string;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

/** Sidebar width when expanded (px). */
export const SIDEBAR_WIDTH_OPEN = 240;

/** Sidebar width when collapsed (px). */
export const SIDEBAR_WIDTH_COLLAPSED = 66;

/** Top bar height (px). */
export const TOPBAR_HEIGHT = 56;

/**
 * Top-bar action button (internal, not exported from the package): 8px
 * padding around a 24px icon in the theme `palette.appShell.text` color, 4px radius.
 */
export const TOPBAR_ACTION_SX = {
  width: 40,
  height: 40,
  borderRadius: `${radii.md}px`,
  color: "var(--mui-palette-appShell-text)",
  "& .MuiSvgIcon-root": { fontSize: iconSize.xl },
} as const;
