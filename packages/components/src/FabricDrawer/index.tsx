/**
 * FabricDrawer — the design-system side drawer. Wraps MUI `Drawer` and defaults
 * to `anchor="right"`, where detail and filter panels usually open. Pass
 * `anchor="left" | "top" | "bottom"` to override.
 *
 * The full MUI `Drawer` prop surface (`open`, `onClose`, `variant`, `elevation`,
 * `hideBackdrop`, `ModalProps`, `PaperProps`, `SlideProps`, `transitionDuration`)
 * is preserved.
 *
 * @example
 * ```tsx
 * <FabricDrawer open={open} onClose={() => setOpen(false)}>
 *   <FabricStack gap="md" sx={{ p: 2, width: 320 }}>
 *     <FabricText textVariant="headingSm">Filters</FabricText>
 *     <FabricTextField label="Search" />
 *   </FabricStack>
 * </FabricDrawer>
 * ```
 */

import { Drawer, type DrawerProps } from "@mui/material";
import { forwardRef, memo } from "react";

export type FabricDrawerProps = DrawerProps;

const PAPER_SX = { backgroundImage: "none" } as const;

export const FabricDrawer = memo(
  forwardRef<HTMLDivElement, FabricDrawerProps>(({ anchor = "right", slotProps, ...rest }, ref) => {
    const consumerPaper = (slotProps?.paper as { sx?: object } | undefined) ?? {};
    const mergedSlotProps = {
      ...slotProps,
      paper: {
        ...consumerPaper,
        sx: { ...PAPER_SX, ...(consumerPaper.sx ?? {}) },
      },
    };
    return <Drawer ref={ref} anchor={anchor} slotProps={mergedSlotProps} {...rest} />;
  }),
);
FabricDrawer.displayName = "FabricDrawer";
