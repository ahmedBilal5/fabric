import { FabricBox, FabricDivider, FabricTooltip } from "@fabric-kit/components";
import { iconSize, opacity, radii, spacing } from "@fabric-kit/design-tokens";
import ArrowBack from "@fabric-kit/icons/ArrowBack";
import ChevronRight from "@fabric-kit/icons/ChevronRight";
import { FabricFlex, FabricText } from "@fabric-kit/primitives";
import { type KeyboardEvent, type ReactNode, useEffect, useRef, useState } from "react";
import { useDrag } from "react-dnd";

import type {
  CanvasNodePaletteGroup,
  CanvasNodePaletteItem,
  CanvasPaletteNode,
  FabricCanvasNodePaletteProps,
} from "../types";
import { toSxArray } from "../utils/sx";

type TooltipPlacement = "left" | "right";

const FOCUS_OUTLINE_PX = spacing.xs / 2;
const BACK_KEY = "back";

const itemKey = (id: string) => `item:${id}`;

const defaultBackAriaLabel = (groupLabel: string) => `Back to all nodes from ${groupLabel}`;

/** True for entries that drill down to child nodes instead of being draggable themselves. */
const isGroup = <DropItem,>(
  item: CanvasNodePaletteItem<DropItem>,
): item is CanvasNodePaletteGroup<DropItem> => "children" in item;

/**
 * Compact vertical list of draggable canvas nodes (icon above label).
 * Groups drill down one level in place; Esc, ArrowLeft, or the back header returns.
 * Arrow Up/Down, Home, and End move between items; Tab enters and leaves the list.
 * The list scrolls when it is taller than its container.
 *
 * @example
 * <FabricCanvasNodePalette mode="edit" nodes={nodes} />
 */
