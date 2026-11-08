/**
 * FabricBadge — the design-system badge / notification indicator.
 *
 * Thin wrapper over MUI `Badge` with theme styling. `badgeContent` accepts
 * any `ReactNode`. Pass the element the badge sits on as `children`, and style
 * the badge itself with `slotProps.badge.sx`.
 *
 * All standard MUI Badge props pass through: `variant` (`standard | dot`),
 * `color`, `anchorOrigin`, `max`, `showZero`, `invisible`, `overlap`,
 * `slotProps`, `slots`, `sx`.
 *
 *
 * @example
 * ```tsx
 * <FabricBadge badgeContent={notifications.length} color="error">
 *   <NotificationsIcon />
 * </FabricBadge>
 * ```
 */

import { Badge, type BadgeProps } from "@mui/material";
import { forwardRef, memo } from "react";

export type FabricBadgeProps = BadgeProps;

const FabricBadgeImpl = forwardRef<HTMLSpanElement, FabricBadgeProps>(
  function FabricBadge(props, ref) {
    return <Badge ref={ref} {...props} />;
  },
);

FabricBadgeImpl.displayName = "FabricBadge";

export const FabricBadge = memo(FabricBadgeImpl);
