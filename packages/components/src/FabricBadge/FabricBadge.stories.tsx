import ChatIcon from "@fabric-kit/icons/Chat";
import MailIcon from "@fabric-kit/icons/Mail";
import NotificationsIcon from "@fabric-kit/icons/Notifications";
import { Box, IconButton, Stack } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { expect, within } from "storybook/test";
import { FabricAvatar } from "../FabricAvatar";
import { FabricBadge, type FabricBadgeProps } from ".";

const meta: Meta<FabricBadgeProps> = {
  title: "Components/FabricBadge",
  component: FabricBadge,
  tags: ["test"],
  argTypes: {
    variant: { control: "select", options: ["standard", "dot"] },
    color: {
      control: "select",
      options: ["default", "primary", "secondary", "error", "info", "success", "warning"],
    },
    overlap: { control: "select", options: ["rectangular", "circular"] },
    max: { control: "number" },
    showZero: { control: "boolean" },
    invisible: { control: "boolean" },
  },
  args: {
    badgeContent: 4,
    color: "primary",
    variant: "standard",
  },
  parameters: {
    docs: {
      description: {
        component:
          'Badge / notification indicator — thin wrapper over MUI Badge. `badgeContent` accepts any ReactNode.',
      },
    },
  },
};
export default meta;
type Story = StoryObj<FabricBadgeProps>;

export const Default: Story = {
  render: (args) => (
    <FabricBadge {...args}>
      <MailIcon color="action" />
    </FabricBadge>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Default meta args set `badgeContent: 4` — the count is rendered verbatim.
    await expect(canvas.getByText("4")).toBeInTheDocument();
  },
};

export const Colors: Story = {
  render: () => (
    <Stack direction="row" spacing={4}>
      <FabricBadge badgeContent={4} color="default">
        <MailIcon color="action" />
      </FabricBadge>
      <FabricBadge badgeContent={4} color="primary">
        <MailIcon color="action" />
      </FabricBadge>
      <FabricBadge badgeContent={4} color="secondary">
        <MailIcon color="action" />
      </FabricBadge>
      <FabricBadge badgeContent={4} color="error">
        <MailIcon color="action" />
      </FabricBadge>
      <FabricBadge badgeContent={4} color="info">
        <MailIcon color="action" />
      </FabricBadge>
      <FabricBadge badgeContent={4} color="success">
        <MailIcon color="action" />
      </FabricBadge>
      <FabricBadge badgeContent={4} color="warning">
        <MailIcon color="action" />
      </FabricBadge>
    </Stack>
  ),
};

export const DotVariant: Story = {
  name: "Dot variant",
  render: () => (
    <Stack direction="row" spacing={4}>
      <FabricBadge variant="dot" color="error">
        <NotificationsIcon color="action" />
      </FabricBadge>
      <FabricBadge variant="dot" color="success">
        <ChatIcon color="action" />
      </FabricBadge>
      <FabricBadge variant="dot" color="primary" invisible={false}>
        <MailIcon color="action" />
      </FabricBadge>
    </Stack>
  ),
};

export const MaxCount: Story = {
  name: "Max cap (99+)",
  render: () => (
    <Stack direction="row" spacing={4}>
      <FabricBadge badgeContent={99} color="primary">
        <MailIcon color="action" />
      </FabricBadge>
      <FabricBadge badgeContent={1000} max={99} color="primary">
        <MailIcon color="action" />
      </FabricBadge>
      <FabricBadge badgeContent={999999} max={999} color="primary">
        <MailIcon color="action" />
      </FabricBadge>
    </Stack>
  ),
};

export const ShowZero: Story = {
  name: "Show zero",
  render: () => (
    <Stack direction="row" spacing={4}>
      <FabricBadge badgeContent={0} color="primary">
        <MailIcon color="action" />
      </FabricBadge>
      <FabricBadge badgeContent={0} color="primary" showZero>
        <MailIcon color="action" />
      </FabricBadge>
    </Stack>
  ),
};

export const Invisible: Story = {
  name: "Invisible (toggle)",
  render: () => {
    const [hidden, setHidden] = React.useState(false);
    return (
      <Stack direction="row" spacing={4} sx={{ alignItems: "center" }}>
        <FabricBadge badgeContent={4} color="primary" invisible={hidden}>
          <MailIcon color="action" />
        </FabricBadge>
        <button onClick={() => setHidden((h) => !h)}>{hidden ? "Show" : "Hide"} badge</button>
      </Stack>
    );
  },
};

export const AnchorOrigin: Story = {
  name: "Anchor origins",
  render: () => (
    <Stack direction="row" spacing={4}>
      <FabricBadge
        badgeContent={4}
        color="primary"
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Box sx={{ width: 40, height: 40, bgcolor: "action.selected", borderRadius: 1 }} />
      </FabricBadge>
      <FabricBadge
        badgeContent={4}
        color="primary"
        anchorOrigin={{ vertical: "top", horizontal: "left" }}
      >
        <Box sx={{ width: 40, height: 40, bgcolor: "action.selected", borderRadius: 1 }} />
      </FabricBadge>
      <FabricBadge
        badgeContent={4}
        color="primary"
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Box sx={{ width: 40, height: 40, bgcolor: "action.selected", borderRadius: 1 }} />
      </FabricBadge>
      <FabricBadge
        badgeContent={4}
        color="primary"
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Box sx={{ width: 40, height: 40, bgcolor: "action.selected", borderRadius: 1 }} />
      </FabricBadge>
    </Stack>
  ),
};

export const CircularOverlap: Story = {
  name: "Circular overlap (avatars)",
  render: () => (
    <Stack direction="row" spacing={4}>
      <FabricBadge
        overlap="circular"
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        variant="dot"
        color="success"
      >
        <FabricAvatar name="Alice Smith" />
      </FabricBadge>
      <FabricBadge
        overlap="circular"
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        badgeContent={3}
        color="error"
      >
        <FabricAvatar name="Bob Johnson" />
      </FabricBadge>
    </Stack>
  ),
};

export const OnIconButton: Story = {
  name: "Wrapping an IconButton",
  render: () => (
    <IconButton aria-label="4 new mails" color="inherit">
      <FabricBadge badgeContent={4} color="error">
        <MailIcon />
      </FabricBadge>
    </IconButton>
  ),
};

export const RichContent: Story = {
  name: "Rich badge content",
  render: () => (
    <Stack direction="row" spacing={4}>
      <FabricBadge badgeContent="NEW" color="primary">
        <Box sx={{ width: 60, height: 40, bgcolor: "action.selected", borderRadius: 1 }} />
      </FabricBadge>
      <FabricBadge badgeContent="!" color="error">
        <Box sx={{ width: 60, height: 40, bgcolor: "action.selected", borderRadius: 1 }} />
      </FabricBadge>
    </Stack>
  ),
};
