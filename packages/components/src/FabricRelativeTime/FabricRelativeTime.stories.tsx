import { FabricStack } from "@fabric-kit/primitives";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { FabricRelativeTime } from ".";

const MIN = 60_000;
const now = Date.now();

const meta = {
  title: "Components/FabricRelativeTime",
  component: FabricRelativeTime,
  tags: ["test"],
  args: { date: now - 3 * MIN, tooltip: true },
  argTypes: {
    date: { control: "date" },
    style: { control: "radio", options: ["long", "short", "narrow"] },
    numeric: { control: "radio", options: ["auto", "always"] },
    locale: { control: "text" },
  },
} satisfies Meta<typeof FabricRelativeTime>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const time = canvas.getByText("3 minutes ago");
    await expect(time.tagName).toBe("TIME");
    await expect(time).toHaveAttribute("dateTime", new Date(now - 3 * MIN).toISOString());
    await userEvent.hover(time);
    await waitFor(() => expect(within(document.body).getByRole("tooltip")).toBeVisible());
  },
};

export const Ranges: Story = {
  render: (args) => (
    <FabricStack gap="xs">
      {[10_000, 3 * MIN, 2 * 60 * MIN, 26 * 60 * MIN, 9 * 24 * 60 * MIN, 400 * 24 * 60 * MIN].map(
        (ago) => (
          <FabricRelativeTime key={ago} {...args} date={now - ago} />
        ),
      )}
      <FabricRelativeTime {...args} date={now + 2 * 60 * MIN} />
    </FabricStack>
  ),
};

export const ShortStyle: Story = { args: { date: now - 12 * MIN, style: "short" } };

export const OtherLocale: Story = { args: { date: now - 26 * 60 * MIN, locale: "de" } };

/** `tooltip={false}` for places that already show the exact time. */
export const WithoutTooltip: Story = { args: { tooltip: false } };
