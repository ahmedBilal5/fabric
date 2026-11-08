import { FabricAvatar } from "@fabric-kit/components";
import { FabricFlex, FabricStack, FabricText } from "@fabric-kit/primitives";
import type React from "react";
import type { NotificationItem } from "../types";
import { NotificationActions } from "./NotificationActions";

/** Formats a timestamp as relative ("Just now", "5 minutes ago") or absolute date. */
function formatTimestamp(timestamp: string | Date): string {
  const date = typeof timestamp === "string" ? new Date(timestamp) : timestamp;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;

  return (
    date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }) +
    ", " +
    date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  );
}

/** Single notification row with avatar, sender, content, timestamp, and action buttons. */
export function NotificationListItem({
  item,
  onItemClick,
  onAction,
  onSenderClick,
  isActionLoading,
}: {
  item: NotificationItem;
  onItemClick?: (item: NotificationItem) => void;
  onAction?: (itemId: string | number, action: string) => void;
  onSenderClick?: (senderId: string) => void;
  isActionLoading?: boolean;
}) {
  const senderId = item.sender.id;
  return (
    <FabricStack
      onClick={() => onItemClick?.(item)}
      sx={{
        px: 2.5,
        py: 1.5,
        borderRadius: 1,
        cursor: onItemClick ? "pointer" : "default",
        "&:hover": {
          bgcolor: "var(--mui-palette-action-hover)",
        },
      }}
    >
      {/* Avatar + name row */}
      <FabricFlex align="center" gap="sm">
        <FabricFlex sx={{ position: "relative" }}>
          <FabricAvatar
            name={item.sender.name}
            src={item.sender.avatar}
            size="sm"
            onClick={
              onSenderClick && senderId
                ? (e) => {
                    e.stopPropagation();
                    onSenderClick(senderId);
                  }
                : undefined
            }
            sx={onSenderClick ? { cursor: "pointer" } : undefined}
          />
          {/* Unread indicator dot */}
          {!item.isRead && (
            <FabricFlex
              data-testid="unread-indicator"
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor: "var(--mui-palette-error-main)",
              }}
            />
          )}
        </FabricFlex>

        <FabricText
          textVariant="uiMd"
          sx={{
            color: "var(--mui-palette-text-primary)",
            "&:hover": onSenderClick ? { color: "var(--mui-palette-primary-main)" } : undefined,
          }}
          onClick={
            onSenderClick && senderId
              ? (e: React.MouseEvent) => {
                  e.stopPropagation();
                  onSenderClick(senderId);
                }
              : undefined
          }
        >
          {item.sender.name}
        </FabricText>
      </FabricFlex>

      {/* Content */}
      <FabricText
        textVariant="bodyMd"
        sx={{
          mt: 0.5,
          color: "var(--mui-palette-text-primary)",
          overflow: "hidden",
          textOverflow: "ellipsis",
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
        }}
      >
        {item.content}
        {item.context && ": "}
        {item.context && (
          <FabricText component="span" textVariant="uiMd" sx={{ textTransform: "uppercase" }}>
            {item.context}
          </FabricText>
        )}
      </FabricText>

      {/* Timestamp */}
      <FabricText textVariant="bodySm" sx={{ mt: 0.5, color: "var(--mui-palette-text-secondary)" }}>
        {formatTimestamp(item.timestamp)}
      </FabricText>

      {/* Action buttons */}
      <NotificationActions item={item} onAction={onAction} isLoading={isActionLoading} />
    </FabricStack>
  );
}
