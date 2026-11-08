import ScheduleIcon from "@fabric-kit/icons/Schedule";
import SecurityIcon from "@fabric-kit/icons/Security";
import SettingsIcon from "@fabric-kit/icons/Settings";
import StorageIcon from "@fabric-kit/icons/Storage";
import TuneIcon from "@fabric-kit/icons/Tune";
import { Box } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { radii } from "@fabric-kit/design-tokens";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";

import { FabricListItemSimple } from ".";

const meta = {
  title: "Components/FabricListItemSimple",
  component: FabricListItemSimple,
  tags: [],
  parameters: {
    docs: {
      description: {
        component:
          "Selectable settings-sidebar list built on MUI `ListItemButton`, so it works with the " +
          "keyboard. Selection changes only on click, and there's no divider after the last item.",
      },
    },
  },
} satisfies Meta<typeof FabricListItemSimple>;

export default meta;
type Story = StoryObj;

const settingsItems = [
  { id: "general", label: "General", icon: <SettingsIcon fontSize="small" /> },
  { id: "permissions", label: "Permissions", icon: <SecurityIcon fontSize="small" /> },
  { id: "schedule", label: "Schedule", icon: <ScheduleIcon fontSize="small" /> },
  { id: "data", label: "Data Sources", icon: <StorageIcon fontSize="small" /> },
  { id: "advanced", label: "Advanced", icon: <TuneIcon fontSize="small" /> },
];

// -- Basics --

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState("general");
    return (
      <Box sx={{ width: 260 }}>
        <FabricListItemSimple
          items={settingsItems}
          value={value}
          onChange={setValue}
          aria-label="Settings sections"
        />
      </Box>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // All settings labels render; clicking a non-default item works.
    await expect(canvas.getByText("General")).toBeInTheDocument();
    await expect(canvas.getByText("Permissions")).toBeInTheDocument();
    await userEvent.click(canvas.getByText("Permissions"));
  },
};

/**
 * A settings list with no lines between options and 4px rounded hover / selected
 * rows, both set through `sx`.
 */
export const SettingsList: Story = {
  name: "Settings list",
  render: () => {
    const [value, setValue] = useState("schedule");
    return (
      <Box sx={{ width: 260 }}>
        <FabricListItemSimple
          items={settingsItems}
          value={value}
          onChange={setValue}
          aria-label="Settings sections"
          sx={{
            "& .MuiDivider-root": { display: "none" },
            "& .MuiListItemButton-root": { borderRadius: `${radii.md}px` },
          }}
        />
      </Box>
    );
  },
};

export const NoIcons: Story = {
  render: () => {
    const [value, setValue] = useState("rules");
    return (
      <Box sx={{ width: 260 }}>
        <FabricListItemSimple
          items={[
            { id: "rules", label: "Rules" },
            { id: "conditions", label: "Conditions" },
            { id: "actions", label: "Actions" },
          ]}
          value={value}
          onChange={setValue}
          aria-label="Rule settings"
        />
      </Box>
    );
  },
};

export const NoSelection: Story = {
  render: () => (
    <Box sx={{ width: 260 }}>
      <FabricListItemSimple items={settingsItems} aria-label="Settings sections" />
    </Box>
  ),
};

// -- States --

export const DisabledItem: Story = {
  render: () => {
    const [value, setValue] = useState("general");
    return (
      <Box sx={{ width: 260 }}>
        <FabricListItemSimple
          items={[
            { id: "general", label: "General", icon: <SettingsIcon fontSize="small" /> },
            { id: "permissions", label: "Permissions", icon: <SecurityIcon fontSize="small" /> },
            {
              id: "schedule",
              label: "Schedule (locked)",
              icon: <ScheduleIcon fontSize="small" />,
              disabled: true,
            },
          ]}
          value={value}
          onChange={setValue}
          aria-label="Settings sections"
        />
      </Box>
    );
  },
};

export const ReactNodeLabels: Story = {
  render: () => {
    const [value, setValue] = useState("general");
    return (
      <Box sx={{ width: 300 }}>
        <FabricListItemSimple
          items={[
            {
              id: "general",
              label: (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  General
                  <Box
                    component="span"
                    sx={{ fontSize: 11, color: "success.main", fontWeight: 600 }}
                  >
                    NEW
                  </Box>
                </Box>
              ),
              icon: <SettingsIcon fontSize="small" />,
            },
            { id: "permissions", label: "Permissions", icon: <SecurityIcon fontSize="small" /> },
          ]}
          value={value}
          onChange={setValue}
          aria-label="Settings sections"
        />
      </Box>
    );
  },
};

// -- Customization --

export const CustomSx: Story = {
  render: () => {
    const [value, setValue] = useState("general");
    return (
      <Box sx={{ width: 280 }}>
        <FabricListItemSimple
          items={settingsItems}
          value={value}
          onChange={setValue}
          aria-label="Settings sections"
          sx={{ borderRadius: 0, border: "1px solid", borderColor: "divider" }}
        />
      </Box>
    );
  },
};
