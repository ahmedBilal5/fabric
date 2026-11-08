import { FabricBox } from "@fabric-kit/components";
import { duration, easing, radii } from "@fabric-kit/design-tokens";
import { useTheme } from "@mui/material/styles";
import {
  type Connection,
  Controls,
  type Edge,
  MiniMap,
  type Node,
  ReactFlow,
  type ReactFlowInstance,
  ReactFlowProvider,
} from "@xyflow/react";
import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import { useDrop } from "react-dnd";
import type { FabricCanvasBuilderProps } from "../types";
import { getCanvasThemeColors, withAlpha } from "../utils/themeColors";

const isCanvasDropDebugEnabled = () =>
  typeof window !== "undefined" && window.localStorage.getItem("fabricCanvasDropDebug") === "true";

// Read the scheme from the `dark` class MUI's class selector sets on <html>; `useColorScheme` throws
// when consumers resolve an MUI version/provider without CssVarsProvider (e.g. MUI 5 apps).
const subscribeToColorScheme = (onChange: () => void) => {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
};
const getIsDark = () => document.documentElement.classList.contains("dark");
const useIsDarkScheme = () => useSyncExternalStore(subscribeToColorScheme, getIsDark, () => false);

/**
 * React Flow canvas wrapper for node/edge rendering, drag-drop and edit/view modes.
 */
export const FabricCanvasBuilder = <
  NodeData extends Record<string, unknown> = Record<string, unknown>,
  EdgeData extends Record<string, unknown> = Record<string, unknown>,
  DropItem = unknown,
>({
  nodes,
  edges,
  nodeTypes,
  edgeTypes,
  mode,
  onNodesChange,
  onEdgesChange,
  onConnect,
  isValidConnection,
  onDropNode,
  onSelectionChange,
  dropItemType = "node",
  emptyState,
  showControls = mode === "edit",
  showMiniMap = true,
  initialFitViewOptions,
  className,
  style,
}: FabricCanvasBuilderProps<NodeData, EdgeData, DropItem>) => {
  const reactFlowInstanceRef = useRef<ReactFlowInstance<Node<NodeData>, Edge<EdgeData>> | null>(
    null,
  );
  const disabled = mode !== "edit";
  const colors = getCanvasThemeColors(useTheme());
  const isDark = useIsDarkScheme();
  const [{ canDrop, isOver }, drop] = useDrop(
    () => ({
      accept: dropItemType,
      drop: (item: DropItem, monitor) => {
        const offset = monitor.getSourceClientOffset();
        if (isCanvasDropDebugEnabled()) {
          console.debug("[CanvasBuilder] drop", {
            item,
            offset,
            hasOnDropNode: Boolean(onDropNode),
            hasReactFlowInstance: Boolean(reactFlowInstanceRef.current),
            didDrop: monitor.didDrop(),
          });
        }
        if (!offset || !onDropNode || !reactFlowInstanceRef.current) return;

        onDropNode({
          item,
          sourceClientOffset: offset,
          position: reactFlowInstanceRef.current.screenToFlowPosition({
            x: offset.x,
            y: offset.y,
          }),
        });
      },
      collect: (monitor) => ({
        canDrop: monitor.canDrop(),
        isOver: monitor.isOver({ shallow: true }),
      }),
    }),
    [dropItemType, onDropNode],
  );

  useEffect(() => {
    if (!isCanvasDropDebugEnabled()) return;

    console.debug("[CanvasBuilder] drop monitor", {
      canDrop,
      isOver,
      dropItemType,
    });
  }, [canDrop, dropItemType, isOver]);

  const setDropRef = useCallback(
    (instance: HTMLDivElement | null) => {
      if (isCanvasDropDebugEnabled()) {
        console.debug("[CanvasBuilder] drop ref", {
          hasInstance: Boolean(instance),
          tagName: instance?.tagName,
        });
      }
      if (instance) {
        drop(instance);
      }
    },
    [drop],
  );

  const handleIsValidConnection = useCallback(
    (connection: Connection | Edge<EdgeData>) => {
      return isValidConnection?.(connection) ?? true;
    },
    [isValidConnection],
  );

  const canvas = (
    <FabricBox
      className={className}
      sx={{
        "--xy-background-color": colors.paper,
        "--xy-minimap-background-color": colors.paper,
        "--xy-minimap-mask-background-color": withAlpha(colors.background, 70),
        "--xy-minimap-node-background-color": colors.divider,
        "--xy-controls-button-background-color": colors.paper,
        "--xy-controls-button-background-color-hover": colors.actionHover,
        "--xy-controls-button-color": colors.textPrimary,
        "--xy-controls-button-border-color": colors.divider,
        "--xy-controls-box-shadow": `0 0 0 1px ${colors.divider}`,
        "--xy-edge-label-background-color": colors.paper,
        "--xy-edge-label-color": colors.textSecondary,
        "--xy-node-color": colors.textPrimary,
        "--xy-handle-border-color": colors.divider,
      }}
      style={{
        width: "100%",
        height: "100vh",
        position: "relative",
        borderRadius: `${radii.xl}px`,
        transition: `all ${duration.fast}ms ${easing.default}`,
        ...style,
      }}
    >
      <div ref={setDropRef} style={{ width: "100%", height: "100%" }}>
        <ReactFlow
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={(instance) => {
            reactFlowInstanceRef.current = instance;
            // Refit once layout settles, e.g. when the canvas mounts inside a tab or dialog.
            requestAnimationFrame(() => instance.fitView({ padding: 0.15, maxZoom: 1 }));
          }}
          fitView
          // Fit the graph, but never zoom a small graph past 100%.
          fitViewOptions={{ padding: 0.15, maxZoom: 1 }}
          // React Flow's default `light` root class matches MUI's `.light` scheme selector and re-applies light palette vars inside the canvas.
          colorMode={isDark ? "dark" : "light"}
          proOptions={{ hideAttribution: true }}
          isValidConnection={handleIsValidConnection}
          edgesFocusable={!disabled}
          nodesDraggable={!disabled}
          nodesConnectable={!disabled}
          nodesFocusable={!disabled}
          draggable={!disabled}
          elementsSelectable
          deleteKeyCode={disabled ? null : "Delete"}
          onSelectionChange={onSelectionChange}
        >
          {disabled && (
            <style>
              {`
                .react-flow__handle:hover {
                  cursor: pointer !important;
                }
              `}
            </style>
          )}
          {showMiniMap && <MiniMap pannable />}
          {showControls && <Controls />}
          {!nodes.length && emptyState}
        </ReactFlow>
      </div>
    </FabricBox>
  );

  return (
    <ReactFlowProvider initialFitViewOptions={initialFitViewOptions}>{canvas}</ReactFlowProvider>
  );
};
