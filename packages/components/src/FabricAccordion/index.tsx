/**
 * FabricAccordion — the design-system accordion.
 *
 * Extends MUI `Accordion` verbatim (full `AccordionProps` surface) and styles it as flat
 * accordion rows. Rows fill the width of their container; nothing is fixed.
 *
 * ─── Row styles ─────────────────────────────────────────────────────────
 *   - Section header                 → `variant="section"` (default)
 *   - Document row                   → `variant="document"`
 *   - Compact content row            → `variant="content"`
 *   - Nested tree branch             → `variant="content" level={2}`
 *   - Tree leaf                      → `<FabricAccordionLeaf />` (a row with nothing to expand)
 *   Nest accordions inside `children` to build a tree.
 *
 * ─── Composition slots ──────────────────────────────────────────────────
 *   - `title` (ReactNode)     — header text. Strings get the row typography.
 *   - `titleIcon` (ReactNode) — icon before the title.
 *   - `action` (ReactNode)    — trailing element (button, icon, switch, badge).
 *   - `draggable` / `onClose` — drag handle and close button.
 *   - `mapIndicator`          — corner mark that highlights the row.
 * For fully custom summary layouts pass `summaryContent`.
 *
 * ─── Behavior ───────────────────────────────────────────────────────────
 *   - Unique ARIA ids per instance via `useId()`.
 *   - MUI-standard `onChange(event, expanded)` signature.
 *   - `unmountOnExit` defaults to `true` (via `slotProps.transition`).
 *   - Every color and dimension comes from `@fabric-kit/design-tokens`.
 *
 * @example
 * ```tsx
 * <FabricAccordion title="Section title" titleIcon={<InfoOutlinedIcon />} defaultExpanded>
 *   <FabricAccordion variant="content" level={2} title="Group">
 *     <FabricAccordionLeaf icon={<InfoOutlinedIcon />}>Item</FabricAccordionLeaf>
 *   </FabricAccordion>
 * </FabricAccordion>
 * ```
 */

import { accordion, dark, duration, easing, spacing, surface } from "@fabric-kit/design-tokens";
import CloseIcon from "@fabric-kit/icons/Close";
import DragIndicatorIcon from "@fabric-kit/icons/DragIndicator";
import KeyboardArrowRightIcon from "@fabric-kit/icons/KeyboardArrowRight";
import { FabricGrow, FabricInline, FabricText } from "@fabric-kit/primitives";
import {
  Accordion,
  AccordionDetails,
  type AccordionDetailsProps,
  type AccordionProps,
  AccordionSummary,
  type AccordionSummaryProps,
  ButtonBase,
  type ButtonBaseProps,
  IconButton,
} from "@mui/material";
import type { CSSObject, SxProps, Theme } from "@mui/material/styles";
import {
  Children,
  forwardRef,
  type HTMLAttributes,
  isValidElement,
  type MouseEvent,
  memo,
  type ReactNode,
  useId,
  useMemo,
} from "react";

type ExpandIconPlacement = "start" | "end";

type ExpandIconPosition = {
  position?: ExpandIconPlacement;
  rotation?: number;
};

type ExpandIconStyleOptions = {
  expandIconPlacement: ExpandIconPlacement;
  initialRotationDegrees: number;
  expandIconRotationDegrees: number;
};

/** Row style: header rows (`section`, `document`) or content rows. */
export type FabricAccordionVariant = "section" | "document" | "content";

/** Nesting depth. Sets the row's left indent: 8px, 56px and 80px. */
export type FabricAccordionLevel = 1 | 2 | 3;