export const FabricCanvasNodePalette = <DropItem,>({
  mode,
  nodes,
  dragItemType = "node",
  onNodeSelect,
  onNodeDragStart,
  renderNodeIcon,
  tooltipPlacement = "right",
  emptyMessage = "No nodes available.",
  backAriaLabel = defaultBackAriaLabel,
  sx,
  ...boxProps
}: FabricCanvasNodePaletteProps<DropItem>) => {
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [focusKey, setFocusKey] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const lastOpenedGroupId = useRef<string | null>(null);

  const activeGroup =
    nodes.find(
      (item): item is CanvasNodePaletteGroup<DropItem> =>
        isGroup(item) && item.id === activeGroupId,
    ) ?? null;
  const visibleNodes = activeGroup ? activeGroup.children : nodes;

  // Roving tabindex: only one enabled entry is in the Tab order at a time.
  const enabledKeys = [
    ...(activeGroup ? [BACK_KEY] : []),
    ...visibleNodes.filter((item) => !item.disabled).map((item) => itemKey(item.id)),
  ];
  const tabbableKey =
    focusKey && enabledKeys.includes(focusKey) ? focusKey : (enabledKeys[0] ?? null);

  const openGroup = (groupId: string) => {
    lastOpenedGroupId.current = groupId;
    setActiveGroupId(groupId);
  };

  const focusEntry = (key: string) => {
    setFocusKey(key);
    rootRef.current?.querySelector<HTMLElement>(`[data-rail-key="${CSS.escape(key)}"]`)?.focus();
  };

  // The clicked item unmounts on every view swap, so focus is moved explicitly to keep keyboard users in place.
  // biome-ignore lint/correctness/useExhaustiveDependencies: focus only on view changes, not on every render
  useEffect(() => {
    if (activeGroupId) {
      focusEntry(BACK_KEY);
    } else if (lastOpenedGroupId.current) {
      focusEntry(itemKey(lastOpenedGroupId.current));
    }
  }, [activeGroupId]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape" && activeGroup) {
      setActiveGroupId(null);
      return;
    }

    const currentKey = (event.target as HTMLElement)
      .closest<HTMLElement>("[data-rail-key]")
      ?.getAttribute("data-rail-key");
    if (!currentKey) {
      return;
    }

    const index = enabledKeys.indexOf(currentKey);
    const last = enabledKeys.length - 1;
    let next: string | undefined;

    switch (event.key) {
      case "ArrowDown":
        next = enabledKeys[Math.min(index + 1, last)];
        break;
      case "ArrowUp":
        next = enabledKeys[Math.max(index - 1, 0)];
        break;
      case "Home":
        next = enabledKeys[0];
        break;
      case "End":
        next = enabledKeys[last];
        break;
      case "ArrowRight": {
        const group = visibleNodes.find(
          (item): item is CanvasNodePaletteGroup<DropItem> =>
            isGroup(item) && !item.disabled && itemKey(item.id) === currentKey,
        );
        if (group) {
          event.preventDefault();
          openGroup(group.id);
        }
        return;
      }
      case "ArrowLeft":
        if (activeGroup) {
          event.preventDefault();
          setActiveGroupId(null);
        }
        return;
      default:
        return;
    }

    if (next) {
      event.preventDefault();
      focusEntry(next);
    }
  };

  return (
    <FabricFlex
      ref={rootRef}
      direction="column"
      role="group"
      aria-label={activeGroup ? `${activeGroup.label} nodes` : "Available nodes"}
      onKeyDown={handleKeyDown}
      {...boxProps}
      sx={[{ flex: "0 1 auto", minHeight: 0 }, ...toSxArray(sx)]}
    >
      {activeGroup && (
        <FabricBox sx={{ flexShrink: 0 }}>
          <RailItem
            railKey={BACK_KEY}
            tabbable={tabbableKey === BACK_KEY}
            onFocusItem={() => setFocusKey(BACK_KEY)}
            icon={<ArrowBack />}
            label={activeGroup.label}
            ariaLabel={backAriaLabel(activeGroup.label)}
            tooltipPlacement={tooltipPlacement}
            onActivate={() => setActiveGroupId(null)}
          />
          <FabricDivider sx={{ mb: `${spacing.xs}px` }} />
        </FabricBox>
      )}

      <FabricFlex
        direction="column"
        sx={{
          flex: "1 1 auto",
          minHeight: 0,
          overflowX: "hidden",
          overflowY: "auto",
          scrollbarWidth: "thin",
        }}
      >
        {visibleNodes.map((item) =>
          isGroup(item) ? (
            <GroupItem
              key={item.id}
              group={item}
              tabbable={tabbableKey === itemKey(item.id)}
              onFocusItem={() => setFocusKey(itemKey(item.id))}
              tooltipPlacement={tooltipPlacement}
              renderNodeIcon={renderNodeIcon}
              onOpen={() => openGroup(item.id)}
            />
          ) : (
            <NodeItem
              key={item.id}
              mode={mode}
              dragItemType={dragItemType}
              node={item}
              tabbable={tabbableKey === itemKey(item.id)}
              onFocusItem={() => setFocusKey(itemKey(item.id))}
              tooltipPlacement={tooltipPlacement}
              onNodeSelect={onNodeSelect}
              onNodeDragStart={onNodeDragStart}
              renderNodeIcon={renderNodeIcon}
            />
          ),
        )}
        {visibleNodes.length === 0 && (
          <FabricText
            textVariant="bodySm"
            color="var(--mui-palette-text-secondary)"
            sx={{ p: `${spacing.sm}px`, textAlign: "center" }}
          >
            {emptyMessage}
          </FabricText>
        )}
      </FabricFlex>
    </FabricFlex>
  );
};

/** Presentational rail entry: icon over label, with an optional hover description. */
const RailItem = ({
  railKey,
  tabbable,
  onFocusItem,
  icon,
  label,
  description,
  ariaLabel,
  interactive = true,
  cursor = "pointer",
  itemOpacity = opacity[100],
  trailing,
  hasPopup,
  tooltipPlacement,
  onActivate,
}: {
  railKey: string;
  tabbable: boolean;
  onFocusItem: () => void;
  icon: ReactNode;
  label: string;
  description?: string;
  ariaLabel?: string;
  interactive?: boolean;
  cursor?: string;
  itemOpacity?: number;
  trailing?: ReactNode;
  hasPopup?: boolean;
  tooltipPlacement: TooltipPlacement;
  onActivate?: () => void;
}) => {
  const activate = () => {
    if (interactive) {
      onActivate?.();
    }
  };

  return (
    <FabricTooltip describeChild title={description ?? ""} placement={tooltipPlacement}>
      <FabricFlex
        role="button"
        data-rail-key={railKey}
        tabIndex={interactive && tabbable ? 0 : -1}
        aria-label={ariaLabel ?? label}
        aria-disabled={!interactive}
        aria-haspopup={hasPopup ? "true" : undefined}
        direction="column"
        align="center"
        gap="xs"
        onClick={activate}
        onFocus={onFocusItem}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            activate();
          }
        }}
        sx={{
          position: "relative",
          px: `${spacing.xs}px`,
          py: `${spacing.sm}px`,
          borderRadius: `${radii.md}px`,
          color: "var(--mui-palette-text-primary)",
          cursor,
          opacity: itemOpacity,
          "&:hover": interactive
            ? { backgroundColor: "var(--mui-palette-action-hover)" }
            : undefined,
          "&:focus-visible": {
            outline: `${FOCUS_OUTLINE_PX}px solid var(--mui-palette-primary-main)`,
            outlineOffset: `-${FOCUS_OUTLINE_PX}px`,
          },
        }}
      >
        <FabricFlex
          sx={{
            "& .MuiSvgIcon-root": { fontSize: `${iconSize.md}px` },
            "& svg, & img": { width: `${iconSize.md}px`, height: `${iconSize.md}px` },
          }}
        >
          {icon}
        </FabricFlex>
        <FabricText textVariant="bodySm" truncate sx={{ maxWidth: "100%" }}>
          {label}
        </FabricText>
        {trailing}
      </FabricFlex>
    </FabricTooltip>
  );
};

