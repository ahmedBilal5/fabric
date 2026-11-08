import { iconSize } from "@fabric-kit/design-tokens";

/**
 * Border / stroke widths used across the canvas. Single place to swap for a Fabric token once one exists.
 * FABRIC_TOKEN_MISS: `design-tokens` has no border-width scale; values come from the design (1px node border, 2px handle ring, 2/3px edge stroke).
 */
export const BORDER_WIDTH_PX = { thin: 1, medium: 2, thick: 3 } as const;

/** Node card border width, shared so handles can sit exactly on the card edge. */
export const NODE_BORDER_WIDTH_PX = BORDER_WIDTH_PX.thin;

/** Diameter of the connection handle ring. */
// FABRIC_TOKEN_MISS: handle diameter has no size token; the design specifies 16px.
export const HANDLE_SIZE_PX = 16;

/**
 * Size of the invisible React Flow hit area around a handle ring. React Flow anchors edges to the
 * edge of this box, so it is larger than the ring and edges must be pulled in by `HANDLE_ANCHOR_INSET_PX`.
 */
export const HANDLE_HIT_AREA_PX = iconSize.xl;

/** Gap between the edge anchor (hit-area border) and the visible ring; edges are pulled in by this much. */
export const HANDLE_ANCHOR_INSET_PX = (HANDLE_HIT_AREA_PX - HANDLE_SIZE_PX) / 2;

/** Distance from a handle's center to the outer edge of its ring. */
export const HANDLE_CLEARANCE_PX = HANDLE_SIZE_PX / 2;

/** Offset that centers a handle on the outer edge of the node card border. */
export const HANDLE_OUTSET_PX = HANDLE_SIZE_PX / 2 + NODE_BORDER_WIDTH_PX;

/** How far a node badge chip pokes above the card border (half the 18px chip height). */
// FABRIC_TOKEN_MISS: derived from the design chip height (14px line + 2×2px padding).
export const BADGE_OVERHANG_PX = 9;
