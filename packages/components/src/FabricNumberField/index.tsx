/**
 * FabricNumberField — a text field for numbers, with − and + buttons, arrow-key
 * stepping, limits and locale-aware formatting for currency, percent and units.
 *
 * The value is a `number`, or `null` when the field is empty. While someone types,
 * the field shows their text as typed; when it loses focus it formats the number
 * ("12480" becomes "$12,480.00") and keeps it within `min` and `max`.
 *
 * @example
 * ```tsx
 * <FabricNumberField
 *   label="Budget"
 *   value={budget}
 *   onChange={setBudget}
 *   format={{ style: "currency", currency: "USD" }}
 *   min={0}
 *   step={100}
 * />
 * ```
 */

import { spacing } from "@fabric-kit/design-tokens";
import AddIcon from "@fabric-kit/icons/Add";
import RemoveIcon from "@fabric-kit/icons/Remove";
import { IconButton, InputAdornment } from "@mui/material";
import {
  type FocusEvent,
  forwardRef,
  type KeyboardEvent,
  type ReactNode,
  useMemo,
  useState,
} from "react";
import { FabricTextField, type FabricTextFieldProps } from "../FabricTextField/FabricTextField";
import {
  clampNumber,
  type FabricNumberFormat,
  numberFormatter,
  parseNumberInput,
  roundTo,
  stepNumber,
} from "./numberFormat";

export type { FabricNumberFormat } from "./numberFormat";
export {
  clampNumber,
  numberFormatter,
  parseNumberInput,
  stepNumber,
} from "./numberFormat";

export interface FabricNumberFieldProps
  extends Omit<
    FabricTextFieldProps,
    | "value"
    | "defaultValue"
    | "onChange"
    | "type"
    | "search"
    | "searchPaperProps"
    | "onClear"
    | "multiline"
    | "rows"
    | "minRows"
    | "maxRows"
    | "prefix"
  > {
  /** The number, or `null` when empty. */
  value: number | null;
  /** Called with the new number, or `null` when cleared. */
  onChange?: (value: number | null) => void;
  /** Lowest allowed value. Typed values are raised to it on blur. */
  min?: number;
  /** Highest allowed value. Typed values are lowered to it on blur. */
  max?: number;
  /** Amount the buttons and arrow keys add or remove. Shift, Page Up and Page Down step ten times as far. @default 1 */
  step?: number;
  /** Currency, percent or unit display. Percent shows the number as typed: 15 → "15%". */
  format?: FabricNumberFormat;
  /** Fewest decimals to show, e.g. 2 for money. */
  minimumFractionDigits?: number;
  /** Most decimals to keep. 0 allows whole numbers only. */
  maximumFractionDigits?: number;
  /** Group thousands ("12,480"). @default true */
  useGrouping?: boolean;
  /** BCP 47 locale for formatting and reading typed numbers. Defaults to the browser's. */
  locale?: string;
  /** Show the − and + buttons. @default true */
  stepper?: boolean;
  /** Text before the number, e.g. "≈". For currency, prefer `format`. */
  prefix?: ReactNode;
  /** Text after the number, e.g. "seats". For units, prefer `format`. */
  suffix?: ReactNode;
}

const stepButtonSx = {
  width: 28,
  height: 28,
  borderRadius: "6px",
  color: "var(--mui-palette-text-secondary)",
  "& svg": { fontSize: 18 },
} as const;

