import { FabricFlex, FabricStack } from "@fabric-kit/primitives";
import { useBreakpoint } from "@fabric-kit/theme";
import React, { useCallback, useRef, useState } from "react";
import { FabricSidebar } from "../FabricSidebar";
import { FabricTopBar } from "../FabricTopBar";
import type { FabricAppShellProps } from "../types";
import { SIDEBAR_WIDTH_COLLAPSED, SIDEBAR_WIDTH_OPEN } from "../types";

/**
 * Full application shell composing `FabricSidebar`, `FabricTopBar`, and a content area.
 *
 * Manages sidebar open/close state internally (uncontrolled) or via
 * `sidebarOpen`/`onSidebarOpenChange` (controlled). On mobile the sidebar
 * collapses to a temporary overlay and the top bar shows a hamburger toggle.
 *
 * @example
 * ```tsx
 * <FabricAppShell
 *   sidebarProps={{ items: navItems, selectedKey: 'home' }}
 *   topBarProps={{ appTitle: 'My App', user }}
 *   bannerSlot={<FabricBanner fixed={false} message="Scheduled maintenance Sunday 02:00 UTC" />}
 * >
 *   <PageContent />
 * </FabricAppShell>
 * ```
 */
export function FabricAppShell({
  sidebarProps,
  topBarProps,
  children,
  bannerSlot,
  footerSlot,
  sidebarOpen: controlledOpen,
  onSidebarOpenChange,
}: FabricAppShellProps) {
  const [internalOpen, setInternalOpen] = useState(true);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const isMobile = useBreakpoint("down", "md");
  const bannerRef = useRef<HTMLDivElement>(null);
  const [bannerHeight, setBannerHeight] = React.useState(0);

  React.useEffect(() => {
    if (!bannerRef.current) {
      setBannerHeight(0);
      return;
    }
    const observer = new ResizeObserver(([entry]) => {
      setBannerHeight(entry.contentRect.height);
    });
    observer.observe(bannerRef.current);
    setBannerHeight(bannerRef.current.offsetHeight);
    return () => observer.disconnect();
  }, []);

  const handleToggle = useCallback(() => {
    const next = !open;
    if (isControlled) {
      onSidebarOpenChange?.(next);
    } else {
      setInternalOpen(next);
    }
  }, [open, isControlled, onSidebarOpenChange]);

  const sidebarWidth = isMobile ? 0 : open ? SIDEBAR_WIDTH_OPEN : SIDEBAR_WIDTH_COLLAPSED;

  return (
    <FabricStack sx={{ minHeight: "100vh" }}>
      {/* Banner slot (e.g. FabricBanner) */}
      {bannerSlot && (
        <FabricFlex
          ref={bannerRef}
          sx={{ flexShrink: 0, zIndex: (theme) => theme.zIndex.drawer + 2 }}
        >
          {bannerSlot}
        </FabricFlex>
      )}

      <FabricStack sx={{ flex: 1 }}>
        {/* Sidebar */}
        <FabricSidebar
          {...sidebarProps}
          open={open}
          onToggle={handleToggle}
          bannerOffset={bannerHeight}
        />

        {/* Main content area */}
        <FabricStack
          component="main"
          sx={{
            flex: 1,
            minWidth: 0,
            ml: isMobile ? 0 : `${sidebarWidth}px`,
            transition: (theme) =>
              theme.transitions.create("margin-left", {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
          }}
        >
          <FabricTopBar {...topBarProps} onSidebarToggle={isMobile ? handleToggle : undefined} />

          <FabricFlex sx={{ flex: 1, overflow: "auto", flexDirection: "column" }}>
            <FabricFlex sx={{ flex: 1, minHeight: 0, flexDirection: "column" }}>
              {children}
            </FabricFlex>
            {footerSlot}
          </FabricFlex>
        </FabricStack>
      </FabricStack>
    </FabricStack>
  );
}
