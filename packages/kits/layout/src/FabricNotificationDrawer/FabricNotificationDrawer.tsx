import {
  FabricCircularProgress,
  FabricDrawer,
  FabricMenu,
  type FabricMenuItem,
} from "@fabric-kit/components";
import { zIndex } from "@fabric-kit/design-tokens";
import CloseIcon from "@fabric-kit/icons/Close";
import MoreHorizIcon from "@fabric-kit/icons/MoreHoriz";
import NotificationsOutlinedIcon from "@fabric-kit/icons/NotificationsOutlined";
import SettingsOutlinedIcon from "@fabric-kit/icons/SettingsOutlined";
import SwapVertIcon from "@fabric-kit/icons/SwapVert";
import { FabricFlex, FabricStack, FabricText } from "@fabric-kit/primitives";
import { useBreakpoint } from "@fabric-kit/theme";
import React from "react";
import type { FabricNotificationDrawerProps } from "../types";
import { NotificationListItem } from "./NotificationListItem";

const DEFAULT_WIDTH = 420;

/**
 * Right-anchored notification drawer with infinite scroll, sort/filter header,
 * and per-item action buttons.
 *
 * On mobile (`< md`) the drawer expands to full screen width.
 * Integrates with `FabricTopBar.onNotificationClick` to open.
 *
 * @example
 * ```tsx
 * <FabricNotificationDrawer
 *   open={open}
 *   onClose={() => setOpen(false)}
 *   items={notifications}
 *   hasMore={hasNextPage}
 *   onLoadMore={fetchNextPage}
 *   onAction={(id, action) => mutate({ id, action })}
 *   onMarkAllRead={markAllRead}
 * />
 * ```
 */
