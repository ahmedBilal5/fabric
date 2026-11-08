/**
 * FabricDateRangePicker — the design-system date range picker.
 *
 * Composed from two `FabricDatePicker`s (no `@mui/x-date-pickers-pro` dep, so
 * no MUI X paid-license requirement). The start-date's `maxDate` is bound to
 * the end-date value and vice-versa, so the calendar UI can't produce an
 * inverted range. Consumers receive `onChange({ start, end })` (both sides in
 * one payload) plus optional side-specific `onStartChange` / `onEndChange`.
 *
 * The two pickers share a single `LocalizationProvider` at this level so we
 * don't re-mount the dayjs adapter twice.
 *
 * @example
 * ```tsx
 * <FabricDateRangePicker
 *   startLabel="From"
 *   endLabel="To"
 *   value={range}
 *   onChange={setRange}
 * />
 * ```
 */

import { spacing } from "@fabric-kit/design-tokens";
import { Box, Typography } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs, { type Dayjs } from "dayjs";
import { forwardRef, memo, type ReactNode, useCallback, useMemo } from "react";
import { FabricDatePicker, type FabricDatePickerValue } from "../FabricDatePicker";

export interface FabricDateRange {
  start: Date | null;
  end: Date | null;
}

export interface FabricDateRangePickerProps {
  /** Current range. Each side accepts `Date`, `Dayjs`, ISO string, or `null`. */
  value: {
    start: FabricDatePickerValue;
    end: FabricDatePickerValue;
  };
  /** Fires with the full range whenever either side changes. */
  onChange?: (range: FabricDateRange) => void;
  /** Side-specific callbacks. Fire after `onChange`. */
  onStartChange?: (date: Date | null) => void;
  onEndChange?: (date: Date | null) => void;
  /** Labels for each side. Defaults: "From" / "To". */
  startLabel?: ReactNode;
  endLabel?: ReactNode;
  /** Overall required / error state — applied to both sides. */
  required?: boolean;
  error?: boolean;
  /** Helper text below the range, spanning both pickers. */
  helperText?: ReactNode;
  /** Absolute lower bound for the start picker; upper bound for the end picker. */
  minDate?: Dayjs;
  maxDate?: Dayjs;
  /** Disable both sides. */
  disabled?: boolean;
  /** Width of each individual picker. Omit for both sides to grow evenly. */
  pickerWidth?: string | number;
  /** Outer container sx. */
  sx?: SxProps<Theme>;
  /** Custom separator between the two pickers. Defaults to a dash `—`. */
  separator?: ReactNode;
}

function toDayjs(value: FabricDatePickerValue): Dayjs | null {
  if (value === null || value === undefined || value === "") return null;
  if (dayjs.isDayjs(value)) return value;
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed : null;
}

const FabricDateRangePickerImpl = forwardRef<HTMLDivElement, FabricDateRangePickerProps>(
  function FabricDateRangePicker(
    {
      value,
      onChange,
      onStartChange,
      onEndChange,
      startLabel = "From",
      endLabel = "To",
      required = false,
      error,
      helperText,
      minDate,
      maxDate,
      disabled,
      pickerWidth,
      sx,
      separator = "—",
    },
    ref,
  ) {
    const startAsDayjs = useMemo(() => toDayjs(value.start), [value.start]);
    const endAsDayjs = useMemo(() => toDayjs(value.end), [value.end]);

    const currentRange = useMemo<FabricDateRange>(
      () => ({
        start: startAsDayjs ? startAsDayjs.toDate() : null,
        end: endAsDayjs ? endAsDayjs.toDate() : null,
      }),
      [startAsDayjs, endAsDayjs],
    );

    const handleStartChange = useCallback(
      (next: Date | null) => {
        const merged = { start: next, end: currentRange.end };
        onChange?.(merged);
        onStartChange?.(next);
      },
      [currentRange.end, onChange, onStartChange],
    );

    const handleEndChange = useCallback(
      (next: Date | null) => {
        const merged = { start: currentRange.start, end: next };
        onChange?.(merged);
        onEndChange?.(next);
      },
      [currentRange.start, onChange, onEndChange],
    );

    // Prevent inverted ranges by binding each side's constraint to the other.
    const startMax =
      endAsDayjs && maxDate
        ? endAsDayjs.isBefore(maxDate)
          ? endAsDayjs
          : maxDate
        : (endAsDayjs ?? maxDate);
    const endMin =
      startAsDayjs && minDate
        ? startAsDayjs.isAfter(minDate)
          ? startAsDayjs
          : minDate
        : (startAsDayjs ?? minDate);

    return (
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Box ref={ref} sx={sx}>
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-end",
              gap: `${spacing.md}px`,
            }}
          >
            <FabricDatePicker
              label={startLabel}
              value={value.start}
              onChange={handleStartChange}
              required={required}
              error={error}
              disabled={disabled}
              minDate={minDate}
              maxDate={startMax}
              width={pickerWidth}
            />
            <Typography
              component="span"
              sx={{
                alignSelf: "center",
                pb: `${spacing.xs}px`,
                color: "text.secondary",
              }}
            >
              {separator}
            </Typography>
            <FabricDatePicker
              label={endLabel}
              value={value.end}
              onChange={handleEndChange}
              required={required}
              error={error}
              disabled={disabled}
              minDate={endMin}
              maxDate={maxDate}
              width={pickerWidth}
            />
          </Box>
          {helperText !== undefined && (
            <Typography
              variant="caption"
              sx={{
                display: "block",
                mt: `${spacing.xs}px`,
                color: error ? "error.main" : "text.secondary",
              }}
            >
              {helperText}
            </Typography>
          )}
        </Box>
      </LocalizationProvider>
    );
  },
);

FabricDateRangePickerImpl.displayName = "FabricDateRangePicker";

export const FabricDateRangePicker = memo(FabricDateRangePickerImpl);
