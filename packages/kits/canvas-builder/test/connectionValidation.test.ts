import type { Connection, Edge, Node } from "@xyflow/react";
import { describe, expect, it } from "vitest";
import { createsCycle, hasPathToSource } from "../src/utils/connectionValidation";

type StoryNodeData = { label: string };

const nodes: Node<StoryNodeData>[] = [
  { id: "A", position: { x: 0, y: 0 }, data: { label: "A" } },
  { id: "B", position: { x: 100, y: 0 }, data: { label: "B" } },
  { id: "C", position: { x: 200, y: 0 }, data: { label: "C" } },
];

const edges: Edge[] = [
  { id: "A-B", source: "A", target: "B" },
  { id: "B-C", source: "B", target: "C" },
];

describe("connectionValidation", () => {
  it("detects when a source is reachable from a target node", () => {
    const sourceReachable = hasPathToSource(nodes[0], "C", nodes, edges);
    const sourceNotReachable = hasPathToSource(nodes[2], "A", nodes, edges);

    expect(sourceReachable).toBe(true);
    expect(sourceNotReachable).toBe(false);
  });

  it("detects cycle-producing connections", () => {
    const cycleConnection: Pick<Connection, "source" | "target"> = {
      source: "C",
      target: "A",
    };
    const acyclicConnection: Pick<Connection, "source" | "target"> = {
      source: "A",
      target: "C",
    };

    expect(createsCycle(cycleConnection, nodes, edges)).toBe(true);
    expect(createsCycle(acyclicConnection, nodes, edges)).toBe(false);
  });
});
