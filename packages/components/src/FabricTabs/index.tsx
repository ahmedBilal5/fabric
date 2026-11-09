/**
 * FabricTabs -- the design-system tab strip.
 *
 * Extends MUI `Tabs` (the full `TabsProps` surface) with a declarative `tabs`
 * array. It renders only the tab strip; render the active panel yourself.
 * Keys come from each tab's `value`, so tabs never remount on re-render.
 *
 * `appearance` picks one of six tab styles (`underline` by default). MUI's
 * `variant` keeps its layout meaning (`standard` / `scrollable` /
 * `fullWidth`). Each tab draws its own line or fill per state (default, hover,
 * press, active, disabled), so MUI's sliding indicator is hidden.
 *
 * Give the strip an `aria-label` (or `aria-labelledby`) that names it.
 *
 * @example
 * ```tsx
 * <FabricTabs
 *   appearance="fillAlt"
 *   value={activeTab}
 *   onChange={(_, v) => setActiveTab(v)}
 *   tabs={[
 *     { value: 'overview', label: 'Overview' },
 *     { value: 'details',  label: 'Details' },
 *     { value: 'history',  label: 'History' },
 *   ]}
 * />
 * ```
 */

import {
  brand,
  dark,
  fontWeight,
  radii,
  spacing,
  tab,
  text,
  textVariant,
} from "@fabric-kit/design-tokens";
import MuiBox from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";
import MuiTab, { type TabProps } from "@mui/material/Tab";
import MuiTabs, { type TabsProps } from "@mui/material/Tabs";
import type React from "react";
import { forwardRef, memo } from "react";

/**
 * Visual style of the tabs.
 *
 * - `underline`: a primary line under the active tab (default).
 * - `underlineAlt`: a lighter underline variant for toolbars.
 * - `fill`, `fillAlt`, `fillAlt2`: filled tabs, from strongest to subtlest.
 * - `border`: outlined tabs.
 */
export type FabricTabsAppearance =
  | "underline"
  | "underlineAlt"
  | "fill"
  | "fillAlt"
  | "fillAlt2"
  | "border";

/** A single tab definition. Extends the full MUI `TabProps` surface with `value` narrowed to `string`. */
export interface FabricTabItem extends Omit<TabProps, "value"> {
  value: string;
}

export interface FabricTabsProps extends Omit<TabsProps, "value" | "onChange" | "children"> {
  /** Tab definitions. Each item is spread onto a MUI `<Tab>`. */
  tabs: FabricTabItem[];
  /** Currently selected tab value. */
  value: string;
  /** Change handler. Signature matches MUI's `Tabs.onChange`. */
  onChange: (event: React.SyntheticEvent, newValue: string) => void;
  /**
   * Tab style. Separate from MUI's `variant`, which still controls layout
   * (`standard` / `scrollable` / `fullWidth`).
   * @default 'underline'
   */
  appearance?: FabricTabsAppearance;
  /** Render a bottom border on the tab strip. Defaults to `false`. */
  borderBottom?: boolean;
  /** Sx overrides for the outer flex-column container. */
  containerSx?: SxProps<Theme>;
}

const CONTAINER_SX: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  width: "100%",
};

/** Colors one scheme needs to paint every appearance. */
interface TabSchemeColors {
  primary: string;
  navy: string;
  hover: string;
  disabled: string;
  text: string;
  textHover: string;
  hoverBg: string;
  pressText: string;
  inverse: string;
  /** Neutral line under unselected tabs, so only the selected tab is highlighted. */
  line: string;
}

const LIGHT: TabSchemeColors = {
  primary: "var(--mui-palette-primary-main)",
  navy: brand.navy,
  hover: "var(--mui-palette-primary-dark)",
  disabled: tab.disabled,
  text: tab.text,
  textHover: tab.textHover,
  hoverBg: "rgba(var(--mui-palette-primary-mainChannel) / 0.1)",
  pressText: tab.pressText,
  inverse: text.inverse,
  line: "var(--mui-palette-divider)",
};

const DARK: TabSchemeColors = {
  primary: "var(--mui-palette-primary-main)",
  navy: dark.brand.navy,
  hover: "var(--mui-palette-primary-light)",
  disabled: dark.tab.disabled,
  text: dark.tab.text,
  textHover: dark.tab.textHover,
  hoverBg: "rgba(var(--mui-palette-primary-mainChannel) / 0.12)",
  pressText: dark.tab.pressText,
  inverse: dark.text.inverse,
  line: "var(--mui-palette-divider)",
};

// Lines are borders on the tab's `::after` (bottom line) and `::before` (folder outline), so a
// tab keeps its 28px height in every state. Borders snap to device pixels; inset box-shadows left
// hairline seams at browser zoom levels other than 100%.
const bottomLine = (color: string, width = 1) => ({
  "&::after": { borderBottom: `${width}px solid ${color}` },
});
const folderBorder = (color: string) => ({
  "&::before": { border: `1px solid ${color}`, borderBottom: "none" },
  "&::after": { borderBottom: "none" },
});

