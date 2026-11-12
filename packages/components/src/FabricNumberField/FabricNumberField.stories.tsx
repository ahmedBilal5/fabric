import { Box } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { FabricNumberField, type FabricNumberFieldProps } from ".";

const meta = {
  title: "Components/FabricNumberField",
  component: FabricNumberField,
  tags: ["test"],
  parameters: { layout: "padded" },
  args: { label: "Seats", value: 12 },
} satisfies Meta<typeof FabricNumberField>;
export default meta;
type Story = StoryObj<typeof meta>;

function Controlled(props: Partial<FabricNumberFieldProps> & { initial?: number | null }) {
  const { initial = null, ...rest } = props;
  const [value, setValue] = useState<number | null>(initial);
  return (
    <Box sx={{ width: 280 }}>
      <FabricNumberField label="Value" {...rest} value={value} onChange={setValue} fullWidth />
    </Box>
  );
}

/** Whole numbers with − and + buttons. */
export const Default: Story = {
  render: (args) => <Controlled label={args.label} initial={12} min={1} max={500} maximumFractionDigits={0} />,
};

/** Currency formats on blur: type 12480, see $12,480.00. */
export const Currency: Story = {
  render: () => (
    <Controlled
      label="Monthly budget"
      initial={12480}
      format={{ style: "currency", currency: "USD" }}
      minimumFractionDigits={2}
      maximumFractionDigits={2}
      min={0}
      step={100}
    />
  ),
};

/** Percent shows the number as typed: 15 is 15%. */
export const Percent: Story = {
  render: () => <Controlled label="Discount" initial={15} format={{ style: "percent" }} min={0} max={100} step={5} />,
};

/** Units come from `Intl`, so they're translated: kg, km/h, GB. */
export const Units: Story = {
  render: () => (
    <Box sx={{ display: "grid", gap: 2 }}>
      <Controlled label="Weight" initial={2.5} format={{ style: "unit", unit: "kilogram" }} step={0.5} />
      <Controlled label="Storage" initial={250} format={{ style: "unit", unit: "gigabyte" }} step={50} />
      <Controlled label="Seats" initial={8} suffix="seats" stepper={false} />
    </Box>
  ),
};

/** Another locale reads and writes its own separators: 1.234,5 in German. */
export const OtherLocale: Story = {
  render: () => (
    <Controlled
      label="Betrag"
      locale="de-DE"
      initial={1234.5}
      format={{ style: "currency", currency: "EUR" }}
      minimumFractionDigits={2}
    />
  ),
};

/** Disabled, read-only and error states. */
export const States: Story = {
  render: () => (
    <Box sx={{ display: "grid", gap: 2 }}>
      <Controlled label="Disabled" initial={4} disabled />
      <Controlled label="Read only" initial={4} slotProps={{ htmlInput: { readOnly: true } }} />
      <Controlled label="Seats" initial={0} error helperText="Add at least 1 seat." />
    </Box>
  ),
};

/** Arrow keys step, Shift steps by 10, and limits apply on blur. */
export const Keyboard: Story = {
  render: () => <Controlled label="Seats" initial={5} min={1} max={20} maximumFractionDigits={0} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("spinbutton", { name: "Seats" });
    await userEvent.click(input);
    await userEvent.keyboard("{ArrowUp}{ArrowUp}");
    await expect(input).toHaveValue("7");
    await userEvent.keyboard("{Shift>}{ArrowUp}{/Shift}");
    await expect(input).toHaveValue("17");
    await userEvent.clear(input);
    await userEvent.type(input, "99");
    await userEvent.tab();
    await expect(input).toHaveValue("20");
    await userEvent.click(canvas.getByRole("button", { name: "Decrease" }));
    await expect(input).toHaveValue("19");
  },
};
