/**
 * FabricMenuButton — trigger + FabricMenu compound.
 *
 * An IconButton (or any `trigger` element) wrapped in an optional Tooltip, opening a FabricMenu on
 * click. Internally manages `anchorEl` when uncontrolled; can be controlled
 * by passing `open` + `onClose`. Renders items via `FabricMenu`'s declarative
 * `items` prop, or arbitrary `children`.
 *
 * Use it for the common "⋮ more actions" button. If you already have your own
 * trigger and anchor state, use `FabricMenu` directly.
 *
 * @example
 * ```tsx
 * <FabricMenuButton
 *   icon={<MoreVertIcon />}
 *   tooltip="Row actions"
 *   items={[
 *     { label: 'Duplicate', onClick: duplicate },
 *     { label: 'Delete',    onClick: remove },
 *   ]}
 * />
 * ```
 */

import MoreVertIcon from "@fabric-kit/icons/MoreVert";
import { Box, IconButton, type IconButtonProps } from "@mui/material";
import React, { memo, type ReactNode, useCallback, useMemo, useState } from "react";
import { FabricMenu, type FabricMenuItem, type FabricMenuProps } from "../FabricMenu";
import { FabricTooltip } from "../FabricTooltip";

export type { FabricMenuItem };

export interface FabricMenuButtonProps
  extends Omit<Partial<FabricMenuProps>, "anchorEl" | "open" | "onClose" | "children"> {
  /** Content of the trigger. Defaults to `<MoreVertIcon />`. Ignored when `trigger` is set. */
  icon?: ReactNode;
  /** Fully-custom trigger element. Overrides `icon`. Receives no injected props — consumer wires onClick via `onOpen`. */
  trigger?: ReactNode;
  /** Tooltip text shown on the trigger. When omitted, no tooltip is rendered. */
  tooltip?: string;
  /** IconButton props (size, color, etc.) forwarded to the default trigger. Ignored when `trigger` is set. */
  triggerButtonProps?: Omit<
    IconButtonProps,
    "onClick" | "aria-controls" | "aria-haspopup" | "aria-expanded"
  >;
  /** `sx` applied to the wrapping Box that receives the click. */
  wrapperSx?: object;
  /** Declarative menu item list. Alternative to `children`. */
  items?: FabricMenuItem[];
  /** Menu children (rendered when `items` is omitted). */
  children?: ReactNode;
  /** `data-testid` on the trigger element. */
  testId?: string;
  /** Controlled open state. When set, `onClose` MUST be provided; internal state is not used. */
  open?: boolean;
  /** Called when the menu should close. Required when `open` is controlled. */
  onClose?: FabricMenuProps["onClose"];
  /** Called after the trigger opens the menu. */
  onOpen?: (event: React.MouseEvent<HTMLElement>) => void;
  /** Disables the trigger. */
  disabled?: boolean;
}

function FabricMenuButtonImpl({
  icon,
  trigger,
  tooltip,
  triggerButtonProps,
  wrapperSx,
  items,
  children,
  testId,
  open: controlledOpen,
  onClose,
  onOpen,
  disabled,
  ...menuProps
}: FabricMenuButtonProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? (controlledOpen ?? false) : Boolean(anchorEl);

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      if (!isControlled) setAnchorEl(event.currentTarget);
      onOpen?.(event);
    },
    [isControlled, onOpen],
  );

  const handleClose = useCallback<NonNullable<FabricMenuProps["onClose"]>>(
    (event, reason) => {
      if (!isControlled) setAnchorEl(null);
      onClose?.(event, reason);
    },
    [isControlled, onClose],
  );

  const triggerNode = useMemo(() => {
    if (trigger) {
      return (
        <Box
          onClick={disabled ? undefined : handleClick}
          data-testid={testId}
          sx={{
            display: "inline-flex",
            cursor: disabled ? "not-allowed" : "pointer",
            ...wrapperSx,
          }}
        >
          {trigger}
        </Box>
      );
    }
    return (
      <IconButton
        onClick={handleClick}
        disabled={disabled}
        data-testid={testId}
        aria-controls={open ? "fabric-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        size="small"
        {...triggerButtonProps}
        sx={{ ...wrapperSx, ...triggerButtonProps?.sx }}
      >
        {icon ?? <MoreVertIcon />}
      </IconButton>
    );
  }, [trigger, disabled, handleClick, testId, wrapperSx, open, triggerButtonProps, icon]);

  const wrappedTrigger = tooltip ? (
    <FabricTooltip title={tooltip}>
      <span>{triggerNode}</span>
    </FabricTooltip>
  ) : (
    triggerNode
  );

  return (
    <>
      {wrappedTrigger}
      <FabricMenu
        id="fabric-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        items={items}
        {...menuProps}
      >
        {children}
      </FabricMenu>
    </>
  );
}

FabricMenuButtonImpl.displayName = "FabricMenuButton";

export const FabricMenuButton = memo(FabricMenuButtonImpl);