/** Per-state tab colors for one appearance (default / hover / press / active / disabled). */
function appearanceStyles(appearance: FabricTabsAppearance, c: TabSchemeColors) {
  const line = (color: string, width = 1) => ({ color, ...bottomLine(color, width) });
  const fill = (bg: string, color: string) => ({ backgroundColor: bg, color });

  switch (appearance) {
    case "fill":
      return {
        ...fill(c.primary, c.inverse),
        "&:hover": fill(c.hover, c.inverse),
        "&:active": fill(c.navy, c.inverse),
        "&.Mui-selected": fill(c.primary, c.inverse),
        "&.Mui-disabled": fill(c.disabled, c.inverse),
      };
    case "fillAlt":
    case "fillAlt2":
      return {
        ...fill("transparent", c.text),
        "&:hover": fill(c.hoverBg, c.textHover),
        "&:active": fill(c.navy, c.inverse),
        "&.Mui-selected": fill(c.primary, c.inverse),
        "&.Mui-disabled": fill(c.disabled, c.inverse),
      };
    case "border":
      return {
        color: c.text,
        ...bottomLine(c.line),
        "&:hover": line(c.hover),
        "&:active": { color: c.pressText, ...bottomLine(c.navy) },
        "&.Mui-selected": { color: c.primary, ...folderBorder(c.primary) },
        "&.Mui-disabled": { color: c.disabled, ...folderBorder(c.disabled) },
      };
    case "underlineAlt":
      return {
        color: c.text,
        "&:hover": line(c.hover),
        "&:active": line(c.navy),
        "&.Mui-selected": line(c.primary, 2),
        "&.Mui-disabled": { color: c.disabled },
      };
    default:
      return {
        color: c.text,
        ...bottomLine(c.line),
        "&:hover": line(c.hover),
        "&:active": line(c.navy),
        "&.Mui-selected": line(c.primary, 2),
        "&.Mui-disabled": { color: c.disabled, ...bottomLine(c.line) },
      };
  }
}

// Tab strip: 28px row, no MUI sliding indicator.
const tabsSx = (appearance: FabricTabsAppearance) => (theme: Theme) => ({
  [theme.breakpoints.up("sm")]: { minHeight: 28 },
  "& .MuiTabs-indicator": { display: "none" },
  // Filled tabs keep a 2px gap between rows so solid tabs stay
  // apart. Line-based tabs sit edge to edge so their lines join into one continuous line. The
  // theme spacing base is 4px.
  "& .MuiTabs-list": {
    gap:
      appearance === "fill" || appearance === "fillAlt" || appearance === "fillAlt2"
        ? theme.spacing(0.5)
        : 0,
  },
});

// Each tab: 28px, 4/8 padding, UI SemiBold 14/20 with 0.5px letter spacing, capitalized,
// 4px top radius (fill_alt rounds all corners). Applied on the tab itself, before the item's
// own `sx`, so per-tab `sx` overrides still win. With `borderBottom`, the strip's border is the
// neutral line, so tabs don't draw a second one under themselves. Below `sm` the theme makes the
// strip 40px tall for touch targets, so tabs grow to fill it and their lines stay on the bottom.
const tabSx = (appearance: FabricTabsAppearance, borderBottom: boolean) => (theme: Theme) => {
  const scheme = (c: TabSchemeColors) => (borderBottom ? { ...c, line: "transparent" } : c);
  return {
    minHeight: 28,
    [theme.breakpoints.down("sm")]: { minHeight: 40 },
    minWidth: 0,
    padding: `${spacing.xs}px ${spacing.sm}px`,
    ...textVariant.uiLg,
    fontWeight: fontWeight.semiBold,
    letterSpacing: "0.5px",
    textTransform: "capitalize",
    opacity: 1,
    borderRadius: appearance === "fillAlt" ? `${radii.md}px` : `${radii.md}px ${radii.md}px 0 0`,
    // Both pseudo-elements sit along the bottom; `::before` also stretches to the top for the
    // folder outline. (`::after` gets its border from `appearanceStyles`, so it has no own key here.)
    "&::before, &::after": {
      content: '""',
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      boxSizing: "border-box",
      pointerEvents: "none",
    },
    "&::before": { top: 0, borderRadius: "inherit" },
    ...appearanceStyles(appearance, scheme(LIGHT)),
    ...theme.applyStyles("dark", appearanceStyles(appearance, scheme(DARK))),
  };
};

const FabricTabsImpl = forwardRef<HTMLDivElement, FabricTabsProps>(function FabricTabs(
  {
    tabs,
    value,
    onChange,
    appearance = "underline",
    borderBottom = false,
    containerSx,
    sx,
    ...tabsRest
  },
  ref,
) {
  return (
    <MuiBox
      sx={[
        CONTAINER_SX,
        ...(Array.isArray(containerSx) ? containerSx : containerSx ? [containerSx] : []),
      ]}
    >
      <MuiTabs
        ref={ref}
        value={value}
        onChange={onChange}
        sx={[
          tabsSx(appearance),
          borderBottom ? { borderBottom: `1px solid var(--mui-palette-divider)` } : false,
          ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
        ]}
        {...tabsRest}
      >
        {tabs.map(({ value: tabValue, sx: itemSx, ...tabProps }) => (
          <MuiTab
            key={tabValue}
            value={tabValue}
            sx={[
              tabSx(appearance, borderBottom),
              ...(Array.isArray(itemSx) ? itemSx : itemSx ? [itemSx] : []),
            ]}
            {...tabProps}
          />
        ))}
      </MuiTabs>
    </MuiBox>
  );
});

FabricTabsImpl.displayName = "FabricTabs";

export const FabricTabs = memo(FabricTabsImpl);
