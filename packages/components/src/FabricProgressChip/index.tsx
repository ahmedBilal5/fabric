/**
 * FabricProgressChip — the design-system sync-status chip.
 *
 * Extends MUI `Chip` with a 4-state status API (`idle` / `loading` /
 * `success` / `error`) for auto-save and sync indicators.
 *
 *   - Each state has its own colors (from the theme's semantic palette, so
 *     dark mode works) and a matching default icon.
 *   - A fill animation runs once on change, and loops while `loading`. It is
 *     scoped per chip and disabled under `prefers-reduced-motion`.
 *   - Without a `label`, it renders as a compact icon-only chip.
 *   - A custom `icon` keeps its own `sx`.
 *
 * @example
 * ```tsx
 * <FabricProgressChip status={saving ? "loading" : "success"} label={saving ? "Saving…" : "Saved"} />
 * ```
 */

import { keyframes } from "@emotion/react";
import { easing } from "@fabric-kit/design-tokens";
import CloudDoneOutlinedIcon from "@fabric-kit/icons/CloudDoneOutlined";
import ErrorOutlineIcon from "@fabric-kit/icons/ErrorOutlined";
import HourglassEmptyIcon from "@fabric-kit/icons/HourglassEmpty";
import PauseCircleOutlineIcon from "@fabric-kit/icons/PauseCircleOutlined";
import { Chip, type ChipProps } from "@mui/material";
import { styled } from "@mui/material/styles";
import { forwardRef, memo, type ReactElement, type ReactNode } from "react";

export type FabricProgressChipStatus = "idle" | "loading" | "success" | "error";

export interface FabricProgressChipProps extends Omit<ChipProps, "label" | "icon" | "color"> {
  status: FabricProgressChipStatus;
  /** Chip text. When omitted the chip renders icon-only. */
  label?: ReactNode;
  /** Icon override. Defaults to a state-appropriate icon. */
  icon?: ReactElement;
}

// Theme semantic palette (CSS variables), so colors follow light and dark mode.
const semantic = (state: string, key: "bg" | "text") =>
  `var(--mui-palette-semantic-${state}-${key})`;

const STATUS_COLORS: Record<FabricProgressChipStatus, { bg: string; text: string }> = {
  idle: { bg: semantic("cancelled", "bg"), text: semantic("cancelled", "text") },
  loading: { bg: semantic("running", "bg"), text: semantic("running", "text") },
  success: { bg: semantic("success", "bg"), text: semantic("success", "text") },
  error: { bg: semantic("error", "bg"), text: semantic("error", "text") },
};

const DEFAULT_ICONS: Record<FabricProgressChipStatus, ReactElement> = {
  idle: <PauseCircleOutlineIcon />,
  loading: <HourglassEmptyIcon />,
  success: <CloudDoneOutlinedIcon />,
  error: <ErrorOutlineIcon />,
};

const fillEffect = keyframes({
  "0%": { backgroundPosition: "200% 0" },
  "100%": { backgroundPosition: "0% 0" },
});

type StyledChipExtra = {
  $bg: string;
  $text: string;
  $mode: "once" | "infinite";
  $hasLabel: boolean;
};

const StyledChip = styled(Chip, {
  shouldForwardProp: (prop) =>
    prop !== "$bg" && prop !== "$text" && prop !== "$mode" && prop !== "$hasLabel",
})<StyledChipExtra>(({ $bg, $text, $mode, $hasLabel }) => ({
  backgroundColor: $bg,
  color: $text,
  height: 16,
  padding: "8px",
  gap: "4px",
  // Use `backgroundImage` (not the `background` shorthand) so the base
  // `backgroundColor` isn't wiped by the gradient overlay.
  backgroundImage: `linear-gradient(90deg, transparent, ${$bg} 100%)`,
  backgroundSize: "200% 100%",
  animation: `${fillEffect} 2s ${easing.inOut} ${$mode === "infinite" ? "infinite" : "1 forwards"}`,
  "& .MuiChip-icon": {
    color: $text,
    margin: 0,
    width: 16,
    height: 16,
  },
  "& .MuiChip-label": {
    padding: 0,
    display: $hasLabel ? undefined : "none",
  },
  "@media (prefers-reduced-motion: reduce)": {
    animation: "none",
    backgroundColor: $bg,
  },
}));

const FabricProgressChipImpl = forwardRef<HTMLDivElement, FabricProgressChipProps>(
  function FabricProgressChip({ status, label, icon, ...rest }, ref) {
    const colors = STATUS_COLORS[status];
    const resolvedIcon = icon ?? DEFAULT_ICONS[status];
    const mode: StyledChipExtra["$mode"] = status === "loading" ? "infinite" : "once";

    return (
      <StyledChip
        ref={ref}
        $bg={colors.bg}
        $text={colors.text}
        $mode={mode}
        $hasLabel={label !== undefined && label !== null && label !== ""}
        icon={resolvedIcon}
        label={label ?? ""}
        role="status"
        aria-live={status === "loading" ? "polite" : "off"}
        {...rest}
      />
    );
  },
);

FabricProgressChipImpl.displayName = "FabricProgressChip";

export const FabricProgressChip = memo(FabricProgressChipImpl);
