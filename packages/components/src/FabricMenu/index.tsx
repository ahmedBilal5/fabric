/**
 * FabricMenu — the design-system menu primitive.
 *
 * Thin wrapper around MUI `Menu` with Fabric's paper (radius, shadow,
 * min-width) and list-item defaults baked in via MUI 9 `slotProps.paper` /
 * `slotProps.list`. Consumers pass their own `slotProps` and their `sx` keys
 * win on the paper / list slots.
 *
 * Adds an optional declarative `items` API for the common "click a MenuItem →
 * fire a handler" pattern (icon + label + optional divider). When `items` is
 * provided, `children` is ignored — pass one or the other. `React.memo` +
 * `displayName` present. No `forwardRef` — MUI Menu manages its own portal
 * ref via the `open`/`anchorEl` props.
 *
 * @example
 * ```tsx
 * <FabricMenu
 *   anchorEl={anchor}
 *   open={Boolean(anchor)}
 *   onClose={() => setAnchor(null)}
 *   items={[
 *     { label: 'Edit',   onClick: openEdit },
 *     { label: 'Delete', onClick: confirmDelete },
 *   ]}
 * />
 * ```
 */

import {
  border,
  brand,
  dark,
  field,
  fontFamily,
  fontSize,
  fontWeight,
  iconSize,
  menu,
  radii,
  shadows,
  spacing,
} from "@fabric-kit/design-tokens";
import {
  Divider,
  ListItemIcon,
  Menu,
  MenuItem,
  type MenuProps,
  type SxProps,
  type Theme,
} from "@mui/material";
import React, { memo, type ReactNode, useMemo } from "react";

export interface FabricMenuItem {
  label: ReactNode;
  onClick?: (event: React.MouseEvent<HTMLLIElement>) => void;
  /** Leading icon or image, centered in a 32px slot (app icon size). */
  icon?: ReactNode;
  disabled?: boolean;
  /** Active state: highlights the item as the current one. */
  selected?: boolean;
  testId?: string;
  /** Renders a separator line after this item. Ignored on the last item. */
  divideAfter?: boolean;
  sx?: object;
}

export interface FabricMenuProps extends MenuProps {
  /** Declarative item list. When present, `children` is ignored. */
  items?: FabricMenuItem[];
}

const DS_PAPER_SX: SxProps<Theme> = {
  borderRadius: `${radii.lg}px`,
  boxShadow: shadows.dropdown,
  minWidth: 232,
  backgroundImage: "none",
};

/** Item colors per state (default / hover / press / active) for one color scheme. */
const itemColors = (isDark: boolean) => {
  const m = isDark ? dark.menu : menu;
  return {
    color: (isDark ? dark.field : field).label,
    "&:hover, &.Mui-focusVisible": {
      backgroundColor: isDark ? "rgba(var(--mui-palette-primary-mainChannel) / 0.12)" : m.bgHover,
      color: isDark ? "var(--mui-palette-primary-light)" : "var(--mui-palette-primary-dark)",
    },
    "&:active": {
      backgroundColor: m.bgPress,
      color: (isDark ? dark.brand : brand).navy,
    },
    "&.Mui-selected, &.Mui-selected:hover, &.Mui-selected.Mui-focusVisible": {
      backgroundColor: "var(--mui-palette-action-selected)",
      color: "var(--mui-palette-primary-main)",
    },
  };
};

const separatorColor = (isDark: boolean) => ({
  borderColor: (isDark ? dark.border : border).light,
});

// No spacing tokens exist for the 2px list inset and 1px item gap.
const DS_LIST_SX: SxProps<Theme> = (theme) => ({
  display: "flex",
  flexDirection: "column",
  gap: "1px",
  paddingBlock: "2px",
  paddingInline: `${spacing.xs}px`,
  "& .MuiMenuItem-root": {
    minHeight: "2.5rem",
    paddingBlock: `${spacing.xs}px`,
    paddingInline: `${spacing.sm}px`,
    gap: `${spacing.sm}px`,
    borderRadius: `${radii.md}px`,
    fontFamily: fontFamily.body,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    lineHeight: "20px",
    letterSpacing: "0.5px",
    textTransform: "capitalize",
    ...itemColors(false),
  },
  "& .MuiDivider-root": separatorColor(false),
  // A flat fill on press, no ripple.
  "& .MuiTouchRipple-root": { display: "none" },
  // MUI's ListItemIcon defaults to `min-width: 56px`; Fabric uses a 32px square slot.
  "& .MuiListItemIcon-root": {
    minWidth: 0,
    width: iconSize["3xl"],
    height: iconSize["3xl"],
    alignItems: "center",
    justifyContent: "center",
  },
  ...theme.applyStyles("dark", {
    "& .MuiMenuItem-root": itemColors(true),
    "& .MuiDivider-root": separatorColor(true),
  }),
});

/** Appends consumer `sx` after the DS defaults so consumer keys win per property. */
const mergeSx = (ds: SxProps<Theme>, consumer?: SxProps<Theme>): SxProps<Theme> => [
  ...(Array.isArray(ds) ? ds : [ds]),
  ...(consumer ? (Array.isArray(consumer) ? consumer : [consumer]) : []),
];

function FabricMenuImpl({
  slotProps: consumerSlotProps,
  items,
  children,
  ...rest
}: FabricMenuProps) {
  const mergedSlotProps = useMemo(() => {
    const consumerPaper = (consumerSlotProps?.paper as { sx?: SxProps<Theme> } | undefined) ?? {};
    const consumerList = (consumerSlotProps?.list as { sx?: SxProps<Theme> } | undefined) ?? {};
    return {
      ...consumerSlotProps,
      paper: { ...consumerPaper, sx: mergeSx(DS_PAPER_SX, consumerPaper.sx) },
      list: { ...consumerList, sx: mergeSx(DS_LIST_SX, consumerList.sx) },
    };
  }, [consumerSlotProps]);

  return (
    <Menu slotProps={mergedSlotProps} {...rest}>
      {items
        ? items.flatMap((item, idx) => {
            const node = (
              <MenuItem
                key={item.testId ?? String(idx)}
                onClick={item.onClick}
                disabled={item.disabled}
                selected={item.selected}
                data-testid={item.testId}
                sx={item.sx}
              >
                {item.icon != null && <ListItemIcon>{item.icon}</ListItemIcon>}
                {item.label}
              </MenuItem>
            );
            // `li` keeps the list markup valid and gives the separator its role.
            return item.divideAfter && idx < items.length - 1
              ? [node, <Divider component="li" key={`div-${idx}`} />]
              : [node];
          })
        : children}
    </Menu>
  );
}

FabricMenuImpl.displayName = "FabricMenu";

export const FabricMenu = memo(FabricMenuImpl);
