import ArchiveIcon from "@fabric-kit/icons/Archive";
import ContentCopyIcon from "@fabric-kit/icons/ContentCopy";
import DeleteIcon from "@fabric-kit/icons/Delete";
import DescriptionOutlinedIcon from "@fabric-kit/icons/DescriptionOutlined";
import EditIcon from "@fabric-kit/icons/Edit";
import HomeOutlinedIcon from "@fabric-kit/icons/HomeOutlined";
import HubOutlinedIcon from "@fabric-kit/icons/HubOutlined";
import SecurityOutlinedIcon from "@fabric-kit/icons/SecurityOutlined";
import SwapHorizIcon from "@fabric-kit/icons/SwapHoriz";
import ViewInArOutlinedIcon from "@fabric-kit/icons/ViewInArOutlined";
import { Box, Button, Divider, MenuItem } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { expect, screen, userEvent, within } from "storybook/test";
import { FabricMenu, type FabricMenuItem } from ".";

const meta = {
  title: "Components/FabricMenu",
  component: FabricMenu,
  tags: ["test"],
  parameters: {
    docs: {
      description: {
        component:
          "Design-system menu primitive. Thin wrapper around MUI `Menu` with Fabric's paper " +
          "(radius, shadow, min-width) and list-item defaults baked in via MUI 9 `slotProps.paper` " +
          "/ `slotProps.list`. Consumers pass their own `slotProps` and their `sx` keys win on the " +
          "paper / list slots. Adds an optional declarative `items` API for the common " +
          '"click MenuItem → fire handler" pattern (label + icon + optional `divideAfter`). ' +
          "When `items` is provided, `children` is ignored. Consumer owns the trigger and manages " +
          "`anchorEl` themselves — use `FabricMenuButton` if you want a trigger + menu compound.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

const useAnchor = () => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  return {
    anchorEl,
    open,
    onClose: () => setAnchorEl(null),
    onOpen: (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget),
  };
};

// ─── Basics ─────────────────────────────────────────────────────────────────

export const WithChildren: Story = {
  name: "Children — consumer-authored items",
  render: () => {
    const { anchorEl, open, onClose, onOpen } = useAnchor();
    return (
      <Box>
        <Button variant="outlined" onClick={onOpen}>
          Open menu
        </Button>
        <FabricMenu anchorEl={anchorEl} open={open} onClose={onClose}>
          <MenuItem onClick={onClose}>Profile</MenuItem>
          <MenuItem onClick={onClose}>Settings</MenuItem>
          <MenuItem onClick={onClose}>Sign out</MenuItem>
        </FabricMenu>
      </Box>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /open menu/i }));
    // Menu is portaled — use screen.
    await expect(await screen.findByRole("menuitem", { name: /profile/i })).toBeInTheDocument();
  },
};

export const WithItems: Story = {
  name: "Items — declarative array",
  render: () => {
    const { anchorEl, open, onClose, onOpen } = useAnchor();
    const items: FabricMenuItem[] = [
      { label: "Edit", icon: <EditIcon fontSize="small" />, onClick: onClose, testId: "menu-edit" },
      {
        label: "Duplicate",
        icon: <ContentCopyIcon fontSize="small" />,
        onClick: onClose,
        testId: "menu-dup",
      },
      {
        label: "Archive",
        icon: <ArchiveIcon fontSize="small" />,
        onClick: onClose,
        testId: "menu-arch",
        divideAfter: true,
      },
      {
        label: "Delete",
        icon: <DeleteIcon fontSize="small" />,
        onClick: onClose,
        testId: "menu-del",
      },
    ];
    return (
      <Box>
        <Button variant="outlined" onClick={onOpen}>
          Open menu
        </Button>
        <FabricMenu anchorEl={anchorEl} open={open} onClose={onClose} items={items} />
      </Box>
    );
  },
};

// ─── App shortcuts ────────────────────────────────────────────────

const appIcon = { sx: { fontSize: 32 } };

export const AppShortcuts: Story = {
  name: "App shortcuts",
  parameters: {
    docs: {
      description: {
        story:
          "An app-shortcuts menu: 232px wide, 8px radius, 32px icon slot, " +
          "SemiBold 14/20 capitalized labels, and 1px separators (`divideAfter`) between groups.",
      },
    },
  },
  render: () => {
    const { anchorEl, open, onClose, onOpen } = useAnchor();
    const items: FabricMenuItem[] = [
      {
        label: "Home",
        icon: <HomeOutlinedIcon {...appIcon} />,
        onClick: onClose,
        divideAfter: true,
      },
      { label: "Access Studio", icon: <SecurityOutlinedIcon {...appIcon} />, onClick: onClose },
      { label: "Content Studio", icon: <ViewInArOutlinedIcon {...appIcon} />, onClick: onClose },
      { label: "Data Studio", icon: <HubOutlinedIcon {...appIcon} />, onClick: onClose },
      { label: "Workflow", icon: <SwapHorizIcon {...appIcon} />, onClick: onClose },
      {
        label: "Simple docs",
        icon: <DescriptionOutlinedIcon {...appIcon} />,
        onClick: onClose,
        divideAfter: true,
      },
      { label: "Cisco", icon: <HubOutlinedIcon {...appIcon} />, onClick: onClose },
      { label: "NetApp", icon: <ArchiveIcon {...appIcon} />, onClick: onClose },
    ];
    return (
      <Box>
        <Button variant="outlined" onClick={onOpen}>
          Open app shortcuts
        </Button>
        <FabricMenu
          anchorEl={anchorEl}
          open={open}
          onClose={onClose}
          items={items}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
        />
      </Box>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /open app shortcuts/i }));
    await expect(await screen.findByRole("menuitem", { name: /home/i })).toBeInTheDocument();
    await expect(screen.getAllByRole("separator")).toHaveLength(2);
  },
};