export interface FabricAccordionProps
  extends Omit<AccordionProps, "children" | "title" | "variant"> {
  /** Row style. `section` and `document` are header rows; `content` is a smaller row. */
  variant?: FabricAccordionVariant;
  /** Nesting depth; sets the left indent (8 / 56 / 80px). Override with `summarySx`. */
  level?: FabricAccordionLevel;
  /** Summary title. A string gets the row typography; a ReactNode renders as-is. */
  title?: ReactNode;
  /** Icon before the title. */
  titleIcon?: ReactNode;
  /** Trailing action in the summary row (button, icon, toggle, badge, etc.). */
  action?: ReactNode;
  /** Details body. Rendered inside `<AccordionDetails>`. */
  children?: ReactNode;
  /**
   * Custom summary content. When set, replaces the default
   * `titleIcon` + `title` + `action` layout.
   */
  summaryContent?: ReactNode;
  /** Override the expand icon. Defaults to a right chevron that turns down when open. */
  expandIcon?: ReactNode;
  /**
   * Expand icon placement and initial rotation (before expansion).
   * `position` defaults to `"start"`, or `"end"` for `variant="document"`.
   */
  expandIconPosition?: ExpandIconPosition;
  /** Rotation added when expanded. Defaults to 90 for the default chevron and 180 for a custom `expandIcon`. */
  expandIconRotationDegrees?: number;
  /** Show a drag handle at the end of the row. */
  draggable?: boolean;
  /** Props for the drag handle, e.g. the listeners and attributes of a drag-and-drop library. */
  dragHandleProps?: HTMLAttributes<HTMLSpanElement>;
  /** Show a close button at the end of the row. */
  onClose?: (event: MouseEvent<HTMLElement>) => void;
  /** Mark the row with a corner triangle. */
  mapIndicator?: boolean;

  /** Unmount details on collapse. Defaults to `true`. */
  unmountOnExit?: boolean;
  /** Sx overrides for the inner `<AccordionSummary>`. */
  summarySx?: SxProps<Theme>;
  /** Sx overrides for the inner `<AccordionDetails>`. */
  detailsSx?: SxProps<Theme>;
  /** Extra props forwarded to `<AccordionSummary>` (className, data-attrs, etc.). */
  summaryProps?: Omit<
    AccordionSummaryProps,
    "children" | "expandIcon" | "sx" | "aria-controls" | "id"
  >;
  /** Extra props forwarded to `<AccordionDetails>`. */
  detailsProps?: Omit<AccordionDetailsProps, "children" | "sx">;
}

export interface FabricAccordionLeafProps
  extends Omit<ButtonBaseProps, "children" | "title" | "action"> {
  /** Row label. A string gets the row typography. */
  children?: ReactNode;
  /** Icon before the label. */
  icon?: ReactNode;
  /** Trailing element (icon, button, badge). */
  action?: ReactNode;
  /** Nesting depth; sets the left indent. Defaults to 3 (80px). */
  level?: FabricAccordionLevel;
  /** Show the row as open. */
  selected?: boolean;
  /** Mark the row with a corner triangle. */
  mapIndicator?: boolean;
}

/** Colors one scheme needs to paint a row. */
interface RowColors {
  text: string;
  textHover: string;
  textActive: string;
  hoverBg: string;
  activeBg: string;
  line: string;
  mark: string;
}

const LIGHT: RowColors = {
  text: "var(--mui-palette-control-label)",
  textHover: "var(--mui-palette-control-labelHover)",
  textActive: "var(--mui-palette-text-primary)",
  hoverBg: accordion.hoverBg,
  activeBg: surface.tertiary,
  line: "var(--mui-palette-divider)",
  mark: "var(--mui-palette-primary-main)",
};

const DARK: RowColors = {
  text: "var(--mui-palette-control-label)",
  textHover: "var(--mui-palette-control-labelHover)",
  textActive: "var(--mui-palette-text-primary)",
  hoverBg: dark.accordion.hoverBg,
  activeBg: dark.surface.tertiary,
  line: "var(--mui-palette-divider)",
  mark: "var(--mui-palette-primary-main)",
};

const ROW_HEIGHT = 40;
/** An open header row is a little taller than a closed one. */
const OPEN_ROW_HEIGHT = 50;
const MARK_SIZE = 10;
const CHEVRON_SIZE = 16;

/** Left indent per level. */
const INDENT: Record<FabricAccordionLevel, number> = { 1: spacing.sm, 2: 56, 3: 80 };

const isHeader = (variant: FabricAccordionVariant) => variant !== "content";

/** Typography and icon sizes of a row: header rows are 16px Medium, content rows 12px Regular. */
const rowType = (variant: FabricAccordionVariant) =>
  isHeader(variant)
    ? { fontSize: 16, fontWeight: 500, lineHeight: "20px", icon: 24 }
    : { fontSize: 12, fontWeight: 400, lineHeight: "14px", icon: 16 };

interface RowStyleOptions {
  variant: FabricAccordionVariant;
  level: FabricAccordionLevel;
  mapIndicator?: boolean;
  selected?: boolean;
}

/** Per-state row styles (default / hover / open) for one scheme. */
const rowStateStyles = (
  c: RowColors,
  { variant, mapIndicator, selected }: Omit<RowStyleOptions, "level">,
) => {
  // Section rows keep their white fill; the other rows tint on hover and when open.
  const plain = variant === "section";
  const open = {
    color: c.textActive,
    minHeight: ROW_HEIGHT,
    ...(plain ? {} : { backgroundColor: c.activeBg }),
  };
  return {
    color: c.text,
    borderBottom: `1px solid ${c.line}`,
    "&::after": {
      content: mapIndicator ? '""' : "none",
      position: "absolute",
      top: 0,
      right: 0,
      width: MARK_SIZE,
      height: MARK_SIZE,
      clipPath: "polygon(0 0, 100% 0, 100% 100%)",
      backgroundColor: c.mark,
    },
    "&:hover": { color: c.textHover, ...(plain ? {} : { backgroundColor: c.hoverBg }) },
    "&.Mui-expanded": { ...open, minHeight: OPEN_ROW_HEIGHT },
    "&.Mui-expanded:hover": { ...open, minHeight: OPEN_ROW_HEIGHT, color: c.textHover },
    ...(selected ? { ...open, "&:hover": { ...open, color: c.textHover } } : {}),
    // Document rows keep their icons dark in every state; only the title changes.
    ...(variant === "document"
      ? { "& .MuiSvgIcon-root, & .MuiAccordionSummary-expandIconWrapper": { color: c.textActive } }
      : {}),
  };
};

