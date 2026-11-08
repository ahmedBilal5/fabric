import NotificationsIcon from "@fabric-kit/icons/Notifications";
import { Chip, Stack, Typography } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";

import { FabricSwitch } from ".";

const meta = {
  title: "Components/FabricSwitch",
  component: FabricSwitch,
  tags: ["test"],
  parameters: {
    docs: {
      description: {
        component:
          "Switch for a single on/off setting that takes effect immediately. Sized, colored and " +
          "typeset to match the other Fabric selection controls (primary-colored track by default). Follows " +
          "`FabricCheckbox`'s convention: label presence controls FormControlLabel wrapping.",
      },
    },
  },
  argTypes: {
    checked: { control: "boolean" },
    disabled: { control: "boolean" },
    required: { control: "boolean" },
    showInfo: { control: "boolean" },
    size: { control: "inline-radio", options: ["small", "medium"] },
    color: {
      control: "select",
      options: ["default", "primary", "secondary", "error", "info", "success", "warning"],
    },
    labelPlacement: {
      control: "inline-radio",
      options: ["start", "end", "top", "bottom"],
    },
  },
} as Meta<typeof FabricSwitch>;

export default meta;
type Story = StoryObj<typeof FabricSwitch>;

// ─── Basics ─────────────────────────────────────────────────────────────────

export const Default: Story = {
  args: {
    label: "Enable notifications",
    defaultChecked: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("switch", { name: /enable notifications/i })).toBeChecked();
  },
};

export const BareNoLabel: Story = {
  name: "Bare (no label)",
  args: { defaultChecked: true },
  parameters: {
    docs: {
      description: {
        story:
          "Omit `label` and the wrapper renders just `<Switch>` — no `<FormControlLabel>`, " +
          "no wrapper div. Use it inside a table cell or next to your own label.",
      },
    },
  },
};

export const States: Story = {
  parameters: {
    docs: {
      description: {
        story: "Off, on and disabled states, plus `required`.",
      },
    },
  },
  render: () => (
    <Stack spacing={1}>
      <FabricSwitch label="Off" />
      <FabricSwitch label="On" defaultChecked />
      <FabricSwitch label="Disabled" disabled />
      <FabricSwitch label="Disabled + checked" disabled defaultChecked />
      <FabricSwitch label="Required" required />
    </Stack>
  ),
};

export const Sizes: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`size="medium"` (default) keeps the thumb inside the track, scaled to a 34×20 track with a 16px thumb. ' +
          '`size="small"` is the same design at 26×16 with a 12px thumb.',
      },
    },
  },
  render: () => (
    <Stack direction="row" spacing={3} sx={{ alignItems: "center" }}>
      <FabricSwitch label="Medium (default)" size="medium" defaultChecked />
      <FabricSwitch label="Small" size="small" defaultChecked />
    </Stack>
  ),
};

export const AllColors: Story = {
  name: "Colors",
  parameters: {
    docs: {
      description: {
        story:
          'The default `color="primary"` uses the theme primary color. Other palette colors work too.',
      },
    },
  },
  render: () => (
    <Stack direction="row" spacing={2} sx={{ flexWrap: "wrap" }}>
      <FabricSwitch label="Primary" color="primary" defaultChecked />
      <FabricSwitch label="Secondary" color="secondary" defaultChecked />
      <FabricSwitch label="Success" color="success" defaultChecked />
      <FabricSwitch label="Warning" color="warning" defaultChecked />
      <FabricSwitch label="Error" color="error" defaultChecked />
      <FabricSwitch label="Info" color="info" defaultChecked />
    </Stack>
  ),
};

export const LabelPlacement: Story = {
  render: () => (
    <Stack spacing={2}>
      <FabricSwitch label="End (default)" labelPlacement="end" defaultChecked />
      <FabricSwitch label="Start" labelPlacement="start" defaultChecked />
      <FabricSwitch label="Top" labelPlacement="top" defaultChecked />
      <FabricSwitch label="Bottom" labelPlacement="bottom" defaultChecked />
    </Stack>
  ),
};

export const ShowInfo: Story = {
  name: "Info icon",
  parameters: {
    docs: {
      description: {
        story:
          "`showInfo` adds the 16px info icon after the label. " +
          "Ignored when `label` is omitted.",
      },
    },
  },
  render: () => (
    <Stack spacing={2}>
      <FabricSwitch label="Auto-sync" showInfo />
      <FabricSwitch label="Auto-sync" showInfo defaultChecked />
    </Stack>
  ),
};

export const ReactNodeLabel: Story = {
  name: "ReactNode label",
  parameters: {
    docs: {
      description: {
        story: "`label` accepts any `ReactNode` — icons, badges, chips.",
      },
    },
  },
  render: () => (
    <FabricSwitch
      defaultChecked
      label={
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <NotificationsIcon fontSize="small" />
          <Typography variant="body2">Notifications</Typography>
          <Chip label="new" size="small" color="primary" />
        </Stack>
      }
    />
  ),
};

export const OnCheckedChangeShorthand: Story = {
  name: "Controlled (onCheckedChange)",
  parameters: {
    docs: {
      description: {
        story:
          "`onCheckedChange(checked)` is the boolean shorthand for consumers who never touch the " +
          "event. `onChange(event, checked)` still fires first when both are set.",
      },
    },
  },
  render: () => {
    const [value, setValue] = useState(false);
    return (
      <Stack spacing={1}>
        <FabricSwitch label="Simple boolean handler" checked={value} onCheckedChange={setValue} />
        <Typography variant="caption" color="text.secondary">
          Value: {String(value)}
        </Typography>
      </Stack>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole("switch", { name: /simple boolean handler/i });
    await expect(canvas.getByText("Value: false")).toBeInTheDocument();
    await userEvent.click(toggle);
    await expect(toggle).toBeChecked();
    await expect(canvas.getByText("Value: true")).toBeInTheDocument();
  },
};
