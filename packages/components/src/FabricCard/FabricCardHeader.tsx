import {
  dark,
  field,
  fontFamily,
  fontSize,
  fontWeight,
  spacing,
  text,
} from "@fabric-kit/design-tokens";
import { CardHeader, type CardHeaderProps } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import { forwardRef, memo } from "react";

export interface FabricCardHeaderProps extends CardHeaderProps {
  /**
   * `medium` is the standard 16px card title (app and tag cards). `large` is
   * the 24px title used by metric cards.
   * @default "medium"
   */
  size?: "medium" | "large";
}

// 24px icon, 16/20 heading-font title, 12/14 body-font description.
const baseSx = (theme: Theme) => ({
  padding: `${spacing.lg}px`,
  "& .MuiCardHeader-avatar": {
    marginRight: `${spacing.sm}px`,
    "& .MuiSvgIcon-root": { fontSize: 24 },
  },
  "& .MuiCardHeader-title": {
    fontFamily: fontFamily.heading,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semiBold,
    lineHeight: "20px",
    color: text.heading,
    ...theme.applyStyles("dark", { color: dark.text.heading }),
  },
  "& .MuiCardHeader-subheader": {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    lineHeight: "14px",
    color: field.label,
    ...theme.applyStyles("dark", { color: dark.field.label }),
  },
});

const largeTitleSx = {
  "& .MuiCardHeader-title": {
    fontFamily: fontFamily.heading,
    fontSize: fontSize["3xl"],
    fontWeight: fontWeight.medium,
    lineHeight: "32px",
  },
} as const;

/**
 * FabricCardHeader — the standard card header: icon, title, description and
 * an optional trailing action (chip, count, menu button).
 *
 * Thin wrapper over MUI `CardHeader`. The spacing, the 24px icon and the
 * title / description type styles are applied here, not in the theme, so raw
 * MUI `CardHeader` elsewhere in an app is unchanged.
 *
 * @example
 * ```tsx
 * <FabricCardHeader avatar={<AppsIcon />} title="Rules" subheader="Manage rules" />
 * <FabricCardHeader size="large" title="Revenue" action={<FabricChip label="Today" />} />
 * ```
 */
const FabricCardHeaderImpl = forwardRef<HTMLDivElement, FabricCardHeaderProps>(
  function FabricCardHeader({ size = "medium", sx, ...rest }, ref) {
    const sxList = Array.isArray(sx) ? sx : sx ? [sx] : [];
    return (
      <CardHeader
        ref={ref}
        sx={[baseSx, size === "large" ? largeTitleSx : {}, ...sxList]}
        {...rest}
      />
    );
  },
);

FabricCardHeaderImpl.displayName = "FabricCardHeader";

export const FabricCardHeader = memo(FabricCardHeaderImpl);
