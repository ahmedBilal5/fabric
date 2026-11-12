import { type FontSize, fontSize, iconSize, spacing, textVariant } from "@fabric-kit/design-tokens";
import Info from "@fabric-kit/icons/Info";
import { FabricInline } from "@fabric-kit/primitives";
import type { SxProps, Theme } from "@mui/material/styles";
import type { ReactNode } from "react";

/** Label with an optional 16px info icon, shared by switch, radio and checkbox. */
export function controlLabel(label: ReactNode, showInfo?: boolean): ReactNode {
  if (!showInfo) return label;
  return (
    <FabricInline component="span" gap="xs" sx={{ display: "inline-flex", flexWrap: "nowrap" }}>
      {label}
      <Info
        sx={(_theme) => ({
          fontSize: iconSize.sm,
          flexShrink: 0,
          color: "var(--mui-palette-control-label)",
        })}
      />
    </FabricInline>
  );
}

/** Label text: pageTitleMd as written (labels are often sentences), light when off and primary when checked. */
export const controlLabelTextSx =
  (labelSize?: keyof FontSize) =>
  (_theme: Theme): SxProps<Theme> => ({
    // Rules only match when Typography wrapping is active; otherwise the consumer styles the label.
    "& .MuiFormControlLabel-label": {
      ...textVariant.pageTitleMd,
      color: "var(--mui-palette-control-label)",
      ...(labelSize ? { fontSize: fontSize[labelSize] } : {}),
    },
    // FormControlLabel has no checked class, so the on-state color keys off the control inside it.
    "&:not(.Mui-disabled):has(.Mui-checked, .MuiCheckbox-indeterminate) .MuiFormControlLabel-label":
      { color: "text.primary" },
    "&.Mui-disabled .MuiFormControlLabel-label": { color: "text.disabled" },
  });

const toArray = (sx?: SxProps<Theme>) => (Array.isArray(sx) ? sx : sx ? [sx] : []);

/** FormControlLabel `sx`: gap and margins, label text, then consumer `labelSx`. */
export const controlLabelSx = (
  labelSize?: keyof FontSize,
  labelSx?: SxProps<Theme>,
): SxProps<Theme> => [
  { gap: `${spacing.xs}px`, marginLeft: 0, marginRight: 0 },
  controlLabelTextSx(labelSize),
  ...toArray(labelSx),
];
