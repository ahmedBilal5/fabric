import Analytics from "@fabric-kit/icons/Analytics";
import CalendarMonth from "@fabric-kit/icons/CalendarMonth";
import Chat from "@fabric-kit/icons/Chat";
import Description from "@fabric-kit/icons/Description";
import Group from "@fabric-kit/icons/Group";
import Home from "@fabric-kit/icons/Home";
import Inventory2 from "@fabric-kit/icons/Inventory2";
import Settings from "@fabric-kit/icons/Settings";
import type { AppSwitcherItem } from "../src/types";

/**
 * Sample app-switcher entries shared by the layout stories. Real apps pass
 * their own list, usually with product logos as icons.
 */

// Icons fill the menu's 32px slot and use the main text color, so they read in both modes.
const ICON = { sx: { fontSize: 32 }, htmlColor: "var(--mui-palette-text-primary)" } as const;

const noop = () => {};

export const appShortcuts: AppSwitcherItem[] = [
  { id: "home", label: "Home", icon: <Home {...ICON} />, onClick: noop, divideAfter: true },
  { id: "analytics", label: "Analytics", icon: <Analytics {...ICON} />, onClick: noop },
  { id: "inventory", label: "Inventory", icon: <Inventory2 {...ICON} />, onClick: noop },
  { id: "people", label: "People", icon: <Group {...ICON} />, onClick: noop },
  { id: "calendar", label: "Calendar", icon: <CalendarMonth {...ICON} />, onClick: noop },
  { id: "docs", label: "Docs", icon: <Description {...ICON} />, onClick: noop },
  { id: "chat", label: "Chat", icon: <Chat {...ICON} />, onClick: noop, divideAfter: true },
  { id: "settings", label: "Settings", icon: <Settings {...ICON} />, onClick: noop },
];
