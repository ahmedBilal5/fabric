import Edit from "@fabric-kit/icons/Edit";
import Send from "@fabric-kit/icons/Send";
import Sync from "@fabric-kit/icons/Sync";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, within } from "storybook/test";
import { FabricEmptyState } from "../FabricEmptyState";
import { FabricStatus } from "../FabricStatus";
import { FabricActivityFeed, type FabricActivityItem } from ".";

const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;
const now = Date.now();

const quote = (text: string) => (
  <div
    style={{
      padding: "8px 12px",
      borderRadius: 8,
      border: "1px solid var(--mui-palette-divider)",
      background: "var(--mui-palette-background-default)",
    }}
  >
    {text}
  </div>
);

const events: FabricActivityItem[] = [
  {
    id: 1,
    actor: { name: "Jane Doe" },
    action: "changed the status to",
    target: <FabricStatus status="success" label="Paid" />,
    date: now - 3 * MIN,
  },
  {
    id: 2,
    actor: "Sam Lee",
    action: "commented",
    date: now - 40 * MIN,
    content: quote("Customer confirmed the bank transfer went out this morning."),
  },
  {
    id: 3,
    actor: "System",
    icon: <Sync />,
    color: "running",
    action: "synced with",
    target: "Northwind ERP",
    date: now - 5 * HOUR,
  },
  {
    id: 4,
    actor: { name: "Jane Doe" },
    icon: <Send />,
    action: "sent the invoice to",
    target: "billing@northwind.example.com",
    date: now - DAY - 2 * HOUR,
  },
  {
    id: 5,
    actor: "Priya Patel",
    icon: <Edit />,
    action: "changed the amount from $12,000.00 to",
    target: "$12,480.00",
    date: now - DAY - 3 * HOUR,
  },
  { id: 6, actor: "Priya Patel", action: "created", target: "INV-2041", date: now - 6 * DAY },
];

const meta = {
  title: "Components/FabricActivityFeed",
  component: FabricActivityFeed,
  tags: ["test"],
  args: { items: events, groupByDay: true, dense: false, loading: false },
  argTypes: { items: { control: false }, emptyState: { control: false } },
  decorators: [(Story) => <div style={{ maxWidth: 560 }}>{Story()}</div>],
} satisfies Meta<typeof FabricActivityFeed>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: "Today" })).toBeVisible();
    await expect(canvas.getByRole("heading", { name: "Yesterday" })).toBeVisible();
    await expect(canvas.getAllByRole("listitem")).toHaveLength(events.length);
    await expect(canvas.getByText("3 minutes ago")).toBeVisible();
  },
};

export const Ungrouped: Story = { args: { groupByDay: false } };

/** `dense` for side panels. */
export const Dense: Story = {
  args: { dense: true },
  decorators: [(Story) => <div style={{ maxWidth: 340 }}>{Story()}</div>],
};

export const Loading: Story = {
  args: { loading: true },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByLabelText("Loading activity")).toHaveAttribute(
      "aria-busy",
      "true",
    );
  },
};

export const Empty: Story = {
  args: {
    items: [],
    emptyState: (
      <FabricEmptyState size="sm" title="No activity yet" description="Changes to this invoice show up here." />
    ),
  },
};

const more = fn();

/** Paging: your code fetches; the feed shows "Show more" while `hasMore`. */
export const LoadMore: Story = {
  args: { onLoadMore: more },
  render: function Render(args) {
    const [count, setCount] = useState(3);
    return (
      <FabricActivityFeed
        {...args}
        items={events.slice(0, count)}
        hasMore={count < events.length}
        onLoadMore={() => {
          args.onLoadMore?.();
          setCount((c) => c + 3);
        }}
      />
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole("listitem")).toHaveLength(3);
    await userEvent.click(canvas.getByRole("button", { name: "Show more" }));
    await expect(more).toHaveBeenCalled();
    await expect(canvas.getAllByRole("listitem")).toHaveLength(6);
    await expect(canvas.queryByRole("button", { name: "Show more" })).toBeNull();
  },
};
