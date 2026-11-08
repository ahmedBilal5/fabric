/**
 * FabricDateTimePicker — the design-system date + time picker.
 *
 * Same shape as `FabricDatePicker`, wrapping MUI X `<DateTimePicker>` with
 * `LocalizationProvider` + `AdapterDayjs` baked in. `value` accepts `Date`,
 * `Dayjs`, an ISO string or `null`; `onChange` fires with a plain `Date | null`.
 *
 * Layout: a calendar beside hour / minute / second
 * columns. Seconds are shown by default (`withSeconds`) and the clock is 12-hour
 * with an AM/PM column unless `ampm={false}`.
 *
 * @example
 * ```tsx
 * <FabricDateTimePicker label="Starts at" value={startsAt} onChange={setStartsAt} />
 * ```
 */

import { Box } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import {
  DateTimePicker,
  type DateTimePickerProps,
  type DateTimePickerSlotProps,
} from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs, { type Dayjs } from "dayjs";
import { forwardRef, memo, type ReactNode, useMemo } from "react";

import { renderDatePanel, renderTimePanel } from "./renderers";

export type FabricDateTimePickerValue = Date | Dayjs | string | null | undefined;

export interface FabricDateTimePickerProps
  extends Omit<DateTimePickerProps, "value" | "onChange" | "label" | "slotProps"> {
  /** Currently selected date and time. Accepts a native `Date`, a `Dayjs`, an ISO string, or `null`. */
  value: FabricDateTimePickerValue;
  /** MUI-standard change handler; fires with a plain `Date | null`. */
  onChange?: (
    date: Date | null,
    context?: Parameters<NonNullable<DateTimePickerProps["onChange"]>>[1],
  ) => void;
  /** Label of the field. Widened from `string` to `ReactNode`. */
  label?: ReactNode;
  /** Width of the input; omit for full width. */
  width?: string | number;
  /** Show seconds in the field and as a third time column. Defaults to `true`. */
  withSeconds?: boolean;
  required?: boolean;
  error?: boolean;
  helperText?: ReactNode;
  containerSx?: SxProps<Theme>;
  /** Pass-through overrides for individual MUI X `DateTimePicker` slots. */
  slotProps?: DateTimePickerSlotProps;
}

function toDayjs(value: FabricDateTimePickerValue): Dayjs | null {
  if (value === null || value === undefined || value === "") return null;
  if (dayjs.isDayjs(value)) return value;
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed : null;
}

const FabricDateTimePickerImpl = forwardRef<HTMLDivElement, FabricDateTimePickerProps>(
  function FabricDateTimePicker(
    {
      value,
      onChange,
      label,
      width,
      withSeconds = true,
      required = false,
      error,
      helperText,
      containerSx,
      slotProps: consumerSlotProps,
      disabled,
      ...dateTimePickerProps
    },
    ref,
  ) {
    const normalizedValue = useMemo(() => toDayjs(value), [value]);

    const handleChange: NonNullable<DateTimePickerProps["onChange"]> = (next, context) => {
      const asDayjs = next as Dayjs | null;
      onChange?.(asDayjs?.isValid() ? asDayjs.toDate() : null, context);
    };

    const consumerTextField = consumerSlotProps?.textField;
    const consumerFieldProps = consumerSlotProps?.field;

    return (
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Box ref={ref} sx={containerSx}>
          <DateTimePicker
            value={normalizedValue}
            onChange={handleChange}
            disabled={disabled}
            views={
              withSeconds
                ? ["year", "day", "hours", "minutes", "seconds"]
                : ["year", "day", "hours", "minutes"]
            }
            timeSteps={{ hours: 1, minutes: 1, seconds: 1 }}
            viewRenderers={{
              day: renderDatePanel,
              month: renderDatePanel,
              year: renderDatePanel,
              hours: renderTimePanel,
              minutes: renderTimePanel,
              seconds: renderTimePanel,
            }}
            {...dateTimePickerProps}
            slotProps={{
              ...consumerSlotProps,
              // No Cancel / OK bar: changes apply as the user picks.
              actionBar: { actions: [] },
              field: {
                clearable: true,
                openPickerButtonPosition: "start",
                ...(typeof consumerFieldProps === "function" ? undefined : consumerFieldProps),
              },
              textField: (ownerState) => {
                const resolvedConsumer =
                  typeof consumerTextField === "function"
                    ? consumerTextField(ownerState)
                    : consumerTextField;
                return {
                  fullWidth: width === undefined,
                  size: "small",
                  label,
                  required,
                  error,
                  helperText,
                  ...resolvedConsumer,
                  sx: [
                    {
                      width,
                      "& .MuiPickersInputBase-root": { height: 40 },
                    },
                    ...(Array.isArray(resolvedConsumer?.sx)
                      ? resolvedConsumer.sx
                      : resolvedConsumer?.sx
                        ? [resolvedConsumer.sx]
                        : []),
                  ],
                };
              },
            }}
          />
        </Box>
      </LocalizationProvider>
    );
  },
);

FabricDateTimePickerImpl.displayName = "FabricDateTimePicker";

export const FabricDateTimePicker = memo(FabricDateTimePickerImpl);
