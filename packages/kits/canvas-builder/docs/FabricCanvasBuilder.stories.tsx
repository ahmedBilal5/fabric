import React, { useCallback, useMemo, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import '@xyflow/react/dist/style.css';
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Position,
  type Connection,
  type Edge,
  type EdgeProps,
  type Node,
  type NodeProps,
} from '@xyflow/react';
import CloseIcon from "@fabric-kit/icons/Close";
import DeleteIcon from "@fabric-kit/icons/Delete";
import DoneIcon from "@fabric-kit/icons/Done";
import SettingsIcon from "@fabric-kit/icons/Settings";
import { FabricBox } from '@fabric-kit/components';
import { FabricFlex, FabricText } from '@fabric-kit/primitives';
import {
  FabricCanvasBuilder,
  FabricCanvasEdge,
  FabricCanvasNode,
  FabricCanvasNodeToolbar,
  type CanvasMode,
  type CanvasNodeConfig,
  type CanvasValidationStatus,
  type FabricCanvasBuilderProps,
  type FabricCanvasEdgeData,
  type FabricCanvasNodeToolbarProps,
} from '../src';

type StoryNodeConfig = {
  badge?: string;
  badgePalette?: 'purple' | 'blue' | 'grey';
  subtitle?: string;
  /** Terminal nodes get one connector: a source only outputs, a target only receives. */
  kind?: 'source' | 'transform' | 'target';
  disabled?: boolean;
  shape?: 'wide' | 'square';
};

type StoryNodeData = {
  label?: string;
  config?: StoryNodeConfig;
  validationStatus?: CanvasValidationStatus;
};

const nodeConfig: CanvasNodeConfig<StoryNodeConfig, 'workflow-node'> = {
  icon: SettingsIcon,
  name: 'Workflow node',
  type: 'workflow-node',
  description: 'Storybook node',
  config: {},
  connectors: {
    getHandles: (config) => {
      const input = { id: 'input', type: 'target', position: Position.Left, name: 'input' } as const;
      const success = { id: 'default', type: 'source', position: Position.Right, name: 'default' } as const;
      const error = { id: 'error', type: 'source', position: Position.Bottom, name: 'error' } as const;
      if (config.kind === 'source') return [success];
      if (config.kind === 'target') return [input];
      return [input, success, error];
    },
  },
  useBadge: (config) =>
    config.badge
      ? { label: config.badge, palette: config.badgePalette ?? 'purple' }
      : undefined,
  getSubtitle: (config) => config.subtitle,
};

function createNodeRenderer(
  mode: CanvasMode,
  toolbarOverrides?: Pick<
    FabricCanvasNodeToolbarProps<StoryNodeConfig>,
    'configureIcon' | 'deleteIcon' | 'confirmIcon' | 'cancelIcon'
  >,
  actionHandlers?: {
    onNodeDelete?: (nodeId: string) => void;
    onNodeConfigure?: (nodeId: string, nodeConfig: CanvasNodeConfig<StoryNodeConfig>) => void;
    onNodeLabelChange?: (nodeId: string, label: string) => void;
  },
) {
  return function StoryNode(props: NodeProps<Node<StoryNodeData>>) {
    return (
      <FabricCanvasNode<StoryNodeConfig, StoryNodeData>
        id={props.id}
        selected={props.selected}
        data={props.data}
        mode={mode}
        nodeConfig={nodeConfig}
        nodeConfigData={props.data.config}
        validationStatus={props.data.validationStatus}
        disabled={props.data.config?.disabled}
        shape={props.data.config?.shape}
        onNodeDelete={actionHandlers?.onNodeDelete}
        onNodeConfigure={actionHandlers?.onNodeConfigure}
        onNodeLabelChange={actionHandlers?.onNodeLabelChange}
        renderNodeToolbar={(toolbarMetadata) => (
          <FabricCanvasNodeToolbar {...toolbarMetadata} {...toolbarOverrides} />
        )}
      />
    );
  };
}

