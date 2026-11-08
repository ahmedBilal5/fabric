import ArchiveIcon from "@fabric-kit/icons/Archive";
import CloudUploadIcon from "@fabric-kit/icons/CloudUpload";
import ContentCopyIcon from "@fabric-kit/icons/ContentCopy";
import DeleteIcon from "@fabric-kit/icons/Delete";
import EditIcon from "@fabric-kit/icons/Edit";
import SaveIcon from "@fabric-kit/icons/Save";
import { Box, Chip, Stack, Typography } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, screen, userEvent, within } from "storybook/test";

import { FabricButton } from ".";

const meta = {
  title: "Components/FabricButton",
  component: FabricButton,
  tags: ["test"],
  parameters: {
    docs: {
      description: {
        component:
          "Extends MUI `Button` (the full `ButtonProps` surface) with Fabric's look: " +
          '4px `standard` corners (`shape="round"` for 24px), ' +
          "a semi-bold capitalized label, compact padding and no elevation shadow. " +
          "Font and state colors come from the theme; shape, size and padding from this component. " +
          "Adds `shape`, `loading` (spinner + disable), " +
          "`tooltip` (Tooltip-with-disabled-buttons via span wrap), " +
          "and `menu` (split-button dropdown with a caret).",
      },
    },
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["contained", "outlined", "text"],
    },
    color: {
      control: "select",
      options: ["primary", "secondary", "error", "success", "warning", "info"],
    },
    size: {
      control: "inline-radio",
      options: ["small", "medium"],
    },
    loading: { control: "boolean" },
    disabled: { control: "boolean" },
    fullWidth: { control: "boolean" },
    shape: { control: "inline-radio", options: ["standard", "round"] },
  },
} satisfies Meta<typeof FabricButton>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Basics ─────────────────────────────────────────────────────────────────

export const Default: Story = {
  args: { variant: "contained", children: "Primary action", onClick: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: /primary action/i });
    await expect(button).toBeInTheDocument();
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

export const AllVariants: Story = {
  name: "All variants",
  render: () => (
    <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
      <FabricButton variant="contained">Contained</FabricButton>
      <FabricButton variant="outlined">Outlined</FabricButton>
      <FabricButton variant="text">Text</FabricButton>
    </Stack>
  ),
};

export const AllColors: Story = {
  name: "All colors",
  render: () => (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1.5}>
        {(["primary", "secondary", "success", "error", "warning", "info"] as const).map((color) => (
          <FabricButton key={color} variant="contained" color={color}>
            {color}
          </FabricButton>
        ))}
      </Stack>
      <Stack direction="row" spacing={1.5}>
        {(["primary", "secondary", "success", "error", "warning", "info"] as const).map((color) => (
          <FabricButton key={color} variant="outlined" color={color}>
            {color}
          </FabricButton>
        ))}
      </Stack>
    </Stack>
  ),
};

export const AllSizes: Story = {
  name: "All sizes",
  parameters: {
    docs: {
      description: {
        story:
          "`small`: 12px label, 26px tall. `medium` (default): 14px label, 28px tall, for toolbars, " +
          "forms and dialogs. `large`: 16px label, 40px tall, for prominent calls to action.",
      },
    },
  },
  render: () => (
    <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
      <FabricButton size="small" variant="contained">
        Small
      </FabricButton>
      <FabricButton size="medium" variant="contained">
        Medium
      </FabricButton>
      <FabricButton size="large" variant="contained">
        Large
      </FabricButton>
    </Stack>
  ),
};

export const Shapes: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "`shape=\"standard\"` (default) has 4px corners. `shape=\"round\"` has 24px corners and 4px more side padding.",
      },
    },
  },
  render: () => (
    <Stack spacing={2}>
      {(["standard", "round"] as const).map((shape) => (
        <Stack key={shape} direction="row" spacing={2} sx={{ alignItems: "center" }}>
          <FabricButton shape={shape} variant="contained">
            Contained
          </FabricButton>
          <FabricButton shape={shape} variant="outlined">
            Outlined
          </FabricButton>
          <FabricButton shape={shape} variant="text">
            Text
          </FabricButton>
        </Stack>
      ))}
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    const buttons = within(canvasElement).getAllByRole("button");
    await expect(getComputedStyle(buttons[0]).borderRadius).toBe("4px");
    await expect(getComputedStyle(buttons[3]).borderRadius).toBe("24px");
  },
};

