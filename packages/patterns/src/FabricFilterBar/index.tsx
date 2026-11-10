/**
 * FabricFilterBar — search, filter buttons and "Clear all" above a list or grid.
 *
 * Each filter is a button that opens a menu: one choice, or several with
 * `multiple`. Active filters show their choice on the button ("Status: Paid",
 * "Owner: 2 selected"). The bar is controlled; pair it with `useFilterParams` to keep
 * the search and filters in the URL so filtered lists can be shared and bookmarked.
 *
 * @example
 * ```tsx
 * const filters = useFilterParams(FILTERS);
 * <FabricFilterBar
 *   filters={FILTERS}
 *   values={filters.values}
 *   onValuesChange={filters.setValues}
 *   search={filters.search}
 *   onSearchChange={filters.setSearch}
 *   resultCount={rows.length}
 * />
 * ```
 */

import { FabricButton, FabricCheckbox, FabricMenu, FabricTextField } from "@fabric-kit/components";
import { fontWeight, spacing } from "@fabric-kit/design-tokens";
import ArrowDropDown from "@fabric-kit/icons/ArrowDropDown";
import Check from "@fabric-kit/icons/Check";
import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import type { SxProps, Theme } from "@mui/material/styles";
import { type ReactNode, useId, useState } from "react";
import type { FabricFilterDef, FabricFilterValues } from "./types";

export type { FabricFilterDef, FabricFilterOption, FabricFilterValues } from "./types";

export interface FabricFilterBarProps {
  /** The filters, in display order. */
  filters: FabricFilterDef[];
  /** Selected values by filter id. */
  values: FabricFilterValues;
  /** Called with the new values when a filter changes. */
  onValuesChange: (values: FabricFilterValues) => void;
  /** Search text. Omit both search props to hide the search box. */
  search?: string;
  /** Called on every keystroke. Debounce your fetch with `useDebounce` from `@fabric-kit/hooks`. */
  onSearchChange?: (search: string) => void;
  /** Placeholder and accessible name of the search box. @default "Search" */
  searchPlaceholder?: string;
  /** Number of matching rows, announced to screen readers and shown at the end. */
  resultCount?: number;
  /** Replaces the "24 results" text. */
  formatResultCount?: (count: number) => ReactNode;
  /** Called by "Clear all". Defaults to clearing search and every filter. */
  onClearAll?: () => void;
  /** Content after the filters, such as a saved-views menu or a density toggle. */
  endSlot?: ReactNode;
  /** Accessible name of the filter group. @default "Filters" */
  "aria-label"?: string;
  /** Class on the root. */
  className?: string;
  /** System styles on the root. */
  sx?: SxProps<Theme>;
}

const isActive = (v: string | string[] | undefined) => (Array.isArray(v) ? v.length > 0 : !!v);

