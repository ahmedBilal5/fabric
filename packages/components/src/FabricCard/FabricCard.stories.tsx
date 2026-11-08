import {
  Box,
  CardActions,
  CardContent,
  CardMedia,
  Divider,
  IconButton,
} from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { dark, field, spacing, text } from "@fabric-kit/design-tokens";
import AddIcon from "@fabric-kit/icons/Add";
import AppsOutlinedIcon from "@fabric-kit/icons/AppsOutlined";
import DescriptionOutlinedIcon from "@fabric-kit/icons/DescriptionOutlined";
import DragIndicatorIcon from "@fabric-kit/icons/DragIndicator";
import HubOutlinedIcon from "@fabric-kit/icons/HubOutlined";
import LockOutlinedIcon from "@fabric-kit/icons/LockOutlined";
import ManageAccountsOutlinedIcon from "@fabric-kit/icons/ManageAccountsOutlined";
import MoreVertIcon from "@fabric-kit/icons/MoreVert";
import MultipleStopIcon from "@fabric-kit/icons/MultipleStop";
import PublicOutlinedIcon from "@fabric-kit/icons/PublicOutlined";
import SellOutlinedIcon from "@fabric-kit/icons/SellOutlined";
import ShareOutlinedIcon from "@fabric-kit/icons/ShareOutlined";
import { FabricFlex, FabricText } from "@fabric-kit/primitives";
import { useState } from "react";
import { expect, fn, userEvent, within } from "storybook/test";
import { FabricAvatar } from "../FabricAvatar";
import { FabricButton } from "../FabricButton";
import { FabricChip } from "../FabricChip";
import { FabricCard, type FabricCardProps, type FabricCardTint } from ".";
import { FabricCardHeader } from "./FabricCardHeader";
import { FabricCardRows } from "./FabricCardRows";