export const States: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Default and disabled for each variant. Hover and press by mouse to see the other states. " +
          "A button with a `menu` also shows its active look while its menu is open (see Split-button menu).",
      },
    },
  },
  render: () => (
    <Stack spacing={2}>
      {(["contained", "outlined", "text"] as const).map((variant) => (
        <Stack key={variant} direction="row" spacing={2} sx={{ alignItems: "center" }}>
          <FabricButton variant={variant}>Default</FabricButton>
          <FabricButton variant={variant} disabled>
            Disabled
          </FabricButton>
        </Stack>
      ))}
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole("button", { name: /disabled/i })).toHaveLength(3);
  },
};

export const LongLabel: Story = {
  name: "Long label",
  parameters: {
    docs: {
      description: {
        story: "A label longer than its container wraps instead of overflowing.",
      },
    },
  },
  render: () => (
    <Box sx={{ width: 160 }}>
      <FabricButton variant="contained" fullWidth>
        Request access to the shared workspace
      </FabricButton>
    </Box>
  ),
};

// ─── Extensions ─────────────────────────────────────────────────────────────

export const WithStartIcon: Story = {
  name: "With startIcon",
  args: {
    variant: "contained",
    startIcon: <SaveIcon />,
    children: "Save",
  },
};

export const WithEndIcon: Story = {
  name: "With endIcon",
  args: {
    variant: "contained",
    endIcon: <CloudUploadIcon />,
    children: "Upload",
  },
};

export const Loading: Story = {
  name: "Loading state",
  parameters: {
    docs: {
      description: {
        story:
          "`loading` swaps the children for a `<CircularProgress>` and disables interaction. " +
          "The button retains its width so the layout does not jump.",
      },
    },
  },
  args: {
    variant: "contained",
    loading: true,
    children: "Saving…",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // `loading` sets `disabled` and swaps children for the MUI spinner (role="progressbar").
    const button = canvas.getByRole("button");
    await expect(button).toBeDisabled();
    await expect(canvas.getByRole("progressbar")).toBeInTheDocument();
  },
};

export const LoadingInteractive: Story = {
  name: "Loading — interactive",
  parameters: {
    docs: {
      description: {
        story:
          "Click the button to simulate an async submit — `loading` is toggled for 1.5 seconds. " +
          "Notice the disabled state, spinner, and the tooltip staying accessible on hover.",
      },
    },
  },
  render: () => {
    const [busy, setBusy] = useState(false);
    return (
      <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
        <FabricButton
          variant="contained"
          loading={busy}
          startIcon={!busy && <SaveIcon />}
          tooltip={{ title: "Submits the form asynchronously" }}
          onClick={() => {
            setBusy(true);
            setTimeout(() => setBusy(false), 1500);
          }}
        >
          {busy ? "Saving…" : "Save changes"}
        </FabricButton>
        <Typography variant="caption" color="text.secondary">
          {busy ? "Saving…" : "Idle"}
        </Typography>
      </Stack>
    );
  },
};

export const WithTooltip: Story = {
  name: "With tooltip",
  args: {
    variant: "contained",
    children: "Hover me",
    tooltip: { title: "Hover-only tooltip", placement: "top" },
  },
};

export const WithTooltipOnDisabled: Story = {
  name: "Tooltip works when disabled",
  parameters: {
    docs: {
      description: {
        story:
          "MUI Tooltip normally ignores disabled children. `FabricButton` wraps the button " +
          "in a `<span>` so the Tooltip listeners stay attached even when interaction is blocked.",
      },
    },
  },
  args: {
    variant: "contained",
    disabled: true,
    children: "Disabled",
    tooltip: { title: "Waiting for a required field to be filled" },
  },
};

export const Destructive: Story = {
  args: {
    variant: "contained",
    color: "error",
    startIcon: <DeleteIcon />,
    children: "Delete",
  },
};

// ─── Split-button menu ──────────────────────────────────────────────────────

export const SplitMenu: Story = {
  name: "Split-button menu",
  parameters: {
    docs: {
      description: {
        story:
          "Passing `menu` attaches a caret (`ArrowDropDown` / `ArrowDropUp`) and opens an " +
          "MUI `<Menu>` on click. Each item is a `FabricButtonMenuItem` — `label`, `onClick`, " +
          "optional `disabled`/`startIcon`/`sx`/`data-testid`.",
      },
    },
  },
  args: {
    variant: "contained",
    children: "Actions",
    menu: [
      { label: "Edit", onClick: fn() },
      { label: "Duplicate", onClick: fn() },
      { label: "Delete", onClick: fn(), disabled: true },
    ],
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /actions/i }));
    // MUI Menu renders in a Portal, so query the document-level `screen`.
    const editItem = await screen.findByRole("menuitem", { name: /edit/i });
    await expect(editItem).toBeInTheDocument();
    // The open menu hides the page from the accessibility tree, hence `hidden: true`.
    await expect(canvas.getByRole("button", { name: /actions/i, hidden: true })).toHaveClass(
      "Mui-selected",
    );
    await expect(screen.getByRole("menuitem", { name: /duplicate/i })).toBeInTheDocument();
    await userEvent.click(editItem);
    await expect(args.menu?.[0].onClick).toHaveBeenCalledOnce();
  },
};

