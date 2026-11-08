import HelpOutline from "@fabric-kit/icons/HelpOutlined";
import ShoppingCartOutlined from "@fabric-kit/icons/ShoppingCartOutlined";
import SearchIcon from "@fabric-kit/icons/Search";
import { Box, InputAdornment, TextField } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { FabricTopBar } from "../src/FabricTopBar";
import type { AppSwitcherItem, UserInfo } from "../src/types";
import { appShortcuts } from "./appShortcuts";

const sampleUser: UserInfo = {
  firstName: "Jane",
  lastName: "Doe",
  email: "jane.doe@example.com",
};

const sampleApps: AppSwitcherItem[] = appShortcuts;

const meta = {
  title: "Kits/Layout/FabricTopBar",
  component: FabricTopBar,
  parameters: {
    docs: {
      description: {
        component:
          "Application top bar with title, optional search slot, notification badge, " +
          "app switcher, user menu, and optional sandbox/cart/help actions. On mobile " +
          "(< md) a hamburger icon replaces the search bar.",
      },
    },
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <Box sx={{ bgcolor: "background.default", minHeight: 200 }}>
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof FabricTopBar>;

export default meta;
type Story = StoryObj<typeof FabricTopBar>;

/* ------------------------------------------------------------------ */

export const Default: Story = {
  args: {
    appTitle: "Acme Console",
    user: sampleUser,
    notificationCount: 3,
    appSwitcherItems: sampleApps,
    actions: [{ id: "help", label: "Help", icon: <HelpOutline />, onClick: () => {} }],
    onNotificationClick: () => {},
    onUserMenuAction: (action: string) => console.log("User action:", action),
  },
};

export const WithSearch: Story = {
  name: "With search slot",
  args: {
    appTitle: "Administration",
    user: sampleUser,
    notificationCount: 0,
    appSwitcherItems: sampleApps,
    renderSearch: () => (
      <TextField
        placeholder="Search..."
        size="small"
        fullWidth
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          },
        }}
      />
    ),
    onNotificationClick: () => {},
    onUserMenuAction: (action: string) => console.log("User action:", action),
  },
};

/** Use `actions` for app-specific icon buttons such as help or a cart. */
export const WithCustomActions: Story = {
  name: "Custom actions",
  args: {
    appTitle: "Storefront",
    user: sampleUser,
    notificationCount: 1,
    onNotificationClick: () => {},
    appSwitcherItems: sampleApps,
    actions: [
      { id: "help", label: "Help", icon: <HelpOutline />, onClick: () => {} },
      { id: "cart", label: "Cart", icon: <ShoppingCartOutlined />, badge: 5, onClick: () => {} },
    ],
    onUserMenuAction: (action: string) => console.log("User action:", action),
  },
};

export const MobileHamburger: Story = {
  name: "Mobile with hamburger",
  parameters: {
    viewport: { defaultViewport: "fabricMobile" },
  },
  args: {
    appTitle: "Acme Console",
    user: sampleUser,
    notificationCount: 2,
    onNotificationClick: () => {},
    onSidebarToggle: () => console.log("Sidebar toggle"),
    onUserMenuAction: (action: string) => console.log("User action:", action),
  },
};

export const WithThemeToggle: Story = {
  name: 'With theme toggle',
  args: {
    appTitle: 'Acme Console',
    user: sampleUser,
    actions: [{ id: "help", label: "Help", icon: <HelpOutline />, onClick: () => {} }],
    showThemeToggle: true,
    notificationCount: 1,
    appSwitcherItems: sampleApps,
    onNotificationClick: () => {},
    onUserMenuAction: (action: string) => console.log('User action:', action),
  },
};