function createNodeTypes(
  mode: CanvasMode,
  toolbarOverrides?: Pick<
    FabricCanvasNodeToolbarProps<StoryNodeConfig>,
    'configureIcon' | 'deleteIcon' | 'confirmIcon' | 'cancelIcon'
  >,
  actionHandlers?: {
    onNodeDelete?: (nodeId: string) => void;
    onNodeConfigure?: (nodeId: string, nodeConfig: CanvasNodeConfig<StoryNodeConfig>) => void;
    onNodeLabelChange?: (nodeId: string, label: string) => void;
  },
) {
  const StoryNode = createNodeRenderer(mode, toolbarOverrides, actionHandlers);
  return { 'workflow-node': StoryNode };
}

function createEdgeTypes(
  mode: CanvasMode,
  actionHandlers?: {
    onEdgeDelete?: (edgeId: string) => void;
  },
) {
  return {
    workflowEdge: (props: EdgeProps<Edge<FabricCanvasEdgeData>>) => (
      <FabricCanvasEdge
        {...props}
        mode={mode}
        onEdgeDelete={actionHandlers?.onEdgeDelete}
      />
    ),
  };
}

type CanvasScenarioProps = Pick<
  FabricCanvasBuilderProps<StoryNodeData, FabricCanvasEdgeData>,
  'nodes' | 'edges'
> & {
  mode: CanvasMode;
  showControls?: boolean;
  showMiniMap?: boolean;
  onNodeDelete?: (nodeId: string) => void;
  onNodeConfigure?: (nodeId: string, nodeConfig: CanvasNodeConfig<StoryNodeConfig>) => void;
  onNodeLabelChange?: (nodeId: string, label: string) => void;
  onEdgeDelete?: (edgeId: string) => void;
  toolbarOverrides?: Pick<
    FabricCanvasNodeToolbarProps<StoryNodeConfig>,
    'configureIcon' | 'deleteIcon' | 'confirmIcon' | 'cancelIcon'
  >;
};

function CanvasScenario({
  nodes: initialNodes,
  edges: initialEdges,
  mode,
  showControls,
  showMiniMap,
  onNodeDelete,
  onNodeConfigure,
  onNodeLabelChange,
  onEdgeDelete,
  toolbarOverrides,
}: CanvasScenarioProps) {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const handleNodeDelete = useCallback(
    (nodeId: string) => {
      onNodeDelete?.(nodeId);
      setNodes((current) => current.filter((node) => node.id !== nodeId));
      setEdges((current) =>
        current.filter((edge) => edge.source !== nodeId && edge.target !== nodeId),
      );
    },
    [onNodeDelete],
  );
  const handleNodeConfigure = useCallback(
    (nodeId: string, config: CanvasNodeConfig<StoryNodeConfig>) => {
      onNodeConfigure?.(nodeId, config);
    },
    [onNodeConfigure],
  );
  const handleNodeLabelChange = useCallback(
    (nodeId: string, label: string) => {
      onNodeLabelChange?.(nodeId, label);
      setNodes((current) =>
        current.map((node) =>
          node.id === nodeId ? { ...node, data: { ...node.data, label } } : node,
        ),
      );
    },
    [onNodeLabelChange],
  );
  const handleEdgeDelete = useCallback(
    (edgeId: string) => {
      onEdgeDelete?.(edgeId);
      setEdges((current) => current.filter((edge) => edge.id !== edgeId));
    },
    [onEdgeDelete],
  );

  const nodeTypes = useMemo(
    () =>
      createNodeTypes(mode, toolbarOverrides, {
        onNodeDelete: handleNodeDelete,
        onNodeConfigure: handleNodeConfigure,
        onNodeLabelChange: handleNodeLabelChange,
      }),
    [handleNodeConfigure, handleNodeDelete, handleNodeLabelChange, mode, toolbarOverrides],
  );
  const edgeTypes = useMemo(
    () => createEdgeTypes(mode, { onEdgeDelete: handleEdgeDelete }),
    [handleEdgeDelete, mode],
  );

  const onConnect = (connection: Connection) => {
    setEdges((current) =>
      addEdge(
        {
          ...connection,
          type: 'workflowEdge',
          data: { label: connection.sourceHandle } as FabricCanvasEdgeData,
        },
        current,
      ),
    );
  };

  return (
    <FabricBox sx={{ height: '75vh', minHeight: 540 }}>
      <DndProvider backend={HTML5Backend}>
        <FabricCanvasBuilder
          mode={mode}
          nodes={nodes}
          edges={edges}
          showControls={showControls}
          showMiniMap={showMiniMap}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodesChange={(changes) =>
            setNodes((current) => applyNodeChanges(changes, current))
          }
          onEdgesChange={(changes) =>
            setEdges((current) => applyEdgeChanges(changes, current))
          }
          onConnect={onConnect}
          emptyState={
            <FabricFlex sx={{ height: '100%' }} align='center' justify='center'>
              <FabricText color='text.secondary'>
                Drag and drop nodes to start building a workflow.
              </FabricText>
            </FabricFlex>
          }
        />
      </DndProvider>
    </FabricBox>
  );
}

