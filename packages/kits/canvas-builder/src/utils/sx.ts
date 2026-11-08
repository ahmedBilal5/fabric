import type { SxProps, Theme } from "@mui/material/styles";

/** Normalizes an `sx` prop to an array so it can be appended after base styles (works for array-form `sx`). */
export const toSxArray = (sx?: SxProps<Theme>) => (Array.isArray(sx) ? sx : sx ? [sx] : []);
