import Add from "@fabric-kit/icons/Add";
import Refresh from "@fabric-kit/icons/Refresh";
import { FabricSurface } from "@fabric-kit/primitives";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { FabricButton } from "../FabricButton/FabricButton";
import { FabricCard } from "../FabricCard";
import { FabricEmptyState } from ".";

const meta = {
  title: "Components/FabricEmptyState",
  component: FabricEmptyState,
  tags: ["test"],
  args: {
    title: "No invoices yet",
    description: "Invoices you create or import show up here.",
    variant: "empty",
    size: "md",
  },
  argTypes: {
    variant: { control: "radio", options: ["empty", "no-results", "error"] },
    size: { control: "radio", options: ["sm", "md"] },
    titleComponent: { control: "select", options: ["h1", "h2", "h3", "h4", "p"] },
    illustration: { control: false },
    actions: { control: false },
  },
} satisfies Meta<typeof FabricEmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FirstRun: Story = {
  args: {
    actions: (
      <>
        <FabricButton variant="contained" startIcon={<Add />}>
          New invoice
        </FabricButton>
        <FabricButton variant="outlined">Import CSV</FabricButton>
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { level: 2, name: "No invoices yet" })).toBeVisible();
    await expect(canvas.getByRole("button", { name: "New invoice" })).toBeEnabled();
  },
};

export const NoResults: Story = {
  args: {
    variant: "no-results",
    title: "No invoices match “Northwind”",
    description: "Try a different name, or clear the filters to see every invoice.",
    actions: <FabricButton variant="outlined">Clear filters</FabricButton>,
  },
};

export const LoadError: Story = {
  args: {
    variant: "error",
    title: "Couldn't load invoices",
    description: "The server didn't respond. Your data is safe; try again in a moment.",
    actions: (
      <FabricButton variant="outlined" startIcon={<Refresh />}>
        Try again
      </FabricButton>
    ),
  },
};

/** `size="sm"` inside a card or panel. */
export const InACard: Story = {
  args: {
    size: "sm",
    titleComponent: "h3",
    title: "No activity this week",
    description: "Changes to this account will appear here.",
  },
  render: (args) => (
    <FabricCard sx={{ maxWidth: 360 }}>
      <FabricEmptyState {...args} />
    </FabricCard>
  ),
};

export const CustomIllustration: Story = {
  args: {
    title: "Your team starts here",
    description: "Invite people to share records, comment and review changes together.",
    illustration: (
      <svg width="160" height="96" viewBox="0 0 160 96" role="presentation">
        <rect
          x="8"
          y="20"
          width="144"
          height="68"
          rx="12"
          fill="var(--mui-palette-action-hover)"
          stroke="var(--mui-palette-divider)"
        />
        <circle cx="56" cy="46" r="14" fill="var(--mui-palette-primary-main)" opacity="0.85" />
        <circle cx="80" cy="46" r="14" fill="var(--mui-palette-secondary-main)" opacity="0.85" />
        <circle cx="104" cy="46" r="14" fill="var(--mui-palette-text-disabled)" />
        <rect x="44" y="70" width="72" height="6" rx="3" fill="var(--mui-palette-divider)" />
      </svg>
    ),
    actions: <FabricButton variant="contained">Invite people</FabricButton>,
  },
};

export const NoImage: Story = {
  args: {
    illustration: null,
    size: "sm",
    title: "Nothing selected",
    description: "Pick a record on the left to see its details.",
  },
};

export const LongContent: Story = {
  args: {
    variant: "no-results",
    title:
      "No records match every filter: status is Overdue, owner is Priya Raman, region is EMEA and amount is over 10,000",
    description:
      "Filters narrow the list together, so each one you add removes more records. Remove a filter or two to widen the search, or save this view to check it again later.",
    actions: (
      <>
        <FabricButton variant="outlined">Remove last filter</FabricButton>
        <FabricButton variant="text">Clear all</FabricButton>
      </>
    ),
  },
};

export const OnSurface: Story = {
  render: (args) => (
    <FabricSurface sx={{ maxWidth: 640 }}>
      <FabricEmptyState {...args} />
    </FabricSurface>
  ),
};
