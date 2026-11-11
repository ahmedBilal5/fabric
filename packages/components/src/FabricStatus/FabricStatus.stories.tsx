import { FabricStack } from "@fabric-kit/primitives";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { FabricStatus, type FabricStatusColor } from ".";

const ALL: [FabricStatusColor, string][] = [
  ["success", "Active"],
  ["running", "Deploying"],
  ["queued", "Queued"],
  ["warning", "Degraded"],
  ["error", "Failed"],
  ["cancelled", "Cancelled"],
  ["suspended", "Suspended"],
  ["archived", "Archived"],
  ["unknown", "Unknown"],
];

const meta = {
  title: "Components/FabricStatus",
  component: FabricStatus,
  tags: ["test"],
  args: { status: "success", label: "Active", size: "md", pulse: false },
  argTypes: {
    status: { control: "select", options: ALL.map(([s]) => s) },
    size: { control: "radio", options: ["sm", "md"] },
    label: { control: "text" },
  },
} satisfies Meta<typeof FabricStatus>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("Active")).toBeVisible();
  },
};

export const AllStatuses: Story = {
  render: (args) => (
    <FabricStack gap="sm">
      {ALL.map(([status, label]) => (
        <FabricStatus key={status} {...args} status={status} label={label} />
      ))}
    </FabricStack>
  ),
};

/** `pulse` for work in progress. The dot stays still when reduced motion is on. */
export const Pulsing: Story = { args: { status: "running", label: "Deploying", pulse: true } };

export const Small: Story = {
  render: (args) => (
    <FabricStack gap="xs">
      {ALL.slice(0, 5).map(([status, label]) => (
        <FabricStatus key={status} {...args} size="sm" status={status} label={label} />
      ))}
    </FabricStack>
  ),
};

/** Without a label, give the dot an `aria-label`. */
export const DotOnly: Story = {
  args: { label: undefined, status: "error", "aria-label": "Failed" },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("img", { name: "Failed" })).toBeInTheDocument();
  },
};

export const LongLabel: Story = {
  args: { status: "warning", label: "Degraded performance in eu-west-1 since 09:40 UTC" },
  render: (args) => (
    <div style={{ width: 220 }}>
      <FabricStatus {...args} />
    </div>
  ),
};
