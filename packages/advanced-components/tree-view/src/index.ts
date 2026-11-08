export * from "@mui/x-tree-view";
export type { SimpleTreeViewProps } from "@mui/x-tree-view/SimpleTreeView";
// Re-export the underlying MUI primitives so consumers can compose directly
// when the data-driven `nodes` API isn't enough. Kept unprefixed to match
// FabricDatagrid's precedent of re-exporting raw @mui/x-* types (GridColDef,
// etc.) without a Fabric prefix.
export { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
export type { TreeItemProps } from "@mui/x-tree-view/TreeItem";
export { TreeItem } from "@mui/x-tree-view/TreeItem";
export { buildTreeViewNodes, FabricTreeView } from "./FabricTreeView";
export { fabricTreeViewStyles } from "./styles";
export type { FabricTreeViewColumn, FabricTreeViewNode, FabricTreeViewProps } from "./types";