const meta: Meta<FabricCardProps> = {
  title: "Components/FabricCard",
  component: FabricCard,
  tags: ["test"],
  argTypes: {
    raised: { control: "boolean" },
    elevation: { control: "number" },
    interactive: { control: "boolean" },
    selected: { control: "boolean" },
    tint: { control: "inline-radio", options: [undefined, "neutral", "blue", "teal", "lime"] },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Card container: a thin wrapper over MUI Card with an 8px radius, no border and a soft shadow. Compose with FabricCardHeader, FabricCardRows, CardContent, CardActions and CardMedia.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<FabricCardProps>;

/** Footer bar shared by the "app alt" and tag cards: 8px top / bottom, 16px sides. */
function CardFooter({ children }: { children: React.ReactNode }) {
  return (
    <CardActions sx={{ minHeight: 32, flexWrap: "wrap", px: `${spacing.lg}px` }}>
      {children}
    </CardActions>
  );
}

export const Default: Story = {
  render: (args) => (
    <FabricCard {...args} sx={{ width: 320 }}>
      <CardContent>
        <FabricText textVariant="headingSmAlt" gutterBottom>
          Card title
        </FabricText>
        <FabricText textVariant="bodyMd" color="var(--mui-palette-text-secondary)">
          Basic card. Consumers compose the internal structure using MUI primitives.
        </FabricText>
      </CardContent>
    </FabricCard>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Card title")).toBeInTheDocument();
  },
};

export const AppCard: Story = {
  name: "App card",
  parameters: {
    docs: {
      description: {
        story:
          "Icon, title and description in a `FabricCardHeader`. Hover the card to see the lifted shadow and fill; press it to see the pressed fill.",
      },
    },
  },
  render: () => (
    <FabricCard onClick={fn()} sx={{ width: 320 }}>
      <FabricCardHeader
        avatar={<AppsOutlinedIcon />}
        title="Access Studio"
        subheader="Manage member access and profiles"
      />
    </FabricCard>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const card = canvas.getByRole("button", { name: /access studio/i });
    await expect(card).toHaveAttribute("tabindex", "0");
  },
};

export const AppCardWithFooter: Story = {
  name: "App card with footer",
  parameters: {
    docs: {
      description: {
        story:
          "The same header as the app card plus a `CardActions` footer: icons, a divider and small labels.",
      },
    },
  },
  render: () => (
    <FabricCard onClick={fn()} sx={{ width: 320 }}>
      <FabricCardHeader
        avatar={<AppsOutlinedIcon />}
        title="Access Studio"
        subheader="Manage member access and profiles"
      />
      <CardFooter>
        <LockOutlinedIcon sx={{ fontSize: 16 }} titleAccess="Private" />
        <ShareOutlinedIcon sx={{ fontSize: 16 }} titleAccess="Shared" />
        <PublicOutlinedIcon sx={{ fontSize: 16 }} titleAccess="Public" />
        <Divider orientation="vertical" flexItem />
        <FabricText size="xs" color="var(--mui-palette-text-secondary)">
          Metadata
        </FabricText>
        <FabricText size="xs" color="var(--mui-palette-text-secondary)">
          Tag
        </FabricText>
      </CardFooter>
    </FabricCard>
  ),
};

export const TagCard: Story = {
  name: "Tag card",
  parameters: {
    docs: {
      description: {
        story:
          "Tag card: the header action holds a count chip; the footer holds removable tag chips and an add button.",
      },
    },
  },
  render: () => (
    <FabricCard sx={{ width: 320 }}>
      <FabricCardHeader
        avatar={<SellOutlinedIcon />}
        title="Customer tags"
        subheader="Group customers by tag"
        action={<FabricChip label="3" size="small" />}
      />
      <CardFooter>
        <FabricChip label="Finance" size="small" onDelete={fn()} />
        <FabricChip label="Priority" size="small" onDelete={fn()} />
        <FabricButton size="small" variant="text" startIcon={<AddIcon />}>
          Add Tag
        </FabricButton>
      </CardFooter>
    </FabricCard>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Customer tags")).toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: /add tag/i })).toBeInTheDocument();
  },
};

export const MetricCard: Story = {
  name: "Metric card",
  parameters: {
    docs: {
      description: {
        story:
          "A large header with a `Today` chip, then `FabricCardRows`. The `emphasized` row is the bold total.",
      },
    },
  },
  render: () => (
    <FabricCard sx={{ width: 320 }}>
      <FabricCardHeader
        size="large"
        title="Jobs"
        action={<FabricChip label="Today" size="small" />}
      />
      <FabricCardRows
        rows={[
          { label: "Total", value: "128", emphasized: true },
          { label: "Completed", value: "96" },
          { label: "Running", value: "24" },
          { label: "Failed", value: "8" },
        ]}
      />
    </FabricCard>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Total")).toBeInTheDocument();
    await expect(canvas.getByText("128")).toBeInTheDocument();
  },
};

const SOURCE_ITEMS: {
  tint: FabricCardTint;
  title: string;
  icon: React.ReactNode;
}[] = [
  { tint: "neutral", title: "Manual entries", icon: <ManageAccountsOutlinedIcon /> },
  { tint: "blue", title: "Partner API", icon: <HubOutlinedIcon /> },
  { tint: "teal", title: "Supplier feed", icon: <DescriptionOutlinedIcon /> },
  { tint: "lime", title: "Nightly import", icon: <MultipleStopIcon /> },
];

/** Data-source list item: drag handle, icon, then title and compact rows. */
function SourceItem({
  tint,
  title,
  icon,
}: {
  tint: FabricCardTint;
  title: string;
  icon: React.ReactNode;
}) {
  return (
    <FabricCard
      tint={tint}
      onClick={fn()}
      sx={{
        width: 358,
        display: "flex",
        alignItems: "flex-start",
        gap: `${spacing.xs}px`,
        pt: `${spacing.md}px`,
        pb: `${spacing.md}px`,
        pl: `${spacing.xs}px`,
        pr: `${spacing.lg}px`,
      }}
    >
      <Box
        aria-hidden
        sx={{ display: "grid", placeItems: "center", p: "5px", color: field.label }}
      >
        <DragIndicatorIcon sx={{ fontSize: 16 }} />
      </Box>
      <Box sx={{ display: "grid", placeItems: "center", color: field.label, "& svg": { fontSize: 24 } }}>
        {icon}
      </Box>
      <FabricFlex direction="column" gap="sm" sx={{ flex: 1, minWidth: 0, py: `${spacing.xs}px` }}>
        <FabricText
          textVariant="headingXs"
          sx={(theme) => ({
            color: text.heading,
            ...theme.applyStyles("dark", { color: dark.text.heading }),
          })}
        >
          {title}
        </FabricText>
        <FabricCardRows
          size="compact"
          rows={[
            { label: "Records updated", value: "100" },
            { label: "Created by", value: "Mary Smith" },
            { label: "Last run date", value: "Dec 30, 2024" },
          ]}
        />
      </FabricFlex>
    </FabricCard>
  );
}

export const ListItem: Story = {
  name: "List item card",
  parameters: {
    docs: {
      description: {
        story:
          "A list item with a drag handle, an icon, a title and compact rows. The `tint` prop sets the background (`neutral`, `blue`, `teal` or `lime`, e.g. one per data source). The tints reuse the status surface tokens, so they follow the same colours as the status chips. Hover only lifts the shadow; the tint stays. The drag handle is visual only: wire your own drag and drop.",
      },
    },
  },
  render: () => (
    <FabricFlex direction="column" gap="md">
      {SOURCE_ITEMS.map((item) => (
        <SourceItem key={item.tint} {...item} />
      ))}
    </FabricFlex>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Manual entries")).toBeInTheDocument();
    await expect(canvas.getAllByText("Records updated")).toHaveLength(4);
    await expect(canvas.getAllByRole("button")).toHaveLength(4);
  },
};

function SelectableCards() {
  const [selected, setSelected] = useState<string | null>("b");
  return (
    <FabricFlex gap="lg" wrap>
      {["a", "b", "c"].map((id) => (
        <FabricCard
          key={id}
          selected={selected === id}
          onClick={() => setSelected(id)}
          sx={{ width: 220 }}
        >
          <FabricCardHeader
            avatar={<AppsOutlinedIcon />}
            title={`Card ${id.toUpperCase()}`}
            subheader={selected === id ? "Selected" : "Click to select"}
          />
        </FabricCard>
      ))}
    </FabricFlex>
  );
}

export const States: Story = {
  name: "States (hover, press, selected)",
  parameters: {
    docs: {
      description: {
        story:
          "Click a card to select it. Hover for the lifted shadow and light fill; hold the mouse down for the pressed fill; Tab to see the focus ring.",
      },
    },
  },
  render: () => <SelectableCards />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const cardA = canvas.getByRole("button", { name: /card a/i });
    const cardB = canvas.getByRole("button", { name: /card b/i });
    await expect(cardB).toHaveAttribute("aria-pressed", "true");
    await expect(cardA).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(cardA);
    await expect(cardA).toHaveAttribute("aria-pressed", "true");
    await expect(cardB).toHaveAttribute("aria-pressed", "false");
  },
};

export const Clickable: Story = {
  name: "Clickable (whole card)",
  parameters: {
    docs: {
      description: {
        story:
          "Passing `onClick` makes the card interactive: hover, pressed, focus ring, and Enter / Space activation come from `FabricCard`; no `sx` needed.",
      },
    },
  },
  args: { onClick: fn() },
  render: (args) => (
    <FabricCard {...args} sx={{ width: 320 }}>
      <FabricCardHeader
        avatar={<AppsOutlinedIcon />}
        title="Data Source"
        subheader="Open the data source"
      />
    </FabricCard>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const card = canvas.getByRole("button", { name: /data source/i });
    await userEvent.click(card);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
    card.focus();
    await userEvent.keyboard("{Enter}");
    await expect(args.onClick).toHaveBeenCalledTimes(2);
    await userEvent.keyboard(" ");
    await expect(args.onClick).toHaveBeenCalledTimes(3);
  },
};

export const LongContent: Story = {
  name: "Long content",
  parameters: {
    docs: {
      description: {
        story:
          "A long title and description wrap inside the 320px card instead of overflowing; the header keeps its 16px padding.",
      },
    },
  },
  render: () => (
    <FabricCard sx={{ width: 320 }}>
      <FabricCardHeader
        avatar={<AppsOutlinedIcon />}
        title="A very long application title that has to wrap onto more than one line"
        subheader="A long description that keeps going to show how the header copes with extra text in a narrow card"
      />
    </FabricCard>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const title = canvas.getByText(/very long application title/i);
    await expect(title.scrollWidth).toBeLessThanOrEqual(title.clientWidth + 1);
  },
};

export const WithHeader: Story = {
  name: "With header",
  render: () => (
    <FabricCard sx={{ width: 360 }}>
      <FabricCardHeader
        avatar={<FabricAvatar name="Alice Smith" />}
        title="Alice Smith"
        subheader="Updated 2 hours ago"
        action={
          <IconButton aria-label="card actions">
            <MoreVertIcon />
          </IconButton>
        }
      />
      <CardContent>
        <FabricText textVariant="bodyMd" color="var(--mui-palette-text-secondary)">
          A card with the standard header pattern — avatar, title, subheader, and an action button.
        </FabricText>
      </CardContent>
    </FabricCard>
  ),
};

export const WithActions: Story = {
  name: "With header + actions",
  render: () => (
    <FabricCard sx={{ width: 360 }}>
      <FabricCardHeader title="Product Template" subheader="2 attributes" />
      <CardContent sx={{ pt: 0 }}>
        <FabricText textVariant="bodyMd" color="var(--mui-palette-text-secondary)">
          A metadata card with actions at the bottom.
        </FabricText>
      </CardContent>
      <CardActions sx={{ px: `${spacing.lg}px` }}>
        <FabricButton size="small">Edit</FabricButton>
        <FabricButton size="small" color="error">
          Delete
        </FabricButton>
      </CardActions>
    </FabricCard>
  ),
};

export const WithMedia: Story = {
  name: "With media",
  render: () => (
    <FabricCard sx={{ width: 320 }}>
      <CardMedia
        component="div"
        sx={{
          height: 140,
          background: (theme) =>
            `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
        }}
      />
      <CardContent>
        <FabricText textVariant="headingSmAlt" gutterBottom>
          Analytics
        </FabricText>
        <FabricText textVariant="bodyMd" color="var(--mui-palette-text-secondary)">
          Media-topped cards work by composing `CardMedia` at the top.
        </FabricText>
      </CardContent>
    </FabricCard>
  ),
};

export const Raised: Story = {
  render: () => (
    <FabricFlex gap="lg" wrap>
      <FabricCard sx={{ width: 220 }}>
        <CardContent>
          <FabricText textVariant="headingXs">Default</FabricText>
        </CardContent>
      </FabricCard>
      <FabricCard raised sx={{ width: 220 }}>
        <CardContent>
          <FabricText textVariant="headingXs">Raised</FabricText>
        </CardContent>
      </FabricCard>
      <FabricCard elevation={8} sx={{ width: 220 }}>
        <CardContent>
          <FabricText textVariant="headingXs">Elevation 8</FabricText>
        </CardContent>
      </FabricCard>
    </FabricFlex>
  ),
};

export const DarkMode: Story = {
  name: "Dark mode check",
  parameters: {
    docs: {
      description: {
        story:
          "Use the Storybook theme toolbar to switch to dark. Titles, descriptions, rows and the interactive fills all switch to their dark tokens.",
      },
    },
  },
  render: () => (
    <FabricFlex gap="lg" wrap>
      <FabricCard onClick={fn()} sx={{ width: 320 }}>
        <FabricCardHeader avatar={<AppsOutlinedIcon />} title="App card" subheader="Description" />
      </FabricCard>
      <FabricCard sx={{ width: 320 }}>
        <FabricCardHeader size="large" title="Jobs" />
        <FabricCardRows
          rows={[
            { label: "Total", value: "128", emphasized: true },
            { label: "Completed", value: "96" },
          ]}
        />
      </FabricCard>
    </FabricFlex>
  ),
};
