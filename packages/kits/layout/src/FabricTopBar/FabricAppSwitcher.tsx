import { FabricIconButton, FabricMenu, type FabricMenuItem } from "@fabric-kit/components";
import Apps from "@fabric-kit/icons/Apps";
import { useState } from "react";
import type { AppSwitcherItem } from "../types";
import { TOPBAR_ACTION_SX } from "../types";

export interface FabricAppSwitcherProps {
  items: AppSwitcherItem[];
}

/**
 * Grid menu of application links opened from a grid icon in the top bar.
 * The grid button shows the selected fill while the menu is open, and
 * `divideAfter` draws the lines between groups.
 */
export function FabricAppSwitcher({ items }: FabricAppSwitcherProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  if (items.length === 0) return null;

  return (
    <>
      <FabricIconButton
        aria-label="Apps"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{
          ...TOPBAR_ACTION_SX,
          bgcolor: open ? "var(--mui-palette-action-selected)" : undefined,
          "&:hover": { bgcolor: "var(--mui-palette-action-hover)" },
        }}
      >
        <Apps />
      </FabricIconButton>

      <FabricMenu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        items={items.map(
          (item): FabricMenuItem => ({
            label: item.label,
            icon: item.icon,
            divideAfter: item.divideAfter,
            onClick: () => {
              item.onClick();
              setAnchorEl(null);
            },
          }),
        )}
      />
    </>
  );
}
