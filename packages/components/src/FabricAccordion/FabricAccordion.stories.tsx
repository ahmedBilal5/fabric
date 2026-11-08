import CollectionsBookmarkOutlinedIcon from "@fabric-kit/icons/CollectionsBookmarkOutlined";
import DescriptionOutlinedIcon from "@fabric-kit/icons/DescriptionOutlined";
import FolderOutlinedIcon from "@fabric-kit/icons/FolderOutlined";
import InfoOutlinedIcon from "@fabric-kit/icons/InfoOutlined";
import KeyboardArrowRightIcon from "@fabric-kit/icons/KeyboardArrowRight";
import SettingsOutlinedIcon from "@fabric-kit/icons/SettingsOutlined";
import { Box, Button, Stack } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { FabricCheckbox } from "../FabricCheckbox";
import { FabricSwitch } from "../FabricSwitch";
import { FabricAccordion, FabricAccordionLeaf } from ".";

const meta = {
  title: "Components/FabricAccordion",
  component: FabricAccordion,
  tags: ["test"],
  parameters: {
    docs: {
      description: {
        component:
          "Flat, full-width accordion rows. `variant` picks the header style (`section`, `document`) or the smaller `content` row; `level` sets the indent for nested rows. Nest accordions in `children` for a tree, and end a branch with `FabricAccordionLeaf`. Rows fill their container's width. Extends MUI `Accordion`, so every MUI prop, `sx`, `slotProps` and the `summarySx` / `detailsSx` slots still apply.",
      },
    },
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["section", "document", "content"] },
    level: { control: "inline-radio", options: [1, 2, 3] },
    disabled: { control: "boolean" },
    defaultExpanded: { control: "boolean" },
    draggable: { control: "boolean" },
    mapIndicator: { control: "boolean" },
    unmountOnExit: { control: "boolean" },
  },
  decorators: [
    (Story) => (
      <Box sx={{ width: 320 }}>
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof FabricAccordion>;

export default meta;
type Story = StoryObj<typeof meta>;

const actionButton = (
  <Button
    size="small"
    startIcon={<InfoOutlinedIcon />}
    onClick={(event) => event.stopPropagation()}
  >
    Action
  </Button>
);

// ─── Row styles ────────────────────────────────────────────────────────────

export const Section: Story = {
  args: {
    title: "Section title",
    titleIcon: <SettingsOutlinedIcon />,
    children: "Details render inside `AccordionDetails`. Any ReactNode works.",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const summary = canvas.getByRole("button", { name: /section title/i });
    await expect(summary).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(summary);
    await expect(summary).toHaveAttribute("aria-expanded", "true");
  },
};

export const SectionExpanded: Story = {
  name: "Section (open)",
  args: { ...Section.args, defaultExpanded: true },
};

export const SectionDraggableAndClosable: Story = {
  name: "Section (draggable + close)",
  args: { ...Section.args, draggable: true, onClose: fn() },
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Close" }));
    await expect(args.onClose).toHaveBeenCalledTimes(1);
    await expect(within(canvasElement).getByRole("button", { name: /section title/i })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  },
};

export const Document: Story = {
  args: {
    variant: "document",
    title: "Document title",
    titleIcon: <DescriptionOutlinedIcon />,
    children: "The chevron sits at the end of the row.",
  },
};

export const Content: Story = {
  args: {
    variant: "content",
    title: "Content row",
    action: actionButton,
    children: "A content row has 12px text and a 16px chevron.",
  },
};

// ─── Nesting ───────────────────────────────────────────────────────────────

export const NestedTree: Story = {
  name: "Nested tree",
  render: () => (
    <FabricAccordion
      title="Dataset"
      titleIcon={<CollectionsBookmarkOutlinedIcon />}
      defaultExpanded
    >
      <FabricAccordion
        variant="content"
        title="Group A"
        action={actionButton}
        defaultExpanded
      >
        <FabricAccordion
          variant="content"
          level={2}
          title="Folder"
          titleIcon={<FolderOutlinedIcon />}
          action={<InfoOutlinedIcon />}
          mapIndicator
          defaultExpanded
        >
          <FabricAccordionLeaf icon={<DescriptionOutlinedIcon />} action={<InfoOutlinedIcon />}>
            Leaf item
          </FabricAccordionLeaf>
          <FabricAccordionLeaf
            icon={<DescriptionOutlinedIcon />}
            action={<InfoOutlinedIcon />}
            mapIndicator
            selected
          >
            Selected leaf
          </FabricAccordionLeaf>
        </FabricAccordion>
      </FabricAccordion>
    </FabricAccordion>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Leaf item")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: /folder/i }));
    await waitFor(() => expect(canvas.queryByText("Leaf item")).toBeNull());
  },
};

export const Leaf: StoryObj<typeof FabricAccordionLeaf> = {
  render: (args) => (
    <FabricAccordionLeaf {...args} icon={<DescriptionOutlinedIcon />} action={<InfoOutlinedIcon />}>
      Leaf item
    </FabricAccordionLeaf>
  ),
  args: { level: 3, onClick: fn() },
};

// ─── Composition ───────────────────────────────────────────────────────────

export const Disabled: Story = {
  args: { title: "Read-only section", disabled: true, children: "Never rendered." },
};

export const CustomExpandIcon: Story = {
  name: "Custom expand icon",
  args: {
    title: "Custom chevron",
    expandIcon: <KeyboardArrowRightIcon />,
    expandIconRotationDegrees: 180,
    children: "A custom `expandIcon` turns 180 degrees unless you set `expandIconRotationDegrees`.",
  },
};

export const CustomSummarySwitch: Story = {
  name: "Custom summary (switch)",
  render: () => {
    const [enabled, setEnabled] = useState(true);
    return (
      <FabricAccordion
        summaryContent={
          <Stack direction="row" spacing={2} sx={{ flex: 1, alignItems: "center" }}>
            <span style={{ flex: 1 }}>Email notifications</span>
            <FabricSwitch
              checked={enabled}
              onChange={(_event, checked) => setEnabled(checked)}
              onClick={(event) => event.stopPropagation()}
            />
          </Stack>
        }
      >
        {enabled ? "Configure recipients and thresholds." : "Enable the switch above to configure."}
      </FabricAccordion>
    );
  },
};

export const CustomSummaryCheckbox: Story = {
  name: "Custom summary (checkbox)",
  render: () => {
    const [checked, setChecked] = useState(false);
    return (
      <FabricAccordion
        summaryContent={
          <FabricCheckbox
            label="Enable audit trail"
            checked={checked}
            onCheckedChange={setChecked}
            onClick={(event) => event.stopPropagation()}
          />
        }
      >
        {checked ? "Audit events will be logged." : "Enable the checkbox above."}
      </FabricAccordion>
    );
  },
};

export const SummaryAndDetailsSx: Story = {
  name: "summarySx + detailsSx",
  args: {
    title: "Custom indent",
    summarySx: { paddingLeft: 4 },
    detailsSx: { padding: 3 },
    children: "Consumer keys win over the defaults.",
  },
};

export const OneExpandedAtATime: Story = {
  name: "One expanded at a time",
  render: () => {
    const [openId, setOpenId] = useState<string | null>("a");
    return (
      <Box>
        {(["a", "b", "c"] as const).map((id) => (
          <FabricAccordion
            key={id}
            title={`Section ${id.toUpperCase()}`}
            expanded={openId === id}
            onChange={(_event, isExpanded) => setOpenId(isExpanded ? id : null)}
          >
            Opening another panel collapses this one.
          </FabricAccordion>
        ))}
      </Box>
    );
  },
};
