import Box from "@mui/material/Box";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import { TreeItem, type TreeItemProps } from "@mui/x-tree-view/TreeItem";
import { forwardRef, memo, type ReactNode } from "react";
import { columnCellSx, columnHeaderRowSx, nameCellSx } from "./styles";
import type { FabricTreeViewColumn, FabricTreeViewNode, FabricTreeViewProps } from "./types";

const DEFAULT_COLUMN_WIDTH = 160;

/** Wraps a node's icon + label, and appends fixed-width column cells when `columns` is set. */
function renderRowContent(node: FabricTreeViewNode, columns?: FabricTreeViewColumn[]): ReactNode {
  if (!node.icon && !columns?.length) return node.label;

  return (
    <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
      <Box sx={nameCellSx}>
        {node.icon}
        {node.label}
      </Box>
      {columns?.map((col) => (
        <Box key={col.field} sx={columnCellSx(col.width ?? DEFAULT_COLUMN_WIDTH)}>
          {node.cells?.[col.field] ?? "—"}
        </Box>
      ))}
    </Box>
  );
}

function renderNodes(nodes: FabricTreeViewNode[], columns?: FabricTreeViewColumn[]): ReactNode {
  return nodes.map((node) => (
    <TreeItem
      key={node.id}
      itemId={node.id}
      label={renderRowContent(node, columns)}
      disabled={node.disabled}
      {...node.itemProps}
    >
      {node.children?.length ? renderNodes(node.children, columns) : null}
    </TreeItem>
  ));
}

/** Header row matching the Name + column layout of the tree rows below it. */
function ColumnHeaderRow({ columns }: { readonly columns: FabricTreeViewColumn[] }) {
  return (
    <Box sx={columnHeaderRowSx}>
      <Box sx={nameCellSx}>Name</Box>
      {columns.map((col) => (
        <Box key={col.field} sx={columnCellSx(col.width ?? DEFAULT_COLUMN_WIDTH)}>
          {col.headerName}
        </Box>
      ))}
    </Box>
  );
}

/**
 * A thin, fully-transparent wrapper around MUI `SimpleTreeView`.
 *
 * Accepts a `nodes` array for data-driven rendering, or plain `<TreeItem>`
 * children for manual control. Every `SimpleTreeView` prop is forwarded as-is,
 * and `ref` is forwarded to the underlying `<ul>` root. No styles are applied
 * by default — use the `sx` prop or the presets exported from
 * `fabricTreeViewStyles` to opt in to a look.
 *
 * Pass `columns` for a file-browser-style layout (a Name column plus fixed
 * trailing data columns with a matching header row), or omit it for a plain
 * single-label tree.
 *
 * @example Data-driven usage
 * ```tsx
 * import { FabricTreeView, fabricTreeViewStyles } from '@fabric-kit/tree-view';
 *
 * <FabricTreeView
 *   sx={fabricTreeViewStyles.rowList}
 *   nodes={[
 *     { id: 'docs', label: 'Documents', children: [
 *       { id: 'docs-q1', label: 'Q1-2026.pdf' },
 *     ]},
 *   ]}
 * />
 * ```
 *
 * @example File-browser layout with columns
 * ```tsx
 * <FabricTreeView
 *   sx={fabricTreeViewStyles.rowList}
 *   columns={[
 *     { field: 'createdDate', headerName: 'Created Date' },
 *     { field: 'lastUpdate', headerName: 'Last Update' },
 *   ]}
 *   nodes={[
 *     { id: 'edi', label: 'Edi', icon: <FolderRoundedIcon fontSize="small" />, cells: { createdDate: '—', lastUpdate: '—' } },
 *   ]}
 * />
 * ```
 *
 * @example Manual `<TreeItem>` children
 * ```tsx
 * import { FabricTreeView } from '@fabric-kit/tree-view';
 * import { TreeItem } from '@mui/x-tree-view/TreeItem';
 *
 * <FabricTreeView>
 *   <TreeItem itemId="docs" label="Documents">
 *     <TreeItem itemId="docs-q1" label="Q1-2026.pdf" />
 *   </TreeItem>
 * </FabricTreeView>
 * ```
 */
const FabricTreeViewInner = forwardRef<HTMLUListElement, FabricTreeViewProps>(
  function FabricTreeViewInner({ nodes, columns, children, ...props }, ref) {
    return (
      <Box>
        {columns?.length ? <ColumnHeaderRow columns={columns} /> : null}
        <SimpleTreeView ref={ref} {...props}>
          {nodes?.length ? renderNodes(nodes, columns) : children}
        </SimpleTreeView>
      </Box>
    );
  },
);

FabricTreeViewInner.displayName = "FabricTreeView";

export const FabricTreeView = memo(FabricTreeViewInner);
FabricTreeView.displayName = "FabricTreeView";

/**
 * Build a `FabricTreeViewNode[]` from a flat list of rows using path segments.
 *
 * @param rows         Flat data rows.
 * @param getPath      Returns hierarchy path segments for a row,
 *                     e.g. `['model', 'object', 'table']`.
 * @param getId        Returns a unique string id for a row.
 * @param getLabel     Returns the label for a row. Defaults to `getId` when omitted.
 * @param getItemProps Returns extra TreeItem props for a row (sx, className,
 *                     slots, slotProps, event handlers, …).
 */
export function buildTreeViewNodes<T>(
  rows: T[],
  getPath: (row: T) => string[],
  getId: (row: T) => string,
  getLabel?: (row: T) => ReactNode,
  getItemProps?: (row: T) => Omit<TreeItemProps, "itemId" | "label" | "children">,
): FabricTreeViewNode[] {
  const nodeMap = new Map<string, FabricTreeViewNode>();
  const roots: FabricTreeViewNode[] = [];

  for (const row of rows) {
    const key = getPath(row).join("\x00");
    nodeMap.set(key, {
      ...(row as object),
      id: getId(row),
      label: getLabel ? getLabel(row) : getId(row),
      children: [],
      ...(getItemProps ? { itemProps: getItemProps(row) } : {}),
    } as FabricTreeViewNode);
  }

  for (const row of rows) {
    const path = getPath(row);
    const key = path.join("\x00");
    const node = nodeMap.get(key);
    if (!node) {
      throw new Error(`buildTreeViewNodes: missing node for path "${key}"`);
    }

    if (path.length <= 1) {
      roots.push(node);
    } else {
      const parentKey = path.slice(0, -1).join("\x00");
      const parent = nodeMap.get(parentKey);
      if (parent) {
        parent.children?.push(node);
      } else {
        roots.push(node);
      }
    }
  }

  return roots;
}
