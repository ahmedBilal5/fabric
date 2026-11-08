import type { Breakpoints, Spacing } from "@fabric-kit/design-tokens";

/** Named spacing slot from `@fabric-kit/design-tokens` (none=0, xs=4, sm=8, md=12, lg=16, xl=24…). */
export type Space = keyof Spacing;

/** Breakpoint key from the design-token scale. */
export type Breakpoint = keyof Breakpoints;

/** A value that can be either a scalar or a per-breakpoint object. */
export type ResponsiveValue<T> = T | Partial<Record<Breakpoint, T>>;
