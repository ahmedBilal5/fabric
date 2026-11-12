import { Stack, Typography } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import dayjs from "dayjs";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";

import { type FabricDateRange, FabricDateRangePicker, dateRangePresets } from ".";

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

const TODAY = new Date(2026, 10, 12);

/** Quick ranges above the pickers. `presets` uses six common ones; the active one is highlighted. */
export const WithPresets: Story = {
  render: () => {
    const [range, setRange] = useState<FabricDateRange>({ start: null, end: null });
    return (
      <Stack spacing={1} sx={{ maxWidth: 520 }}>
        <FabricDateRangePicker value={range} onChange={setRange} presets today={TODAY} />
      </Stack>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const last7 = canvas.getByRole("button", { name: "Last 7 days" });
    await userEvent.click(last7);
    await expect(last7).toHaveAttribute("aria-pressed", "true");
    await expect(canvas.getByRole("group", { name: "Quick ranges" })).toBeInTheDocument();
  },
};

/** Your own list, mixing built-ins with a custom "Fiscal year to date". */
export const CustomPresets: Story = {
  render: () => {
    const [range, setRange] = useState<FabricDateRange>({ start: null, end: null });
    return (
      <Stack spacing={1} sx={{ maxWidth: 520 }}>
        <FabricDateRangePicker
          value={range}
          onChange={setRange}
          today={TODAY}
          presets={[
            dateRangePresets.today,
            dateRangePresets.yesterday,
            dateRangePresets.last30Days,
            {
              id: "fiscalYtd",
              label: "Fiscal year to date",
              // Fiscal year starts on 1 April.
              getRange: (t) => ({
                start: new Date(t.getMonth() >= 3 ? t.getFullYear() : t.getFullYear() - 1, 3, 1),
                end: t,
              }),
            },
          ]}
        />
      </Stack>
    );
  },
};
