import CloseIcon from "@fabric-kit/icons/Close";
import { Box, IconButton, List, ListItem, ListItemText, Typography } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, screen, userEvent, within } from "storybook/test";
import { FabricButton } from "../FabricButton";
import { FabricDrawer, type FabricDrawerProps } from ".";

const meta: Meta<FabricDrawerProps> = {
  title: "Components/FabricDrawer",
  component: FabricDrawer,
  tags: ["test"],
  parameters: {
    docs: {
      description: {
        component:
          'Drawer panel — extends MUI Drawer. Defaults anchor to "right".',
      },
    },
  },
};
export default meta;
type Story = StoryObj<FabricDrawerProps>;

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <FabricButton onClick={() => setOpen(true)}>Open Drawer</FabricButton>
        <FabricDrawer open={open} onClose={() => setOpen(false)}>
          <Box sx={{ width: 300, p: 2 }}>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}
            >
              <Typography variant="h6">Settings</Typography>
              <IconButton onClick={() => setOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
            <List>
              <ListItem>
                <ListItemText primary="General" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Security" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Notifications" />
              </ListItem>
            </List>
          </Box>
        </FabricDrawer>
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /open drawer/i }));
    // Drawer content renders in a Portal.
    await expect(await screen.findByText("Settings")).toBeInTheDocument();
  },
};

export const BottomAnchor: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <FabricButton onClick={() => setOpen(true)}>Open Bottom Drawer</FabricButton>
        <FabricDrawer anchor="bottom" open={open} onClose={() => setOpen(false)}>
          <Box sx={{ p: 2, minHeight: 200 }}>
            <Typography variant="h6" gutterBottom>
              Preview
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Bottom drawers are used for previews and query builders.
            </Typography>
          </Box>
        </FabricDrawer>
      </>
    );
  },
};

export const NonModalPanel: Story = {
  name: "Non-modal panel",
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <Box sx={{ display: "flex", height: 300, position: "relative" }}>
        <Box sx={{ flex: 1, p: 2 }}>
          <Typography variant="body1" gutterBottom>
            Main content area — the drawer does not block interaction here.
          </Typography>
          <FabricButton onClick={() => setOpen((o) => !o)}>
            {open ? "Close" : "Open"} Panel
          </FabricButton>
        </Box>
        <FabricDrawer
          open={open}
          onClose={() => setOpen(false)}
          variant="persistent"
          anchor="right"
          slotProps={{ paper: { sx: { position: "relative", width: 300 } } }}
        >
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Filter Panel
            </Typography>
            <Typography variant="body2">Filters go here.</Typography>
          </Box>
        </FabricDrawer>
      </Box>
    );
  },
};

export const CustomWidth: Story = {
  name: "Custom width via PaperProps",
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <FabricButton onClick={() => setOpen(true)}>Open Wide Drawer</FabricButton>
        <FabricDrawer
          open={open}
          onClose={() => setOpen(false)}
          slotProps={{ paper: { sx: { width: 500, p: 0 } } }}
        >
          <Box sx={{ p: 2 }}>
            <Typography variant="h6">Wide drawer (500px)</Typography>
          </Box>
        </FabricDrawer>
      </>
    );
  },
};