export const ActiveAndDisabled: Story = {
  name: "Active and disabled items",
  parameters: {
    docs: {
      description: {
        story:
          "`selected` renders the active state. Hover and press are driven by CSS " +
          "(`:hover`, `:active`); disabled items keep MUI's reduced opacity.",
      },
    },
  },
  render: () => {
    const { anchorEl, open, onClose, onOpen } = useAnchor();
    const items: FabricMenuItem[] = [
      { label: "Default", icon: <EditIcon {...appIcon} />, onClick: onClose },
      { label: "Active", icon: <EditIcon {...appIcon} />, onClick: onClose, selected: true },
      { label: "Disabled", icon: <EditIcon {...appIcon} />, onClick: onClose, disabled: true },
    ];
    return (
      <Box>
        <Button variant="outlined" onClick={onOpen}>
          Open states
        </Button>
        <FabricMenu anchorEl={anchorEl} open={open} onClose={onClose} items={items} />
      </Box>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /open states/i }));
    await expect(await screen.findByRole("menuitem", { name: /active/i })).toHaveClass(
      "Mui-selected",
    );
  },
};

// ─── Placement / anchor ─────────────────────────────────────────────────────

export const CustomAnchorOrigin: Story = {
  name: "Custom anchor/transform origin",
  render: () => {
    const { anchorEl, open, onClose, onOpen } = useAnchor();
    return (
      <Box sx={{ p: 6 }}>
        <Button variant="outlined" onClick={onOpen}>
          Open menu (opens to the right of button)
        </Button>
        <FabricMenu
          anchorEl={anchorEl}
          open={open}
          onClose={onClose}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "left" }}
        >
          <MenuItem onClick={onClose}>Item 1</MenuItem>
          <MenuItem onClick={onClose}>Item 2</MenuItem>
        </FabricMenu>
      </Box>
    );
  },
};

// ─── Consumer overrides ─────────────────────────────────────────────────────

export const ConsumerPaperOverride: Story = {
  name: "Consumer overrides paper sx",
  parameters: {
    docs: {
      description: {
        story:
          "Consumers pass their own `slotProps.paper.sx` — their keys win over the DS defaults " +
          "(here, a wider min-width and a colored border).",
      },
    },
  },
  render: () => {
    const { anchorEl, open, onClose, onOpen } = useAnchor();
    return (
      <Box>
        <Button variant="outlined" onClick={onOpen}>
          Wide menu
        </Button>
        <FabricMenu
          anchorEl={anchorEl}
          open={open}
          onClose={onClose}
          slotProps={{ paper: { sx: { minWidth: 320, border: "1px solid var(--mui-palette-primary-main)" } } }}
        >
          <MenuItem onClick={onClose}>Wider layout</MenuItem>
          <MenuItem onClick={onClose}>Colored border</MenuItem>
        </FabricMenu>
      </Box>
    );
  },
};

// ─── Kitchen sink ───────────────────────────────────────────────────────────

export const KitchenSink: Story = {
  name: "Kitchen sink",
  render: () => {
    const { anchorEl, open, onClose, onOpen } = useAnchor();
    const items: FabricMenuItem[] = [
      { label: "Edit", icon: <EditIcon fontSize="small" />, onClick: onClose },
      {
        label: "Duplicate",
        icon: <ContentCopyIcon fontSize="small" />,
        onClick: onClose,
        divideAfter: true,
      },
      {
        label: "Archive",
        icon: <ArchiveIcon fontSize="small" />,
        onClick: onClose,
        disabled: true,
      },
      { label: "Delete", icon: <DeleteIcon fontSize="small" />, onClick: onClose },
    ];
    return (
      <Box>
        <Button variant="outlined" onClick={onOpen}>
          Full example
        </Button>
        <FabricMenu anchorEl={anchorEl} open={open} onClose={onClose} items={items} />
        <Divider sx={{ my: 2 }} />
      </Box>
    );
  },
};
