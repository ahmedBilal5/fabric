import CloudDoneOutlinedIcon from "@fabric-kit/icons/CloudDoneOutlined";
import CloudOffOutlinedIcon from "@fabric-kit/icons/CloudOffOutlined";
import CloudUploadOutlinedIcon from "@fabric-kit/icons/CloudUploadOutlined";
import { Avatar, Stack, Typography } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, within } from "storybook/test";

import { FabricChip } from ".";

const meta = {
  title: "Components/FabricChip",
  component: FabricChip,
  tags: ["test"],
  parameters: {
    docs: {
      description: {
        component:
          "Design-system chip. Strict `label: ReactNode` typing (required — a " +
          "chip without a label is semantically empty). Inherits MUI defaults " +
          "(`size='medium'`, `variant='filled'`, `color='default'`) and adds status " +
          "colors and a `filledAlt` variant. `React.memo` keeps large chip lists cheap.",
      },
    },
  },
  argTypes: {
    size: { control: "inline-radio", options: ["small", "medium"] },
    variant: { control: "inline-radio", options: ["filled", "outlined", "filledAlt"] },
    color: {
      control: "select",
      options: [
        "default",
        "queued",
        "running",
        "success",
        "warning",
        "cancelled",
        "error",
        "suspended",
        "archived",
        "unknown",
        "primary",
        "secondary",
        "info",
      ],
    },
    disabled: { control: "boolean" },
  },
} as Meta<typeof FabricChip>;

export default meta;
type Story = StoryObj<typeof FabricChip>;

// ─── Basics ─────────────────────────────────────────────────────────────────

export const Default: Story = {
  args: {
    label: "Chip",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Chip")).toBeInTheDocument();
  },
};

const statusColors = [
  "default",
  "queued",
  "running",
  "success",
  "warning",
  "cancelled",
  "error",
  "suspended",
  "archived",
  "unknown",
] as const;
const chipVariants = ["filled", "outlined", "filledAlt"] as const;

export const AllColors: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Every status color in the three " +
          "variants (filled, outlined, filledAlt), for both sizes. `primary`, `secondary` " +
          "and `info` keep MUI's default styling.",
      },
    },
  },
  render: () => (
    <Stack spacing={2}>
      {(["medium", "small"] as const).map((size) => (
        <Stack key={size} spacing={1}>
          <Typography variant="caption" color="text.secondary">
            {size}
          </Typography>
          {statusColors.map((color) => (
            <Stack key={color} direction="row" spacing={1}>
              {chipVariants.map((variant) => (
                <FabricChip key={variant} label={color} color={color} variant={variant} size={size} />
              ))}
              <FabricChip label="disabled" disabled color={color} size={size} />
            </Stack>
          ))}
        </Stack>
      ))}
    </Stack>
  ),
};

export const WithThumbnail: Story = {
  parameters: {
    docs: {
      description: {
        story: "A 16px avatar before the label.",
      },
    },
  },
  render: () => (
    <Stack spacing={1}>
      {(["medium", "small"] as const).map((size) => (
        <Stack key={size} direction="row" spacing={1}>
          {chipVariants.map((variant) => (
            <FabricChip
              key={variant}
              label="Thumbnail"
              variant={variant}
              size={size}
              color="running"
              avatar={<Avatar>A</Avatar>}
              onDelete={() => undefined}
            />
          ))}
        </Stack>
      ))}
    </Stack>
  ),
};

// ─── Interactive ──────────────────────────────────────────────────────────────

export const Clickable: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Add `onClick` and MUI Chip renders a button role with focus/hover " +
          "affordances. The transition token gives the hover state a smooth fade.",
      },
    },
  },
  render: () => {
    const [count, setCount] = useState(0);
    return (
      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
        <FabricChip
          label={`Clicked ${count}`}
          color="primary"
          onClick={() => setCount((c) => c + 1)}
        />
        <FabricChip
          label="Outlined clickable"
          variant="outlined"
          color="primary"
          onClick={() => setCount((c) => c + 1)}
        />
      </Stack>
    );
  },
};

export const Deletable: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Add `onDelete` to render the delete-x adornment. Common in filter " +
          "bars — click × to remove the filter. `deleteIcon` swaps the default × " +
          "for a custom icon.",
      },
    },
  },
  render: () => {
    const [items, setItems] = useState(["Apples", "Bananas", "Oranges", "Grapes"]);
    return (
      <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
        {items.map((item) => (
          <FabricChip
            key={item}
            label={item}
            color="primary"
            variant="outlined"
            onDelete={() => setItems((prev) => prev.filter((i) => i !== item))}
          />
        ))}
        {items.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            All chips removed. Refresh the story to reset.
          </Typography>
        )}
      </Stack>
    );
  },
};

// ─── Use cases ───────────────────────────────────────────────────────────────

export const FileProgress: Story = {
  parameters: {
    docs: {
      description: {
        story: "Processing state of a file upload.",
      },
    },
  },
  render: () => (
    <Stack spacing={1} sx={{ alignItems: "flex-start" }}>
      <FabricChip label="Processed" color="success" />
      <FabricChip label="Processing" color="running" />
      <FabricChip label="Unprocessed" color="warning" />
      <FabricChip label="Pending" color="queued" />
      <FabricChip label="Failed" color="error" />
      <FabricChip label="Archived" color="archived" />
    </Stack>
  ),
};

export const SaveStatus: Story = {
  parameters: {
    docs: {
      description: {
        story: "Autosave state, with a 16px cloud icon before the label.",
      },
    },
  },
  render: () => (
    <Stack spacing={1} sx={{ alignItems: "flex-start" }}>
      <FabricChip label="Saving" color="running" icon={<CloudUploadOutlinedIcon />} />
      <FabricChip label="Saved" color="success" icon={<CloudDoneOutlinedIcon />} />
      <FabricChip
        label="Will Autosave Once Connected"
        color="warning"
        icon={<CloudOffOutlinedIcon />}
      />
    </Stack>
  ),
};

export const Versions: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Version and edit-mode labels. The chips stretch to a " +
          "shared width (132px here) so a version list lines up.",
      },
    },
  },
  render: () => (
    <Stack spacing={1} sx={{ width: 132 }}>
      <FabricChip label="Current V.02" color="running" />
      <FabricChip label="Draft" color="warning" />
      <FabricChip label="V.01" color="unknown" />
      <FabricChip label="Draft Mode On" color="warning" />
      <FabricChip label="Edit Mode" color="warning" />
    </Stack>
  ),
};
