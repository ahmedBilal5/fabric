import type { Connection, Edge, Node } from "@xyflow/react";
import { getOutgoers } from "@xyflow/react";

/**
 * Walks outward from `currentNode` to determine whether `sourceId` is reachable.
 * Used to prevent introducing cycles when adding a new edge.
 */
export const hasPathToSource = <NodeData extends Record<string, unknown>>(
  currentNode: Node<NodeData>,
  sourceId: string,
  nodes: Node<NodeData>[],
  edges: Edge[],
  visited = new Set<string>(),
): boolean => {
  if (visited.has(currentNode.id)) {
    return false;
  }

  if (currentNode.id === sourceId) {
    return true;
  }

  visited.add(currentNode.id);

  const outgoers = getOutgoers(currentNode, nodes, edges);

  return outgoers.some((outgoer) => hasPathToSource(outgoer, sourceId, nodes, edges, visited));
};

/**
 * Returns `true` when adding `connection` would create a graph cycle.
 */
export const createsCycle = <NodeData extends Record<string, unknown>>(
  connection: Pick<Connection, "source" | "target">,
  nodes: Node<NodeData>[],
  edges: Edge[],
): boolean => {
  const targetNode = nodes.find((node) => node.id === connection.target);

  if (!targetNode || !connection.source) {
    return false;
  }

  return hasPathToSource(targetNode, connection.source, nodes, edges);
};
