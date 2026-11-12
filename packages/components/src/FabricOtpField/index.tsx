/**
 * FabricOtpField — boxes for a one-time code, such as a 6-digit sign-in or
 * verification code.
 *
 * Typing moves to the next box, Backspace moves back, the arrow keys move
 * between boxes, and pasting a whole code fills every box. `onComplete` fires
 * once all boxes are filled, so you can verify without a submit button. The first
 * box sets `autoComplete="one-time-code"`, so phones offer codes from texts.
 *
 * @example
 * ```tsx
 * <FabricOtpField
 *   label="Verification code"
 *   value={code}
 *   onChange={setCode}
 *   onComplete={verify}
 * />
 * ```
 */

import { fontWeight, radii, spacing } from "@fabric-kit/design-tokens";
import { Box, FormHelperText } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import {
  type ClipboardEvent,
  forwardRef,
  type KeyboardEvent,
  type ReactNode,
  useId,
  useImperativeHandle,
  useRef,
} from "react";

export interface FabricOtpFieldHandle {
  /** Focus the first empty box. */
  focus: () => void;
}

export interface FabricOtpFieldProps {
  /** The code typed so far. */
  value: string;
  /** Called with the code as it's typed. */
  onChange: (value: string) => void;
  /** Called once with the full code when the last box is filled. */
  onComplete?: (value: string) => void;
  /** Number of boxes. @default 6 */
  length?: number;
  /** Characters allowed. `"numeric"` uses the number keypad on phones. @default "numeric" */
  type?: "numeric" | "alphanumeric";
  /** Group label shown above the boxes. Required for accessibility unless you pass `aria-label`. */
  label?: ReactNode;
  /** Accessible name when there's no visible label. */
  "aria-label"?: string;
  /** Text under the boxes; replaced by your error message when `error`. */
  helperText?: ReactNode;
  /** Show the error state. */
  error?: boolean;
  /** Disable every box. */
  disabled?: boolean;
  /** Hide characters as dots, e.g. for a PIN. */
  mask?: boolean;
  /** Focus the first box on mount. */
  autoFocus?: boolean;
  /** Put a gap after this many boxes, e.g. 3 for "123 456". */
  groupSize?: number;
  /** Name of a hidden input carrying the whole code, for plain form posts. */
  name?: string;
  /** Called when focus leaves the whole field. */
  onBlur?: () => void;
  /** Class on the root. */
  className?: string;
  /** System styles on the root. */
  sx?: SxProps<Theme>;
}

const clean = (text: string, type: "numeric" | "alphanumeric") =>
  type === "numeric" ? text.replace(/\D/g, "") : text.replace(/[^0-9a-z]/gi, "").toUpperCase();