export function FabricNotificationDrawer({
  open,
  onClose,
  items,
  loading = false,
  hasMore = false,
  onLoadMore,
  onMarkAllRead,
  onItemClick,
  onAction,
  actionLoadingIds,
  onViewAll,
  onSettings,
  onSenderClick,
  onSortByUnread,
  onSortByDate,
  width,
  sx,
}: FabricNotificationDrawerProps) {
  const isMobile = useBreakpoint("down", "md");
  const drawerWidth = isMobile ? "100vw" : (width ?? DEFAULT_WIDTH);

  const sortMenuItems: FabricMenuItem[] = [
    ...(onSortByUnread
      ? [{ label: "Sort By Unread", onClick: () => onSortByUnread() } as FabricMenuItem]
      : []),
    ...(onSortByDate
      ? [{ label: "Sort By Date", onClick: () => onSortByDate() } as FabricMenuItem]
      : []),
  ];

  const optionsMenuItems: FabricMenuItem[] = [
    ...(onMarkAllRead
      ? [{ label: "Mark All As Read", onClick: () => onMarkAllRead() } as FabricMenuItem]
      : []),
  ];

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!hasMore || !onLoadMore) return;
    const el = e.currentTarget;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 100) {
      onLoadMore();
    }
  };

  return (
    <FabricDrawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: drawerWidth,
            maxWidth: "100vw",
            zIndex: zIndex.drawer,
          },
        },
      }}
    >
      <FabricStack sx={{ height: "100%", overflow: "hidden", ...sx }}>
        {/* Header */}
        <FabricFlex
          align="center"
          justify="space-between"
          sx={{
            px: 2.5,
            py: 2,
            borderBottom: "1px solid var(--mui-palette-divider)",
            flexShrink: 0,
          }}
        >
          <FabricFlex align="center" gap="sm">
            <NotificationsOutlinedIcon
              sx={{ color: "var(--mui-palette-text-secondary)", fontSize: 20 }}
            />
            <FabricText textVariant="uiMd">Notifications</FabricText>
          </FabricFlex>

          <FabricFlex align="center" gap="xs">
            {sortMenuItems.length > 0 && (
              <HeaderIconMenu
                icon={<SwapVertIcon fontSize="small" />}
                items={sortMenuItems}
                testId="sort-menu"
              />
            )}
            {optionsMenuItems.length > 0 && (
              <HeaderIconMenu
                icon={<MoreHorizIcon fontSize="small" />}
                items={optionsMenuItems}
                testId="options-menu"
              />
            )}
            {onSettings && (
              <FabricFlex
                align="center"
                justify="center"
                onClick={onSettings}
                data-testid="notification-settings"
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 1,
                  cursor: "pointer",
                  "&:hover": { bgcolor: "var(--mui-palette-action-hover)" },
                }}
              >
                <SettingsOutlinedIcon
                  fontSize="small"
                  sx={{ color: "var(--mui-palette-text-secondary)" }}
                />
              </FabricFlex>
            )}
            {isMobile && (
              <FabricFlex
                align="center"
                justify="center"
                onClick={onClose}
                data-testid="notification-close"
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 1,
                  cursor: "pointer",
                  "&:hover": { bgcolor: "var(--mui-palette-action-hover)" },
                }}
              >
                <CloseIcon fontSize="small" sx={{ color: "var(--mui-palette-text-secondary)" }} />
              </FabricFlex>
            )}
          </FabricFlex>
        </FabricFlex>

        {/* Content */}
        {loading && items.length === 0 ? (
          <FabricFlex align="center" justify="center" sx={{ flex: 1 }}>
            <FabricCircularProgress />
          </FabricFlex>
        ) : items.length === 0 ? (
          <FabricFlex align="center" justify="center" sx={{ flex: 1 }}>
            <FabricText textVariant="bodyMd" sx={{ color: "var(--mui-palette-text-secondary)" }}>
              No notifications
            </FabricText>
          </FabricFlex>
        ) : (
          <FabricStack onScroll={handleScroll} sx={{ flex: 1, overflowY: "auto", py: 1 }}>
            {items.map((item) => (
              <NotificationListItem
                key={item.id}
                item={item}
                onItemClick={onItemClick}
                onAction={onAction}
                onSenderClick={onSenderClick}
                isActionLoading={actionLoadingIds?.includes(item.id)}
              />
            ))}

            {/* Scroll loading indicator */}
            {hasMore && (
              <FabricFlex align="center" justify="center" sx={{ py: 2 }}>
                <FabricCircularProgress size={20} />
              </FabricFlex>
            )}

            {/* End of list — view all */}
            {!hasMore && items.length > 0 && onViewAll && (
              <FabricFlex align="center" justify="center" sx={{ py: 2 }}>
                <FabricText
                  textVariant="uiMd"
                  onClick={onViewAll}
                  sx={{
                    cursor: "pointer",
                    color: "var(--mui-palette-primary-main)",
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  View All Notifications
                </FabricText>
              </FabricFlex>
            )}
          </FabricStack>
        )}
      </FabricStack>
    </FabricDrawer>
  );
}

/* ------------------------------------------------------------------ */
/*  Header icon with dropdown menu                                     */
/* ------------------------------------------------------------------ */

/** Small icon button in the drawer header that opens a FabricMenu dropdown. */
function HeaderIconMenu({
  icon,
  items,
  testId,
}: {
  icon: React.ReactNode;
  items: FabricMenuItem[];
  testId?: string;
}) {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

  return (
    <>
      <FabricFlex
        align="center"
        justify="center"
        onClick={(e) => setAnchorEl(e.currentTarget as HTMLElement)}
        data-testid={testId}
        sx={{
          width: 32,
          height: 32,
          borderRadius: 1,
          cursor: "pointer",
          color: "var(--mui-palette-text-secondary)",
          "&:hover": { bgcolor: "var(--mui-palette-action-hover)" },
        }}
      >
        {icon}
      </FabricFlex>
      <FabricMenu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        items={items.map((item) => ({
          ...item,
          onClick: (e: React.MouseEvent<HTMLLIElement>) => {
            item.onClick?.(e);
            setAnchorEl(null);
          },
        }))}
      />
    </>
  );
}
