/**
 * Text fields, selects, autocompletes and pickers fill the width of a form
 * section or row, so apps don't pass `fullWidth` to every field. Use
 * `FabricFormRow` to put short fields side by side.
 */
export const fillFieldsSx = {
  "& .MuiTextField-root, & .MuiAutocomplete-root, & .MuiPickersTextField-root": { width: "100%" },
} as const;
