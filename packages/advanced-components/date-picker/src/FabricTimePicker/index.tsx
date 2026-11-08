/**
 * FabricTimePicker — the design-system time picker.
 *
 * Same shape as `FabricDatePicker` but for time-of-day. `LocalizationProvider`
 * + `AdapterDayjs` baked in; `value` accepts `Date`, `Dayjs`, ISO string, or
 * `null`; `onChange` fires with a plain `Date | null`.
 *
 * @example
 * ```tsx
 * <FabricTimePicker
 *   label="Delivery window start"
 *   value={time}
 *   onChange={setTime}
 * />
 * ```
 */

import { Box } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import {
  TimePicker,
  type TimePickerProps,
  type TimePickerSlotProps,
} from "@mui/x-date-pickers/TimePicker";
import dayjs, { type Dayjs } from "dayjs";
import { forwardRef, memo, type ReactNode, useMemo } from "react";

import { renderStandaloneTimePanel } from "../FabricDateTimePicker/renderers";

export type FabricTimePickerValue = Date | Dayjs | string | null | undefined;

export interface FabricTimePickerProps
  extends Omit<TimePickerProps, "value" | "onChange" | "label" | "slotProps"> {
  /** Currently selected time. Accepts a native `Date`, a `Dayjs`, an ISO string, or `null`. */
  value: FabricTimePickerValue;
  /** MUI-standard change handler; fires with a plain `Date | null`. */
  onChange?: (
    date: Date | null,
    context?: Parameters<NonNullable<TimePickerProps["onChange"]>>[1],
  ) => void;
  /** Label above the picker. */
  label?: ReactNode;
  /** Width of the input; omit for full width. */
  width?: string | number;
  required?: boolean;
  error?: boolean;
  helperText?: ReactNode;
  containerSx?: SxProps<Theme>;
  slotProps?: TimePickerSlotProps;
}

function toDayjs(value: FabricTimePickerValue): Dayjs | null {
  if (value === null || value === undefined || value === "") return null;
  if (dayjs.isDayjs(value)) return value;
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed : null;
}

const FabricTimePickerImpl = forwardRef<HTMLDivElement, FabricTimePickerProps>(
  function FabricTimePicker(
    {
      value,
      onChange,
      label,
      width,
      required = false,
      error,
      helperText,
      containerSx,
      slotProps: consumerSlotProps,
      disabled,
      ...timePickerProps
    },
    ref,
  ) {
    const normalizedValue = useMemo(() => toDayjs(value), [value]);

    const handleChange: NonNullable<TimePickerProps["onChange"]> = (next, context) => {
      const asDayjs = next as Dayjs | null;
      const asDate = asDayjs?.isValid() ? asDayjs.toDate() : null;
      onChange?.(asDate, context);
    };

    const consumerTextField = consumerSlotProps?.textField;

    return (
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Box ref={ref} sx={containerSx}>
          <TimePicker
            value={normalizedValue}
            onChange={handleChange}
            disabled={disabled}
            // Same time panel as the date + time picker, one-step columns.
            timeSteps={{ hours: 1, minutes: 1, seconds: 1 }}
            viewRenderers={{
              hours: renderStandaloneTimePanel,
              minutes: renderStandaloneTimePanel,
              seconds: renderStandaloneTimePanel,
            }}
            {...timePickerProps}
            slotProps={{
              ...consumerSlotProps,
              // No Cancel / OK bar: changes apply as the user picks.
              actionBar: { actions: [] },
              // Same field as the date picker: icon at the start, floating label.
              field: {
                openPickerButtonPosition: "start",
                ...(typeof consumerSlotProps?.field === "function"
                  ? undefined
                  : consumerSlotProps?.field),
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
                      // Outline / radius / colors come from the theme; match the 40px field height.
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

FabricTimePickerImpl.displayName = "FabricTimePicker";

export const FabricTimePicker = memo(FabricTimePickerImpl);
