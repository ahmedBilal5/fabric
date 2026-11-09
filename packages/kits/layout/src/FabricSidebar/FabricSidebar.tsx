import {
  FabricDrawer,
  FabricIconButton,
  FabricMenu,
  type FabricMenuItem,
} from "@fabric-kit/components";
import { controlHeight, iconSize, radii, spacing } from "@fabric-kit/design-tokens";
// Deep imports: the package barrel re-exports every icon.
import ArrowDropDown from "@fabric-kit/icons/ArrowDropDown";
import ArrowMenuClose from "@fabric-kit/icons/ArrowMenuClose";
import ArrowMenuOpen from "@fabric-kit/icons/ArrowMenuOpen";
import { FabricFlex, FabricStack, FabricText } from "@fabric-kit/primitives";
import { useBreakpoint } from "@fabric-kit/theme";
import { ButtonBase, type CSSObject, styled, type Theme } from "@mui/material";
import React, { useState } from "react";
import type { FabricSidebarProps, NavigationItem, WorkspaceItem } from "../types";
import { SIDEBAR_WIDTH_COLLAPSED, SIDEBAR_WIDTH_OPEN } from "../types";

/* ------------------------------------------------------------------ */
/*  Global navigation look */
/* ------------------------------------------------------------------ */

// Theme CSS variables (`palette.appShell.*`), so light / dark mode switch with the theme.
const appShellColor = (
  key: "text" | "hover" | "press" | "toggleBg" | "toggleBgHover" | "toggleBgPress",
) => `var(--mui-palette-appShell-${key})`;

/** Sidebar labels use `uiMd` (13px Medium), capitalized. */
const ITEM_LABEL_SX = { textTransform: "capitalize" } as const;

/** Sidebar item and toggle icons: 20px. */
const SIDEBAR_ICON_SIZE = iconSize.lg;

/* ------------------------------------------------------------------ */
/*  Styled drawer                                                      */
/* ------------------------------------------------------------------ */

const openedMixin = (theme: Theme): CSSObject => ({
  width: SIDEBAR_WIDTH_OPEN,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme: Theme): CSSObject => ({
  width: SIDEBAR_WIDTH_COLLAPSED,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
});

interface StyledDrawerProps {
  open?: boolean;
}

const StyledDrawer = styled(FabricDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})<StyledDrawerProps>(({ theme, open }) => ({
  width: open ? SIDEBAR_WIDTH_OPEN : SIDEBAR_WIDTH_COLLAPSED,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  "& .MuiDrawer-paper": {
    backgroundImage: "none",
    backgroundColor: "var(--mui-palette-background-paper)",
    color: "var(--mui-palette-text-primary)",
    borderRight: "1px solid var(--mui-palette-divider)",
    ...(open ? openedMixin(theme) : closedMixin(theme)),
  },
  ...(open ? openedMixin(theme) : closedMixin(theme)),
}));

/* ------------------------------------------------------------------ */
/*  Workspace dropdown                                                 */
/* ------------------------------------------------------------------ */

/**
 * Dropdown in the sidebar header for switching between workspaces: the workspace icon
 * (36px) and name, with the drop-down arrow after the name. In the collapsed rail
 * there is no room beside the icon, so the arrow moves to its own row underneath.
 */
function WorkspaceDropdown({
  items,
  onItemClick,
  sidebarOpen,
  enabled,
}: {
  items: WorkspaceItem[];
  onItemClick: (id: string) => void;
  sidebarOpen: boolean;
  enabled: boolean;
}) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const current = items[0];
  if (!current) return null;

  const arrow = (
    <ArrowDropDown
      aria-hidden
      sx={{
        fontSize: iconSize.xl,
        flexShrink: 0,
        transition: "transform 0.3s ease",
        transform: anchorEl ? "rotate(180deg)" : "rotate(0deg)",
        color: anchorEl ? appShellColor("press") : appShellColor("text"),
      }}
    />
  );

  const content = (
    <>
      <FabricFlex
        align="center"
        gap="lg"
        sx={{ px: `${spacing.md}px`, py: "2px", overflow: "hidden", width: "100%" }}
      >
        {/* 36px logo / workspace mark. */}
        <FabricFlex
          align="center"
          justify="center"
          sx={{ width: controlHeight.sm, height: controlHeight.sm, flexShrink: 0 }}
        >
          {current.icon}
        </FabricFlex>
        {sidebarOpen && (
          <FabricText
            textVariant="uiMd"
            truncate
            sx={{ flex: 1, minWidth: 0, color: "var(--mui-palette-text-primary)" }}
          >
            {current.name}
          </FabricText>
        )}
        {enabled && sidebarOpen && arrow}
      </FabricFlex>
      {enabled && !sidebarOpen && (
        <FabricFlex align="center" sx={{ height: iconSize.xl, mt: "-2px", px: `${spacing.lg}px` }}>
          {arrow}
        </FabricFlex>
      )}
    </>
  );

  return (
    <>
      {enabled ? (
        <ButtonBase
          onClick={(e) => setAnchorEl(e.currentTarget)}
          aria-haspopup="menu"
          aria-expanded={Boolean(anchorEl)}
          aria-label={`Workspace: ${current.name}`}
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch",
            width: "100%",
            textAlign: "left",
            borderRadius: `${radii.md}px`,
            "&:hover": { bgcolor: "var(--mui-palette-action-hover)" },
            "&.Mui-focusVisible": {
              outline: "2px solid var(--mui-palette-primary-main)",
              outlineOffset: -2,
            },
          }}
        >
          {content}
        </ButtonBase>
      ) : (
        <FabricStack sx={{ width: "100%" }}>{content}</FabricStack>
      )}

      <FabricMenu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        items={items.slice(1).map(
          (item): FabricMenuItem => ({
            label: item.name,
            icon: item.icon,
            divideAfter: item.divideAfter,
            onClick: () => {
              onItemClick(item.id);
              setAnchorEl(null);
            },
          }),
        )}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Navigation row                                                     */