const baseNodes: Node<StoryNodeData>[] = [
  {
    id: 'source',
    type: 'workflow-node',
    position: { x: 120, y: 120 },
    data: {
      label: 'Source system',
      config: { kind: 'source', badge: 'Beta', subtitle: 'Orders database' },
    },
  },
  {
    id: 'transform',
    type: 'workflow-node',
    position: { x: 420, y: 120 },
    data: { label: 'Transform payload', config: { subtitle: 'Configure transform' } },
  },
  {
    id: 'target',
    type: 'workflow-node',
    position: { x: 720, y: 120 },
    data: { label: 'Publish result', config: { kind: 'target', subtitle: 'Warehouse table' } },
  },
];

const baseEdges: Edge<FabricCanvasEdgeData>[] = [
  {
    id: 'source-transform',
    source: 'source',
    sourceHandle: 'default',
    target: 'transform',
    targetHandle: 'input',
    type: 'workflowEdge',
    data: { label: 'default' },
  },
  {
    id: 'transform-target',
    source: 'transform',
    sourceHandle: 'default',
    target: 'target',
    targetHandle: 'input',
    type: 'workflowEdge',
    data: { label: 'success' },
  },
];

const selectedStateNodes: Node<StoryNodeData>[] = baseNodes.map((node) => ({
  ...node,
  selected: node.id === 'transform',
}));

const selectedStateEdges: Edge<FabricCanvasEdgeData>[] = baseEdges.map((edge) => ({
  ...edge,
  selected: edge.id === 'transform-target',
  data: edge.id === 'transform-target' ? { label: 'success' } : edge.data,
}));

const meta = {
  title: 'Kits/Canvas Builder/FabricCanvasBuilder',
  component: FabricCanvasBuilder,
  tags: ['autodocs'],
  argTypes: {
    mode: {
      control: 'inline-radio',
      options: ['edit', 'view'],
      description: 'Canvas interaction mode.',
    },
    showControls: {
      control: 'boolean',
      description: 'Show or hide zoom/fit controls.',
    },
    showMiniMap: {
      control: 'boolean',
      description: 'Show or hide the minimap panel.',
    },
  },
  parameters: {
    layout: 'fullscreen',
    a11y: { test: 'error' },
  },
} satisfies Meta<typeof FabricCanvasBuilder>;

export default meta;
type Story = StoryObj<typeof FabricCanvasBuilder>;

export const DefaultEditMode: Story = {
  tags: ['test'],
  render: () => <CanvasScenario mode='edit' nodes={baseNodes} edges={baseEdges} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText('Source system')).toBeTruthy();
    await expect(await canvas.findByText('Publish result')).toBeTruthy();
    const firstNode = canvasElement.querySelector('.react-flow__node');
    await expect(firstNode).toBeTruthy();
    expect(firstNode?.className).toContain('draggable');
  },
};

export const ViewModeNoEditing: Story = {
  tags: ['test'],
  render: () => <CanvasScenario mode='view' nodes={baseNodes} edges={baseEdges} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // React Flow renders nodes after it measures them, so wait for the first one.
    const firstNode = await waitFor(() => {
      const node = canvasElement.querySelector('.react-flow__node');
      if (!node) throw new Error('No node rendered yet');
      return node;
    });
    expect(firstNode.className).not.toContain('draggable');
    expect(canvas.queryByLabelText('Configure node')).toBeNull();
    expect(canvas.queryByLabelText('Delete node')).toBeNull();
  },
};

