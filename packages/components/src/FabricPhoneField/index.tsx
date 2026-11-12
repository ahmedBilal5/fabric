/**
 * FabricPhoneField — a phone number box with a country picker in front.
 *
 * The value is one string in E.164 form ("+442071234567"), or `""` when empty,
 * which is what most APIs and SMS providers expect. People pick their country
 * (code and dialling code, e.g. "GB +44") and type the number the way they know it, with or
 * without the leading 0. Pasting a full "+44 20 7123 4567" switches the country.
 *
 * Validation stays yours: `isE164` checks the shape; use a library such as
 * libphonenumber on your server for a real check.
 *
 * @example
 * ```tsx
 * <FabricPhoneField label="Mobile number" value={phone} onChange={setPhone} defaultCountry="GB" />
 * ```
 */

import { spacing } from "@fabric-kit/design-tokens";
import { Divider, InputAdornment, ListSubheader, MenuItem, Select } from "@mui/material";
import { forwardRef, type ReactNode, useEffect, useMemo, useState } from "react";
import { FabricTextField, type FabricTextFieldProps } from "../FabricTextField/FabricTextField";
import {
  countryName,
  type FabricPhoneCountry,
  PHONE_COUNTRIES,
  parsePhone,
  toE164,
} from "./countries";

export type { FabricPhoneCountry } from "./countries";
export { countryFlag, countryName, isE164, PHONE_COUNTRIES, parsePhone, toE164 } from "./countries";

export interface FabricPhoneFieldProps
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
  > {
  /** The number in E.164 form ("+442071234567"), or `""`. */
  value: string;
  /** Called with the number in E.164 form, or `""` when the digits are cleared. */
  onChange?: (value: string) => void;
  /** Country picked when the value is empty, as an ISO code. @default "US" */
  defaultCountry?: string;
  /** Limit the picker to these ISO codes. */
  countries?: string[];
  /** ISO codes listed first, above the rest. */
  preferredCountries?: string[];
  /** Locale for country names. Defaults to the browser's. */
  locale?: string;
  /** Called when the person picks another country. */
  onCountryChange?: (code: string) => void;
}

/** A phone number field with a country picker. The value is E.164. */
export const FabricPhoneField = forwardRef<HTMLDivElement, FabricPhoneFieldProps>(
  function FabricPhoneField(
    {
      value,
      onChange,
      defaultCountry = "US",
      countries,
      preferredCountries = [],
      locale,
      onCountryChange,
      disabled,
      slotProps,
      label,
      ...rest
    },
    ref,
  ) {
    const list = useMemo(
      () =>
        (countries
          ? PHONE_COUNTRIES.filter((c) => countries.includes(c.code))
          : PHONE_COUNTRIES
        ).map((c) => ({ ...c, name: countryName(c.code, locale) })),
      [countries, locale],
    );
    const sorted = useMemo(
      () => [...list].sort((a, b) => a.name.localeCompare(b.name, locale)),
      [list, locale],
    );
    const preferred = preferredCountries
      .map((code) => list.find((c) => c.code === code))
      .filter((c): c is (typeof list)[number] => !!c);

    const fallback = list.find((c) => c.code === defaultCountry) ?? list[0];
    const [countryCode, setCountryCode] = useState(
      () => parsePhone(value, list, defaultCountry).country?.code ?? fallback.code,
    );
    const country: FabricPhoneCountry = list.find((c) => c.code === countryCode) ?? fallback;
    const [draft, setDraft] = useState(() => parsePhone(value, list, countryCode).national);

    // Follow changes made outside the field (a form reset, loaded data).
    // biome-ignore lint/correctness/useExhaustiveDependencies: draft and country are this field's own state
    useEffect(() => {
      if (toE164(country, draft) === value) return;
      const parsed = parsePhone(value, list, country.code);
      if (parsed.country) setCountryCode(parsed.country.code);
      setDraft(value === "" ? "" : parsed.national);
    }, [value]);

    const pickCountry = (code: string) => {
      const next = list.find((c) => c.code === code) ?? fallback;
      setCountryCode(next.code);
      onCountryChange?.(next.code);
      onChange?.(toE164(next, draft));
    };

    const onType = (text: string) => {
      // A pasted international number brings its own country.
      if (text.trim().startsWith("+")) {
        const parsed = parsePhone(text, list, country.code);
        if (parsed.country) {
          setCountryCode(parsed.country.code);
          setDraft(parsed.national);
          onChange?.(toE164(parsed.country, parsed.national));
          return;
        }
      }
      const kept = text.replace(/[^\d\s().-]/g, "");
      setDraft(kept);
      onChange?.(toE164(country, kept));
    };

    const option = (c: (typeof list)[number], key: string): ReactNode => (
      <MenuItem key={key} value={c.code} sx={{ gap: `${spacing.sm}px` }}>
        <span style={{ flex: 1 }}>{c.name}</span>
        <span style={{ color: "var(--mui-palette-text-secondary)" }}>+{c.dial}</span>
      </MenuItem>
    );

    const inputSlot = (slotProps?.input ?? {}) as Record<string, unknown>;

    return (
      <FabricTextField
        {...rest}
        ref={ref}
        label={label}
        disabled={disabled}
        value={draft}
        onChange={(e) => onType(e.target.value)}
        slotProps={{
          ...slotProps,
          // The country picker sits in front, so the label always floats above.
          inputLabel: { shrink: true, ...(slotProps?.inputLabel as object) },
          input: {
            ...inputSlot,
            notched: true,
            startAdornment: (
              <InputAdornment position="start" sx={{ mr: `${spacing.xs}px`, ml: "-6px" }}>
                <Select
                  variant="standard"
                  disableUnderline
                  value={country.code}
                  disabled={disabled}
                  onChange={(e) => pickCountry(e.target.value)}
                  renderValue={(code) => {
                    const c = list.find((x) => x.code === code) ?? country;
                    return (
                      <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
                        <span style={{ fontWeight: 600 }}>{c.code}</span>
                        <span style={{ color: "var(--mui-palette-text-secondary)" }}>
                          +{c.dial}
                        </span>
                      </span>
                    );
                  }}
                  inputProps={{
                    "aria-label": `Country code: ${countryName(country.code, locale)} +${country.dial}`,
                  }}
                  MenuProps={{ slotProps: { paper: { sx: { maxHeight: 360 } } } }}
                  sx={{
                    fontSize: "0.875rem",
                    "& .MuiSelect-select": { py: 0, pr: "22px !important", minHeight: 0 },
                    "& .MuiSelect-icon": { right: 0 },
                  }}
                >
                  {preferred.map((c) => option(c, `p-${c.code}`))}
                  {preferred.length > 0 && <Divider />}
                  {preferred.length > 0 && <ListSubheader>All countries</ListSubheader>}
                  {sorted.map((c) => option(c, c.code))}
                </Select>
                <Divider
                  orientation="vertical"
                  flexItem
                  sx={{ ml: `${spacing.sm}px`, my: "-2px" }}
                />
              </InputAdornment>
            ),
          },
          htmlInput: {
            inputMode: "tel",
            autoComplete: "tel-national",
            ...(slotProps?.htmlInput as object),
          },
        }}
      />
    );
  },
);
