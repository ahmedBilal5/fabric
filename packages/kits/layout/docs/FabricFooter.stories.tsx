import Dashboard from "@fabric-kit/icons/Dashboard";
import Inventory2 from "@fabric-kit/icons/Inventory2";
import Settings from "@fabric-kit/icons/Settings";
import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Box, Typography } from "@mui/material";
import { FabricFooter } from "../src/FabricFooter";
import { FabricAppShell } from "../src/FabricAppShell";
import type { NavigationItem, UserInfo } from "../src/types";

const meta = {
  title: "Kits/Layout/FabricFooter",
  component: FabricFooter,
  parameters: {
    docs: {
      description: {
        component:
          "Enterprise footer providing responsive layout, theme-adaptive styling, " +
          "corporate policy links, copyright notices, and an optional logo slot. " +
          "Can be used standalone or passed into FabricAppShell.footerSlot.",
      },
    },
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <Box sx={{ bgcolor: "background.default", minHeight: 180, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof FabricFooter>;

export default meta;
type Story = StoryObj<typeof FabricFooter>;

/* ------------------------------------------------------------------ */

export const Default: Story = {
  args: {
    companyName: "Acme Inc.",
  },
};

export const WithCustomLinks: Story = {
  args: {
    companyName: "Acme Inc.",
    links: [
      { label: "Documentation", href: "#" },
      { label: "Support & Help", href: "#" },
      { label: "Privacy Policy", href: "https://example.com/privacy", target: "_blank" },
      { label: "Terms of Service", href: "https://example.com/terms", target: "_blank" },
    ],
  },
};

export const WithLogoSlot: Story = {
  args: {
    companyName: "Acme Inc.",
    logoSlot: (
      <Typography
        variant="caption"
        sx={{
          fontWeight: 700,
          letterSpacing: 1.5,
          color: "primary.main",
          px: 1.5,
          py: 0.5,
          borderRadius: 1,
          border: "1px solid",
          borderColor: "primary.main",
        }}
      >
        ACME
      </Typography>
    ),
  },
};

const sampleUser: UserInfo = {
  firstName: "Jane",
  lastName: "Doe",
  email: "jane.doe@example.com",
};

const sampleNavItems: NavigationItem[] = [
  { key: "home", label: "Dashboard", icon: <Dashboard /> },
  { key: "catalog", label: "Product catalog", icon: <Inventory2 /> },
  { key: "settings", label: "Settings", icon: <Settings /> },
];

export const InsideAppShell: Story = {
  render: () => (
    <Box sx={{ height: "100vh", width: "100%" }}>
      <FabricAppShell
        sidebarProps={{
          open: true,
          onToggle: () => {},
          items: sampleNavItems,
          selectedKey: "home",
        }}
        topBarProps={{
          appTitle: "Acme Console",
          user: sampleUser,
        }}
        footerSlot={
          <FabricFooter
            companyName="Acme Inc."
            logoSlot={
              <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary" }}>
                ACME
              </Typography>
            }
          />
        }
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Main Dashboard Content
          </Typography>
          <Typography variant="body1" color="text.secondary">
            The footer is placed inside FabricAppShell at the bottom of the scrollable content area.
          </Typography>
        </Box>
      </FabricAppShell>
    </Box>
  ),
};
