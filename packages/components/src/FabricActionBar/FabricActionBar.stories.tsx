import AddIcon from "@fabric-kit/icons/Add";
import ArrowBackIcon from "@fabric-kit/icons/ArrowBack";
import CategoryIcon from "@fabric-kit/icons/Category";
import DeleteIcon from "@fabric-kit/icons/Delete";
import RefreshIcon from "@fabric-kit/icons/Refresh";
import SearchIcon from "@fabric-kit/icons/Search";
import { Box, Typography } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { FabricButton } from "../FabricButton";
import { FabricChip } from "../FabricChip";
import { FabricTabs } from "../FabricTabs";
import { FabricTextField } from "../FabricTextField/FabricTextField";
import { FabricActionBar, type FabricActionBarProps } from ".";

const meta: Meta<FabricActionBarProps> = {
  title: "Components/FabricActionBar",
  component: FabricActionBar,
  tags: ["test"],
  argTypes: {
    bordered: { control: "boolean" },
    height: { control: "number" },
  },
  args: {
    bordered: false,
  },
  parameters: {
    docs: {
      description: {
        component:
          "A header strip for pages, panels and drawers. Left content: `slots.left`, `leftControls`, and the `heading` block (icon + text + chip + edit affordance). Right content: `rightControls` + `slots.right`.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<FabricActionBarProps>;

export const Default: Story = {
  render: (args) => (
    <Box sx={{ width: "100%" }}>
      <FabricActionBar {...args} heading={{ text: "Settings" }} />
    </Box>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Settings")).toBeInTheDocument();
  },
};

export const HeadingWithIcon: Story = {
  name: "Heading with icon + chip",
  render: () => (
    <FabricActionBar
      heading={{
        text: "Customer schema",
        icon: <CategoryIcon color="primary" />,
        chip: <FabricChip label="v3" size="small" />,
      }}
    />
  ),
};

export const RightControls: Story = {
  name: "Right controls",
  render: () => (
    <FabricActionBar
      heading={{ text: "Data Sources" }}
      rightControls={[
        { children: "Refresh", startIcon: <RefreshIcon />, variant: "outlined" },
        { children: "New source", startIcon: <AddIcon />, variant: "contained" },
      ]}
    />
  ),
};

export const LeftControls: Story = {
  name: "Left controls (below heading)",
  render: () => (
    <FabricActionBar
      leftControls={[{ children: "Back", variant: "text", startIcon: <ArrowBackIcon /> }]}
      heading={{ text: "Edit rule" }}
      rightControls={[
        { children: "Cancel", variant: "text" },
        { children: "Save", variant: "text" },
      ]}
    />
  ),
};

export const WithSlots: Story = {
  name: "With slots.left / slots.right",
  render: () => (
    <FabricActionBar
      slots={{
        left: (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mr: 1 }}>
            <SearchIcon color="action" />
            <Typography variant="caption" color="text.secondary">
              12,043 records
            </Typography>
          </Box>
        ),
        right: (
          <Typography variant="caption" color="text.secondary">
            Updated 2m ago
          </Typography>
        ),
      }}
      heading={{ text: "Product listing" }}
      rightControls={[{ children: "Filter", variant: "text" }]}
    />
  ),
};

export const WithField: Story = {
  name: "With field",
  render: () => {
    const [query, setQuery] = useState("");
    return (
      <FabricActionBar
        heading={{ text: "Products" }}
        slots={{
          right: (
            <FabricTextField
              search
              placeholder="Search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          ),
        }}
        rightControls={[{ children: "Export" }]}
      />
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByPlaceholderText("Search")).toBeInTheDocument();
  },
};

export const WithTabs: Story = {
  name: "With tabs",
  render: () => {
    const [tab, setTab] = useState("general");
    return (
      <FabricActionBar
        heading={{ text: "Settings" }}
        slots={{
          right: (
            <FabricTabs
              appearance="underlineAlt"
              tabs={[
                { value: "general", label: "General" },
                { value: "advanced", label: "Advanced" },
                { value: "permissions", label: "Permissions" },
              ]}
              value={tab}
              onChange={(_, v) => setTab(v)}
              aria-label="Settings tabs"
            />
          ),
        }}
      />
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("tab", { name: /advanced/i }));
    await expect(canvas.getByRole("tab", { name: /advanced/i })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  },
};

export const Bordered: Story = {
  name: "Bordered vs. borderless",
  render: () => (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <FabricActionBar heading={{ text: "Bordered" }} bordered />
      <FabricActionBar heading={{ text: "No border (default)" }} bordered={false} />
    </Box>
  ),
};

export const EditableHeadingStory: Story = {
  name: "Editable heading",
  render: () => {
    const [name, setName] = useState("Draft product template");
    return (
      <FabricActionBar
        heading={{
          text: name,
          editable: true,
          onEditComplete: async (newText) => {
            await new Promise((r) => setTimeout(r, 700)); // simulate save
            setName(newText);
          },
        }}
        rightControls={[{ children: "Publish", variant: "text" }]}
      />
    );
  },
};

export const LongTitleEllipsis: Story = {
  name: "Long title (ellipsis)",
  render: () => (
    <Box sx={{ width: 460 }}>
      <FabricActionBar
        heading={{
          text: "A very long entity title that must truncate with ellipsis when the container is narrow",
          icon: <CategoryIcon color="primary" />,
        }}
        rightControls={[{ children: "Save", variant: "text" }]}
      />
    </Box>
  ),
};

export const DrawerHeader: Story = {
  name: "Drawer header",
  parameters: {
    docs: {
      description: {
        story:
          "An ActionBar as the top bar of a drawer or side panel. `bordered={false}` because the drawer surface has its own edge; a close button lives in `rightControls`.",
      },
    },
  },
  render: () => (
    <Box sx={{ width: 380, border: 1, borderColor: "divider", bgcolor: "background.paper" }}>
      <FabricActionBar
        bordered={false}
        heading={{ text: "Filter" }}
        rightControls={[
          {
            children: "",
            variant: "text",
            startIcon: <DeleteIcon />,
            "aria-label": "clear filter",
          },
        ]}
      />
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Drawer body content.
        </Typography>
      </Box>
    </Box>
  ),
};

export const PanelHeader: Story = {
  name: "Panel header with a view switcher",
  parameters: {
    docs: {
      description: {
        story:
          'A side-panel title with a segmented control in `slots.right`, e.g. to switch between list and tree views.',
      },
    },
  },
  render: () => (
    <FabricActionBar
      heading={{ text: "Projects", variant: "h6" }}
      slots={{
        right: (
          <Box sx={{ display: "flex", gap: 1 }}>
            <FabricButton size="small" variant="text">
              List
            </FabricButton>
            <FabricButton size="small" variant="text">
              Board
            </FabricButton>
          </Box>
        ),
      }}
    />
  ),
};

export const AllTogether: Story = {
  name: "Kitchen sink",
  render: () => (
    <FabricActionBar
      heading={{
        text: "Product catalog",
        icon: <CategoryIcon color="primary" />,
        chip: <FabricChip label="draft" size="small" color="warning" />,
      }}
      slots={{
        left: (
          <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
            12,043 items
          </Typography>
        ),
        right: (
          <Typography variant="caption" color="text.secondary">
            v3.2
          </Typography>
        ),
      }}
      leftControls={[{ children: "Back", variant: "text", startIcon: <ArrowBackIcon /> }]}
      rightControls={[
        { children: "Refresh", variant: "text", startIcon: <RefreshIcon /> },
        { children: "Publish", variant: "text" },
      ]}
    />
  ),
};