export const InteractivePropsControls: Story = {
  args: {
    mode: 'edit',
    showControls: true,
    showMiniMap: true,
  },
  render: (args) => (
    <CanvasScenario
      mode={args.mode ?? 'edit'}
      showControls={args.showControls}
      showMiniMap={args.showMiniMap}
      nodes={baseNodes}
      edges={baseEdges}
    />
  ),
};

export const ValidationStates: Story = {
  render: () => (
    <CanvasScenario
      mode='edit'
      nodes={[
        {
          id: 'warn',
          type: 'workflow-node',
          position: { x: 140, y: 120 },
          data: {
            label: 'Warn node',
            validationStatus: { hasWarnings: true },
          },
        },
        {
          id: 'error',
          type: 'workflow-node',
          position: { x: 420, y: 120 },
          data: {
            label: 'Error node',
            validationStatus: { hasErrors: true },
          },
        },
        {
          id: 'ok',
          type: 'workflow-node',
          position: { x: 700, y: 120 },
          data: {
            label: 'Healthy node',
          },
        },
      ]}
      edges={[
        {
          id: 'warn-error',
          source: 'warn',
          sourceHandle: 'default',
          target: 'error',
          targetHandle: 'input',
          type: 'workflowEdge',
          data: { label: 'default' },
        },
        {
          id: 'error-ok',
          source: 'error',
          sourceHandle: 'default',
          target: 'ok',
          targetHandle: 'input',
          type: 'workflowEdge',
          data: { label: 'default' },
        },
      ]}
    />
  ),
};

export const BadgePalettes: Story = {
  render: () => (
    <CanvasScenario
      mode='edit'
      nodes={(['purple', 'blue', 'grey'] as const).map((palette, index) => ({
        id: palette,
        type: 'workflow-node',
        position: { x: 140 + index * 280, y: 140 },
        data: {
          label: `${palette} badge`,
          config: {
            kind: 'transform',
            badge: palette === 'blue' ? 'Delta Processing' : `${palette} badge`,
            badgePalette: palette,
            subtitle: 'Badge on the top border',
          },
        },
      }))}
      edges={[]}
    />
  ),
};

export const DisabledNode: Story = {
  render: () => (
    <CanvasScenario
      mode='edit'
      nodes={[
        { id: 'on', type: 'workflow-node', position: { x: 120, y: 120 }, data: { label: 'Enabled', config: { subtitle: 'Normal node', badge: 'Beta' } } },
        { id: 'off', type: 'workflow-node', position: { x: 420, y: 120 }, data: { label: 'Disabled', config: { subtitle: 'Greyed out', badge: 'Disabled', badgePalette: 'grey', disabled: true } } },
        { id: 'tgt', type: 'workflow-node', position: { x: 720, y: 120 }, data: { label: 'Next step', config: { kind: 'target' } } },
      ]}
      edges={[
        { id: 'd-1', source: 'off', sourceHandle: 'default', target: 'tgt', targetHandle: 'input', type: 'workflowEdge', data: { label: 'success' } },
      ]}
    />
  ),
};

