import { describe, expect, it } from "vitest";
import {
  formatCurrency,
  formatDate,
  formatFileSize,
  formatNumber,
  formatPercent,
  formatRelativeTime,
  relativeTimeRefreshMs,
  toDate,
} from "../src/format";

// Intl output can use narrow no-break spaces; compare with plain spaces.
const plain = (s: string) => s.replace(/[  ]/g, " ");

describe("toDate", () => {
  it("accepts dates, timestamps and ISO strings", () => {
    const iso = "2026-03-12T14:05:00.000Z";
    expect(toDate(iso).toISOString()).toBe(iso);
    expect(toDate(Date.parse(iso)).toISOString()).toBe(iso);
    expect(toDate(new Date(iso)).toISOString()).toBe(iso);
  });
  it("throws on an invalid date", () => {
    expect(() => toDate("not a date")).toThrow(RangeError);
  });
});

describe("formatDate", () => {
  const d = "2026-03-12T14:05:00Z";
  const opts = { locale: "en-GB", timeZone: "UTC" };
  it("formats named styles", () => {
    expect(formatDate(d, "date", opts)).toBe("12 Mar 2026");
    expect(formatDate(d, "long", opts)).toBe("12 March 2026");
    expect(formatDate(d, "time", opts)).toBe("14:05");
    expect(formatDate(d, "monthYear", opts)).toBe("March 2026");
  });
  it("respects the locale", () => {
    expect(formatDate(d, "short", { locale: "en-US", timeZone: "UTC" })).toBe("3/12/26");
  });
  it("accepts Intl options", () => {
    expect(formatDate(d, { weekday: "long" }, opts)).toBe("Thursday");
  });
});

describe("formatRelativeTime", () => {
  const now = Date.parse("2026-03-12T12:00:00Z");
  const at = (seconds: number) => now + seconds * 1000;
  const rel = (seconds: number) => formatRelativeTime(at(seconds), { now, locale: "en" });
  it("reads under 45 seconds as now", () => {
    expect(rel(-10)).toBe("now");
    expect(rel(30)).toBe("now");
  });
  it("picks the largest sensible unit", () => {
    expect(rel(-5 * 60)).toBe("5 minutes ago");
    expect(rel(-3 * 3600)).toBe("3 hours ago");
    expect(rel(-24 * 3600)).toBe("yesterday");
    expect(rel(2 * 7 * 24 * 3600)).toBe("in 2 weeks");
    expect(rel(-400 * 24 * 3600)).toBe("last year");
  });
  it("counts days by the calendar", () => {
    // Local times, so the test holds in any time zone.
    const justAfterMidnight = new Date(2026, 2, 12, 0, 30).getTime();
    const twoDatesBack = new Date(2026, 2, 10, 22, 30).getTime(); // 26 hours earlier
    expect(formatRelativeTime(twoDatesBack, { now: justAfterMidnight, locale: "en" })).toBe(
      "2 days ago",
    );
    const lateEvening = new Date(2026, 2, 12, 23, 0).getTime();
    const earlyMorning = new Date(2026, 2, 12, 1, 0).getTime(); // 22 hours, same date
    expect(formatRelativeTime(earlyMorning, { now: lateEvening, locale: "en" })).toBe(
      "22 hours ago",
    );
  });
  it("supports numeric always", () => {
    expect(formatRelativeTime(at(-24 * 3600), { now, locale: "en", numeric: "always" })).toBe(
      "1 day ago",
    );
  });
  it("refreshes often for recent times and rarely for old ones", () => {
    expect(relativeTimeRefreshMs(at(-20), now)).toBe(10_000);
    expect(relativeTimeRefreshMs(at(-600), now)).toBe(30_000);
    expect(relativeTimeRefreshMs(at(-7200), now)).toBe(300_000);
    expect(relativeTimeRefreshMs(at(-3 * 86400), now)).toBe(3_600_000);
  });
});

describe("numbers", () => {
  it("groups digits for the locale", () => {
    expect(formatNumber(1234567.891, { locale: "en-US" })).toBe("1,234,567.891");
    expect(plain(formatNumber(1234567.891, { locale: "de-DE" }))).toBe("1.234.567,891");
  });
  it("supports compact notation", () => {
    expect(formatNumber(1234567, { locale: "en-US", notation: "compact" })).toBe("1.2M");
  });
  it("formats currency", () => {
    expect(formatCurrency(1499.5, "USD", { locale: "en-US" })).toBe("$1,499.50");
    expect(plain(formatCurrency(1499.5, "EUR", { locale: "de-DE" }))).toBe("1.499,50 €");
    expect(formatCurrency(1500, "JPY", { locale: "en-US" })).toBe("¥1,500");
  });
  it("formats percentages from ratios", () => {
    expect(formatPercent(0.256, { locale: "en-US" })).toBe("26%");
    expect(formatPercent(0.256, { locale: "en-US", maximumFractionDigits: 1 })).toBe("25.6%");
  });
});

describe("formatFileSize", () => {
  it("uses decimal units by default", () => {
    expect(formatFileSize(0, { locale: "en-US" })).toBe("0 bytes");
    expect(formatFileSize(999, { locale: "en-US" })).toBe("999 bytes");
    expect(formatFileSize(1_536_000, { locale: "en-US" })).toBe("1.5 MB");
    expect(formatFileSize(2_000_000_000, { locale: "en-US" })).toBe("2 GB");
  });
  it("uses binary units with base 1024", () => {
    expect(formatFileSize(1_572_864, { locale: "en-US", base: 1024 })).toBe("1.5 MiB");
    expect(formatFileSize(512, { locale: "en-US", base: 1024 })).toBe("512 B");
  });
});
