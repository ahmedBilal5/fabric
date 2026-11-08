import { Stack, Typography } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";

import { FabricAvatarGroup, type FabricAvatarItem } from ".";

const meta = {
  title: "Components/FabricAvatarGroup",
  component: FabricAvatarGroup,
  tags: ["test"],
  parameters: {
    docs: {
      description: {
        component:
          'Stacked avatars for "shared with N users" columns. Extends MUI ' +
          "`AvatarGroup` with a declarative `list` of `FabricAvatarItem` " +
          "objects and a custom surplus `+N` tooltip that lists hidden users' " +
          "names. Each item auto-derives initials + deterministic background " +
          "color from `name` (via `FabricAvatar` internally).",
      },
    },
  },
  argTypes: {
    max: { control: { type: "number", min: 1, max: 20 } },
    surplusTooltipLimit: { control: { type: "number", min: 1, max: 50 } },
  },
} as Meta<typeof FabricAvatarGroup>;

export default meta;
type Story = StoryObj<typeof FabricAvatarGroup>;

const NAMES = [
  "Jane Doe",
  "Marcus Aurelius",
  "Emily Zhang",
  "Diego Ramirez",
  "Priya Singh",
  "Kenji Tanaka",
  "Fatima Al-Sayed",
  "Olga Petrova",
  "Samuel Kim",
  "Nadia Rossi",
  "Ryo Nakamura",
  "Beatrice Owusu",
];

const smallList: FabricAvatarItem[] = NAMES.slice(0, 3).map((name) => ({ name }));
const mediumList: FabricAvatarItem[] = NAMES.slice(0, 7).map((name) => ({ name }));
const largeList: FabricAvatarItem[] = NAMES.map((name) => ({ name }));

// ─── Basics ─────────────────────────────────────────────────────────────────

export const Default: Story = {
  args: { list: mediumList, max: 5 },
};

export const NoSurplus: Story = {
  args: { list: smallList, max: 5 },
  parameters: {
    docs: {
      description: {
        story: "When `list.length <= max`, all avatars render and no surplus chip is shown.",
      },
    },
  },
};

export const WithSurplus: Story = {
  args: { list: mediumList, max: 3 },
  parameters: {
    docs: {
      description: {
        story:
          "Surplus `+N` chip appears once `list.length > max`. Hover it to see the " +
          "names of the hidden users.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // 7 items with max=3 renders 2 avatars plus a "+5" surplus chip
    // (MUI reserves one slot for the surplus indicator).
    await expect(canvas.getByText("+5")).toBeInTheDocument();
  },
};

// ─── Surplus tooltip ────────────────────────────────────────────────────────

export const LargeSurplus: Story = {
  args: { list: largeList, max: 3 },
  parameters: {
    docs: {
      description: {
        story:
          "Full 12-user list with `max=3` — the tooltip shows up to 10 names (default) " +
          'and appends "N more users…" for the rest.',
      },
    },
  },
};

export const SurplusLimit: Story = {
  args: { list: largeList, max: 3, surplusTooltipLimit: 4 },
  parameters: {
    docs: {
      description: {
        story:
          "Cap the surplus tooltip at 4 names — a smaller limit for dense tables where " +
          "a long tooltip would push out of the viewport.",
      },
    },
  },
};

export const SurplusOverflowText: Story = {
  args: {
    list: largeList,
    max: 3,
    surplusTooltipLimit: 3,
    surplusOverflowText: (count) => `+ ${count} others`,
  },
};

// ─── Content modes ──────────────────────────────────────────────────────────

export const MixedImagesAndInitials: Story = {
  args: {
    list: [
      { name: "Jane Doe", image: <img src="https://mui.com/static/images/avatar/1.jpg" alt="" /> },
      { name: "Marcus Aurelius" },
      {
        name: "Emily Zhang",
        image: <img src="https://mui.com/static/images/avatar/3.jpg" alt="" />,
      },
      { name: "Diego Ramirez" },
      { name: "Priya Singh" },
    ],
    max: 5,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Items with an `image` render the image; items without fall back to " +
          "the `name`-derived initials + colored background.",
      },
    },
  },
};

export const CustomTooltip: Story = {
  args: {
    list: [
      { name: "Jane Doe", tooltip: "Jane Doe — Owner" },
      { name: "Marcus Aurelius", tooltip: "Marcus Aurelius — Editor" },
      { name: "Emily Zhang", tooltip: "Emily Zhang — Viewer" },
    ],
    max: 5,
  },
  parameters: {
    docs: {
      description: {
        story:
          "`tooltip` overrides the auto-tooltip from `name`. Useful for showing role " +
          "or permission alongside the name.",
      },
    },
  },
};

// ─── Consumer pattern ───────────────────────────────────────────────────────

export const SharedWithColumn: Story = {
  render: () => (
    <Stack spacing={2}>
      <Typography variant="body2" color="text.secondary">
        Data-grid "SHARED" column pattern
      </Typography>
      <FabricAvatarGroup list={mediumList} max={4} />
    </Stack>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "A \"Shared with\" table cell: " +
          "`list={users.map(u => ({ name: u.fullName }))}`.",
      },
    },
  },
};
