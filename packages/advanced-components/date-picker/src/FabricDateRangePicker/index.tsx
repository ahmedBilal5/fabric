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
import { Box, Chip, Typography } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs, { type Dayjs } from "dayjs";
import { forwardRef, memo, type ReactNode, useCallback, useMemo } from "react";
import { FabricDatePicker, type FabricDatePickerValue } from "../FabricDatePicker";
import { defaultDateRangePresets, type FabricDateRangePreset, matchPreset } from "./presets";

export type { FabricDateRangePreset } from "./presets";
export { dateRangePresets, defaultDateRangePresets, matchPreset } from "./presets";

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
  /**
   * Quick ranges shown as buttons above the pickers. `true` shows Last 7 days, Last 30
   * days, This month, Last month, This quarter and This year; or pass your own list,
   * e.g. `[dateRangePresets.today, dateRangePresets.last7Days]`.
   */
  presets?: boolean | FabricDateRangePreset[];
  /** "Today" for the presets. Defaults to now; set it for stable stories and tests. */
  today?: Date;
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
      presets,
      today,
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

    const presetList = presets === true ? defaultDateRangePresets : presets || [];
    const now = today ?? new Date();
    const activePreset = presetList.length ? matchPreset(currentRange, presetList, now) : undefined;

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
          {presetList.length > 0 && (
            <Box
              role="group"
              aria-label="Quick ranges"
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: `${spacing.sm}px`,
                mb: `${spacing.md}px`,
              }}
            >
              {presetList.map((p) => {
                const on = activePreset?.id === p.id;
                const r = p.getRange(now);
                const outside =
                  (minDate && dayjs(r.start).isBefore(minDate, "day")) ||
                  (maxDate && dayjs(r.end).isAfter(maxDate, "day"));
                return (
                  <Chip
                    key={p.id}
                    label={p.label}
                    size="small"
                    clickable
                    disabled={disabled || Boolean(outside)}
                    aria-pressed={on}
                    color={on ? "primary" : "default"}
                    variant={on ? "filled" : "outlined"}
                    onClick={() => {
                      onChange?.({ start: r.start, end: r.end });
                      onStartChange?.(r.start);
                      onEndChange?.(r.end);
                    }}
                  />
                );
              })}
            </Box>
          )}
          <Box
            sx={{
              display: "flex",
              alignItems: { xs: "stretch", sm: "flex-end" },
              flexDirection: { xs: "column", sm: "row" },
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
              containerSx={{ minWidth: 0, flex: pickerWidth === undefined ? 1 : undefined }}
            />
            <Typography
              component="span"
              sx={{
                display: { xs: "none", sm: "block" },
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
              containerSx={{ minWidth: 0, flex: pickerWidth === undefined ? 1 : undefined }}
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
