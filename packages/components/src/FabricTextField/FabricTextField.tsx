/**
 * FabricTextField — the design-system text field.
 *
 * Extends MUI `TextField` (via `Omit<TextFieldProps, 'variant'>` with variant
 * narrowed to `'standard' | 'outlined' | 'filled'`). Widens `label` to
 * `ReactNode`. First-class `error` state routes through design-token error
 * colors (only in error state, not on every helper text). Each field gets a
 * unique `useId()`-generated DOM id — labels link cleanly and browser autofill
 * grouping works.
 *
 * Visuals come from the theme (`MuiOutlinedInput` / `MuiInputLabel` overrides):
 * 40px tall, 8px radius, floating 14px SemiBold label.
 *
 * Variants:
 *   - `input`, `lead-icon`, `tail-icon` — plain field with `slotProps.input`
 *     start/end adornments.
 *   - `count` — `type="number"` hides native spinners and adds an up/down stepper
 *     that respects `min` / `max` / `step`.
 *   - `textbox` — `multiline`; height prop is ignored and the box resizes vertically.
 *   - `search` — `search`: label-less box with a clear (×)
 *     button once filled. Renders as a `<form>` that defaults to
 *     `onSubmit={preventDefault}`; override via `searchPaperProps`.
 *
 * No `autoComplete` default is applied; pass it per field (e.g.
 * `autoComplete="one-time-code"`). `height` overrides the fixed input height.
 *
 * @example
 * ```tsx
 * <FabricTextField
 *   label="Email address"
 *   value={email}
 *   onChange={(e) => setEmail(e.target.value)}
 *   error={!!errors.email}
 *   helperText={errors.email}
 * />
 * ```
 */

