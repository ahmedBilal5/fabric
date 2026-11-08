import { FabricButton, FabricCircularProgress } from "@fabric-kit/components";
import { FabricFlex, FabricText } from "@fabric-kit/primitives";
import type { NotificationItem } from "../types";

/** Action buttons rendered per notification item based on type and state. */
export function NotificationActions({
  item,
  onAction,
  isLoading,
}: {
  item: NotificationItem;
  onAction?: (itemId: string | number, action: string) => void;
  isLoading?: boolean;
}) {
  if (item.type === "readonly") return null;

  // Already actioned — show status badge
  if (item.actionPerformed) {
    const isPositive = ["approved", "start"].includes(item.actionPerformed.toLowerCase());
    return (
      <FabricFlex sx={{ pt: 1 }}>
        <FabricText
          textVariant="uiMd"
          sx={{
            px: 1,
            py: 0.25,
            borderRadius: 1,
            bgcolor: isPositive
              ? "var(--mui-palette-success-light)"
              : "var(--mui-palette-error-light)",
            color: isPositive ? "var(--mui-palette-success-dark)" : "var(--mui-palette-error-dark)",
          }}
        >
          {item.actionPerformed.charAt(0).toUpperCase() + item.actionPerformed.slice(1)}
        </FabricText>
      </FabricFlex>
    );
  }

  if (isLoading) {
    return (
      <FabricFlex align="center" sx={{ pt: 1.5 }}>
        <FabricCircularProgress size={20} />
      </FabricFlex>
    );
  }

  // Actionable: Accept / Deny
  if (item.type === "actionable" || item.type === "approval") {
    return (
      <FabricFlex gap="sm" sx={{ pt: 1.5 }}>
        <FabricButton
          size="small"
          onClick={() => onAction?.(item.id, "approved")}
          sx={{ minWidth: 0, px: 1.5, height: 30 }}
        >
          Accept
        </FabricButton>
        <FabricButton
          size="small"
          variant="outlined"
          onClick={() => onAction?.(item.id, "denied")}
          sx={{ minWidth: 0, px: 1.5, height: 30 }}
        >
          Deny
        </FabricButton>
      </FabricFlex>
    );
  }

  // Onboarding: Skip / Start
  if (item.type === "onboarding") {
    return (
      <FabricFlex gap="sm" sx={{ pt: 1.5 }}>
        <FabricButton
          size="small"
          variant="outlined"
          onClick={() => onAction?.(item.id, "skip")}
          sx={{ minWidth: 0, px: 1.5, height: 30 }}
        >
          Skip
        </FabricButton>
        <FabricButton
          size="small"
          onClick={() => onAction?.(item.id, "start")}
          sx={{ minWidth: 0, px: 1.5, height: 30 }}
        >
          Start
        </FabricButton>
      </FabricFlex>
    );
  }

  return null;
}
