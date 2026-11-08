/**
 * FabricAutocomplete — the design-system autocomplete / combobox.
 *
 * Thin generic wrapper over MUI `Autocomplete<T, Multiple, DisableClearable, FreeSolo>`
 * that preserves the full MUI surface (single-select, multi-select, free solo,
 * grouped options, virtualization) and adds first-class top-level `label` /
 * `placeholder` / `error` / `helperText` props that flow into a
 * `FabricTextField`-based default `renderInput`, so the common case is one line
 * instead of a hand-written `renderInput`.
 *
 * `height` defaults to `"auto"` on the wrapped `FabricTextField` so chip
 * overflow in multi-select mode wraps naturally instead of being clipped by
 * the fixed 40px default. Consumers who override `renderInput` own the input
 * surface entirely and the top-level input props are ignored.
 *
 * `React.memo` + `displayName` present. No `forwardRef` at the wrapper level —
 * MUI Autocomplete already forwards its root `ref` and generics + `forwardRef`
 * do not compose cleanly.
 *
 * @example
 * ```tsx
 * <FabricAutocomplete
 *   options={countries}
 *   getOptionLabel={(o) => o.name}
 *   value={selected}
 *   onChange={(_, v) => setSelected(v)}
 *   renderInput={(p) => <TextField {...p} label="Country" />}
 * />
 * ```
 */

import {
  Autocomplete,
  type AutocompleteProps,
  type AutocompleteRenderInputParams,
} from "@mui/material";
import type { ReactNode } from "react";
import { FabricTextField } from "../FabricTextField/FabricTextField";

export interface FabricAutocompleteProps<
  T,
  Multiple extends boolean | undefined = false,
  DisableClearable extends boolean | undefined = false,
  FreeSolo extends boolean | undefined = false,
> extends Omit<AutocompleteProps<T, Multiple, DisableClearable, FreeSolo>, "renderInput"> {
  /** Input label. Widened to `ReactNode` from MUI's `string`. */
  label?: ReactNode;
  /** Input placeholder. */
  placeholder?: string;
  /** Error state — routes into the default `renderInput` `FabricTextField`. */
  error?: boolean;
  /** Helper text — routes into the default `renderInput` `FabricTextField`. */
  helperText?: ReactNode;
  /** Optional full override of the input render. Advanced case. */
  renderInput?: (params: AutocompleteRenderInputParams) => ReactNode;
}

function FabricAutocompleteFn<
  T,
  Multiple extends boolean | undefined = false,
  DisableClearable extends boolean | undefined = false,
  FreeSolo extends boolean | undefined = false,
>({
  label,
  placeholder,
  error,
  helperText,
  renderInput,
  ...rest
}: FabricAutocompleteProps<T, Multiple, DisableClearable, FreeSolo>) {
  const defaultRenderInput = (params: AutocompleteRenderInputParams) => (
    <FabricTextField
      {...params}
      // Selected chips sit in the start adornment, where FabricTextField keeps the label at rest
      // for a lead icon; float it above the chips instead.
      slotProps={
        params.slotProps.input.startAdornment
          ? { ...params.slotProps, inputLabel: { ...params.slotProps.inputLabel, shrink: true } }
          : params.slotProps
      }
      label={label}
      placeholder={placeholder}
      error={error}
      helperText={helperText}
      height="auto"
    />
  );
  return (
    <Autocomplete<T, Multiple, DisableClearable, FreeSolo>
      renderInput={renderInput ?? defaultRenderInput}
      {...rest}
    />
  );
}

FabricAutocompleteFn.displayName = "FabricAutocomplete";

// Generic wrappers don't compose cleanly with `React.memo` — the cast erases
// JSX generic inference for callback params. MUI Autocomplete internally
// memoizes its own rendering, so the outer memo saves little here.
export const FabricAutocomplete = FabricAutocompleteFn;
