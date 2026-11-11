/**
 * FabricKeyValueList — label and value pairs that summarize a record: an invoice's
 * customer, amount and due date, or a server's region and IP address.
 *
 * Renders a real description list (`<dl>`), so screen readers announce each label
 * with its value. Lay pairs out side by side (`layout="horizontal"`) or with the
 * label above the value (`layout="stacked"`), in one or two columns. Two columns drop
 * to one on narrow screens. Mark a value `copyable` to add a copy button, handy for
 * IDs, keys and addresses.
 *
 * @example
 * ```tsx
 * <FabricKeyValueList
 *   columns={2}
 *   items={[
 *     { label: "Customer", value: "Northwind Traders" },
 *     { label: "Invoice ID", value: "INV-2041", copyable: true },
 *     { label: "Notes", value: longNotes, fullWidth: true },
 *   ]}
 * />
 * ```
 */

import { fontWeight, spacing } from "@fabric-kit/design-tokens";
import { useClipboard } from "@fabric-kit/hooks";
import Check from "@fabric-kit/icons/Check";
import ContentCopy from "@fabric-kit/icons/ContentCopy";
import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";
import { forwardRef, type HTMLAttributes, type Key, memo, type ReactNode } from "react";
import { FabricIconButton } from "../FabricIconButton";
import { FabricTooltip } from "../FabricTooltip";

export interface FabricKeyValueItem {
  /** Stable key. Defaults to the label when it's a string, otherwise the index. */
  id?: Key;
  /** What the value is, e.g. "Due date". */
  label: ReactNode;
  /** The value. `null`, `undefined` and `""` show the list's `emptyValue`. */
  value?: ReactNode;
  /**
   * Adds a copy button. `true` copies the value when it's a string or number; pass a
   * string to copy something else (e.g. a full ID when the value shows it shortened).
   */
  copyable?: boolean | string;
  /** Small muted text under the value, e.g. "Changed 2 days ago". */
  hint?: ReactNode;
  /** Span both columns, for long values such as notes or addresses. */
  fullWidth?: boolean;
}

export interface FabricKeyValueListProps extends Omit<HTMLAttributes<HTMLDListElement>, "title"> {
  /** The pairs, in reading order. */
  items: FabricKeyValueItem[];
  /** Label beside the value, or label above it. @default "horizontal" */
  layout?: "horizontal" | "stacked";
  /** One or two columns. Two drop to one below the `sm` breakpoint. @default 1 */
  columns?: 1 | 2;
  /** Label column width in `horizontal` layout. Any CSS width. @default "40%" */
  labelWidth?: string | number;
  /** Shown for empty values. @default "—" */
  emptyValue?: ReactNode;
  /** Tighter rows, for side panels and cards. @default false */
  dense?: boolean;
  /** Draw a line between rows. @default false */
  dividers?: boolean;
  /** System styles on the root. */
  sx?: SxProps<Theme>;
}

/**
 * The label column's width. A full-width item in two columns spans both, so a
 * percentage is converted to a share of one column to keep values aligned.
 */
const labelCol = (width: string | number, spansTwo: boolean) => {
  if (typeof width === "number") return `${width}px`;
  const pct = /^(\d+(?:\.\d+)?)%$/.exec(width.trim());
  if (!spansTwo || !pct) return width;
  return `calc((100% - ${spacing.xl}px) * ${Number(pct[1]) / 200})`;
};

const isEmpty = (v: ReactNode) => v === null || v === undefined || v === "";

function CopyButton({ text, label }: { text: string; label: ReactNode }) {
  const { copy, copied } = useClipboard();
  const name = typeof label === "string" ? label : "value";
  return (
    <FabricTooltip title={copied ? "Copied" : `Copy ${name}`} placement="top">
      <FabricIconButton
        size="small"
        aria-label={copied ? `${name} copied` : `Copy ${name}`}
        onClick={() => copy(text)}
        sx={{ my: "-4px", flexShrink: 0 }}
      >
        {copied ? <Check /> : <ContentCopy />}
      </FabricIconButton>
    </FabricTooltip>
  );
}

const FabricKeyValueListImpl = forwardRef<HTMLDListElement, FabricKeyValueListProps>(
  function FabricKeyValueList(
    {
      items,
      layout = "horizontal",
      columns = 1,
      labelWidth = "40%",
      emptyValue = "—",
      dense = false,
      dividers = false,
      sx,
      ...rest
    },
    ref,
  ) {
    const rowGap = dense ? spacing.sm : spacing.md;
    const horizontal = layout === "horizontal";

    return (
      <Box
        component="dl"
        ref={ref}
        sx={[
          {
            m: 0,
            display: "grid",
            gridTemplateColumns: { xs: "minmax(0, 1fr)", sm: `repeat(${columns}, minmax(0, 1fr))` },
            columnGap: `${spacing.xl}px`,
            rowGap: dividers ? 0 : `${rowGap}px`,
            fontSize: dense ? "0.8125rem" : "0.875rem",
            lineHeight: 1.5,
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
        {...rest}
      >
        {items.map((item, i) => {
          const key = item.id ?? (typeof item.label === "string" ? item.label : i);
          const empty = isEmpty(item.value);
          const copyText =
            typeof item.copyable === "string"
              ? item.copyable
              : item.copyable && (typeof item.value === "string" || typeof item.value === "number")
                ? String(item.value)
                : null;

          return (
            <Box
              key={key}
              className="FabricKeyValueList-item"
              sx={{
                minWidth: 0,
                display: "grid",
                gridTemplateColumns: horizontal
                  ? {
                      xs: `${labelCol(labelWidth, false)} minmax(0, 1fr)`,
                      sm: `${labelCol(labelWidth, !!item.fullWidth && columns === 2)} minmax(0, 1fr)`,
                    }
                  : "minmax(0, 1fr)",
                columnGap: `${spacing.md}px`,
                rowGap: `${spacing.xs}px`,
                alignItems: "baseline",
                ...(item.fullWidth && { gridColumn: "1 / -1" }),
                ...(dividers && {
                  py: `${rowGap}px`,
                  borderBottom: "1px solid var(--mui-palette-divider)",
                }),
              }}
            >
              <Box
                component="dt"
                sx={{
                  color: "var(--mui-palette-control-label)",
                  fontWeight: fontWeight.medium,
                  minWidth: 0,
                  overflowWrap: "anywhere",
                }}
              >
                {item.label}
              </Box>
              <Box component="dd" sx={{ m: 0, minWidth: 0 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: `${spacing.xs}px`,
                    color: empty
                      ? "var(--mui-palette-text-disabled)"
                      : "var(--mui-palette-text-primary)",
                    overflowWrap: "anywhere",
                  }}
                >
                  <Box component="span" sx={{ minWidth: 0 }}>
                    {empty ? emptyValue : item.value}
                  </Box>
                  {copyText != null && !empty && <CopyButton text={copyText} label={item.label} />}
                </Box>
                {item.hint && (
                  <Box
                    sx={{
                      mt: "2px",
                      fontSize: "0.75rem",
                      color: "var(--mui-palette-text-secondary)",
                    }}
                  >
                    {item.hint}
                  </Box>
                )}
              </Box>
            </Box>
          );
        })}
      </Box>
    );
  },
);

FabricKeyValueListImpl.displayName = "FabricKeyValueList";

/** Label and value pairs for record summaries. */
export const FabricKeyValueList = memo(FabricKeyValueListImpl);
