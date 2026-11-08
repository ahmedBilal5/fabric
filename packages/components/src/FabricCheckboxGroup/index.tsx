/**
 * CheckboxGroup — the correct place for `<FormGroup>` semantics.
 *
 * A labelled group of checkboxes. Standalone `FabricCheckbox`es render without a
 * group wrapper; use this when several checkboxes answer one question, so screen
 * readers announce the group label.
 *
 * Composition follows MUI's canonical pattern:
 *
 *     <FormControl>          ← ties the group's label to the inputs for a11y
 *       <FormLabel>          ← the group's accessible name
 *       <FormGroup>          ← the `role="group"` container
 *         <FabricCheckbox />  ← individual controls
 *
 * The group provides layout (`row?: boolean`), a label, and helper text. Individual
 * `<FabricCheckbox>` children retain full control of their state — the group does NOT
 * try to own the values. Consumers who want "select all" or "N of M selected" behavior
 * compose it themselves; those are product-specific patterns that don't belong in a
 * base component.
 *
 * @example
 * ```tsx
 * <FabricCheckboxGroup
 *   label="Notifications"
 *   value={enabled}
 *   onChange={setEnabled}
 *   options={[
 *     { value: 'email', label: 'Email' },
 *     { value: 'sms',   label: 'SMS' },
 *     { value: 'push',  label: 'Push' },
 *   ]}
 * />
 * ```
 */

import { spacing } from "@fabric-kit/design-tokens";
import {
  FormControl,
  type FormControlProps,
  FormGroup,
  FormHelperText,
  FormLabel,
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import { forwardRef, memo, type ReactNode, useId } from "react";

export interface CheckboxGroupProps extends Omit<FormControlProps, "children"> {
  /** Group label — rendered inside `<FormLabel>` and wired to the group via `aria-labelledby`. */
  label?: ReactNode;
  /** Helper or error text rendered below the group. Announced via `aria-describedby`. */
  helperText?: ReactNode;
  /** Lay checkboxes out horizontally instead of stacked. */
  row?: boolean;
  /** Style overrides for the inner `<FormGroup>`. Group-level layout tuning lives here. */
  groupSx?: SxProps<Theme>;
  /** `<FabricCheckbox>` instances (or any ReactNode). */
  children: ReactNode;
}

const CheckboxGroupImpl = forwardRef<HTMLDivElement, CheckboxGroupProps>(function CheckboxGroup(
  { label, helperText, row, groupSx, children, error, ...formControlProps },
  ref,
) {
  const labelId = useId();
  const helperId = useId();

  return (
    <FormControl ref={ref} error={error} {...formControlProps}>
      {label !== undefined && <FormLabel id={labelId}>{label}</FormLabel>}
      <FormGroup
        row={row}
        // FabricCheckbox has no hit-area padding, so the group supplies the spacing between items.
        sx={[
          { gap: `${spacing.sm}px ${spacing.xl}px` },
          ...(Array.isArray(groupSx) ? groupSx : groupSx ? [groupSx] : []),
        ]}
        aria-labelledby={label !== undefined ? labelId : undefined}
        aria-describedby={helperText !== undefined ? helperId : undefined}
      >
        {children}
      </FormGroup>
      {helperText !== undefined && <FormHelperText id={helperId}>{helperText}</FormHelperText>}
    </FormControl>
  );
});

CheckboxGroupImpl.displayName = "CheckboxGroup";

export const CheckboxGroup = memo(CheckboxGroupImpl);