export const SquareNodeShape: Story = {
  render: () => (
    <CanvasScenario
      mode='edit'
      nodes={[
        { id: 'w-src', type: 'workflow-node', position: { x: 40, y: 40 }, data: { label: 'Manual Run', config: { kind: 'source' } } },
        { id: 'w-mid', type: 'workflow-node', position: { x: 300, y: 40 }, data: { label: 'If', config: { subtitle: 'Wide', badge: 'Beta' } } },
        { id: 'w-ok', type: 'workflow-node', position: { x: 560, y: 40 }, data: { label: 'On success', config: { kind: 'target' } } },
        { id: 'w-err', type: 'workflow-node', position: { x: 460, y: 230 }, data: { label: 'On error', config: { kind: 'target' } } },
        { id: 's-src', type: 'workflow-node', position: { x: 40, y: 430 }, data: { label: 'Manual Run', config: { kind: 'source', shape: 'square' } } },
        { id: 's-mid', type: 'workflow-node', position: { x: 300, y: 430 }, data: { label: 'If', config: { subtitle: 'Square', badge: 'Beta', shape: 'square' } } },
        { id: 's-ok', type: 'workflow-node', position: { x: 560, y: 430 }, data: { label: 'On success', config: { kind: 'target', shape: 'square' } } },
        { id: 's-err', type: 'workflow-node', position: { x: 460, y: 650 }, data: { label: 'On error', config: { kind: 'target', shape: 'square' } } },
      ]}
      edges={[
        { id: 'w-1', source: 'w-src', sourceHandle: 'default', target: 'w-mid', targetHandle: 'input', type: 'workflowEdge' },
        { id: 'w-2', source: 'w-mid', sourceHandle: 'default', target: 'w-ok', targetHandle: 'input', type: 'workflowEdge', data: { label: 'success' } },
        { id: 'w-3', source: 'w-mid', sourceHandle: 'error', target: 'w-err', targetHandle: 'input', type: 'workflowEdge', data: { label: 'error' } },
        { id: 's-1', source: 's-src', sourceHandle: 'default', target: 's-mid', targetHandle: 'input', type: 'workflowEdge' },
        { id: 's-2', source: 's-mid', sourceHandle: 'default', target: 's-ok', targetHandle: 'input', type: 'workflowEdge', data: { label: 'success' } },
        { id: 's-3', source: 's-mid', sourceHandle: 'error', target: 's-err', targetHandle: 'input', type: 'workflowEdge', data: { label: 'error' } },
      ]}
    />
  ),
};

export const EdgeLabelsOnCurvedEdges: Story = {
  render: () => (
    <CanvasScenario
      mode='edit'
      nodes={[
        { id: 'tx', type: 'workflow-node', position: { x: 60, y: 80 }, data: { label: 'Transform', config: { subtitle: 'Success right, Error down' } } },
        { id: 'ok', type: 'workflow-node', position: { x: 380, y: 80 }, data: { label: 'On success', config: { kind: 'target' } } },
        { id: 'err', type: 'workflow-node', position: { x: 260, y: 400 }, data: { label: 'On error', config: { kind: 'target' } } },
        { id: 'tx2', type: 'workflow-node', position: { x: 700, y: 80 }, data: { label: 'Offset source', config: { subtitle: 'Target sits lower' } } },
        { id: 'far', type: 'workflow-node', position: { x: 1020, y: 300 }, data: { label: 'Offset target', config: { kind: 'target' } } },
      ]}
      edges={[
        { id: 'e-1', source: 'tx', sourceHandle: 'default', target: 'ok', targetHandle: 'input', type: 'workflowEdge', data: { label: 'success' } },
        { id: 'e-2', source: 'tx', sourceHandle: 'error', target: 'err', targetHandle: 'input', type: 'workflowEdge', data: { label: 'error' } },
        { id: 'e-3', source: 'tx2', sourceHandle: 'default', target: 'far', targetHandle: 'input', type: 'workflowEdge', data: { label: 'success' } },
      ]}
    />
  ),
};

export const NodeCallbacksAndDeleteFlow: Story = {
  tags: ['test'],
  render: () => {
    const NodeCallbackHarness = () => {
      const [lastConfiguredNodeId, setLastConfiguredNodeId] = useState('none');
      const [lastDeletedNodeId, setLastDeletedNodeId] = useState('none');

      return (
        <FabricBox>
          <CanvasScenario
            mode='edit'
            nodes={selectedStateNodes}
            edges={selectedStateEdges}
            onNodeConfigure={(nodeId) => setLastConfiguredNodeId(nodeId)}
            onNodeDelete={(nodeId) => setLastDeletedNodeId(nodeId)}
          />
          <FabricText data-testid='last-configured-node'>{lastConfiguredNodeId}</FabricText>
          <FabricText data-testid='last-deleted-node'>{lastDeletedNodeId}</FabricText>
        </FabricBox>
      );
    };

    return <NodeCallbackHarness />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByLabelText('Configure node'));
    await expect(canvas.getByTestId('last-configured-node')).toHaveTextContent('transform');
    await userEvent.click(canvas.getByLabelText('Delete node'));
    await expect(screen.getByLabelText('Confirm delete')).toBeTruthy();
    await userEvent.click(screen.getByLabelText('Confirm delete'));
    await expect(canvas.getByTestId('last-deleted-node')).toHaveTextContent('transform');
    expect(canvas.queryByText('Transform payload')).toBeNull();
  },
};