/** Shared by the accordion summary and the leaf row. */
const rowSx =
  ({ level, ...state }: RowStyleOptions) =>
  (theme: Theme): CSSObject => {
    const type = rowType(state.variant);
    return {
      minHeight: ROW_HEIGHT,
      padding: `0 ${spacing.sm}px 0 ${INDENT[level]}px`,
      position: "relative",
      ...rowStateStyles(LIGHT, state),
      ...theme.applyStyles("dark", rowStateStyles(DARK, state)),
      "&.Mui-focusVisible": {
        backgroundColor: "transparent",
        outline: "2px solid var(--mui-palette-primary-main)",
        outlineOffset: -2,
      },
      // MUI adds a 20px margin to open rows; the row height alone sets the open size.
      "& .MuiAccordionSummary-content, & .MuiAccordionSummary-content.Mui-expanded": {
        alignItems: "center",
        gap: `${spacing.sm}px`,
        margin: 0,
      },
      "& .MuiAccordionSummary-content .MuiSvgIcon-root": { fontSize: type.icon },
      "& .MuiAccordionSummary-expandIconWrapper .MuiSvgIcon-root": { fontSize: CHEVRON_SIZE },
    };
  };

const DS_ACCORDION_SX: SxProps<Theme> = {
  borderRadius: 0,
  boxShadow: "none",
  backgroundColor: "transparent",
  // Suppress MUI Paper's elevation-gradient overlay; matches boxShadow:'none' intent.
  backgroundImage: "none",
  "&::before": { display: "none" },
  "&:first-of-type, &:last-of-type": { borderRadius: 0 },
  "&.Mui-expanded": { margin: 0 },
};

const EXPAND_ICON_WRAPPER_SELECTOR = "& .MuiAccordionSummary-expandIconWrapper";
const EXPAND_ICON_WRAPPER_EXPANDED_SELECTOR =
  "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded";

const getExpandIconStyles = ({
  expandIconPlacement,
  initialRotationDegrees,
  expandIconRotationDegrees,
}: ExpandIconStyleOptions): SxProps<Theme> => {
  const expandedRotationDegrees = initialRotationDegrees + expandIconRotationDegrees;

  const expandIconWrapperSx = {
    transition: `transform ${duration.fast}ms ${easing.inOut}`,
    transform: `rotate(${initialRotationDegrees}deg)`,
  };

  return {
    ...(expandIconPlacement === "start"
      ? {
          flexDirection: "row-reverse",
          justifyContent: "flex-end",
          [EXPAND_ICON_WRAPPER_SELECTOR]: {
            ...expandIconWrapperSx,
            marginRight: `${spacing.sm}px`,
            marginLeft: 0,
          },
        }
      : {
          [EXPAND_ICON_WRAPPER_SELECTOR]: expandIconWrapperSx,
        }),
    [EXPAND_ICON_WRAPPER_EXPANDED_SELECTOR]: {
      transform: `rotate(${expandedRotationDegrees}deg)`,
    },
  };
};

/** Wraps a string in the row typography; anything else renders as-is. */
const rowLabel = (label: ReactNode, variant: FabricAccordionVariant) => {
  if (typeof label !== "string") return label;
  const { fontSize, fontWeight, lineHeight } = rowType(variant);
  return (
    <FabricText
      variant="body2"
      component="span"
      sx={{ color: "inherit", fontSize, fontWeight, lineHeight }}
    >
      {label}
    </FabricText>
  );
};

const isRow = (child: ReactNode) =>
  isValidElement(child) && (child.type === FabricAccordion || child.type === FabricAccordionLeaf);

