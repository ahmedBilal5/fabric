import BusinessIcon from "@fabric-kit/icons/Business";
import PersonIcon from "@fabric-kit/icons/Person";
import { Stack, Typography } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";

import { FabricAvatar } from ".";

const meta = {
  title: "Components/FabricAvatar",
  component: FabricAvatar,
  tags: ["test"],
  parameters: {
    docs: {
      description: {
        component:
          "Design-system user / entity avatar. Extends MUI `Avatar` with two " +
          "first-class props for the patterns consumers were hand-rolling: " +
          "`name` (auto-derives initials + deterministic HSL background + " +
          "`alt`), and `size` (`xs`|`sm`|`md`|`lg` presets or a pixel value). " +
          "Every explicit prop wins over the derived values.",
      },
    },
  },
  argTypes: {
    name: { control: "text" },
    size: { control: "inline-radio", options: ["xs", "sm", "md", "lg"] },
    variant: {
      control: "inline-radio",
      options: ["circular", "rounded", "square"],
    },
    src: { control: "text" },
    appearance: { control: "inline-radio", options: [undefined, "default", "inverse"] },
    border: { control: "boolean" },
  },
} as Meta<typeof FabricAvatar>;

export default meta;
type Story = StoryObj<typeof FabricAvatar>;

// ─── Basics ─────────────────────────────────────────────────────────────────

export const Default: Story = {
  args: { name: "Jane Doe" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // `name` auto-derives two initials ("Jane Doe" → "JD") for the label.
    await expect(canvas.getByText("JD")).toBeInTheDocument();
  },
};

export const FromName: Story = {
  render: () => (
    <Stack direction="row" spacing={2}>
      <FabricAvatar name="Jane Doe" />
      <FabricAvatar name="Marcus Aurelius" />
      <FabricAvatar name="Emily Zhang" />
      <FabricAvatar name="Cher" />
      <FabricAvatar name="Anonymous User" />
    </Stack>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "`name` derives two initials (or one for single-word names), plus a " +
          "deterministic HSL background color — the same name always maps to the " +
          "same color, giving each user a consistent visual identity across the app.",
      },
    },
  },
};

export const AllSizes: Story = {
  render: () => (
    <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
      <Stack spacing={0.5} sx={{ alignItems: "center" }}>
        <FabricAvatar name="Jane Doe" size="xs" />
        <Typography variant="caption">xs (20)</Typography>
      </Stack>
      <Stack spacing={0.5} sx={{ alignItems: "center" }}>
        <FabricAvatar name="Jane Doe" size="sm" />
        <Typography variant="caption">sm (24)</Typography>
      </Stack>
      <Stack spacing={0.5} sx={{ alignItems: "center" }}>
        <FabricAvatar name="Jane Doe" size="md" />
        <Typography variant="caption">md (32)</Typography>
      </Stack>
      <Stack spacing={0.5} sx={{ alignItems: "center" }}>
        <FabricAvatar name="Jane Doe" size="lg" />
        <Typography variant="caption">lg (40)</Typography>
      </Stack>
      <Stack spacing={0.5} sx={{ alignItems: "center" }}>
        <FabricAvatar name="Jane Doe" size={64} />
        <Typography variant="caption">64</Typography>
      </Stack>
    </Stack>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <Stack direction="row" spacing={2}>
      <FabricAvatar name="Jane Doe" variant="circular" />
      <FabricAvatar name="Jane Doe" variant="rounded" />
      <FabricAvatar name="Jane Doe" variant="square" />
    </Stack>
  ),
};

// ─── Appearance and border ──────────────────────────────────────────────────

export const Appearances: Story = {
  render: () => (
    <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
      <FabricAvatar name="Jane Doe" size="sm" appearance="default" />
      <FabricAvatar name="Jane Doe" size="sm" appearance="inverse" />
      <FabricAvatar name="Jane Doe" size="sm" />
    </Stack>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '`appearance="default"` (yellow) and `appearance="inverse"` (brown). Without ' +
          "`appearance`, a `name` keeps its own derived color (last avatar).",
      },
    },
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getAllByText("JD")).toHaveLength(3);
  },
};

export const Borders: Story = {
  render: () => (
    <Stack spacing={2}>
      {(["circular", "rounded"] as const).map((variant) => (
        <Stack key={variant} direction="row" spacing={2} sx={{ alignItems: "center" }}>
          <FabricAvatar name="Jane Doe" size="sm" appearance="default" variant={variant} />
          <FabricAvatar name="Jane Doe" size="sm" appearance="default" variant={variant} border />
          <FabricAvatar
            name="Jane Doe"
            size="sm"
            variant={variant}
            border
            src="https://mui.com/static/images/avatar/1.jpg"
          />
          <Typography variant="caption">{variant}</Typography>
        </Stack>
      ))}
    </Stack>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "`circular` and `rounded` avatars without and with `border` (a grey border with " +
          "a small gap, also around photos).",
      },
    },
  },
};

// ─── Content modes ──────────────────────────────────────────────────────────

export const WithImage: Story = {
  render: () => (
    <Stack direction="row" spacing={2}>
      <FabricAvatar name="Jane Doe" src="https://mui.com/static/images/avatar/1.jpg" size="md" />
      <FabricAvatar
        name="Marcus Aurelius"
        src="https://mui.com/static/images/avatar/2.jpg"
        size="md"
      />
      <FabricAvatar name="Emily Zhang" src="https://mui.com/static/images/avatar/3.jpg" size="md" />
    </Stack>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "When `src` is set, the image renders and `name` still supplies the " +
          "`alt` text for screen readers. If the image fails to load, MUI falls " +
          "back to the derived initials automatically.",
      },
    },
  },
};

export const WithIcon: Story = {
  render: () => (
    <Stack direction="row" spacing={2}>
      <FabricAvatar size="md">
        <PersonIcon />
      </FabricAvatar>
      <FabricAvatar size="md" sx={{ bgcolor: "primary.main" }}>
        <BusinessIcon />
      </FabricAvatar>
    </Stack>
  ),
};

export const InitialsOverride: Story = {
  render: () => (
    <Stack direction="row" spacing={2}>
      <FabricAvatar name="Jane Doe" size="md">
        J
      </FabricAvatar>
      <FabricAvatar name="Marcus Aurelius" size="md">
        MA
      </FabricAvatar>
    </Stack>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Explicit `children` always wins over the derived initials. Use this to " +
          "force a specific label without losing the `name`-derived background color.",
      },
    },
  },
};

// ─── Consumer patterns ──────────────────────────────────────────────────────

export const PermissionListRow: Story = {
  render: () => (
    <Stack spacing={2}>
      {[
        { name: "Jane Doe", role: "Owner" },
        { name: "Marcus Aurelius", role: "Editor" },
        { name: "Emily Zhang", role: "Viewer" },
      ].map((user) => (
        <Stack key={user.name} direction="row" spacing={2} sx={{ alignItems: "center" }}>
          <FabricAvatar name={user.name} size="md" />
          <Stack>
            <Typography variant="body2">{user.name}</Typography>
            <Typography variant="caption" color="text.secondary">
              {user.role}
            </Typography>
          </Stack>
        </Stack>
      ))}
    </Stack>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "A typical access list. `name` gives each user consistent initials and color.",
      },
    },
  },
};
