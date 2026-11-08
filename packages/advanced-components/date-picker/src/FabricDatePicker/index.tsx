/**
 * FabricDatePicker — the design-system date picker.
 *
 * Wraps MUI X `<DatePicker>` with `LocalizationProvider` + `AdapterDayjs`
 * baked in, so consumers do not need to install dayjs or wrap the page in a
 * provider. `value` accepts a `Date`, a `Dayjs` or an ISO string, and
 * `onChange` fires with a plain `Date | null`.
 *
 * Design tokens drive the underlying `TextField` slot: `border.default`
 * outline, `brand.primary` focus, `radii.lg` corner radius, `status.error`
 * for the error state. First-class `label`, `required`, `error`, `helperText`
 * on the textfield slot with `useId()` linkage. `width` and `containerSx`
 * shortcut the outer wrapper. `forwardRef`, `React.memo`, `displayName` all
 * present.
 *
 * @example
 * ```tsx
 * <FabricDatePicker
 *   label="Start date"
 *   value={startDate}
 *   onChange={setStartDate}
 *   minDate={dayjs()}
 * />
 * ```
 */

import { Box } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import {
  DatePicker,
  type DatePickerProps,
  type DatePickerSlotProps,
} from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs, { type Dayjs } from "dayjs";
import { forwardRef, memo, type ReactNode, useMemo } from "react";

export type FabricDatePickerValue = Date | Dayjs | string | null | undefined;

export interface FabricDatePickerProps
  extends Omit<DatePickerProps, "value" | "onChange" | "label" | "slotProps"> {
  /** Currently selected date. Accepts a native `Date`, a `Dayjs`, an ISO string, or `null`. */
  value: FabricDatePickerValue;
  /** MUI-standard change handler; fires with a plain `Date | null`. */
  onChange?: (
    date: Date | null,
    context?: Parameters<NonNullable<DatePickerProps["onChange"]>>[1],
  ) => void;
  /** Label above the picker. */
  label?: ReactNode;
  /** Width of the input. Shortcut for `sx.width`. */
  width?: string | number;
  /** Show the required-asterisk on the label. */
  required?: boolean;
  /** Error state routes through `status.error` design token. */
  error?: boolean;
  /** Helper text below the picker. `aria-describedby` wired via `useId()`. */
  helperText?: ReactNode;
  /** Outer container sx. */
  containerSx?: SxProps<Theme>;
  /** Pass-through overrides for individual MUI X `DatePicker` slots. */
  slotProps?: DatePickerSlotProps;
}

function toDayjs(value: FabricDatePickerValue): Dayjs | null {
  if (value === null || value === undefined || value === "") return null;
  if (dayjs.isDayjs(value)) return value;
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed : null;
}

const FabricDatePickerImpl = forwardRef<HTMLDivElement, FabricDatePickerProps>(
  function FabricDatePicker(
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
      ...datePickerProps
    },
    ref,
  ) {
    const normalizedValue = useMemo(() => toDayjs(value), [value]);

    const handleChange: NonNullable<DatePickerProps["onChange"]> = (next, context) => {
      const asDayjs = next as Dayjs | null;
      const asDate = asDayjs?.isValid() ? asDayjs.toDate() : null;
      onChange?.(asDate, context);
    };

    // Design-token driven textfield slot; consumer slotProps.textField wins.
    const consumerTextField = consumerSlotProps?.textField;
    const consumerFieldProps = consumerSlotProps?.field;

    return (
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Box ref={ref} sx={containerSx}>
          <DatePicker
            value={normalizedValue}
            onChange={handleChange}
            disabled={disabled}
            {...datePickerProps}
            slotProps={{
              ...consumerSlotProps,
              field: {
                clearable: true,
                // Calendar icon at the start.
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

FabricDatePickerImpl.displayName = "FabricDatePicker";

export const FabricDatePicker = memo(FabricDatePickerImpl);
