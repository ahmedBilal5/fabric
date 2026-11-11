import type { ReactNode } from "react";

/** One choice in a filter. */
export interface FabricFilterOption {
  /** Value stored in `values` and in the URL. */
  value: string;
  /** Text shown in the menu and on the filter button. */
  label: string;
  /** Optional leading visual, such as a `FabricStatus` dot. */
  icon?: ReactNode;
}

/** A filter: a button that opens a menu of options. */
export interface FabricFilterDef {
  /** Key in `values` and in the URL, e.g. `"status"`. */
  id: string;
  /** Name on the button, e.g. "Status". */
  label: string;
  /** The choices. */
  options: FabricFilterOption[];
  /** Allow several choices (checkboxes) instead of one. @default false */
  multiple?: boolean;
}

/** Selected values by filter id: a string for single filters, an array for multiple. */
export type FabricFilterValues = Record<string, string | string[] | undefined>;
