/**
 * FabricToggleButtonGroup — a segmented control. Wraps MUI
 * `ToggleButtonGroup` with a declarative `items` array so consumers can
 * define the group as data instead of hand-writing each child `ToggleButton`.
 * Defaults to `exclusive={true}` (radio-style single selection); pass
 * `exclusive={false}` for multi-select.
 *
 * Each item accepts an `icon`, a `label`, its own `aria-label`, `disabled`
 * flag, and per-button `sx`. The rest of the MUI surface (`value`,
 * `onChange`, `size`, `color`, `orientation`, `fullWidth`) is preserved via
 * spread.
 *
 *
 * @example
 * ```tsx
 * <FabricToggleButtonGroup
 *   value={view}
 *   onChange={(_, v) => v && setView(v)}
 *   items={[
 *     { value: 'grid', icon: <ViewModuleIcon />, 'aria-label': 'Grid view' },
 *     { value: 'list', icon: <ViewListIcon />,   'aria-label': 'List view' },
 *   ]}
 * />
 * ```
 */

import { iconSize, opacity, radii, spacing } from "@fabric-kit/design-tokens";
import type { SxProps, Theme } from "@mui/material/styles";
import { styled } from "@mui/material/styles";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup, { type ToggleButtonGroupProps } from "@mui/material/ToggleButtonGroup";
import type React from "react";
import { forwardRef, memo } from "react";

// One rounded, filled box; borderless 32×28 segments (2px 4px padding
// around a 24px icon); the selected segment is solid primary. `size` and `color` are accepted for
// MUI compatibility, but Fabric defines a single look, so they render alike.
const StyledToggleButtonGroup = styled(ToggleButtonGroup)(() => ({
  borderRadius: `${radii.lg}px`,
  overflow: "hidden",
  // The divider color, so the track follows the brand and the mode.
  backgroundColor: "var(--mui-palette-divider)",
  "& .MuiToggleButtonGroup-grouped": {
    margin: 0,
    border: 0,
    borderRadius: `${radii.lg}px`,
    padding: `2px ${spacing.xs}px`,
    color: "var(--mui-palette-text-primary)",
    "& .MuiSvgIcon-root": { fontSize: iconSize.xl },
    "&.Mui-selected, &.Mui-selected:hover": {
      backgroundColor: "var(--mui-palette-primary-main)",
      color: "var(--mui-palette-primary-contrastText)",
    },
    "&.Mui-disabled": { opacity: opacity.disabled, border: 0 },
  },
}));

export interface FabricToggleItem {
  /** Unique value that identifies this item in the group's `value` / `onChange`. */
  value: string;
  /** Text label rendered inside the button. */
  label?: React.ReactNode;
  /** Icon element rendered before the label. */
  icon?: React.ReactElement;
  /** Disable this individual button. */
  disabled?: boolean;
  /** Accessible label for this button (announced by screen readers). */
  "aria-label"?: string;
  /** Per-button style overrides. */
  sx?: SxProps<Theme>;
}

export interface FabricToggleButtonGroupProps extends Omit<ToggleButtonGroupProps, "children"> {
  /** The toggle options to render. Each item becomes a `ToggleButton`. */
  items: FabricToggleItem[];
}

const FabricToggleButtonGroupInner = forwardRef<HTMLDivElement, FabricToggleButtonGroupProps>(
  function FabricToggleButtonGroup({ items, exclusive = true, ...rest }, ref) {
    return (
      <StyledToggleButtonGroup ref={ref} exclusive={exclusive} {...rest}>
        {items.map((item) => (
          <ToggleButton
            key={item.value}
            value={item.value}
            disabled={item.disabled}
            aria-label={item["aria-label"]}
            sx={item.sx}
          >
            {item.icon}
            {item.label}
          </ToggleButton>
        ))}
      </StyledToggleButtonGroup>
    );
  },
);

export const FabricToggleButtonGroup = memo(FabricToggleButtonGroupInner);
FabricToggleButtonGroup.displayName = "FabricToggleButtonGroup";
