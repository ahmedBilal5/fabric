import Box from "@mui/material/Box";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { FabricMeter } from ".";

const meta = {
  title: "Components/FabricMeter",
  component: FabricMeter,
  tags: ["test"],
  parameters: { layout: "padded" },
  args: { label: "Seats", value: 6, max: 10, unit: "seats" },
} satisfies Meta<typeof FabricMeter>;
export default meta;
type Story = StoryObj<typeof meta>;

const Stack = ({ children }: { children: React.ReactNode }) => (
  <Box sx={{ display: "grid", gap: 3, maxWidth: 420 }}>{children}</Box>
);

/** Usage against a limit. */
export const Default: Story = {
  render: (args) => (
    <Box sx={{ maxWidth: 420 }}>
      <FabricMeter {...args} />
    </Box>
  ),
};

/** A quota turns amber at 80% and red at the limit, and says so in words. */
export const QuotaLevels: Story = {
  render: () => (
    <Stack>
      <FabricMeter label="Seats" value={6} max={10} unit="seats" />
      <FabricMeter label="Seats" value={8} max={10} unit="seats" />
      <FabricMeter label="Seats" value={10} max={10} unit="seats" />
      <FabricMeter label="Seats" value={12} max={10} unit="seats" helperText="2 people can't sign in until you add seats." />
    </Stack>
  ),
};

/** Formats and custom wording. */
export const Formats: Story = {
  render: () => (
    <Stack>
      <FabricMeter label="Storage" value={4.2} max={10} valueText="4.2 GB of 10 GB" helperText="Resets never. Delete old files to free space." />
      <FabricMeter label="API calls this month" value={182_400} max={250_000} format="percent" helperText="Resets on 1 December." />
      <FabricMeter
        label="Monthly budget"
        value={9_400}
        max={10_000}
        valueText="$9,400 of $10,000"
        thresholds={{ warning: 0.9, critical: 1 }}
        statusText={{ warning: "Close to budget" }}
      />
    </Stack>
  ),
};

/** `kind="progress"` for how far along a task is. Always the brand color. */
export const Progress: Story = {
  render: () => (
    <Stack>
      <FabricMeter kind="progress" label="Account setup" value={3} max={5} unit="steps" />
      <FabricMeter kind="progress" label="Import" value={64} format="percent" helperText="About 2 minutes left." />
    </Stack>
  ),
};

/** `size="small"` and `hideLabel` for tables and dense lists. */
export const InATable: Story = {
  render: () => (
    <Box component="table" sx={{ borderCollapse: "collapse", fontSize: 14, "& td, & th": { py: 1, pr: 3, textAlign: "left" } }}>
      <thead>
        <tr>
          <th>Workspace</th>
          <th style={{ width: 200 }}>Seats used</th>
        </tr>
      </thead>
      <tbody>
        {[
          ["Northwind Traders", 18, 25],
          ["Acme Corporation", 47, 50],
          ["Contoso Ltd", 12, 10],
        ].map(([name, used, total]) => (
          <tr key={name}>
            <td>{name}</td>
            <td>
              <FabricMeter
                size="small"
                hideLabel
                label={`${name} seats`}
                value={used as number}
                max={total as number}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </Box>
  ),
};

/** Screen readers hear the label, the value in words and the status. */
export const ScreenReader: Story = {
  render: () => (
    <Stack>
      <FabricMeter label="Seats" value={9} max={10} unit="seats" />
      <FabricMeter kind="progress" label="Account setup" value={3} max={5} unit="steps" />
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const meter = canvas.getByRole("meter", { name: "Seats" });
    await expect(meter).toHaveAttribute("aria-valuetext", "9 of 10 seats, Nearly full");
    await expect(meter).toHaveAttribute("aria-valuenow", "9");
    const progress = canvas.getByRole("progressbar", { name: "Account setup" });
    await expect(progress).toHaveAttribute("aria-valuetext", "3 of 5 steps");
  },
};