const FabricAccordionImpl = forwardRef<HTMLDivElement, FabricAccordionProps>(
  function FabricAccordion(
    {
      variant = "section",
      level = 1,
      title,
      titleIcon,
      action,
      children,
      summaryContent,
      expandIcon,
      expandIconPosition,
      expandIconRotationDegrees,
      draggable,
      dragHandleProps,
      onClose,
      mapIndicator,
      unmountOnExit = true,
      summarySx,
      detailsSx,
      summaryProps,
      detailsProps,
      slotProps,
      sx,
      ...accordionRest
    },
    ref,
  ) {
    const headerId = useId();
    const contentId = useId();

    const mergedSlotProps = useMemo(
      () => ({
        ...slotProps,
        transition: {
          unmountOnExit,
          ...(slotProps?.transition ?? {}),
        },
      }),
      [slotProps, unmountOnExit],
    );

    const resolvedSummaryContent = summaryContent ?? (
      <FabricInline gap="sm" sx={{ width: "100%" }}>
        {titleIcon}
        <FabricGrow>{rowLabel(title, variant)}</FabricGrow>
        {action}
        {draggable && (
          <span
            {...dragHandleProps}
            style={{ display: "flex", cursor: "grab", ...dragHandleProps?.style }}
          >
            <DragIndicatorIcon sx={{ fontSize: `${CHEVRON_SIZE}px !important` }} />
          </span>
        )}
        {onClose && (
          <IconButton
            aria-label="Close"
            size="small"
            sx={{ padding: 0, color: "inherit" }}
            onClick={(event) => {
              event.stopPropagation();
              onClose(event);
            }}
            onFocus={(event) => event.stopPropagation()}
          >
            <CloseIcon sx={{ fontSize: `${CHEVRON_SIZE}px !important` }} />
          </IconButton>
        )}
      </FabricInline>
    );

    const resolvedExpandIconPosition =
      expandIconPosition?.position ?? (variant === "document" ? "end" : "start");
    const resolvedInitialRotation = expandIconPosition?.rotation ?? 0;
    const resolvedRotation = expandIconRotationDegrees ?? (expandIcon ? 180 : 90);

    const resolvedSummarySx = useMemo(
      () => (theme: Theme) => ({
        ...rowSx({ variant, level, mapIndicator })(theme),
        ...(getExpandIconStyles({
          expandIconPlacement: resolvedExpandIconPosition,
          initialRotationDegrees: resolvedInitialRotation,
          expandIconRotationDegrees: resolvedRotation,
        }) as object),
        ...(typeof summarySx === "function" ? summarySx(theme) : (summarySx as object)),
      }),
      [
        variant,
        level,
        mapIndicator,
        resolvedExpandIconPosition,
        resolvedInitialRotation,
        resolvedRotation,
        summarySx,
      ],
    );

    // Nested rows already carry their own indent, so they sit flush with the container.
    const flush = Children.toArray(children).some(isRow);

    return (
      <Accordion
        ref={ref}
        slotProps={mergedSlotProps}
        sx={{ ...(DS_ACCORDION_SX as object), ...(sx as object) }}
        {...accordionRest}
      >
        <AccordionSummary
          component="div"
          id={headerId}
          aria-controls={contentId}
          expandIcon={expandIcon ?? <KeyboardArrowRightIcon />}
          sx={resolvedSummarySx}
          {...summaryProps}
        >
          {resolvedSummaryContent}
        </AccordionSummary>
        <AccordionDetails
          id={contentId}
          sx={{
            padding: flush ? 0 : `${spacing.sm}px ${spacing.sm}px ${spacing.md}px`,
            ...(detailsSx as object),
          }}
          {...detailsProps}
        >
          {children}
        </AccordionDetails>
      </Accordion>
    );
  },
);

FabricAccordionImpl.displayName = "FabricAccordion";

export const FabricAccordion = memo(FabricAccordionImpl);

/** A row with nothing to expand: the last level of a tree. */
const FabricAccordionLeafImpl = forwardRef<HTMLDivElement, FabricAccordionLeafProps>(
  function FabricAccordionLeaf(
    { children, icon, action, level = 3, selected, mapIndicator, onClick, sx, ...rest },
    ref,
  ) {
    const rowStyles = rowSx({ variant: "content", level, mapIndicator, selected });
    const type = rowType("content");
    return (
      <ButtonBase
        ref={ref}
        component="div"
        aria-current={selected ? "true" : undefined}
        onClick={onClick}
        sx={(theme: Theme) => ({
          width: "100%",
          justifyContent: "flex-start",
          gap: `${spacing.sm}px`,
          textAlign: "left",
          cursor: onClick ? "pointer" : "default",
          ...rowStyles(theme),
          "& .MuiSvgIcon-root": { fontSize: type.icon },
          ...(typeof sx === "function" ? sx(theme) : (sx as object)),
        })}
        {...rest}
      >
        {icon}
        <FabricGrow>{rowLabel(children, "content")}</FabricGrow>
        {action}
      </ButtonBase>
    );
  },
);

FabricAccordionLeafImpl.displayName = "FabricAccordionLeaf";

export const FabricAccordionLeaf = memo(FabricAccordionLeafImpl);
