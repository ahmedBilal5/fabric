import { Stack, Typography } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import dayjs from "dayjs";
import { useState } from "react";
import { expect, within } from "storybook/test";

import { FabricTimePicker } from ".";

const meta = {
  title: "Advanced Components/FabricTimePicker",
  component: FabricTimePicker,
  tags: ["test"],
  parameters: {
    docs: {
      description: {
        component:
          "Design-system time picker. Same shape as `FabricDatePicker` but " +
          "for time-of-day. `LocalizationProvider` + `AdapterDayjs` baked in; " +
          "`value` accepts `Date`, `Dayjs`, ISO string, or `null`; `onChange` " +
          "fires with a plain `Date | null`.",
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

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState<Date | null>(null);
    return <FabricTimePicker label="Start time" value={value} onChange={setValue} width={220} />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("group", { name: /start time/i })).toBeInTheDocument();
  },
};

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState<Date | null>(dayjs().hour(9).minute(0).toDate());
    return (
      <Stack spacing={2}>
        <FabricTimePicker label="Meeting time" value={value} onChange={setValue} width={220} />
        <Typography variant="body2">Selected: {value ? value.toISOString() : "null"}</Typography>
      </Stack>
    );
  },
};

export const States: Story = {
  render: () => (
    <Stack spacing={3} sx={{ width: 240 }}>
      <FabricTimePicker label="Default" value={null} onChange={() => {}} />
      <FabricTimePicker label="Required" required value={null} onChange={() => {}} />
      <FabricTimePicker
        label="Error"
        error
        helperText="Please choose a time between 09:00 and 17:00."
        value={null}
        onChange={() => {}}
      />
      <FabricTimePicker
        label="Disabled"
        disabled
        value={dayjs().hour(14).minute(30).toDate()}
      />
    </Stack>
  ),
};
