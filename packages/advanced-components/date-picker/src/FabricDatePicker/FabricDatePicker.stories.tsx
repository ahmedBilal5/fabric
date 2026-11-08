import { Box, Stack, Typography } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import dayjs from "dayjs";
import { useState } from "react";
import { expect, within } from "storybook/test";

import { FabricDatePicker } from ".";

const meta = {
  title: "Advanced Components/FabricDatePicker",
  component: FabricDatePicker,
  tags: ["test"],
  parameters: {
    docs: {
      description: {
        component:
          "Design-system date picker. Wraps MUI X `<DatePicker>` with " +
          "`LocalizationProvider` + `AdapterDayjs` baked in so consumers " +
          "don't need to wrap the tree in a provider. " +
          "`value` accepts `Date`, `Dayjs`, ISO string, or `null`; `onChange` " +
          "always fires with a plain `Date | null`.",
      },
    },
  },
  argTypes: {
    label: { control: "text" },
    width: { control: "text" },
    required: { control: "boolean" },
    error: { control: "boolean" },
    disabled: { control: "boolean" },
    helperText: { control: "text" },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

// ─── Basics ─────────────────────────────────────────────────────────────

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState<Date | null>(null);
    return <FabricDatePicker label="Start date" value={value} onChange={setValue} width={220} />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // MUI X DatePicker exposes a group labelled by the `label` prop.
    await expect(canvas.getByRole("group", { name: /start date/i })).toBeInTheDocument();
  },
};

export const Controlled: Story = {
  name: "Controlled — selected value round-trips as `Date`",
  render: () => {
    const [value, setValue] = useState<Date | null>(new Date());
    return (
      <Stack spacing={2}>
        <FabricDatePicker label="Launch date" value={value} onChange={setValue} width={220} />
        <Typography variant="body2">Selected: {value ? value.toISOString() : "null"}</Typography>
      </Stack>
    );
  },
};

// ─── States ─────────────────────────────────────────────────────────────

export const States: Story = {
  render: () => (
    <Stack spacing={3} sx={{ width: 240 }}>
      <FabricDatePicker label="Default" value={null} onChange={() => {}} />
      <FabricDatePicker label="Filled" value={new Date()} onChange={() => {}} />
      <FabricDatePicker label="Required" required value={null} onChange={() => {}} />
      <FabricDatePicker
        label="Error"
        error
        helperText="This field is required."
        value={null}
        onChange={() => {}}
      />
      <FabricDatePicker label="Disabled" disabled value={new Date()} />
    </Stack>
  ),
};

// ─── Constraints ────────────────────────────────────────────────────────

export const MinMaxRange: Story = {
  name: "Constraint — minDate / maxDate",
  render: () => {
    const [value, setValue] = useState<Date | null>(null);
    return (
      <FabricDatePicker
        label="Quarter"
        value={value}
        onChange={setValue}
        minDate={dayjs("2026-01-01")}
        maxDate={dayjs("2026-03-31")}
        width={220}
      />
    );
  },
};

// ─── Layout ─────────────────────────────────────────────────────────────

export const FullWidth: Story = {
  name: "Layout — no `width` = fullWidth",
  render: () => {
    const [value, setValue] = useState<Date | null>(null);
    return (
      <Box sx={{ maxWidth: 480 }}>
        <FabricDatePicker label="Full width" value={value} onChange={setValue} />
      </Box>
    );
  },
};
