import type { SimpleTreeViewProps } from "@mui/x-tree-view/SimpleTreeView";
import type { TreeItemProps } from "@mui/x-tree-view/TreeItem";
import type { ReactNode } from "react";

/**
 * A single node in a data-driven Fabric tree.
 *
 * Pass an array of these to {@link FabricTreeViewProps.nodes} to render a
 * tree without hand-writing `<TreeItem>` JSX. Nested children are rendered
 * recursively.
 *
 * @example
 * ```ts
 * const nodes: FabricTreeViewNode[] = [
 *   { id: 'docs', label: 'Documents', children: [
 *     { id: 'docs-q1', label: 'Q1-2026.pdf' },
 *   ]},
 * ];
 * ```
 */
export interface FabricTreeViewNode {
  /** Unique identifier — maps to TreeItem's itemId. */
  id: string;
  /** Content rendered inside the row. */
  label: ReactNode;
  /** Leading icon rendered before the label (e.g. a folder/file icon). */
  icon?: ReactNode;
  /**
   * Values for the trailing data columns declared via
   * {@link FabricTreeViewProps.columns}, keyed by `field`. Ignored when
   * `columns` isn't set.
   */
  cells?: Record<string, ReactNode>;
  /** Nested child nodes. */
  children?: FabricTreeViewNode[];
  /** Whether this node is interactive. */
  disabled?: boolean;
  /**
   * Any additional TreeItem props (sx, className, style, slots, slotProps,
   * onClick, onFocus, data-*, aria-*, …). itemId, label and children are
   * derived from the node itself and are omitted here.
   */
  itemProps?: Omit<TreeItemProps, "itemId" | "label" | "children">;
}

/**
 * Declares a trailing data column rendered alongside the tree's Name column
 * (e.g. "Created Date", "Last Update") — a file-browser-style layout on top
 * of the tree structure. Column position/width is fixed regardless of node
 * depth; only the Name column absorbs indentation.
 */
export interface FabricTreeViewColumn {
  /** Key looked up on each node's {@link FabricTreeViewNode.cells}. */
  field: string;
  /** Text shown in the header row. */
  headerName: string;
  /** Column width in px. Defaults to 160. */
  width?: number;
}

/**
 * Props for {@link FabricTreeView}.
 *
 * Extends the full MUI `SimpleTreeViewProps` surface — every SimpleTreeView
 * prop (`defaultExpandedItems`, `expandedItems`, `onExpandedItemsChange`,
 * `selectedItems`, `onSelectedItemsChange`, `multiSelect`, `disableSelection`,
 * `expansionTrigger`, `slots`, `slotProps`, `sx`, …) flows straight through
 * to the underlying MUI component with no interference.
 *
 * The generic parameter is fixed to `boolean | undefined` so consumers do
 * not have to annotate `multiSelect` at every call site.
 */
export interface FabricTreeViewProps extends SimpleTreeViewProps<boolean | undefined> {
  /**
   * Data-driven tree nodes. When provided the component renders them
   * recursively as TreeItems. Omit this and pass `<TreeItem>` children
   * directly for full manual control.
   */
  nodes?: FabricTreeViewNode[];
  /**
   * Trailing data columns rendered to the right of the Name column, with a
   * matching header row above the tree (file-browser style). Omit for a
   * plain single-label tree.
   */
  columns?: FabricTreeViewColumn[];
}
