import { FormControl, FormHelperText } from "@mui/material";
import type { ReactNode } from "react";

// Controls without their own helper-text slot share this accessible shell.
export function FieldFeedback({
  error,
  helperText,
  id,
  children,
  disabled,
}: {
  error: boolean;
  helperText: ReactNode;
  id?: string;
  children: ReactNode;
  disabled?: boolean;
}) {
  return (
    <FormControl error={error} disabled={disabled}>
      {children}
      {helperText != null && <FormHelperText id={id}>{helperText}</FormHelperText>}
    </FormControl>
  );
}