export const LongLabelsAndOverflow: Story = {
  tags: ['test'],
  render: () => (
    <CanvasScenario
      mode='edit'
      nodes={[
        {
          id: 'long-source',
          type: 'workflow-node',
          position: { x: 120, y: 120 },
          data: {
            label: 'Source with a very long and intentionally overflowing display label',
          },
        },
        {
          id: 'long-target',
          type: 'workflow-node',
          position: { x: 560, y: 200 },
          data: {
            label: 'Target that validates long text rendering and edge labels',
          },
        },
      ]}
      edges={[
        {
          id: 'long-edge',
          source: 'long-source',
          sourceHandle: 'default',
          target: 'long-target',
          targetHandle: 'input',
          type: 'workflowEdge',
          data: {
            label:
              'default connection with long label to validate edge annotation overflow handling',
          },
        },
      ]}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByText('Source with a very long and intentionally overflowing display label'),
    ).toBeTruthy();
    await expect(
      await canvas.findByText('Target that validates long text rendering and edge labels'),
    ).toBeTruthy();
    expect(canvasElement.querySelectorAll('.react-flow__node').length).toBe(2);
  },
};

export const LabelEditingKeyboardPath: Story = {
  tags: ['test'],
  render: () => {
    const LabelEditHarness = () => {
      const [lastLabelChange, setLastLabelChange] = useState('none');
      return (
        <FabricBox>
          <CanvasScenario
            mode='edit'
            nodes={baseNodes}
            edges={baseEdges}
            onNodeLabelChange={(nodeId, label) => setLastLabelChange(`${nodeId}:${label}`)}
          />
          <FabricText data-testid='last-label-change'>{lastLabelChange}</FabricText>
        </FabricBox>
      );
    };

    return <LabelEditHarness />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.dblClick(await canvas.findByText('Transform payload'));
    const labelEditor = canvas.getByRole('textbox');
    await userEvent.clear(labelEditor);
    await userEvent.type(labelEditor, 'Transform ready{Enter}');
    await expect(canvas.getByTestId('last-label-change')).toHaveTextContent(
      'transform:Transform ready',
    );
  },
};

export const EmptyState: Story = {
  tags: ['test'],
  render: () => <CanvasScenario mode='edit' nodes={[]} edges={[]} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Drag and drop nodes to start building a workflow.')).toBeTruthy();
  },
};

export const SelectedNodeAndEdgeStates: Story = {
  render: () => (
    <CanvasScenario
      mode='edit'
      nodes={selectedStateNodes}
      edges={selectedStateEdges}
    />
  ),
};

export const EdgeDeleteBehavior: Story = {
  tags: ['test'],
  render: () => {
    const EdgeDeleteHarness = () => {
      const [lastDeletedEdgeId, setLastDeletedEdgeId] = useState('none');
      return (
        <FabricBox>
          <CanvasScenario
            mode='edit'
            nodes={selectedStateNodes}
            edges={selectedStateEdges}
            onEdgeDelete={(edgeId) => setLastDeletedEdgeId(edgeId)}
          />
          <FabricText data-testid='last-edge-delete'>{lastDeletedEdgeId}</FabricText>
        </FabricBox>
      );
    };

    return <EdgeDeleteHarness />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const deleteEdgeButton = await canvas.findByRole('button', { name: /^Delete$/i });
    await userEvent.click(deleteEdgeButton);
    await expect(canvas.getByTestId('last-edge-delete')).toHaveTextContent('transform-target');
    expect(canvas.queryByRole('button', { name: /^Delete$/i })).toBeNull();
  },
};

export const EdgeDeleteKeyboardPath: Story = {
  tags: ['test'],
  render: () => {
    const EdgeDeleteKeyboardHarness = () => {
      const [lastDeletedEdgeId, setLastDeletedEdgeId] = useState('none');
      return (
        <FabricBox>
          <CanvasScenario
            mode='edit'
            nodes={selectedStateNodes}
            edges={selectedStateEdges}
            onEdgeDelete={(edgeId) => setLastDeletedEdgeId(edgeId)}
          />
          <FabricText data-testid='last-edge-delete-keyboard'>{lastDeletedEdgeId}</FabricText>
        </FabricBox>
      );
    };

    return <EdgeDeleteKeyboardHarness />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const deleteEdgeButton = await canvas.findByRole('button', { name: /^Delete$/i });
    deleteEdgeButton.focus();
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByTestId('last-edge-delete-keyboard')).toHaveTextContent(
      'transform-target',
    );
  },
};

