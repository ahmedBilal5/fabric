/**
 * FabricPasswordField — a password box with a show/hide button and an optional
 * strength meter.
 *
 * Set `strength` on sign-up and change-password forms. The meter uses a quick
 * built-in estimate; pass `getStrength` to use your own (zxcvbn, a breach check).
 * It describes the field, and screen readers hear the new rating as it changes.
 *
 * @example
 * ```tsx
 * <FabricPasswordField
 *   label="New password"
 *   value={password}
 *   onChange={(e) => setPassword(e.target.value)}
 *   strength
 * />
 * ```
 */

import { radii, spacing } from "@fabric-kit/design-tokens";
import VisibilityIcon from "@fabric-kit/icons/Visibility";
import VisibilityOffIcon from "@fabric-kit/icons/VisibilityOff";
import { Box, IconButton, InputAdornment } from "@mui/material";
import { forwardRef, useId, useState } from "react";
import { FabricTextField, type FabricTextFieldProps } from "../FabricTextField/FabricTextField";
import { type FabricPasswordStrength, scorePassword } from "./strength";

export type { FabricPasswordStrength } from "./strength";
export { scorePassword } from "./strength";

export interface FabricPasswordFieldProps
  extends Omit<
    FabricTextFieldProps,
    "type" | "search" | "searchPaperProps" | "onClear" | "multiline"
  > {
  /** Show a strength meter under the field. Turns on `autoComplete="new-password"`. */
  strength?: boolean;
  /** Your own strength estimate. @default scorePassword */
  getStrength?: (password: string) => FabricPasswordStrength;
  /** Show the password as text from the start. */
  defaultVisible?: boolean;
}

const METER_COLORS = [
  "var(--mui-palette-error-main)",
  "var(--mui-palette-error-main)",
  "var(--mui-palette-warning-main)",
  "var(--mui-palette-info-main)",
  "var(--mui-palette-success-main)",
];

/** A password box with show/hide and an optional strength meter. */
export const FabricPasswordField = forwardRef<HTMLDivElement, FabricPasswordFieldProps>(
  function FabricPasswordField(
    {
      strength = false,
      getStrength = scorePassword,
      defaultVisible = false,
      value,
      slotProps,
      helperText,
      disabled,
      autoComplete,
      ...rest
    },
    ref,
  ) {
    const [visible, setVisible] = useState(defaultVisible);
    const meterId = useId();
    const text = typeof value === "string" ? value : "";
    const rating = strength && text !== "" ? getStrength(text) : null;
    const inputSlot = (slotProps?.input ?? {}) as Record<string, unknown>;
    const htmlInputSlot = (slotProps?.htmlInput ?? {}) as Record<string, unknown>;

    const meter = strength && (
      <Box
        component="span"
        sx={{ display: "flex", flexDirection: "column", gap: `${spacing.xs}px`, mt: "2px" }}
      >
        <Box
          component="span"
          aria-hidden
          sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: `${spacing.xs}px` }}
        >
          {[1, 2, 3, 4].map((i) => (
            <Box
              key={i}
              component="span"
              sx={{
                height: 4,
                borderRadius: `${radii.full}px`,
                backgroundColor:
                  rating && rating.score >= i
                    ? METER_COLORS[rating.score]
                    : "var(--mui-palette-divider)",
                transition: "background-color 150ms",
              }}
            />
          ))}
        </Box>
        <Box component="span" id={meterId} aria-live="polite">
          {rating ? (
            <>
              <Box component="span" sx={{ fontWeight: 600, color: "text.primary" }}>
                {rating.label}
              </Box>
              {rating.hint ? ` · ${rating.hint}` : null}
            </>
          ) : (
            "Use 12 or more characters with a mix of letters, numbers and symbols."
          )}
        </Box>
      </Box>
    );

    return (
      <FabricTextField
        {...rest}
        ref={ref}
        value={value}
        disabled={disabled}
        type={visible ? "text" : "password"}
        autoComplete={autoComplete ?? (strength ? "new-password" : "current-password")}
        helperText={
          helperText != null || meter ? (
            <Box component="span" sx={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              {helperText != null && <span>{helperText}</span>}
              {meter}
            </Box>
          ) : undefined
        }
        slotProps={{
          ...slotProps,
          input: {
            ...inputSlot,
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label={visible ? "Hide password" : "Show password"}
                  aria-pressed={visible}
                  disabled={disabled}
                  onClick={() => setVisible((v) => !v)}
                  onMouseDown={(e) => e.preventDefault()}
                  edge="end"
                  sx={{ color: "var(--mui-palette-text-secondary)", "& svg": { fontSize: 20 } }}
                >
                  {visible ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              </InputAdornment>
            ),
          },
          htmlInput: {
            spellCheck: false,
            autoCapitalize: "none",
            ...htmlInputSlot,
          },
        }}
      />
    );
  },
);
