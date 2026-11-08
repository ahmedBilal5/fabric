import BarChartIcon from "@fabric-kit/icons/BarChart";
import HomeIcon from "@fabric-kit/icons/Home";
import PeopleIcon from "@fabric-kit/icons/People";
import SettingsIcon from "@fabric-kit/icons/Settings";
import StorageIcon from "@fabric-kit/icons/Storage";
import { Box, Typography } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import Apps from "@fabric-kit/icons/Apps";
import Person from "@fabric-kit/icons/Person";
import Settings from "@fabric-kit/icons/Settings";
import SettingsInputAntenna from "@fabric-kit/icons/SettingsInputAntenna";
import Timer from "@fabric-kit/icons/Timer";
import Hub from "@fabric-kit/icons/Hub";
import { useState } from "react";
import { FabricSidebar } from "../src/FabricSidebar";
import type { NavigationItem, WorkspaceItem } from "../src/types";
import { appShortcuts } from "./appShortcuts";

const sampleNavItems: NavigationItem[] = [
  { key: "home", label: "Home", icon: <HomeIcon /> },
  { key: "analytics", label: "Analytics", icon: <BarChartIcon /> },
  { key: "users", label: "Users", icon: <PeopleIcon /> },
  { key: "data", label: "Data Sources", icon: <StorageIcon /> },
  { key: "settings", label: "Settings", icon: <SettingsIcon /> },
];

const meta = {
  title: "Kits/Layout/FabricSidebar",
  component: FabricSidebar,
  parameters: {
    docs: {
      description: {
        component:
          "Responsive navigation sidebar. Renders as a permanent drawer on desktop " +
          "(≥ md) with expand/collapse toggle, and a temporary overlay drawer on mobile " +
          "(< md). Supports workspace selection, custom logo, and `linkComponent` for " +
          "router integration.",
      },
    },
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <Box sx={{ display: "flex", height: "100vh", bgcolor: "background.default" }}>
        <Story />
        <Box sx={{ flex: 1, p: 4 }}>
          <Typography variant="body2" color="text.secondary">
            Main content area
          </Typography>
        </Box>
      </Box>
    ),
  ],
} satisfies Meta<typeof FabricSidebar>;

export default meta;
type Story = StoryObj<typeof FabricSidebar>;

/* ------------------------------------------------------------------ */

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    const [selected, setSelected] = useState("home");

    const items = sampleNavItems.map((item) => ({
      ...item,
      onClick: () => setSelected(item.key),
    }));

    return (
      <FabricSidebar
        open={open}
        onToggle={() => setOpen((prev) => !prev)}
        items={items}
        selectedKey={selected}
      />
    );
  },
};

// Admin navigation: the organization workspace on top; the dropdown lists the same entries as the
// top-bar app switcher.
const orgWorkspaces: WorkspaceItem[] = [
  { id: "acme", name: "Acme Inc.", icon: <Hub sx={{ fontSize: 36 }} /> },
  ...appShortcuts.map(({ id, label, icon, divideAfter }) => ({
    id,
    name: label,
    icon,
    divideAfter,
  })),
];

const adminNavItems: NavigationItem[] = [
  { key: "members", label: "Members", icon: <Person /> },
  { key: "iam", label: "IAM System", icon: <SettingsInputAntenna /> },
  { key: "applications", label: "Applications", icon: <Apps /> },
  { key: "activity", label: "Activity Timeline", icon: <Timer /> },
  { key: "settings", label: "Settings", icon: <Settings /> },
];

export const WithWorkspaceSelector: Story = {
  name: "With workspace selector",
  render: () => {
    const [open, setOpen] = useState(true);
    const [selected, setSelected] = useState("members");
    const [workspaces, setWorkspaces] = useState(orgWorkspaces);

    const items = adminNavItems.map((item) => ({
      ...item,
      onClick: () => setSelected(item.key),
    }));

    return (
      <FabricSidebar
        open={open}
        onToggle={() => setOpen((prev) => !prev)}
        items={items}
        selectedKey={selected}
        workspaceItems={workspaces}
        showWorkspaceSelector
        onWorkspaceChange={(id) => {
          const idx = workspaces.findIndex((w) => w.id === id);
          if (idx > 0) {
            const next = [...workspaces];
            const [moved] = next.splice(idx, 1);
            next.unshift(moved);
            setWorkspaces(next);
          }
        }}
      />
    );
  },
};

export const Collapsed: Story = {
  name: "Collapsed state",
  render: () => {
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState("home");

    const items = sampleNavItems.map((item) => ({
      ...item,
      onClick: () => setSelected(item.key),
    }));

    return (
      <FabricSidebar
        open={open}
        onToggle={() => setOpen((prev) => !prev)}
        items={items}
        selectedKey={selected}
      />
    );
  },
};
