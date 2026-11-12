/**
 * FabricStatCard — one key number with its change versus the previous period and an
 * optional sparkline of the trend.
 *
 * Pass `previousValue` and the card works out the change, or pass `change` yourself.
 * The change is colored by whether it's good news: set `goodDirection="down"` for
 * numbers that should fall (churn, response time), or `"neutral"` when neither way is
 * better. Color is never the only cue: an arrow and the words "up" or "down" go with it.
 *
 * @example
 * ```tsx
 * <FabricStatCard
 *   label="Monthly recurring revenue"
 *   value={48_250}
 *   previousValue={43_900}
 *   comparisonLabel="vs last month"
 *   valueFormat={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }}
 *   trend={[39_100, 40_200, 41_800, 43_900, 48_250]}
 * />
 * ```
 */

import { fontSize, fontWeight, radii, spacing } from "@fabric-kit/design-tokens";
import ArrowDownwardIcon from "@fabric-kit/icons/ArrowDownward";
import ArrowUpwardIcon from "@fabric-kit/icons/ArrowUpward";
import RemoveIcon from "@fabric-kit/icons/Remove";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Skeleton from "@mui/material/Skeleton";
import type { SxProps, Theme } from "@mui/material/styles";
import { type ElementType, forwardRef, type ReactNode, useId } from "react";
import { computeDelta, deltaTone } from "../data";
import { FabricSparkline } from "../FabricSparkline";
import { useNumberFormat } from "../internal/shared";

export interface FabricStatCardProps {
  /** What the number is, in sentence case, e.g. "Active customers". */
  label: ReactNode;
  /** The number, or text you've already formatted. */
  value: number | string | null;
  /** Last period's value. The card shows the change from it. */
  previousValue?: number | null;
  /**
   * The change as a ratio (0.12 is +12%), when you have it instead of `previousValue`.
   * Wins over `previousValue`.
   */
  change?: number | null;
  /** The period the change compares with, e.g. "vs last month". */
  comparisonLabel?: string;
  /**
   * Which way is good news. "down" for churn or wait times; "neutral" when neither.
   * @default "up"
   */
  goodDirection?: "up" | "down" | "neutral";
  /** Show the change as a percentage or as an absolute amount. @default "percent" */
  changeFormat?: "percent" | "absolute";
  /** Number format for the value (and an absolute change). */
  valueFormat?: Intl.NumberFormatOptions;
  /** Locale for numbers. Defaults to the browser's. */
  locale?: string;
  /** Recent values, oldest first, drawn as a sparkline. */
  trend?: number[];
  /** Labels for the trend values, shown on hover. */
  trendLabels?: Array<string | Date>;
  /** Draw the trend as a line or bars. @default "line" */
  trendType?: "line" | "bar";
  /** An icon at the top right. */
  icon?: ReactNode;
  /** A short note under the number, e.g. "12 trials end this week". */
  caption?: ReactNode;
  /** Show placeholders while the number loads. */
  loading?: boolean;
  /** Make the whole card a link. */
  href?: string;
  /** Make the whole card a button. */
  onClick?: () => void;
  /** Link component for `href`, e.g. a router link. */
  LinkComponent?: ElementType;
  /** System styles on the root. */
  sx?: SxProps<Theme>;
}

const toneColor = {
  positive: "var(--mui-palette-semantic-success-text)",
  negative: "var(--mui-palette-semantic-error-text)",
  neutral: "var(--mui-palette-text-secondary)",
} as const;

