import type { FabricStatusColor } from "@fabric-kit/components";
import type { ProjectStatus } from "../data";

export const STATUS_COLORS: Record<ProjectStatus, FabricStatusColor> = {
  planned: "queued",
  active: "running",
  done: "success",
};

const money = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
const day = new Intl.DateTimeFormat(undefined, {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export const formatMoney = (n: number) => money.format(n);
/** "15 Dec 2026" for `2026-12-15`. */
export const formatDay = (iso: string) => day.format(new Date(`${iso}T00:00:00Z`));
