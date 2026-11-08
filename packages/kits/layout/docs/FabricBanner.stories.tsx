import HomeIcon from "@fabric-kit/icons/Home";
import StorageIcon from "@fabric-kit/icons/Storage";
import { FabricStack, FabricText } from "@fabric-kit/primitives";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { fn } from "storybook/test";
import { FabricAppShell } from "../src/FabricAppShell";
import { FabricBanner } from "../src/FabricBanner";
import type { NavigationItem } from "../src/types";

const meta = {
  title: "Kits/Layout/FabricBanner",
  component: FabricBanner,
  parameters: {
    docs: {
      description: {
        component:
          "A full-width bar for app-wide messages: maintenance, trial expiry, read-only mode, " +
          "or viewing the app as another user. Use it standalone (`fixed`, the default) or " +
          "inside `FabricAppShell`'s `bannerSlot` with `fixed={false}`.",
      },
    },
    layout: "fullscreen",
  },
  args: {
    fixed: false,
    message: "Scheduled maintenance on Sunday from 02:00 to 03:00 UTC.",
  },
} satisfies Meta<typeof FabricBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** One banner per severity. Each sets its color and default icon. */
export const Severities: Story = {
  render: (args) => (
    <FabricStack gap="sm">
      <FabricBanner {...args} severity="info" message="A new version is available." />
      <FabricBanner {...args} severity="success" message="Your workspace settings were saved." />
      <FabricBanner {...args} severity="warning" message="Your trial ends in 3 days." />
      <FabricBanner {...args} severity="error" message="We can't reach the server. Retrying." />
    </FabricStack>
  ),
};

export const WithAction: Story = {
  args: {
    severity: "warning",
    message: "You are viewing the app as Jane Cooper (jane.cooper@example.com).",
    action: { label: "Exit", onClick: fn() },
  },
};

/** Set `action.loading` while the action runs. The button shows a spinner and is disabled. */
export const ActionLoading: Story = {
  args: {
    severity: "warning",
    message: "You are viewing the app as Jane Cooper (jane.cooper@example.com).",
    action: { label: "Exit", onClick: fn(), loading: true },
  },
};

/** Long messages truncate to a single line. */
export const LongMessage: Story = {
  args: {
    message:
      "Billing is moving to a new provider on the 1st. Update your payment method before then to avoid any interruption to your team's workspace, integrations and scheduled reports.",
    action: { label: "Update", onClick: fn() },
  },
};

export const InsideAppShell: Story = {
  name: "Inside FabricAppShell",
  render: () => {
    const [selected, setSelected] = useState("home");
    const [visible, setVisible] = useState(true);

    const navItems: NavigationItem[] = [
      { key: "home", label: "Home", icon: <HomeIcon />, onClick: () => setSelected("home") },
      {
        key: "data",
        label: "Data sources",
        icon: <StorageIcon />,
        onClick: () => setSelected("data"),
      },
    ];

    return (
      <FabricAppShell
        sidebarProps={{ open: true, onToggle: () => {}, items: navItems, selectedKey: selected }}
        topBarProps={{
          appTitle: "Acme Console",
          user: { firstName: "Jane", lastName: "Cooper", email: "jane.cooper@example.com" },
          onNotificationClick: () => {},
        }}
        bannerSlot={
          visible ? (
            <FabricBanner
              fixed={false}
              severity="warning"
              message="You are viewing the app as Jane Cooper (jane.cooper@example.com)."
              action={{ label: "Exit", onClick: () => setVisible(false) }}
              sx={{ width: "100%" }}
            />
          ) : undefined
        }
      >
        <FabricText textVariant="bodyMd" sx={{ p: 4 }}>
          The banner sits above the shell and pushes the sidebar and content down. Click Exit to
          dismiss it.
        </FabricText>
      </FabricAppShell>
    );
  },
};
