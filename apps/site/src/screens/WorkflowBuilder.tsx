import {
  type CanvasNodeConfig,
  FabricCanvasBuilder,
  FabricCanvasEdge,
  type FabricCanvasEdgeData,
  FabricCanvasNode,
  FabricCanvasNodeToolbar,
} from "@fabric-kit/canvas-builder";
import CallSplitOutlined from "@fabric-kit/icons/CallSplitOutlined";
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type Edge,
  type EdgeProps,
  type Node,
  type NodeProps,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useMemo, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

type StepConfig = { kind?: "trigger" | "step" | "end"; subtitle?: string; badge?: string };
type StepData = { label?: string; config?: StepConfig };

const nodeConfig: CanvasNodeConfig<StepConfig, "step"> = {
  icon: CallSplitOutlined,
  name: "Step",
  type: "step",
  description: "Workflow step",
  config: {},
  connectors: {
    getHandles: (config) => {
      const input = {
        id: "input",
        type: "target",
        position: Position.Left,
        name: "input",
      } as const;
      const next = { id: "next", type: "source", position: Position.Right, name: "next" } as const;
      if (config.kind === "trigger") return [next];
      if (config.kind === "end") return [input];
      return [input, next];
    },
  },
  useBadge: (config) => (config.badge ? { label: config.badge, palette: "blue" } : undefined),
  getSubtitle: (config) => config.subtitle,
};

// Sample workflow for the concept screen.
const NODES: Node<StepData>[] = [
  {
    id: "a",
    type: "step",
    position: { x: 40, y: 150 },
    data: {
      label: "New order",
      config: { kind: "trigger", subtitle: "Store webhook", badge: "Trigger" },
    },
  },
  {
    id: "b",
    type: "step",
    position: { x: 300, y: 60 },
    data: { label: "Check stock", config: { subtitle: "Inventory API" } },
  },
  {
    id: "c",
    type: "step",
    position: { x: 300, y: 250 },
    data: { label: "Score fraud risk", config: { subtitle: "Rules engine" } },
  },
  {
    id: "d",
    type: "step",
    position: { x: 560, y: 150 },
    data: { label: "Email customer", config: { kind: "end", subtitle: "Order confirmation" } },
  },
];

const EDGES: Edge<FabricCanvasEdgeData>[] = [
  {
    id: "a-b",
    source: "a",
    sourceHandle: "next",
    target: "b",
    targetHandle: "input",
    type: "step",
  },
  {
    id: "a-c",
    source: "a",
    sourceHandle: "next",
    target: "c",
    targetHandle: "input",
    type: "step",
  },
  {
    id: "b-d",
    source: "b",
    sourceHandle: "next",
    target: "d",
    targetHandle: "input",
    type: "step",
  },
  {
    id: "c-d",
    source: "c",
    sourceHandle: "next",
    target: "d",
    targetHandle: "input",
    type: "step",
    data: { label: "low risk" },
  },
];

/** Concept screen: an order-automation flow on the Fabric canvas. Drag nodes, connect handles. */
export function WorkflowBuilder() {
  const [nodes, setNodes] = useState(NODES);
  const [edges, setEdges] = useState(EDGES);

  const nodeTypes = useMemo(
    () => ({
      step: (props: NodeProps<Node<StepData>>) => (
        <FabricCanvasNode<StepConfig, StepData>
          id={props.id}
          selected={props.selected}
          data={props.data}
          mode="edit"
          nodeConfig={nodeConfig}
          nodeConfigData={props.data.config}
          onNodeDelete={(id) => {
            setNodes((list) => list.filter((n) => n.id !== id));
            setEdges((list) => list.filter((e) => e.source !== id && e.target !== id));
          }}
          onNodeLabelChange={(id, label) =>
            setNodes((list) =>
              list.map((n) => (n.id === id ? { ...n, data: { ...n.data, label } } : n)),
            )
          }
          renderNodeToolbar={(toolbar) => <FabricCanvasNodeToolbar {...toolbar} />}
        />
      ),
    }),
    [],
  );

  const edgeTypes = useMemo(
    () => ({
      step: (props: EdgeProps<Edge<FabricCanvasEdgeData>>) => (
        <FabricCanvasEdge
          {...props}
          mode="edit"
          onEdgeDelete={(id) => setEdges((list) => list.filter((e) => e.id !== id))}
        />
      ),
    }),
    [],
  );

  return (
    <DndProvider backend={HTML5Backend}>
      <FabricCanvasBuilder
        style={{ height: "100%" }}
        mode="edit"
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        showControls
        onNodesChange={(changes) => setNodes((list) => applyNodeChanges(changes, list))}
        onEdgesChange={(changes) => setEdges((list) => applyEdgeChanges(changes, list))}
        onConnect={(connection: Connection) =>
          setEdges((list) => addEdge({ ...connection, type: "step" }, list))
        }
      />
    </DndProvider>
  );
}