/** Rail entry that opens a group; not draggable. */
const GroupItem = <DropItem,>({
  group,
  tabbable,
  onFocusItem,
  tooltipPlacement,
  renderNodeIcon,
  onOpen,
}: {
  group: CanvasNodePaletteGroup<DropItem>;
  tabbable: boolean;
  onFocusItem: () => void;
  tooltipPlacement: TooltipPlacement;
  renderNodeIcon?: (item: CanvasNodePaletteItem<DropItem>) => ReactNode;
  onOpen: () => void;
}) => (
  <FabricBox data-testid={group.testId ?? `node-group-${group.id}`}>
    <RailItem
      railKey={itemKey(group.id)}
      tabbable={tabbable}
      onFocusItem={onFocusItem}
      icon={renderNodeIcon?.(group) ?? group.icon}
      label={group.label}
      description={group.description}
      interactive={!group.disabled}
      cursor={group.disabled ? "not-allowed" : "pointer"}
      itemOpacity={group.disabled ? opacity.disabled : opacity[100]}
      hasPopup
      tooltipPlacement={tooltipPlacement}
      onActivate={onOpen}
      trailing={
        <ChevronRight
          sx={{
            position: "absolute",
            top: "50%",
            transform: "translateY(-50%)",
            right: 0,
            fontSize: `${iconSize.xs}px`,
            color: "var(--mui-palette-text-secondary)",
          }}
        />
      }
    />
  </FabricBox>
);

/** Rail entry that can be dragged onto the canvas (edit mode) or selected. */
const NodeItem = <DropItem,>({
  mode,
  dragItemType,
  node,
  tabbable,
  onFocusItem,
  tooltipPlacement,
  onNodeSelect,
  onNodeDragStart,
  renderNodeIcon,
}: Pick<
  FabricCanvasNodePaletteProps<DropItem>,
  "mode" | "onNodeSelect" | "onNodeDragStart" | "renderNodeIcon"
> & {
  dragItemType: string;
  node: CanvasPaletteNode<DropItem>;
  tabbable: boolean;
  onFocusItem: () => void;
  tooltipPlacement: TooltipPlacement;
}) => {
  const isInteractive = !node.disabled;
  const canDrag = mode === "edit" && isInteractive;

  const [{ isDragging }, dragRef] = useDrag(
    () => ({
      type: dragItemType,
      item: () => {
        onNodeDragStart?.(node);
        return node.dropItem;
      },
      canDrag,
      collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    }),
    [dragItemType, node, canDrag, onNodeDragStart],
  );

  return (
    <FabricBox ref={dragRef} data-testid={node.testId ?? `node-drag-${node.id}`}>
      <RailItem
        railKey={itemKey(node.id)}
        tabbable={tabbable}
        onFocusItem={onFocusItem}
        icon={renderNodeIcon?.(node) ?? node.icon}
        label={node.label}
        description={node.description}
        interactive={isInteractive}
        cursor={canDrag ? "move" : isInteractive ? "pointer" : "not-allowed"}
        itemOpacity={isDragging ? opacity[50] : isInteractive ? opacity[100] : opacity.disabled}
        tooltipPlacement={tooltipPlacement}
        onActivate={() => onNodeSelect?.(node)}
      />
    </FabricBox>
  );
};
