import type { BoxProps } from "@mui/material/Box";
import type {
  Connection,
  Edge,
  EdgeChange,
  EdgeTypes,
  FitViewOptions,
  IsValidConnection,
  Node,
  NodeChange,
  NodeTypes,
  Position,
  XYPosition,
} from "@xyflow/react";
import type { ComponentType, CSSProperties, ReactNode } from "react";

/** Interaction mode for the canvas (`view` read-only, `edit` interactive). */
export type CanvasMode = "view" | "edit";

/** Direction role for a node handle. */
export type CanvasHandleType = "source" | "target";

/** Shape for one connection handle rendered on a node. */
export interface CanvasHandleDefinition {
  id: string;
  type: CanvasHandleType;
  position?: Position;
  name?: string;
  style?: CSSProperties;
}

/** Connector configuration for a node definition. */
export interface CanvasConnectorConfig<NodeConfig = unknown> {
  handles?: CanvasHandleDefinition[];
  getHandles?: (config: NodeConfig) => CanvasHandleDefinition[];
}

/** Named badge palettes supported by the canvas node badge renderer. */
export type CanvasBadgePalette = "purple" | "blue" | "grey";

/** Optional badge metadata for a node. */
export interface CanvasBadgeInfo {
  label: string;
  palette?: CanvasBadgePalette;
}

/** Node definition consumed by `FabricCanvasNode`. */
export interface CanvasNodeConfig<NodeConfig = unknown, NodeType extends string = string> {
  icon: ComponentType;
  name: string;
  type: NodeType;
  description: string;
  config: NodeConfig;
  connectors?: CanvasConnectorConfig<NodeConfig>;
  customContent?: (config: NodeConfig) => ReactNode;
  useBadge?: (config: NodeConfig) => CanvasBadgeInfo | undefined;
  /** Secondary line shown under the node label, e.g. the configured asset or a "Configure…" prompt. */
  getSubtitle?: (config: NodeConfig) => string | undefined;
}

/** Validation hints rendered on a node. */
export interface CanvasValidationStatus {
  hasErrors?: boolean;
  hasWarnings?: boolean;
  hasInfo?: boolean;
}

/** Metadata passed to `renderNodeStatus`. */
export interface FabricCanvasNodeStatusMetadata {
  nodeId: string;
  validationStatus?: CanvasValidationStatus;
}

/** Node action callbacks used across node and toolbar components. */
export interface FabricCanvasNodeActionHandlers<NodeConfig = unknown> {
  onNodeDelete?: (nodeId: string) => void;
  onNodeConfigure?: (nodeId: string, nodeConfig: CanvasNodeConfig<NodeConfig>) => void;
  onNodeLabelChange?: (nodeId: string, label: string) => void;
}

/** Public props for `FabricCanvasNode`. */
export interface FabricCanvasNodeProps<
  NodeConfig = unknown,
  NodeData extends Record<string, unknown> = Record<string, unknown>,
> extends FabricCanvasNodeActionHandlers<NodeConfig> {
  id: string;
  data: NodeData;
  selected?: boolean;
  nodeConfig: CanvasNodeConfig<NodeConfig>;
  mode: CanvasMode;
  nodeConfigData?: NodeConfig;
  renderNodeToolbar?: (metadata: FabricCanvasNodeToolbarMetadata<NodeConfig>) => ReactNode;
  renderNodeStatus?: (metadata: FabricCanvasNodeStatusMetadata) => ReactNode;
  validationStatus?: CanvasValidationStatus;
  /** Greys out the whole card (icon, border, text). A selected node keeps its selection border. */
  disabled?: boolean;
  /** Card proportions: "wide" (default, 128x88) or "square" (112x96, tighter padding, same content size). */
  shape?: "wide" | "square";
}

/** Metadata passed to `renderNodeToolbar`. */
export interface FabricCanvasNodeToolbarMetadata<NodeConfig = unknown>
  extends FabricCanvasNodeActionHandlers<NodeConfig> {
  nodeId: string;
  nodeConfig: CanvasNodeConfig<NodeConfig>;
  hasBadge: boolean;
}