/* ------------------------------------------------------------------ */

/**
 * Single navigation row — renders as a link when `item.path` is set, plain clickable otherwise.
 * The design: 40px row, 8/16 padding, 16px gap; selected rows get the selected fill and the brand
 * color. The 20px icon sits in a 24px box so the closed rail keeps its width.
 */
function NavRow({
  item,
  isSelected,
  sidebarOpen,
  linkComponent: LinkEl,
}: {
  item: NavigationItem;
  isSelected: boolean;
  sidebarOpen: boolean;
  linkComponent: React.ElementType;
}) {
  const color = isSelected ? "var(--mui-palette-primary-main)" : appShellColor("text");
  const isLink = Boolean(item.path);
  const row = (
    <FabricFlex
      data-testid={item.testId}
      align="center"
      gap="lg"
      // Rows without a path act as buttons, so they need a role and keyboard support.
      role={isLink ? undefined : "button"}
      tabIndex={isLink ? undefined : 0}
      aria-current={!isLink && isSelected ? "page" : undefined}
      aria-label={sidebarOpen ? undefined : item.label}
      title={sidebarOpen ? undefined : item.label}
      onClick={isLink ? undefined : item.onClick}
      onKeyDown={
        isLink
          ? undefined
          : (event: React.KeyboardEvent) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                item.onClick?.();
              }
            }
      }
      sx={{
        height: 40,
        px: `${spacing.lg}px`,
        py: `${spacing.sm}px`,
        borderRadius: `${radii.md}px`,
        cursor: "pointer",
        overflow: "hidden",
        color,
        bgcolor: isSelected ? "var(--mui-palette-action-selected)" : "transparent",
        "&:hover": {
          bgcolor: "var(--mui-palette-action-selected)",
        },
        "&:focus-visible": {
          outline: "2px solid var(--mui-palette-primary-main)",
          outlineOffset: -2,
        },
        ...item.sx,
      }}
    >
      <FabricFlex
        align="center"
        justify="center"
        sx={{
          width: iconSize.xl,
          height: iconSize.xl,
          flexShrink: 0,
          "& .MuiSvgIcon-root": { fontSize: SIDEBAR_ICON_SIZE },
        }}
      >
        {item.icon}
      </FabricFlex>
      {sidebarOpen && (
        <FabricText textVariant="uiMd" truncate sx={{ flex: 1, color, ...ITEM_LABEL_SX }}>
          {item.label}
        </FabricText>
      )}
    </FabricFlex>
  );

  if (item.path) {
    return (
      <LinkEl
        to={item.path}
        href={item.path}
        aria-current={isSelected ? "page" : undefined}
        aria-label={sidebarOpen ? undefined : item.label}
        onClick={item.onClick}
        style={{
          textDecoration: "none",
          color: "inherit",
          display: "block",
          borderRadius: radii.md,
        }}
      >
        {row}
      </LinkEl>
    );
  }

  return row;
}

/* ------------------------------------------------------------------ */
/*  FabricSidebar                                                      */
/* ------------------------------------------------------------------ */

/**
 * Collapsible navigation sidebar with workspace selector and icon-based nav items.
 *
 * Renders as a permanent drawer on desktop and a temporary overlay on mobile.
 * Use inside `FabricAppShell` or standalone with your own layout shell.
 *
 * @example
 * ```tsx
 * <FabricSidebar
 *   open={open}
 *   onToggle={() => setOpen(!open)}
 *   items={navItems}
 *   selectedKey="home"
 *   workspaceItems={workspaces}
 *   showWorkspaceSelector
 * />
 * ```
 */