/** Boxes for a one-time code, with paste, arrow keys and auto-advance. */
export const FabricOtpField = forwardRef<FabricOtpFieldHandle, FabricOtpFieldProps>(
  function FabricOtpField(
    {
      value,
      onChange,
      onComplete,
      length = 6,
      type = "numeric",
      label,
      "aria-label": ariaLabel,
      helperText,
      error = false,
      disabled = false,
      mask = false,
      autoFocus = false,
      groupSize,
      name,
      onBlur,
      className,
      sx,
    },
    ref,
  ) {
    const id = useId();
    const labelId = `${id}-label`;
    const helpId = `${id}-help`;
    const inputs = useRef<(HTMLInputElement | null)[]>([]);
    const chars = Array.from({ length }, (_, i) => value[i] ?? "");

    const focusAt = (i: number) => {
      const el = inputs.current[Math.max(0, Math.min(length - 1, i))];
      el?.focus();
      el?.select();
    };

    useImperativeHandle(
      ref,
      () => ({
        focus: () => {
          const el = inputs.current[Math.min(value.length, length - 1)];
          el?.focus();
          el?.select();
        },
      }),
      [value.length, length],
    );

    const update = (next: string) => {
      const code = next.slice(0, length);
      onChange(code);
      if (code.length === length && value.length !== length) onComplete?.(code);
    };

    // Writes text starting at box `i`, keeping what's before it.
    const writeAt = (i: number, text: string) => {
      const typed = clean(text, type);
      if (!typed) return;
      const before = value.slice(0, i).padEnd(i, " ").replace(/ /g, "");
      const next = (before + typed + value.slice(i + typed.length)).slice(0, length);
      update(next);
      focusAt(Math.min(before.length + typed.length, length - 1));
    };

    const onKeyDown = (i: number) => (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace") {
        e.preventDefault();
        if (chars[i]) update(value.slice(0, i) + value.slice(i + 1));
        else if (i > 0) {
          update(value.slice(0, i - 1) + value.slice(i));
          focusAt(i - 1);
        }
      } else if (e.key === "Delete") {
        e.preventDefault();
        update(value.slice(0, i) + value.slice(i + 1));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        focusAt(i - 1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        focusAt(i + 1);
      } else if (e.key === "Home") {
        e.preventDefault();
        focusAt(0);
      } else if (e.key === "End") {
        e.preventDefault();
        focusAt(length - 1);
      }
    };

    const onPaste = (i: number) => (e: ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const text = e.clipboardData.getData("text");
      // A full code replaces everything, wherever it's pasted.
      writeAt(clean(text, type).length >= length ? 0 : i, text);
    };

    return (
      <Box
        role="group"
        aria-labelledby={label ? labelId : undefined}
        aria-label={label ? undefined : ariaLabel}
        aria-describedby={helperText ? helpId : undefined}
        className={className}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) onBlur?.();
        }}
        sx={[
          { display: "inline-flex", flexDirection: "column", gap: `${spacing.sm}px` },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        {label && (
          <Box
            id={labelId}
            sx={{
              fontSize: "0.875rem",
              fontWeight: fontWeight.semiBold,
              color: error ? "var(--mui-palette-error-main)" : "var(--mui-palette-control-label)",
            }}
          >
            {label}
          </Box>
        )}
        <Box sx={{ display: "flex", gap: `${spacing.sm}px` }}>
          {chars.map((c, i) => (
            <Box
              key={i}
              component="input"
              ref={(el: HTMLInputElement | null) => {
                inputs.current[i] = el;
              }}
              value={c}
              type={mask ? "password" : "text"}
              inputMode={type === "numeric" ? "numeric" : "text"}
              autoComplete={i === 0 ? "one-time-code" : "off"}
              autoFocus={autoFocus && i === 0}
              disabled={disabled}
              maxLength={length}
              aria-label={`Character ${i + 1} of ${length}`}
              aria-invalid={error || undefined}
              onFocus={(e) => e.currentTarget.select()}
              onChange={(e) =>
                writeAt(i, e.currentTarget.value.slice(c ? 1 : 0) || e.currentTarget.value)
              }
              onKeyDown={onKeyDown(i)}
              onPaste={onPaste(i)}
              sx={{
                width: 44,
                height: 52,
                mr:
                  groupSize && (i + 1) % groupSize === 0 && i < length - 1 ? `${spacing.md}px` : 0,
                p: 0,
                textAlign: "center",
                fontFamily: "inherit",
                fontSize: "1.25rem",
                fontWeight: fontWeight.semiBold,
                color: "var(--mui-palette-text-primary)",
                backgroundColor: "var(--mui-palette-background-paper)",
                border: "1px solid",
                borderColor: error ? "var(--mui-palette-error-main)" : "var(--mui-palette-divider)",
                borderRadius: `${radii.lg}px`,
                outline: "none",
                caretColor: "var(--mui-palette-primary-main)",
                transition: "border-color 120ms, box-shadow 120ms",
                "&:hover:not(:disabled)": { borderColor: "var(--mui-palette-text-secondary)" },
                "&:focus": {
                  borderColor: error
                    ? "var(--mui-palette-error-main)"
                    : "var(--mui-palette-primary-main)",
                  boxShadow: `0 0 0 3px rgba(var(${error ? "--mui-palette-error-mainChannel" : "--mui-palette-primary-mainChannel"}) / 0.18)`,
                },
                "&:disabled": {
                  color: "var(--mui-palette-text-disabled)",
                  backgroundColor: "var(--mui-palette-action-disabledBackground)",
                },
              }}
            />
          ))}
        </Box>
        {name && <input type="hidden" name={name} value={value} />}
        {helperText && (
          <FormHelperText id={helpId} error={error} sx={{ m: 0 }}>
            {helperText}
          </FormHelperText>
        )}
      </Box>
    );
  },
);
