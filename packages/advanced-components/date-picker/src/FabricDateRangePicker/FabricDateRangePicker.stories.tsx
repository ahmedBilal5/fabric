import { Stack, Typography } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import dayjs from "dayjs";
import { useState } from "react";
import { expect, within } from "storybook/test";

import { type FabricDateRange, FabricDateRangePicker } from ".";

const meta = {
  title: "Advanced Components/FabricDateRangePicker",
  component: FabricDateRangePicker,
  tags: ["test"],
  parameters: {
    docs: {
      description: {
        component:
          "Design-system date range picker. Composed from two " +
          "`FabricDatePicker`s — no `@mui/x-date-pickers-pro` license needed. " +
          "Each side auto-clamps the other so the calendar UI cannot produce " +
          "an inverted range. Consumers get a single `onChange({ start, end })` " +
          "and optional side-specific callbacks.",
      },
    },
  },
  argTypes: {
    startLabel: { control: "text" },
    endLabel: { control: "text" },
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
    const [range, setRange] = useState<FabricDateRange>({
      start: null,
      end: null,
    });
    return <FabricDateRangePicker value={range} onChange={setRange} pickerWidth={200} />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The range picker renders two composed FabricDatePicker inputs.
    await expect(canvas.getAllByRole("group")).not.toHaveLength(0);
  },
};

export const Controlled: Story = {
  name: "Controlled — round-trip both sides",
  render: () => {
    const [range, setRange] = useState<FabricDateRange>({
      start: dayjs("2026-06-01").toDate(),
      end: dayjs("2026-06-15").toDate(),
    });
    return (
      <Stack spacing={2}>
        <FabricDateRangePicker value={range} onChange={setRange} pickerWidth={200} />
        <Typography variant="body2">
          {range.start ? range.start.toISOString() : "null"} →{" "}
          {range.end ? range.end.toISOString() : "null"}
        </Typography>
      </Stack>
    );
  },
};

export const WithAbsoluteBounds: Story = {
  name: "Absolute bounds — minDate / maxDate",
  render: () => {
    const [range, setRange] = useState<FabricDateRange>({
      start: null,
      end: null,
    });
    return (
      <FabricDateRangePicker
        startLabel="Quarter start"
        endLabel="Quarter end"
        value={range}
        onChange={setRange}
        minDate={dayjs("2026-01-01")}
        maxDate={dayjs("2026-12-31")}
        pickerWidth={200}
      />
    );
  },
};

export const ErrorState: Story = {
  render: () => {
    const [range, setRange] = useState<FabricDateRange>({
      start: null,
      end: null,
    });
    return (
      <FabricDateRangePicker
        value={range}
        onChange={setRange}
        error
        helperText="Both dates are required."
        pickerWidth={200}
      />
    );
  },
};

export const Disabled: Story = {
  render: () => (
    <FabricDateRangePicker
      value={{
        start: dayjs("2026-06-01").toDate(),
        end: dayjs("2026-06-15").toDate(),
      }}
      disabled
      pickerWidth={200}
    />
  ),
};
