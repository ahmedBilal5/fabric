import { Stack, Typography } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import dayjs from "dayjs";
import { useState } from "react";
import { expect, within } from "storybook/test";

import { FabricDateTimePicker } from ".";

const meta = {
  title: "Advanced Components/FabricDateTimePicker",
  component: FabricDateTimePicker,
  tags: ["test"],
  parameters: {
    docs: {
      description: {
        component:
          "Design-system date + time picker. Same shape as `FabricDatePicker`: " +
          "`LocalizationProvider` + `AdapterDayjs` baked in; `value` accepts `Date`, " +
          "`Dayjs`, ISO string, or `null`; `onChange` fires with a plain `Date | null`.",
      },
    },
  },
  argTypes: {
    label: { control: "text" },
    width: { control: "text" },
    withSeconds: { control: "boolean" },
    ampm: { control: "boolean" },
    required: { control: "boolean" },
    error: { control: "boolean" },
    disabled: { control: "boolean" },
    helperText: { control: "text" },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState<Date | null>(null);
    return <FabricDateTimePicker label="Starts at" value={value} onChange={setValue} width={300} />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("group", { name: /starts at/i })).toBeInTheDocument();
  },
};

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState<Date | null>(
      dayjs("2026-01-06").hour(9).minute(30).second(0).toDate(),
    );
    return (
      <Stack spacing={2}>
        <FabricDateTimePicker label="Meeting" value={value} onChange={setValue} width={300} />
        <Typography variant="body2">Selected: {value ? value.toISOString() : "null"}</Typography>
      </Stack>
    );
  },
};

export const WithoutSeconds: Story = {
  render: () => {
    const [value, setValue] = useState<Date | null>(null);
    return (
      <FabricDateTimePicker
        label="Starts at"
        withSeconds={false}
        ampm={false}
        value={value}
        onChange={setValue}
        width={300}
      />
    );
  },
};

export const States: Story = {
  render: () => (
    <Stack spacing={3} sx={{ width: 300 }}>
      <FabricDateTimePicker label="Default" value={null} onChange={() => {}} />
      <FabricDateTimePicker label="Required" required value={null} onChange={() => {}} />
      <FabricDateTimePicker
        label="Error"
        error
        helperText="Please choose a date and time."
        value={null}
        onChange={() => {}}
      />
      <FabricDateTimePicker label="Disabled" disabled value={dayjs().toDate()} />
    </Stack>
  ),
};
