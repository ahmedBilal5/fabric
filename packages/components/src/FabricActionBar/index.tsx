/**
 * FabricActionBar — the design-system page-header / toolbar strip.
 *
 * A header strip for pages, side panels, editors and filter drawers. It has
 * free-form left/right slots, a heading block (icon + text + chip + optional
 * inline editing), and `leftControls` / `rightControls` arrays rendered as
 * `FabricButton`s.
 *
 * - `heading.text` accepts any `ReactNode`.
 * - The editable heading confirms on Enter or the check button, and cancels on Escape.
 * - Height, padding, gap and the optional bottom border come from design tokens.
 *
 * @example
 * ```tsx
 * <FabricActionBar
 *   heading={{ text: 'Products', variant: 'h5' }}
 *   rightControls={[
 *     { children: 'Import', variant: 'outlined', onClick: openImport },
 *     { children: 'New product', variant: 'contained', onClick: create },
 *   ]}
 * />
 * ```
 */

import { border, fontWeight, iconSize, spacing, textVariant } from "@fabric-kit/design-tokens";
import EditOutlinedIcon from "@fabric-kit/icons/EditOutlined";
import { Box, Typography } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import React, { forwardRef, memo, type ReactNode, useState } from "react";
import { FabricButton, type FabricButtonProps } from "../FabricButton";
import { EditableHeading } from "./EditableHeading";

export interface FabricActionBarHeading {
  /** Heading content. */
  text?: ReactNode;
  /** Icon rendered before the text. */
  icon?: ReactNode;
  /** Chip / badge / progress rendered after the text. */
  chip?: ReactNode;
  /** Click handler on the heading container. */
  onClick?: () => void;
  /** MUI Typography variant applied to the heading text. */
  variant?: React.ComponentProps<typeof Typography>["variant"];
  /** When set, hovering the heading reveals an edit pencil. */
  editable?: boolean;
  /**
   * Called when the user confirms an edit. Return a promise; a spinner
   * replaces the check icon while pending.
   */
  onEditComplete?: (newText: string) => unknown | Promise<unknown>;
}

export interface FabricActionBarProps {
  /** Center-left heading block. */
  heading?: FabricActionBarHeading;
  /** Free-form nodes rendered before / after the controls. */
  slots?: { left?: ReactNode; right?: ReactNode };
  /**
   * Buttons rendered on the left, after `slots.left`. Default to `size="small"`; text buttons get
   * a muted label color. Props passed per item win.
   */
  leftControls?: FabricButtonProps[];
  /** Buttons rendered on the right, before `slots.right`. Same defaults as `leftControls`. */
  rightControls?: FabricButtonProps[];
  /** Render a `1px` bottom border using `border.default`. Defaults to `false`. */
  bordered?: boolean;
  /** Bar height. Defaults to `52px`. */
  height?: number | string;
  /** Root `sx` — merged after DS defaults; consumer keys win. */
  sx?: SxProps<Theme>;
}

// Page-title style: heading font 16/18 SemiBold, capitalized. Used when `heading.variant` is not set.
const PAGE_TITLE_SX: SxProps<Theme> = {
  ...textVariant.pageTitleLg,
  fontWeight: fontWeight.semiBold,
  lineHeight: 1.125,
  textTransform: "capitalize",
};

// Text buttons in the bar use the muted header label color.
const TEXT_CONTROL_SX: SxProps<Theme> = { color: "var(--mui-palette-appShell-text)" };

function renderControls(controls: FabricButtonProps[] | undefined) {
  if (!controls || controls.length === 0) return null;
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: `${spacing.xs}px` }}>
      {controls.map((control, idx) => {
        const isText = (control.variant ?? "text") === "text";
        const controlSx = Array.isArray(control.sx) ? control.sx : [control.sx];
        return (
          <FabricButton
            key={idx}
            size="small"
            {...control}
            sx={isText ? [TEXT_CONTROL_SX, ...controlSx] : control.sx}
          />
        );
      })}
    </Box>
  );
}

const FabricActionBarImpl = forwardRef<HTMLDivElement, FabricActionBarProps>(
  function FabricActionBar(
    { heading, slots, leftControls, rightControls, bordered = false, height = 52, sx },
    ref,
  ) {
    const [editMode, setEditMode] = useState(false);

    const dsSx: SxProps<Theme> = {
      display: "flex",
      width: "100%",
      height,
      justifyContent: "space-between",
      alignItems: "center",
      padding: `${spacing.md}px ${spacing.xl}px`,
      bgcolor: "var(--mui-palette-background-paper)",
      borderBottom: bordered ? `1px solid ${border.default}` : "none",
      boxSizing: "border-box",
    };
    const mergedSx: SxProps<Theme> = Array.isArray(sx) ? [dsSx, ...sx] : sx ? [dsSx, sx] : dsSx;

    const showEditable = heading?.editable && editMode;

    return (
      <Box ref={ref} sx={mergedSx}>
        {/* Left content */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: `${spacing.sm}px`,
            minWidth: 0,
          }}
        >
          {slots?.left}
          {renderControls(leftControls)}
          {heading && (
            <Box
              onClick={heading.onClick}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: `${spacing.sm}px`,
                minWidth: 0,
                cursor: heading.onClick ? "pointer" : "default",
                "& > .MuiSvgIcon-root": { fontSize: iconSize.xl },
                "&:hover .FabricActionBar-editButton": { opacity: 1 },
              }}
            >
              {heading.icon}
              {showEditable ? (
                <EditableHeading
                  text={typeof heading.text === "string" ? heading.text : ""}
                  onEditComplete={async (newText) => {
                    await heading.onEditComplete?.(newText);
                    setEditMode(false);
                  }}
                  onCancel={() => setEditMode(false)}
                />
              ) : (
                <Typography
                  variant={heading.variant}
                  sx={[
                    {
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      color: "text.primary",
                    },
                    !heading.variant && PAGE_TITLE_SX,
                  ]}
                >
                  {heading.text}
                </Typography>
              )}
              {heading.chip && (
                <Box sx={{ display: "flex", alignItems: "center" }}>{heading.chip}</Box>
              )}
              {heading.editable && !showEditable && (
                <Box
                  className="FabricActionBar-editButton"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditMode(true);
                  }}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    opacity: 0,
                    transition: "opacity .15s",
                    cursor: "pointer",
                  }}
                >
                  <EditOutlinedIcon sx={{ fontSize: 18 }} />
                </Box>
              )}
            </Box>
          )}
        </Box>
        {/* Right content */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: `${spacing.sm}px`,
            flexShrink: 0,
          }}
        >
          {renderControls(rightControls)}
          {slots?.right}
        </Box>
      </Box>
    );
  },
);

FabricActionBarImpl.displayName = "FabricActionBar";

export const FabricActionBar = memo(FabricActionBarImpl);