import { radii, spacing } from "@fabric-kit/design-tokens";
import CancelIcon from "@fabric-kit/icons/Cancel";
import SearchIcon from "@fabric-kit/icons/Search";
import UnfoldMoreIcon from "@fabric-kit/icons/UnfoldMore";
import { FabricInline, FabricSurface } from "@fabric-kit/primitives";
import {
  Box,
  IconButton,
  InputAdornment,
  InputBase,
  type PaperProps,
  TextField,
  type TextFieldProps,
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import React, {
  type ChangeEvent,
  type FormEvent,
  forwardRef,
  memo,
  type ReactNode,
  useCallback,
  useId,
  useRef,
  useState,
} from "react";

export interface FabricTextFieldProps extends Omit<TextFieldProps, "variant"> {
  /**
   * Render a compact search box: a search icon, no floating label, and a clear (×)
   * button once there's text. It renders as a `<form>`; pressing Enter calls
   * `searchPaperProps.onSubmit` if set.
   */
  search?: boolean;
  /** Fixed input height. Defaults to `40px`, `32px` with `size="small"`, `36px` for `variant="standard"` (underline), `35px` in search mode. Ignored when `multiline`. */
  height?: string;
  /** Props for the search-mode container (only used with `search`). */
  searchPaperProps?: PaperProps;
  /** Search mode: called by the clear (×) button. Without it, `onChange` fires with an empty value. */
  onClear?: () => void;
  /** MUI variant. Defaults to `outlined`. */
  variant?: "standard" | "outlined" | "filled";
  /** Field label. */
  label?: ReactNode;
}

// Read-only fields keep the outlined shell so they visually match editable fields
// — only the fill dims to signal non-interactive.
const readOnlySx: SxProps<Theme> = {
  "& .MuiOutlinedInput-root": { backgroundColor: "action.hover" },
};

// Number fields: native spinners hidden, 16px leading padding, stepper icon at the end.
const numberSx: SxProps<Theme> = {
  "& .MuiOutlinedInput-input": {
    paddingLeft: `${spacing.lg}px`,
    MozAppearance: "textfield",
    "&::-webkit-inner-spin-button, &::-webkit-outer-spin-button": {
      WebkitAppearance: "none",
      margin: 0,
    },
  },
};

// Search box: 0/12 padding, 4px gap, icon/text color follows hover / focus / filled.
const searchSx = (height: string, filled: boolean) => (theme: Theme) => ({
  width: "100%",
  height,
  px: `${spacing.md}px`,
  borderRadius: `${radii.md}px`,
  borderColor: "divider",
  backgroundColor: "background.paper",
  color: filled ? "text.primary" : "var(--mui-palette-control-label)",
  "&:hover": { color: filled ? "text.primary" : "var(--mui-palette-control-labelHover)" },
  "&:focus-within": { color: "text.primary", borderColor: "primary.main" },
  ...theme.applyStyles("dark", {
    color: filled ? "text.primary" : "var(--mui-palette-control-label)",
    "&:hover": { color: filled ? "text.primary" : "var(--mui-palette-control-labelHover)" },
  }),
});

const iconButtonSx: SxProps<Theme> = { p: 0, color: "inherit" };

function preventFormSubmit(event: FormEvent) {
  event.preventDefault();
}

function hasValue(value: unknown): boolean {
  return value !== undefined && value !== null && String(value) !== "";
}

/** Number stepper: one 24px icon split into increment / decrement halves. */
function NumberStepper({
  onStep,
  disabled,
}: {
  onStep: (direction: 1 | -1) => void;
  disabled?: boolean;
}) {
  const halfSx = {
    position: "absolute",
    left: 0,
    width: "100%",
    height: "50%",
    p: 0,
    borderRadius: 0,
  } as const;
  return (
    <InputAdornment position="end">
      <Box sx={{ position: "relative", width: 24, height: 24, display: "flex" }}>
        <UnfoldMoreIcon sx={{ fontSize: 24 }} />
        <IconButton
          aria-label="increment"
          tabIndex={-1}
          disabled={disabled}
          onClick={() => onStep(1)}
          sx={{ ...halfSx, top: 0 }}
        />
        <IconButton
          aria-label="decrement"
          tabIndex={-1}
          disabled={disabled}
          onClick={() => onStep(-1)}
          sx={{ ...halfSx, bottom: 0 }}
        />
      </Box>
    </InputAdornment>
  );
}

const FabricTextFieldImpl = forwardRef<HTMLDivElement, FabricTextFieldProps>(
  function FabricTextField(
    {
      search = false,
      height,
      searchPaperProps,
      onClear,
      disabled,
      sx,
      placeholder,
      label,
      value,
      onChange,
      variant = "outlined",
      id,
      slotProps,
      type,
      multiline,
      inputRef: consumerInputRef,
      onFocus,
      onBlur,
      ...rest
    },
    ref,
  ) {
    const generatedId = useId();
    const resolvedId = id ?? generatedId;
    const nativeInputRef = useRef<HTMLInputElement | null>(null);
    const [uncontrolledSearch, setUncontrolledSearch] = useState("");
    const [focused, setFocused] = useState(false);
    const [typedFilled, setTypedFilled] = useState(() => hasValue(rest.defaultValue));

    const setInputRef = useCallback(
      (node: HTMLInputElement | null) => {
        nativeInputRef.current = node;
        if (typeof consumerInputRef === "function") consumerInputRef(node);
        else if (consumerInputRef)
          (consumerInputRef as React.MutableRefObject<HTMLInputElement | null>).current = node;
      },
      [consumerInputRef],
    );

    // Native stepUp/stepDown honours min/max/step; the bubbling input event lets React fire onChange.
    const step = useCallback((direction: 1 | -1) => {
      const input = nativeInputRef.current;
      if (!input) return;
      if (direction === 1) input.stepUp();
      else input.stepDown();
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }, []);

    if (search) {
      const {
        onSubmit: consumerOnSubmit,
        variant: _paperVariant,
        color: _paperColor,
        sx: paperSx,
        ...paperRest
      } = searchPaperProps ?? {};

      const htmlInputProps = slotProps?.htmlInput as
        | React.InputHTMLAttributes<HTMLInputElement>
        | undefined;

      const isControlled = value !== undefined;
      const searchValue = String((isControlled ? value : uncontrolledSearch) ?? "");
      const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (!isControlled) setUncontrolledSearch(event.target.value);
        onChange?.(event);
      };
      const handleClear = () => {
        if (!isControlled) setUncontrolledSearch("");
        if (onClear) onClear();
        else
          onChange?.({
            target: { value: "" },
            currentTarget: { value: "" },
          } as ChangeEvent<HTMLInputElement>);
        nativeInputRef.current?.focus();
      };

      return (
        <FabricSurface
          ref={ref as React.Ref<HTMLDivElement>}
          variant="outlined"
          component="form"
          onSubmit={
            (consumerOnSubmit ?? preventFormSubmit) as React.FormEventHandler<HTMLDivElement>
          }
          sx={[
            searchSx(height ?? "35px", searchValue !== ""),
            ...(Array.isArray(paperSx) ? paperSx : [paperSx]),
          ]}
          {...paperRest}
        >
          <FabricInline
            align="center"
            sx={{ width: "100%", height: "100%", gap: `${spacing.xs}px` }}
          >
            <IconButton type="submit" aria-label="submit search" sx={iconButtonSx}>
              <SearchIcon sx={{ fontSize: 22 }} />
            </IconButton>
            <InputBase
              sx={{ flex: 1, color: "inherit", fontSize: 16, lineHeight: "24px" }}
              value={searchValue}
              onChange={handleSearchChange}
              placeholder={
                (placeholder ?? (typeof label === "string" ? label : "Search")) as string
              }
              inputProps={htmlInputProps}
              inputRef={setInputRef}
              disabled={disabled}
            />
            {searchValue !== "" && (
              <IconButton aria-label="clear search" onClick={handleClear} sx={iconButtonSx}>
                <CancelIcon sx={{ fontSize: 16 }} />
              </IconButton>
            )}
          </FabricInline>
        </FabricSurface>
      );
    }

    const isDisabled = Boolean(disabled);
    const inputSlotProps = slotProps?.input as
      | { readOnly?: boolean; startAdornment?: ReactNode; endAdornment?: ReactNode }
      | undefined;
    const labelSlotProps = slotProps?.inputLabel as { shrink?: boolean } | undefined;
    const deprecatedMuiInputProps = (rest as { InputProps?: { readOnly?: boolean } }).InputProps;
    const isReadOnly = Boolean(inputSlotProps?.readOnly ?? deprecatedMuiInputProps?.readOnly);
    const showStepper =
      type === "number" &&
      !multiline &&
      typeof slotProps?.input !== "function" &&
      !inputSlotProps?.endAdornment;
    // MUI always floats the label next to a start adornment; Fabric keeps it at rest
    // until focus or a value.
    const controlShrink =
      Boolean(inputSlotProps?.startAdornment) &&
      typeof slotProps?.inputLabel !== "function" &&
      labelSlotProps?.shrink === undefined;
    const shrink =
      (multiline && Boolean(inputSlotProps?.startAdornment)) ||
      focused ||
      (value !== undefined ? hasValue(value) : typedFilled);
    const resolvedHeight = multiline
      ? undefined
      : (height ?? (variant === "standard" ? "36px" : rest.size === "small" ? "32px" : "40px"));

    return (
      <TextField
        ref={ref as React.Ref<HTMLDivElement>}
        id={resolvedId}
        value={value}
        onChange={(event) => {
          if (value === undefined) setTypedFilled(event.target.value !== "");
          onChange?.(event);
        }}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        label={label}
        placeholder={placeholder}
        disabled={isDisabled}
        variant={variant}
        type={type}
        multiline={multiline}
        inputRef={setInputRef}
        slotProps={
          showStepper || controlShrink
            ? {
                ...slotProps,
                input: {
                  ...inputSlotProps,
                  ...(showStepper
                    ? {
                        endAdornment: (
                          <NumberStepper onStep={step} disabled={isDisabled || isReadOnly} />
                        ),
                      }
                    : null),
                  ...(controlShrink ? { notched: shrink } : null),
                },
                ...(controlShrink ? { inputLabel: { ...labelSlotProps, shrink } } : null),
              }
            : slotProps
        }
        sx={{
          ...(resolvedHeight
            ? { "& .MuiInputBase-root": { height: resolvedHeight, minHeight: resolvedHeight } }
            : null),
          ...(type === "number" ? (numberSx as object) : null),
          ...(isReadOnly && !isDisabled ? (readOnlySx as object) : null),
          ...(sx as object),
        }}
        {...rest}
      />
    );
  },
);

FabricTextFieldImpl.displayName = "FabricTextField";

export const FabricTextField = memo(FabricTextFieldImpl);