/** Edge action callbacks exposed by `FabricCanvasEdge`. */
export interface FabricCanvasEdgeActionHandlers {
  onEdgeDelete?: (edgeId: string) => void;
}

/** Payload passed to `onDropNode` on successful drop. */
export interface CanvasDropNodeArgs<DropItem = unknown> {
  item: DropItem;
  position: XYPosition;
  sourceClientOffset: XYPosition;
}

/** Selection payload emitted from React Flow. */
export interface CanvasSelectionChange<
  NodeData extends Record<string, unknown> = Record<string, unknown>,
> {
  nodes: Node<NodeData>[];
  edges: Edge[];
}

/** Public props for `FabricCanvasBuilder`. */
export interface FabricCanvasBuilderProps<
  NodeData extends Record<string, unknown> = Record<string, unknown>,
  EdgeData extends Record<string, unknown> = Record<string, unknown>,
  DropItem = unknown,
> {
  nodes: Node<NodeData>[];
  edges: Edge<EdgeData>[];
  nodeTypes: NodeTypes;
  edgeTypes?: EdgeTypes;
  mode: CanvasMode;
  onNodesChange: (changes: NodeChange<Node<NodeData>>[]) => void;
  onEdgesChange: (changes: EdgeChange<Edge<EdgeData>>[]) => void;
  onConnect: (connection: Connection) => void;
  isValidConnection?: IsValidConnection<Edge<EdgeData>>;
  onDropNode?: (args: CanvasDropNodeArgs<DropItem>) => void;
  onSelectionChange?: (selection: CanvasSelectionChange<NodeData>) => void;
  dropItemType?: string;
  emptyState?: ReactNode;
  showControls?: boolean;
  showMiniMap?: boolean;
  initialFitViewOptions?: FitViewOptions<Node<NodeData>>;
  className?: string;
  style?: CSSProperties;
}

/** One node option rendered in the shared canvas node palette. */
export interface CanvasPaletteNode<DropItem = unknown> {
  id: string;
  label: string;
  description?: string;
  icon?: ReactNode;
  dropItem: DropItem;
  disabled?: boolean;
  testId?: string;
}

/** A rail entry that opens a drilled-down list of draggable nodes (one level deep). */
export interface CanvasNodePaletteGroup<DropItem = unknown> {
  /** Stable identifier, unique among the top-level rail entries. */
  id: string;
  /** Text shown under the icon. */
  label: string;
  /** Shown in a tooltip on hover. */
  description?: string;
  icon?: ReactNode;
  /** Dims the group and prevents it from opening. */
  disabled?: boolean;
  /** Overrides the default `node-group-<id>` test id. */
  testId?: string;
  /** Draggable nodes revealed when the group is opened. Groups cannot nest. */
  children: CanvasPaletteNode<DropItem>[];
}

/** A rail entry: either a draggable node or a group of nodes. */
export type CanvasNodePaletteItem<DropItem = unknown> =
  | CanvasPaletteNode<DropItem>
  | CanvasNodePaletteGroup<DropItem>;

/** Public props for `FabricCanvasNodePalette`, the compact icon-over-label node list. */
export interface FabricCanvasNodePaletteProps<DropItem = unknown>
  extends Omit<BoxProps, "children" | "ref"> {
  /** `view` makes every node non-draggable. */
  mode: CanvasMode;
  /** Rail entries: draggable nodes and/or groups that drill down to more nodes. */
  nodes: CanvasNodePaletteItem<DropItem>[];
  /** react-dnd item type; must match the canvas `dropItemType`. @default "node" */
  dragItemType?: string;
  /** Fires when a node (not a group) is clicked or activated with Enter/Space. */
  onNodeSelect?: (node: CanvasPaletteNode<DropItem>) => void;
  /** Fires when a drag of a node begins. */
  onNodeDragStart?: (node: CanvasPaletteNode<DropItem>) => void;
  /** Overrides the icon of a node or group. */
  renderNodeIcon?: (item: CanvasNodePaletteItem<DropItem>) => ReactNode;
  /** Side the description tooltip opens on. @default "right" */
  tooltipPlacement?: "left" | "right";
  /** Shown when there are no nodes to list. @default "No nodes available." */
  emptyMessage?: string;
  /** Accessible name of the back header inside a group. @default (label) => `Back to all nodes from ${label}` */
  backAriaLabel?: (groupLabel: string) => string;
}

