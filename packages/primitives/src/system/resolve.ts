import { spacing } from "@fabric-kit/design-tokens";
import type { Breakpoint, ResponsiveValue, Space } from "./types";

/** Resolve a token-scale gap key to a px string for sx. */
export function resolveGap(gap: Space | undefined): string | undefined {
  return gap !== undefined ? `${spacing[gap]}px` : undefined;
}

function isResponsiveObject<T>(
  value: T | Partial<Record<Breakpoint, T>>,
): value is Partial<Record<Breakpoint, T>> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

/** Resolve a responsive gap prop into an sx-compatible value (scalar or breakpoint object). */
export function resolveResponsiveGap(
  gap: ResponsiveValue<Space> | undefined,
): string | Record<string, string> | undefined {
  if (gap === undefined) return undefined;
  if (!isResponsiveObject(gap)) return `${spacing[gap]}px`;
  const result: Record<string, string> = {};
  for (const [bp, val] of Object.entries(gap)) {
    if (val !== undefined) result[bp] = `${spacing[val]}px`;
  }
  return result;
}

/** Resolve a responsive prop that doesn't need token transformation (pass-through values like direction, align). */
export function resolveResponsiveProp<T>(
  value: ResponsiveValue<T> | undefined,
): T | Record<string, T> | undefined {
  if (value === undefined) return undefined;
  if (!isResponsiveObject(value)) return value;
  const result: Record<string, T> = {};
  for (const [bp, val] of Object.entries(value)) {
    if (val !== undefined) result[bp] = val as T;
  }
  return result;
}