/** A key number with its change and an optional trend. */
export const FabricStatCard = forwardRef<HTMLDivElement, FabricStatCardProps>(
  function FabricStatCard(
    {
      label,
      value,
      previousValue,
      change,
      comparisonLabel,
      goodDirection = "up",
      changeFormat = "percent",
      valueFormat,
      locale,
      trend,
      trendLabels,
      trendType = "line",
      icon,
      caption,
      loading = false,
      href,
      onClick,
      LinkComponent,
      sx,
    },
    ref,
  ) {
    const labelId = useId();
    const format = useNumberFormat(valueFormat, locale);
    const pct = useNumberFormat({ style: "percent", maximumFractionDigits: 1 }, locale);
    const shown = typeof value === "number" ? format(value) : (value ?? "–");

    let delta: {
      text: string;
      spoken: string;
      /** "up", "down" or "no change", for the end of a clickable card's name. */
      word: string;
      tone: keyof typeof toneColor;
      dir: "up" | "down" | "flat";
    } | null = null;
    const numeric = typeof value === "number";
    if (change != null || (numeric && previousValue != null)) {
      const d =
        change != null
          ? {
              change: numeric && previousValue != null ? (value as number) - previousValue : 0,
              ratio: change,
              direction:
                change > 0 ? ("up" as const) : change < 0 ? ("down" as const) : ("flat" as const),
            }
          : computeDelta(value as number, previousValue as number);
      const amount =
        changeFormat === "percent" && d.ratio != null
          ? pct(Math.abs(d.ratio))
          : format(Math.abs(d.change));
      const word = d.direction === "flat" ? "No change" : d.direction === "up" ? "Up" : "Down";
      delta = {
        text: d.direction === "flat" ? "0%" : amount,
        spoken: d.direction === "flat" ? word : `${word} ${amount}`,
        word: word.toLowerCase(),
        tone: deltaTone(d.direction, goodDirection),
        dir: d.direction,
      };
    }

    const Arrow =
      delta?.dir === "up"
        ? ArrowUpwardIcon
        : delta?.dir === "down"
          ? ArrowDownwardIcon
          : RemoveIcon;
    const interactive = Boolean(href || onClick);

    const body = (
      <>
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: `${spacing.sm}px` }}>
          <Box
            id={labelId}
            sx={{
              flex: 1,
              minWidth: 0,
              fontSize: fontSize.md,
              fontWeight: fontWeight.medium,
              color: "var(--mui-palette-text-secondary)",
            }}
          >
            {label}
          </Box>
          {icon && (
            <Box
              aria-hidden="true"
              sx={{
                display: "flex",
                color: "var(--mui-palette-text-secondary)",
                "& svg": { fontSize: 20 },
              }}
            >
              {icon}
            </Box>
          )}
        </Box>{" "}
        {loading ? (
          <>
            <Skeleton width="55%" height={40} />
            <Skeleton width="40%" />
          </>
        ) : (
          <>
            <Box
              sx={{
                fontSize: fontSize["4xl"],
                lineHeight: 1.15,
                fontWeight: fontWeight.semiBold,
                letterSpacing: "-0.02em",
                color: "var(--mui-palette-text-primary)",
                overflowWrap: "anywhere",
              }}
            >
              {shown}
            </Box>
            {/* Spaces between blocks keep the text readable when copied or read as one string. */}{" "}
            {(delta || caption) && (
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  columnGap: `${spacing.xs}px`,
                  fontSize: fontSize.md,
                  color: "var(--mui-palette-text-secondary)",
                }}
              >
                {delta && (
                  <>
                    <Box
                      component="span"
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "2px",
                        fontWeight: fontWeight.semiBold,
                        color: toneColor[delta.tone],
                        "& svg": { fontSize: 16 },
                      }}
                    >
                      <Arrow aria-hidden="true" />
                      <span aria-hidden="true">{delta.text}</span>
                      <Box component="span" sx={srOnly}>
                        {delta.spoken}
                      </Box>
                    </Box>
                    {comparisonLabel && " "}
                    {comparisonLabel && <span>{comparisonLabel}</span>}
                  </>
                )}
                {caption && (
                  <Box component="span" sx={{ flexBasis: delta ? "100%" : "auto" }}>
                    {caption}
                  </Box>
                )}
              </Box>
            )}
          </>
        )}
        {trend && trend.length > 1 && !loading && (
          <FabricSparkline
            data={trend}
            labels={trendLabels}
            plotType={trendType}
            valueFormat={valueFormat}
            locale={locale}
            title={typeof label === "string" ? `${label} trend` : "Trend"}
            showTooltip={!interactive}
            sx={{ mt: "auto", pt: `${spacing.xs}px` }}
          />
        )}
      </>
    );

    const rootSx = [
      {
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        gap: `${spacing.xs}px`,
        minWidth: 0,
        height: "100%",
        p: `${spacing.lg}px`,
        borderRadius: `${radii.lg}px`,
        border: "1px solid var(--mui-palette-divider)",
        backgroundColor: "var(--mui-palette-background-paper)",
        textAlign: "left",
        font: "inherit",
      },
      interactive && {
        transition: "border-color 120ms",
        "&:hover": { borderColor: "var(--mui-palette-text-disabled)" },
        "&.Mui-focusVisible": {
          outline: "2px solid var(--mui-palette-primary-main)",
          outlineOffset: 2,
        },
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ] as SxProps<Theme>;

    if (interactive) {
      return (
        <ButtonBase
          ref={ref as never}
          {...((href ? { component: LinkComponent ?? "a", href, onClick } : { onClick }) as object)}
          // The name starts with the visible label and includes the visible value and change,
          // so voice-control users can say what they see.
          aria-labelledby={`${labelId} ${labelId}-value`}
          sx={rootSx}
        >
          {body}
          <Box id={`${labelId}-value`} sx={srOnly}>
            {/* The visible text in order, then the direction, so the name contains what's on screen. */}
            {[shown, delta?.text, comparisonLabel].filter(Boolean).join(" ")}
            {delta ? `, ${delta.word}` : ""}
          </Box>
        </ButtonBase>
      );
    }

    return (
      <Box
        ref={ref}
        role="group"
        aria-labelledby={labelId}
        aria-busy={loading || undefined}
        sx={rootSx}
      >
        {body}
      </Box>
    );
  },
);

const srOnly = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  whiteSpace: "nowrap",
} as const;