/** Public props for `FabricCanvasNodePalettePanel`, the palette pinned to the left of the canvas. */
export interface FabricCanvasNodePalettePanelProps<DropItem = unknown>
  extends FabricCanvasNodePaletteProps<DropItem> {
  /** Render the panel in `view` mode too (items stay non-draggable). @default false */
  showInViewMode?: boolean;
}

/** Severity bucket for one canvas validation entry. */
export type CanvasValidationSeverity = "error" | "warning" | "info";

/** A single validation item rendered in global/node validation popovers. */
export interface CanvasValidationItem {
  id: string;
  code?: string;
  title?: string;
  message: string;
  context?: string;
  severity: CanvasValidationSeverity;
}

/** Group of validation items for either a workflow-level or node-level scope. */
export interface CanvasValidationGroup {
  id: string;
  nodeId?: string;
  nodeLabel?: string;
  nodeType?: string;
  items: CanvasValidationItem[];
}

/** Aggregate validation counters displayed on status triggers. */
export interface CanvasValidationSummary {
  errorCount: number;
  warningCount: number;
  infoCount?: number;
}

/** Public props for the shared validation status trigger icon. */
export interface FabricCanvasValidationTriggerProps {
  summary: CanvasValidationSummary;
  validationStatus?: CanvasValidationStatus;
  nodeScoped?: boolean;
  popoverId: string;
  activePopoverId: string | null;
  onActivePopoverChange: (id: string | null) => void;
  iconSize?: string;
  tooltipFormatter?: (summary: CanvasValidationSummary) => string;
  onAnchorElementChange?: (element: Element | null) => void;
  testId?: string;
}

/** Public props for the shared draggable validation popover. */
export interface FabricCanvasValidationPopoverProps extends Omit<BoxProps, "children"> {
  open: boolean;
  onClose: () => void;
  anchorElement?: Element | null;
  groups: CanvasValidationGroup[];
  validationStatus?: CanvasValidationStatus;
  draggable?: boolean;
  disableAccordion?: boolean;
  readOnly?: boolean;
  widthPx?: number;
  maxHeightPx?: number;
  renderNodeIcon?: (nodeType?: string) => ReactNode;
  renderValidationItem?: (item: CanvasValidationItem) => ReactNode;
}

/** Public props for the combined validation trigger + popover widget. */
export interface FabricCanvasValidationWidgetProps {
  popoverId: string;
  activePopoverId: string | null;
  onActivePopoverChange: (id: string | null) => void;
  groups: CanvasValidationGroup[];
  validationStatus?: CanvasValidationStatus;
  nodeIdScope?: string;
  iconSize?: string;
  disableAccordion?: boolean;
  readOnly?: boolean;
  renderNodeIcon?: (nodeType?: string) => ReactNode;
  renderValidationItem?: (item: CanvasValidationItem) => ReactNode;
}

/** Canonical top-bar slot keys used for consistent action ordering. */
export type CanvasTopBarActionSlot =
  | "validation"
  | "runNow"
  | "modeToggle"
  | "settings"
  | "publish"
  | "versionHistory"
  | "custom";

/** One top-bar action in the shared canvas workspace header. */
export interface CanvasTopBarAction {
  id: string;
  slot?: CanvasTopBarActionSlot;
  label?: string;
  icon?: ReactNode;
  content?: ReactNode;
  visible?: boolean;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  testId?: string;
}

/** Public props for the shared canvas workspace top bar. */
export interface FabricCanvasWorkspaceTopBarProps extends Omit<BoxProps, "children"> {
  title: string;
  mode: CanvasMode;
  onBack?: () => void;
  backLabel?: string;
  backIcon?: ReactNode;
  titleSlot?: ReactNode;
  titleIcon?: ReactNode;
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
  readOnly?: boolean;
  readOnlyLabel?: string;
  modeLabels?: {
    edit: string;
    view: string;
  };
  showModeChip?: boolean;
  statusSlot?: ReactNode;
  actions?: CanvasTopBarAction[];
}