export const LoopEdgeState: Story = {
  render: () => (
    <CanvasScenario
      mode='edit'
      nodes={[
        {
          id: 'loop-source',
          type: 'workflow-node',
          position: { x: 220, y: 120 },
          data: { label: 'Loop source' },
        },
        {
          id: 'loop-target',
          type: 'workflow-node',
          position: { x: 540, y: 120 },
          data: { label: 'Loop target' },
        },
      ]}
      edges={[
        {
          id: 'loop-path',
          source: 'loop-source',
          sourceHandle: 'default',
          target: 'loop-target',
          targetHandle: 'input',
          type: 'workflowEdge',
          data: { label: 'loop', isLoop: true },
          selected: true,
        },
      ]}
    />
  ),
};

export const DenseGraphWithManyNodes: Story = {
  render: () => {
    const denseNodes: Node<StoryNodeData>[] = Array.from({ length: 12 }).map((_, index) => ({
      id: `node-${index + 1}`,
      type: 'workflow-node',
      position: {
        x: 120 + (index % 4) * 260,
        y: 90 + Math.floor(index / 4) * 170,
      },
      data: { label: `Node ${index + 1}` },
    }));

    const denseEdges: Edge<FabricCanvasEdgeData>[] = denseNodes.slice(0, -1).map((node, index) => ({
      id: `edge-${index + 1}`,
      source: node.id,
      sourceHandle: 'default',
      target: denseNodes[index + 1].id,
      targetHandle: 'input',
      type: 'workflowEdge',
      data: { label: 'default' },
    }));

    return <CanvasScenario mode='edit' nodes={denseNodes} edges={denseEdges} />;
  },
};

export const CustomToolbarIcons: Story = {
  render: () => (
    <CanvasScenario
      mode='edit'
      nodes={baseNodes}
      edges={baseEdges}
      toolbarOverrides={{
        configureIcon: <SettingsIcon fontSize='small' color='primary' />,
        deleteIcon: <DeleteIcon fontSize='small' color='error' />,
        confirmIcon: <DoneIcon fontSize='small' color='success' />,
        cancelIcon: <CloseIcon fontSize='small' color='action' />,
      }}
    />
  ),
};

export const ResponsiveMobileViewport: Story = {
  tags: ['test'],
  render: () => (
    <CanvasScenario
      mode='edit'
      nodes={baseNodes}
      edges={[
        ...baseEdges,
        {
          id: 'mobile-no-arrow',
          source: 'target',
          sourceHandle: 'default',
          target: 'source',
          targetHandle: 'input',
          type: 'workflowEdge',
          data: { label: 'default', hideTargetArrow: true },
        },
      ]}
    />
  ),
  globals: {
    viewport: { value: 'fabricMobile', isRotated: false },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText('Source system')).toBeTruthy();
  },
};

export const ResponsiveTabletViewport: Story = {
  tags: ['test'],
  render: () => <CanvasScenario mode='edit' nodes={baseNodes} edges={baseEdges} />,
  globals: {
    viewport: { value: 'fabricTablet', isRotated: false },
  },
};

export const ResponsiveDesktopViewport: Story = {
  tags: ['test'],
  render: () => <CanvasScenario mode='edit' nodes={baseNodes} edges={baseEdges} />,
  globals: {
    viewport: { value: 'fabricDesktop', isRotated: false },
  },
};

export const ResponsiveWideViewport: Story = {
  tags: ['test'],
  render: () => <CanvasScenario mode='edit' nodes={baseNodes} edges={baseEdges} />,
  globals: {
    viewport: { value: 'fabricWide', isRotated: false },
  },
};

export const MissingOptionalNodeData: Story = {
  render: () => (
    <CanvasScenario
      mode='edit'
      nodes={[
        {
          id: 'fallback',
          type: 'workflow-node',
          position: { x: 280, y: 160 },
          data: {},
        },
      ]}
      edges={[]}
    />
  ),
};