export const FabricSidebar = React.forwardRef<HTMLDivElement, FabricSidebarProps>(
  function FabricSidebar(
    {
      open,
      onToggle,
      items,
      selectedKey,
      workspaceItems,
      onWorkspaceChange,
      showWorkspaceSelector = false,
      logo,
      linkComponent = "a",
      bannerOffset = 0,
      sx,
    },
    ref,
  ) {
    const isMobile = useBreakpoint("down", "md");

    const sidebarContent = (
      <>
        <FabricStack
          sx={{
            pt: `${spacing.sm}px`,
            width: "100%",
            mt: `${bannerOffset}px`,
          }}
        >
          {workspaceItems && workspaceItems.length > 0 ? (
            <WorkspaceDropdown
              items={workspaceItems}
              onItemClick={onWorkspaceChange ?? (() => {})}
              sidebarOpen={open}
              enabled={showWorkspaceSelector}
            />
          ) : logo ? (
            <FabricFlex align="center" sx={{ px: `${spacing.md}px`, py: "2px" }}>
              {logo}
            </FabricFlex>
          ) : null}
        </FabricStack>

        <FabricStack
          component="nav"
          aria-label="Main"
          sx={{
            flex: 1,
            overflowY: "auto",
            p: `${spacing.xs}px`,
            gap: "2px",
            mt: `${spacing.xs}px`,
          }}
        >
          {items.map((item) => (
            <NavRow
              key={item.key}
              item={item}
              isSelected={selectedKey === item.key}
              sidebarOpen={open}
              linkComponent={linkComponent}
            />
          ))}
        </FabricStack>

        {/* Panel toggle: open shows "Close Menu" with arrow_menu_close; closed shows
            arrow_menu_open in a filled button. */}
        <FabricStack sx={{ mt: "auto", py: `${spacing.xs}px` }}>
          {open ? (
            <FabricIconButton
              onClick={onToggle}
              aria-label="Close menu"
              aria-expanded
              sx={{
                alignSelf: "flex-start",
                // FabricIconButton is a fixed square; this one also has a label.
                width: "auto",
                gap: `${spacing.lg}px`,
                height: 40,
                px: "20px",
                py: `${spacing.sm}px`,
                borderRadius: `${radii.md}px`,
                color: "var(--mui-palette-primary-main)",
                "&:hover": { bgcolor: "transparent", color: appShellColor("hover") },
                "&:active": { color: appShellColor("press") },
              }}
            >
              <ArrowMenuClose sx={{ fontSize: SIDEBAR_ICON_SIZE }} />
              <FabricText
                textVariant="uiMd"
                sx={{ color: appShellColor("text"), whiteSpace: "nowrap", ...ITEM_LABEL_SX }}
              >
                Close Menu
              </FabricText>
            </FabricIconButton>
          ) : (
            <FabricIconButton
              onClick={onToggle}
              aria-label="Open menu"
              aria-expanded={false}
              sx={{
                alignSelf: "center",
                px: `${spacing.md}px`,
                py: `${spacing.sm}px`,
                borderRadius: `${radii.lg}px`,
                bgcolor: appShellColor("toggleBg"),
                color: appShellColor("text"),
                "&:hover": {
                  bgcolor: appShellColor("toggleBgHover"),
                  color: appShellColor("hover"),
                },
                "&:active": {
                  bgcolor: appShellColor("toggleBgPress"),
                  color: appShellColor("press"),
                },
              }}
            >
              <ArrowMenuOpen sx={{ fontSize: SIDEBAR_ICON_SIZE }} />
            </FabricIconButton>
          )}
        </FabricStack>
      </>
    );

    // Temporary drawers render paper in a Portal, so descendant CSS from
    // StyledDrawer never reaches it. Use slotProps.paper.sx instead.
    if (isMobile) {
      return (
        <FabricDrawer
          ref={ref}
          anchor="left"
          variant="temporary"
          open={open}
          onClose={onToggle}
          slotProps={{
            paper: {
              sx: {
                width: SIDEBAR_WIDTH_OPEN,
                backgroundImage: "none",
                backgroundColor: "var(--mui-palette-background-paper)",
                color: "var(--mui-palette-text-primary)",
                borderRight: "1px solid var(--mui-palette-divider)",
              },
            },
          }}
          sx={sx}
        >
          {sidebarContent}
        </FabricDrawer>
      );
    }

    return (
      <StyledDrawer ref={ref} anchor="left" variant="permanent" open={open} sx={sx}>
        {sidebarContent}
      </StyledDrawer>
    );
  },
);
