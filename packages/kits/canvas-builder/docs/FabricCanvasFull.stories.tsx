import React, { useCallback, useMemo, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
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
import { FabricBox, FabricButton } from '@fabric-kit/components';
import AltRoute from "@fabric-kit/icons/AltRoute";
import Apps from "@fabric-kit/icons/Apps";
import Language from "@fabric-kit/icons/Language";
import Notifications from "@fabric-kit/icons/Notifications";
import PlayArrow from "@fabric-kit/icons/PlayArrow";
import PlayCircleOutlined from "@fabric-kit/icons/PlayCircleOutlined";
import Publish from "@fabric-kit/icons/Publish";
import SettingsIcon from "@fabric-kit/icons/Settings";
import { FabricText } from '@fabric-kit/primitives';
import {
  FabricCanvasBuilder,
  FabricCanvasEdge,
  FabricCanvasNode,
  FabricCanvasNodeToolbar,
  FabricCanvasNodePalettePanel,
  FabricCanvasValidationWidget,
  FabricCanvasWorkspaceTopBar,
  type CanvasMode,
  type CanvasNodeConfig,
  type CanvasNodePaletteItem,
  type CanvasTopBarAction,
  type CanvasValidationGroup,
  type FabricCanvasEdgeData,
} from '../src';

type DropItem = { type: string };

type NodeData = {
  label?: string;
  config?: { badge?: string };
};

const nodeConfig: CanvasNodeConfig<{ badge?: string }, 'workflow-node'> = {
  icon: SettingsIcon,
  name: 'Workflow node',
  type: 'workflow-node',
  description: 'Storybook node',
  config: {},
  connectors: {
    handles: [
      { id: 'input', type: 'target', position: Position.Left, name: 'input' },
      { id: 'default', type: 'source', position: Position.Right, name: 'default' },
      { id: 'error', type: 'source', position: Position.Bottom, name: 'error' },
    ],
  },
  useBadge: (config) => (config.badge ? { label: config.badge, palette: 'purple' } : undefined),
};

const paletteNodes: CanvasNodePaletteItem<DropItem>[] = [
  {
    id: 'trigger',
    label: 'Trigger',
    description: 'Trigger start your workflow',
    icon: <PlayCircleOutlined />,
    children: [
      {
        id: 'manual-run',
        label: 'Manual Run',
        description: 'Trigger workflow manually',
        icon: <PlayCircleOutlined />,
        dropItem: { type: 'manual-run' },
      },
      {
        id: 'webhook',
        label: 'Webhook',
        description: 'Trigger via webhook',
        icon: <PlayCircleOutlined />,
        dropItem: { type: 'webhook' },
      },
    ],
  },
  {
    id: 'flow',
    label: 'Flow',
    description: 'Control the flow of your workflow',
    icon: <AltRoute />,
    children: [
      {
        id: 'if',
        label: 'If',
        description: 'Add branching logic',
        icon: <AltRoute />,
        dropItem: { type: 'if' },
      },
    ],
  },
  {
    id: 'core',
    label: 'Core',
    description: 'Make http, graphQl requests etc',
    icon: <Language />,
    children: [
      {
        id: 'http',
        label: 'HTTP',
        description: 'Call an HTTP endpoint',
        icon: <Language />,
        dropItem: { type: 'http' },
      },
    ],
  },
  {
    id: 'apps',
    label: 'Apps',
    description: 'Connect to apps and services',
    icon: <Apps />,
    children: [
      {
        id: 'notification',
        label: 'Notification',
        description: 'Send notification',
        icon: <Apps />,
        dropItem: { type: 'notification' },
      },
    ],
  },
];

const validationGroups: CanvasValidationGroup[] = [
  {
    id: 'webhook-warning',
    nodeId: 'webhook',
    nodeLabel: 'Webhook 1',
    nodeType: 'webhook',
    items: [
      {
        id: 'webhook-warning-1',
        code: 'NOT_CONFIGURED',
        title: 'Not Configured',
        severity: 'warning',
        message: 'No authentication configured',
        context: 'Consider adding authentication to secure your webhook endpoint',
      },
    ],
  },
  {
    id: 'notification-error',
    nodeId: 'notification',
    nodeLabel: 'Notification 1',
    nodeType: 'notification',
    items: [
      {
        id: 'notification-error-1',
        severity: 'error',
        code: 'REQUIRED_FIELD_MISSING',
        title: 'Required Field Missing',
        message: 'Recipient email is required.',
        context: 'Configure recipient details in node settings.',
      },
    ],
  },
];

const initialNodes: Node<NodeData>[] = [
  {
    id: 'webhook',
    type: 'workflow-node',
    position: { x: 80, y: 140 },
    data: { label: 'Webhook 1', config: { badge: 'Trigger' } },
  },
  { id: 'http', type: 'workflow-node', position: { x: 380, y: 140 }, data: { label: 'HTTP 1' } },
  {
    id: 'notification',
    type: 'workflow-node',
    position: { x: 680, y: 140 },
    data: { label: 'Notification 1' },
  },
];

const initialEdges: Edge<FabricCanvasEdgeData>[] = [
  {
    id: 'webhook-http',
    source: 'webhook',
    sourceHandle: 'default',
    target: 'http',
    targetHandle: 'input',
    type: 'workflowEdge',
    data: { label: 'default' },
  },
  {
    id: 'http-notification',
    source: 'http',
    sourceHandle: 'default',
    target: 'notification',
    targetHandle: 'input',
    type: 'workflowEdge',
    data: { label: 'success' },
  },
];

const FullCanvas = ({ initialMode }: { initialMode: CanvasMode }) => {
  const [mode, setMode] = useState<CanvasMode>(initialMode);
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [activePopoverId, setActivePopoverId] = useState<string | null>(null);

  const handleNodeDelete = useCallback((nodeId: string) => {
    setNodes((current) => current.filter((node) => node.id !== nodeId));
    setEdges((current) => current.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
  }, []);
  const handleEdgeDelete = useCallback((edgeId: string) => {
    setEdges((current) => current.filter((edge) => edge.id !== edgeId));
  }, []);

  const nodeTypes = useMemo(
    () => ({
      'workflow-node': (props: NodeProps<Node<NodeData>>) => (
        <FabricCanvasNode<{ badge?: string }, NodeData>
          id={props.id}
          selected={props.selected}
          data={props.data}
          mode={mode}
          nodeConfig={nodeConfig}
          nodeConfigData={props.data.config}
          onNodeDelete={handleNodeDelete}
          renderNodeToolbar={(toolbarMetadata) => <FabricCanvasNodeToolbar {...toolbarMetadata} />}
        />
      ),
    }),
    [handleNodeDelete, mode],
  );
  const edgeTypes = useMemo(
    () => ({
      workflowEdge: (props: EdgeProps<Edge<FabricCanvasEdgeData>>) => (
        <FabricCanvasEdge {...props} mode={mode} onEdgeDelete={handleEdgeDelete} />
      ),
    }),
    [handleEdgeDelete, mode],
  );

  const actions = useMemo<CanvasTopBarAction[]>(
    () => [
      {
        id: 'validation',
        slot: 'validation',
        content: (
          <FabricCanvasValidationWidget
            popoverId="full-canvas-validation"
            activePopoverId={activePopoverId}
            onActivePopoverChange={setActivePopoverId}
            groups={validationGroups}
            renderNodeIcon={(nodeType) =>
              nodeType === 'notification' ? <Notifications sx={{ color: 'text.secondary' }} /> : null
            }
          />
        ),
      },
      {
        id: 'run-now',
        slot: 'runNow',
        label: 'Run now',
        icon: <PlayArrow sx={{ width: 16, height: 16 }} />,
      },
      {
        id: 'mode-toggle',
        slot: 'modeToggle',
        label: mode === 'edit' ? 'View' : 'Edit',
        onClick: () => setMode((current) => (current === 'edit' ? 'view' : 'edit')),
      },
      {
        id: 'publish',
        slot: 'publish',
        label: 'Publish',
        icon: <Publish sx={{ width: 16, height: 16 }} />,
      },
    ],
    [activePopoverId, mode],
  );

  return (
    <DndProvider backend={HTML5Backend}>
      <FabricBox
        sx={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.default',
        }}
      >
        <FabricCanvasWorkspaceTopBar
          title="Sample workflow"
          mode={mode}
          onBack={() => undefined}
          titleIcon={<Apps sx={{ width: 24, height: 24 }} />}
          actions={actions}
          statusSlot={
            <FabricButton
              size="small"
              variant="text"
              sx={{ color: 'text.secondary', textTransform: 'none', fontSize: '10px' }}
            >
              Autosaved
            </FabricButton>
          }
          modeLabels={{ edit: 'Edit Mode', view: 'Read Only' }}
        />
        <FabricBox sx={{ flex: 1, minHeight: 0, display: 'flex' }}>
          <FabricBox sx={{ flex: 1, minWidth: 0, position: 'relative' }}>
            <FabricCanvasBuilder
              mode={mode}
              nodes={nodes}
              edges={edges}
              showControls
              showMiniMap
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              onNodesChange={(changes) => setNodes((current) => applyNodeChanges(changes, current))}
              onEdgesChange={(changes) => setEdges((current) => applyEdgeChanges(changes, current))}
              onConnect={(connection: Connection) =>
                setEdges((current) =>
                  addEdge(
                    {
                      ...connection,
                      type: 'workflowEdge',
                      data: { label: connection.sourceHandle } as FabricCanvasEdgeData,
                    },
                    current,
                  ),
                )
              }
              emptyState={
                <FabricBox sx={{ height: '100%', display: 'grid', placeItems: 'center' }}>
                  <FabricText color="text.secondary">
                    Click a node in the palette to add it to the workflow.
                  </FabricText>
                </FabricBox>
              }
            />
            <FabricCanvasNodePalettePanel
              mode={mode}
              nodes={paletteNodes}
              onNodeSelect={(node) =>
                setNodes((current) => [
                  ...current,
                  {
                    id: `${node.id}-${current.length + 1}`,
                    type: 'workflow-node',
                    position: {
                      x: 120 + (current.length % 5) * 40,
                      y: 300 + (current.length % 5) * 40,
                    },
                    data: { label: `${node.label} ${current.length + 1}` },
                  },
                ])
              }
            />
          </FabricBox>
        </FabricBox>
      </FabricBox>
    </DndProvider>
  );
};

const meta = {
  title: 'Kits/Canvas Builder/Full Canvas',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** Whole workspace: top bar, canvas, validation widget and node palette. Toggle dark mode from the toolbar. */
export const Workspace: Story = {
  render: () => <FullCanvas initialMode="edit" />,
};

export const WorkspaceReadOnly: Story = {
  render: () => <FullCanvas initialMode="view" />,
};