/** A number input with stepping, limits and locale-aware formatting. */
export const FabricNumberField = forwardRef<HTMLDivElement, FabricNumberFieldProps>(
  function FabricNumberField(
    {
      value,
      onChange,
      min,
      max,
      step = 1,
      format,
      minimumFractionDigits,
      maximumFractionDigits,
      useGrouping,
      locale,
      stepper = true,
      prefix,
      suffix,
      disabled,
      slotProps,
      onFocus,
      onBlur,
      label,
      ...rest
    },
    ref,
  ) {
    const formatter = useMemo(
      () =>
        numberFormatter({
          locale,
          format,
          minimumFractionDigits,
          maximumFractionDigits,
          useGrouping,
        }),
      [locale, format, minimumFractionDigits, maximumFractionDigits, useGrouping],
    );
    // Typing uses plain digits; grouping and symbols come back on blur.
    const editFormatter = useMemo(
      () =>
        new Intl.NumberFormat(locale, {
          useGrouping: false,
          maximumFractionDigits: maximumFractionDigits ?? 20,
        }),
      [locale, maximumFractionDigits],
    );
    const [draft, setDraft] = useState<string | null>(null);
    const readOnly = Boolean(
      (slotProps?.htmlInput as { readOnly?: boolean } | undefined)?.readOnly ??
        (slotProps?.input as { readOnly?: boolean } | undefined)?.readOnly,
    );
    const inert = Boolean(disabled) || readOnly;

    const tidy = (n: number) => {
      const clamped = clampNumber(n, min, max);
      return maximumFractionDigits === undefined
        ? clamped
        : roundTo(clamped, maximumFractionDigits);
    };

    const commit = (next: number | null) => {
      if (next !== value) onChange?.(next);
    };

    const doStep = (direction: 1 | -1, multiplier = 1) => {
      if (inert) return;
      const next = stepNumber(value, direction, { step: step * multiplier, min, max });
      commit(next);
      if (draft !== null) setDraft(editFormatter.format(next));
    };

    const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
      const big = e.shiftKey ? 10 : 1;
      if (e.key === "ArrowUp") doStep(1, big);
      else if (e.key === "ArrowDown") doStep(-1, big);
      else if (e.key === "PageUp") doStep(1, 10);
      else if (e.key === "PageDown") doStep(-1, 10);
      else if (e.key === "Home" && min !== undefined) commit(min);
      else if (e.key === "End" && max !== undefined) commit(max);
      else return;
      e.preventDefault();
    };

    const shown = draft ?? (value === null || Number.isNaN(value) ? "" : formatter.format(value));
    const atMin = min !== undefined && value !== null && value <= min;
    const atMax = max !== undefined && value !== null && value >= max;

    const inputSlot = (slotProps?.input ?? {}) as Record<string, unknown>;
    const htmlInputSlot = (slotProps?.htmlInput ?? {}) as Record<string, unknown>;

    return (
      <FabricTextField
        {...rest}
        ref={ref}
        label={label}
        disabled={disabled}
        value={shown}
        onChange={(e) => {
          const text = e.target.value;
          setDraft(text);
          const parsed = parseNumberInput(text, locale);
          // Report numbers as they're typed so live validation works; limits apply on blur.
          if (parsed === null) commit(null);
          else if (Number.isFinite(parsed)) commit(parsed);
        }}
        onFocus={(e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
          if (!readOnly) setDraft(value === null ? "" : editFormatter.format(value));
          onFocus?.(e);
        }}
        onBlur={(e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
          if (draft !== null) {
            const parsed = parseNumberInput(draft, locale);
            // Text that isn't a number goes back to the last good value.
            if (parsed === null) commit(null);
            else if (Number.isFinite(parsed)) commit(tidy(parsed));
            setDraft(null);
          }
          onBlur?.(e);
        }}
        onKeyDown={onKeyDown}
        slotProps={{
          ...slotProps,
          input: {
            ...inputSlot,
            startAdornment:
              (inputSlot.startAdornment as ReactNode) ??
              (prefix != null ? <InputAdornment position="start">{prefix}</InputAdornment> : null),
            endAdornment: (
              <>
                {suffix != null && <InputAdornment position="end">{suffix}</InputAdornment>}
                {(inputSlot.endAdornment as ReactNode) ?? null}
                {stepper && (
                  <InputAdornment
                    position="end"
                    sx={{ gap: "2px", ml: suffix != null ? `${spacing.xs}px` : undefined }}
                  >
                    <IconButton
                      aria-label="Decrease"
                      tabIndex={-1}
                      disabled={inert || atMin}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => doStep(-1)}
                      sx={stepButtonSx}
                    >
                      <RemoveIcon />
                    </IconButton>
                    <IconButton
                      aria-label="Increase"
                      tabIndex={-1}
                      disabled={inert || atMax}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => doStep(1)}
                      sx={{ ...stepButtonSx, mr: "-6px" }}
                    >
                      <AddIcon />
                    </IconButton>
                  </InputAdornment>
                )}
              </>
            ),
          },
          htmlInput: {
            inputMode: maximumFractionDigits === 0 ? "numeric" : "decimal",
            autoComplete: "off",
            role: "spinbutton",
            "aria-valuenow": value ?? undefined,
            "aria-valuemin": min,
            "aria-valuemax": max,
            "aria-valuetext": value === null ? undefined : formatter.format(value),
            ...htmlInputSlot,
          },
        }}
      />
    );
  },
);
