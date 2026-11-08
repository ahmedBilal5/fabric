/**
 * FabricSkeleton — the design-system content-loading placeholder.
 *
 * Extends MUI `Skeleton` with six ready-made layouts, so you name what is
 * loading instead of composing raw skeletons by hand.
 *
 * The four MUI variants (`text`, `rectangular`, `rounded`, `circular`)
 * pass through untouched. The six Fabric variants — `card` (default),
 * `row`, `listItem`, `tableRow`, `field`, `editor` — render an inner layout
 * built from `@fabric-kit/primitives` with sizes from `@fabric-kit/design-tokens`.
 *
 * `variant` defaults to `"card"`, so `<FabricSkeleton count={6} />` is a
 * full card-grid placeholder. `animation` defaults to `"wave"`.
 *
 * `count?: number` (default `1`) repeats the variant N times inside a
 * `<FabricStack gap="md">`.
 *
 * Composed variants forward the ref to the outer wrapper Stack (`HTMLDivElement`);
 * MUI variants forward to the Skeleton root (`HTMLSpanElement`).
 *
 * @example Basic card grid placeholder (6 tiles)
 * ```tsx
 * <FabricSkeleton count={6} />
 * ```
 *
 * @example Table row placeholder
 * ```tsx
 * <FabricSkeleton variant="tableRow" count={10} />
 * ```
 *
 * @example Raw MUI passthrough (unchanged behavior)
 * ```tsx
 * <FabricSkeleton variant="text" width="60%" height={16} />
 * ```
 */

import { radii } from "@fabric-kit/design-tokens";
import { FabricInline, FabricStack } from "@fabric-kit/primitives";
import Skeleton, { type SkeletonProps } from "@mui/material/Skeleton";
import type { SxProps, Theme } from "@mui/material/styles";
import React, { forwardRef, memo, type ReactNode } from "react";

export type FabricSkeletonVariant =
  | "card"
  | "row"
  | "listItem"
  | "tableRow"
  | "field"
  | "editor"
  | "text"
  | "rectangular"
  | "rounded"
  | "circular";

export interface FabricSkeletonProps extends Omit<SkeletonProps, "variant" | "children"> {
  /**
   * A Fabric layout variant or an MUI passthrough variant. Defaults to `"card"`.
   */
  variant?: FabricSkeletonVariant;
  /**
   * Repeat the variant N times inside a `<FabricStack gap="md">`.
   * @default 1
   */
  count?: number;
}

const MUI_VARIANTS: ReadonlySet<FabricSkeletonVariant> = new Set([
  "text",
  "rectangular",
  "rounded",
  "circular",
]);

type AnimationValue = SkeletonProps["animation"];

// Fabric's composed layouts.
function renderComposed(variant: FabricSkeletonVariant, animation: AnimationValue): ReactNode {
  switch (variant) {
    case "card":
      return (
        <>
          <Skeleton
            variant="rounded"
            width="100%"
            height={200}
            animation={animation}
            sx={{ borderRadius: `${radii.xl}px` }}
          />
          <Skeleton variant="text" width="80%" height={24} animation={animation} />
          <Skeleton variant="text" width="60%" height={20} animation={animation} />
          <FabricInline gap="sm" sx={SPACE_BETWEEN_SX}>
            <Skeleton variant="text" width="30%" height={24} animation={animation} />
            <Skeleton variant="rounded" width={80} height={24} animation={animation} />
          </FabricInline>
          <Skeleton variant="rounded" width="100%" height={28} animation={animation} />
        </>
      );

    case "row":
      return (
        <FabricInline gap="md" sx={ROW_ALIGN_SX}>
          <Skeleton variant="rounded" width={60} height={60} animation={animation} />
          <FabricStack gap="xs" sx={FLEX_ONE_SX}>
            <Skeleton variant="text" width="60%" height={18} animation={animation} />
            <Skeleton variant="text" width="40%" height={14} animation={animation} />
          </FabricStack>
          <Skeleton variant="text" width={60} height={18} animation={animation} />
          <Skeleton variant="rounded" width={50} height={32} animation={animation} />
        </FabricInline>
      );

    case "listItem":
      return (
        <FabricInline gap="sm" sx={ROW_ALIGN_SX}>
          <Skeleton variant="circular" width={16} height={16} animation={animation} />
          <Skeleton variant="text" width="60%" height={16} animation={animation} />
        </FabricInline>
      );

    case "tableRow":
      return (
        <FabricInline gap="md" sx={ROW_ALIGN_SX}>
          <Skeleton variant="text" width="20%" height={20} animation={animation} />
          <Skeleton variant="text" width="30%" height={20} animation={animation} />
          <Skeleton variant="text" width="15%" height={20} animation={animation} />
          <Skeleton variant="text" width="25%" height={20} animation={animation} />
        </FabricInline>
      );

    case "field":
      return (
        <Skeleton
          variant="rounded"
          width="100%"
          height={40}
          animation={animation}
          sx={{ borderRadius: `${radii.md}px` }}
        />
      );

    case "editor":
      return (
        <Skeleton
          variant="rounded"
          width="100%"
          height={400}
          animation={animation}
          sx={{ borderRadius: `${radii.md}px` }}
        />
      );

    default:
      return null;
  }
}

const SPACE_BETWEEN_SX: SxProps<Theme> = {
  alignItems: "center",
  justifyContent: "space-between",
};
const ROW_ALIGN_SX: SxProps<Theme> = { alignItems: "center" };
const FLEX_ONE_SX: SxProps<Theme> = { flex: 1 };

const FabricSkeletonImpl = forwardRef<HTMLElement, FabricSkeletonProps>(function FabricSkeleton(
  { variant = "card", count = 1, animation = "wave", sx, ...rest },
  ref,
) {
  // MUI variants — pass through to a single Skeleton root.
  if (MUI_VARIANTS.has(variant)) {
    const muiVariant = variant as SkeletonProps["variant"];
    if (count > 1) {
      return (
        <FabricStack ref={ref as React.Ref<HTMLDivElement>} gap="sm" sx={sx as SxProps<Theme>}>
          {Array.from({ length: count }).map((_, i) => (
            <Skeleton key={i} variant={muiVariant} animation={animation} {...rest} />
          ))}
        </FabricStack>
      );
    }
    return (
      <Skeleton
        ref={ref as React.Ref<HTMLSpanElement>}
        variant={muiVariant}
        animation={animation}
        sx={sx}
        {...rest}
      />
    );
  }

  // Composed variants — wrap in FabricStack and render the semantic layout.
  const content = renderComposed(variant, animation);
  return (
    <FabricStack
      ref={ref as React.Ref<HTMLDivElement>}
      gap={count > 1 ? "md" : "sm"}
      sx={sx as SxProps<Theme>}
    >
      {count > 1
        ? Array.from({ length: count }).map((_, i) => (
            <FabricStack key={i} gap="sm">
              {content}
            </FabricStack>
          ))
        : content}
    </FabricStack>
  );
});

FabricSkeletonImpl.displayName = "FabricSkeleton";

export const FabricSkeleton = memo(FabricSkeletonImpl);