export const SplitMenuWithIcons: Story = {
  name: "Split-button menu — with icons",
  args: {
    variant: "outlined",
    children: "More actions",
    menu: [
      {
        label: "Edit",
        startIcon: <EditIcon fontSize="small" />,
        onClick: () => console.log("Edit"),
      },
      {
        label: "Duplicate",
        startIcon: <ContentCopyIcon fontSize="small" />,
        onClick: () => console.log("Duplicate"),
      },
      {
        label: "Archive",
        startIcon: <ArchiveIcon fontSize="small" />,
        onClick: () => console.log("Archive"),
      },
      {
        label: "Delete",
        startIcon: <DeleteIcon fontSize="small" />,
        onClick: () => console.log("Delete"),
        destructive: true,
      },
    ],
  },
};

// ─── Kitchen sink ───────────────────────────────────────────────────────────

export const KitchenSink: Story = {
  render: () => {
    const [busy, setBusy] = useState(false);
    const [clicks, setClicks] = useState(0);

    return (
      <Stack spacing={3}>
        <Stack spacing={1}>
          <Typography variant="overline">Variants</Typography>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            <FabricButton variant="contained">Contained</FabricButton>
            <FabricButton variant="outlined">Outlined</FabricButton>
            <FabricButton variant="text">Text</FabricButton>
          </Stack>
        </Stack>

        <Stack spacing={1}>
          <Typography variant="overline">Sizes</Typography>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            <FabricButton size="small" variant="contained">
              Small
            </FabricButton>
            <FabricButton size="medium" variant="contained">
              Medium
            </FabricButton>
          </Stack>
        </Stack>

        <Stack spacing={1}>
          <Typography variant="overline">States</Typography>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            <FabricButton variant="contained">Idle</FabricButton>
            <FabricButton variant="contained" disabled>
              Disabled
            </FabricButton>
            <FabricButton variant="contained" loading>
              Loading
            </FabricButton>
            <FabricButton variant="contained" disabled tooltip={{ title: "Disabled with tooltip" }}>
              Disabled + tooltip
            </FabricButton>
          </Stack>
        </Stack>

        <Stack spacing={1}>
          <Typography variant="overline">Icons</Typography>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            <FabricButton variant="contained" startIcon={<SaveIcon />}>
              Save
            </FabricButton>
            <FabricButton variant="outlined" endIcon={<CloudUploadIcon />}>
              Upload
            </FabricButton>
            <FabricButton variant="contained" color="error" startIcon={<DeleteIcon />}>
              Delete
            </FabricButton>
          </Stack>
        </Stack>

        <Stack spacing={1}>
          <Typography variant="overline">Interactive</Typography>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            <FabricButton
              variant="contained"
              loading={busy}
              onClick={() => {
                setBusy(true);
                setTimeout(() => setBusy(false), 1500);
              }}
              tooltip={{ title: "Simulates an async submit" }}
            >
              {busy ? "Saving…" : "Save changes"}
            </FabricButton>
            <FabricButton variant="outlined" onClick={() => setClicks((n) => n + 1)}>
              Click me
            </FabricButton>
            <Chip label={`Clicks: ${clicks}`} size="small" />
          </Stack>
        </Stack>

        <Stack spacing={1}>
          <Typography variant="overline">Split-button menu</Typography>
          <Box>
            <FabricButton
              variant="contained"
              menu={[
                {
                  label: "Edit",
                  startIcon: <EditIcon fontSize="small" />,
                  onClick: () => console.log("Edit"),
                },
                {
                  label: "Duplicate",
                  startIcon: <ContentCopyIcon fontSize="small" />,
                  onClick: () => console.log("Duplicate"),
                },
                {
                  label: "Delete",
                  startIcon: <DeleteIcon fontSize="small" />,
                  onClick: () => console.log("Delete"),
                  destructive: true,
                },
              ]}
            >
              Actions
            </FabricButton>
          </Box>
        </Stack>
      </Stack>
    );
  },
};