function FilterButton({
  def,
  value,
  onChange,
}: {
  def: FabricFilterDef;
  value: string | string[] | undefined;
  onChange: (v: string | string[] | undefined) => void;
}) {
  const menuId = useId();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const selected = Array.isArray(value) ? value : value ? [value] : [];
  const active = selected.length > 0;

  let summary: string | null = null;
  if (selected.length === 1)
    summary = def.options.find((o) => o.value === selected[0])?.label ?? null;
  else if (selected.length > 1) summary = `${selected.length} selected`;

  const toggle = (v: string) => {
    if (def.multiple) {
      const next = selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v];
      // Keep the options' order, so the URL and the button text are stable.
      onChange(def.options.map((o) => o.value).filter((x) => next.includes(x)));
    } else {
      onChange(selected[0] === v ? undefined : v);
      setAnchor(null);
    }
  };

  return (
    <>
      <FabricButton
        variant="outlined"
        size="small"
        endIcon={<ArrowDropDown />}
        aria-haspopup="menu"
        aria-expanded={anchor ? true : undefined}
        aria-controls={anchor ? menuId : undefined}
        aria-label={summary ? `${def.label}: ${summary}` : def.label}
        onClick={(e) => setAnchor(e.currentTarget)}
        data-active={active || undefined}
        sx={
          active
            ? {
                backgroundColor: "rgba(var(--mui-palette-primary-mainChannel) / 0.08)",
                borderColor: "var(--mui-palette-primary-main)",
              }
            : undefined
        }
      >
        {def.label}
        {summary && (
          <>
            <Box component="span" aria-hidden sx={{ mr: "4px" }}>
              :
            </Box>
            <Box
              component="span"
              sx={{
                fontWeight: fontWeight.semiBold,
                maxWidth: 160,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {summary}
            </Box>
          </>
        )}
      </FabricButton>
      <FabricMenu
        id={menuId}
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{ list: { "aria-label": def.label } }}
      >
        {def.options.map((o) => {
          const on = selected.includes(o.value);
          return (
            <MenuItem
              key={o.value}
              role={def.multiple ? "menuitemcheckbox" : "menuitemradio"}
              aria-checked={on}
              selected={!def.multiple && on}
              onClick={() => toggle(o.value)}
              sx={{ gap: `${spacing.sm}px` }}
            >
              {def.multiple ? (
                <FabricCheckbox
                  checked={on}
                  tabIndex={-1}
                  size="small"
                  sx={{ p: 0 }}
                  slotProps={{ input: { "aria-hidden": true } }}
                />
              ) : (
                <Box sx={{ width: 20, display: "flex", "& svg": { fontSize: 18 } }}>
                  {on && <Check />}
                </Box>
              )}
              {o.icon}
              {o.label}
            </MenuItem>
          );
        })}
      </FabricMenu>
    </>
  );
}

/** Search, filter buttons and "Clear all" above a list or grid. */
export function FabricFilterBar({
  filters,
  values,
  onValuesChange,
  search,
  onSearchChange,
  searchPlaceholder = "Search",
  resultCount,
  formatResultCount,
  onClearAll,
  endSlot,
  "aria-label": ariaLabel = "Filters",
  className,
  sx,
}: Readonly<FabricFilterBarProps>) {
  const hasSearch = search !== undefined && onSearchChange !== undefined;
  const anyActive = filters.some((f) => isActive(values[f.id])) || !!search?.trim();

  const clearAll = () => {
    if (onClearAll) return onClearAll();
    onValuesChange(Object.fromEntries(filters.map((f) => [f.id, undefined])));
    onSearchChange?.("");
  };

  const count =
    resultCount == null
      ? null
      : (formatResultCount?.(resultCount) ??
        `${resultCount.toLocaleString()} ${resultCount === 1 ? "result" : "results"}`);

  return (
    <Box
      role="search"
      aria-label={ariaLabel}
      className={className}
      sx={[
        { display: "flex", alignItems: "center", flexWrap: "wrap", gap: `${spacing.sm}px` },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {hasSearch && (
        <FabricTextField
          search
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          onClear={() => onSearchChange("")}
          slotProps={{ htmlInput: { "aria-label": searchPlaceholder } }}
          searchPaperProps={{ sx: { width: { xs: "100%", sm: 260 } } }}
        />
      )}
      {filters.map((def) => (
        <FilterButton
          key={def.id}
          def={def}
          value={values[def.id]}
          onChange={(v) => onValuesChange({ ...values, [def.id]: v })}
        />
      ))}
      {anyActive && (
        <FabricButton variant="text" size="small" onClick={clearAll}>
          Clear all
        </FabricButton>
      )}
      <Box
        sx={{
          ml: "auto",
          display: "flex",
          alignItems: "center",
          gap: `${spacing.md}px`,
        }}
      >
        {count != null && (
          <Box
            component="span"
            aria-live="polite"
            sx={{ fontSize: "0.875rem", color: "var(--mui-palette-text-secondary)" }}
          >
            {count}
          </Box>
        )}
        {endSlot}
      </Box>
    </Box>
  );
}
