/**
 * FabricListItemSimple — a compact single-selection list. Renders items as
 * MUI `ListItemButton`s with an optional leading icon, a selected state
 * driven by `value`, and dividers between items. Ideal for sidebar
 * navigation, settings sub-navigation, and pick-lists where each item is a
 * label + optional icon.
 *
 * `onChange` fires only when an item is clicked, never on an outside click.
 *
 * @example
 * ```tsx
 * <FabricListItemSimple
 *   value={selected}
 *   onChange={setSelected}
 *   items={[
 *     { id: 'profile',  label: 'Profile',  icon: <PersonIcon /> },
 *     { id: 'billing',  label: 'Billing',  icon: <CreditCardIcon /> },
 *     { id: 'settings', label: 'Settings', icon: <SettingsIcon /> },
 *   ]}
 * />
 * ```
 */

import { fontFamily, fontWeight } from "@fabric-kit/design-tokens";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import type { SxProps, Theme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import React, { forwardRef, memo } from "react";

export interface FabricListItem {
  id: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}

export interface FabricListItemSimpleProps {
  items: FabricListItem[];
  /** Currently selected item id. */
  value?: string;
  /** Fires when an item is clicked. Never fires on an outside click. */
  onChange?: (id: string) => void;
  sx?: SxProps<Theme>;
  "aria-label"?: string;
}

const FabricListItemSimpleInner = forwardRef<HTMLDivElement, FabricListItemSimpleProps>(
  function FabricListItemSimple({ items, value, onChange, sx, "aria-label": ariaLabel }, ref) {
    return (
      <Box
        ref={ref}
        sx={[
          {
            width: "100%",
            borderRadius: 2,
            bgcolor: "background.paper",
            overflow: "hidden",
          },
          ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
        ]}
      >
        <List disablePadding aria-label={ariaLabel}>
          {items.map((item, index) => (
            <React.Fragment key={item.id}>
              <ListItemButton
                selected={item.id === value}
                disabled={item.disabled}
                onClick={() => {
                  onChange?.(item.id);
                  item.onClick?.();
                }}
              >
                {item.icon != null && (
                  <ListItemIcon sx={{ minWidth: 32 }}>{item.icon}</ListItemIcon>
                )}
                {/* Settings-list labels: heading font, Medium weight. */}
                <Typography
                  variant="body2"
                  sx={{ flex: 1, fontFamily: fontFamily.heading, fontWeight: fontWeight.medium }}
                >
                  {item.label}
                </Typography>
              </ListItemButton>
              {index < items.length - 1 && <Divider component="li" />}
            </React.Fragment>
          ))}
        </List>
      </Box>
    );
  },
);

export const FabricListItemSimple = memo(FabricListItemSimpleInner);
FabricListItemSimple.displayName = "FabricListItemSimple";
