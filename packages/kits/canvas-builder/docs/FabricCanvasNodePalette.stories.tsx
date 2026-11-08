import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type ReactNode } from 'react';
import { DndProvider, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { FabricBox } from '@fabric-kit/components';
import AltRoute from "@fabric-kit/icons/AltRoute";
import Apps from "@fabric-kit/icons/Apps";
import AssignmentInd from "@fabric-kit/icons/AssignmentInd";
import Language from "@fabric-kit/icons/Language";
import Notifications from "@fabric-kit/icons/Notifications";
import PlayCircleOutlined from "@fabric-kit/icons/PlayCircleOutlined";
import { FabricText } from '@fabric-kit/primitives';
import {
  FabricCanvasNodePalettePanel,
  type CanvasNodePaletteItem,
  type CanvasPaletteNode,
} from '../src';

type DropItem = { type: string };

const node = (
  id: string,
  label: string,
  icon: ReactNode,
  description?: string,
  extra?: Partial<CanvasPaletteNode<DropItem>>,
): CanvasPaletteNode<DropItem> => ({
  id,
  label,
  icon,
  description,
  dropItem: { type: id },
  ...extra,
});

const flatNodes: CanvasNodePaletteItem<DropItem>[] = [
  node('datasource', 'Data Source', <Apps />, 'Read from a configured datasource.'),
  node('datatarget', 'Data Target', <Apps />, 'Write to an MDM data object.'),
  node('transform', 'Transform', <AltRoute />, 'Reshape records.'),
  node('truncate', 'Truncate', <Language />, 'Clear the target before loading.'),
  node('map', 'Map', <AssignmentInd />, 'Map source fields to target fields.'),
];

const groupedNodes: CanvasNodePaletteItem<DropItem>[] = [
  node('datasource', 'Data Source', <Apps />, 'Read from a configured datasource.'),
  node('datatarget', 'Data Target', <Apps />, 'Write to an MDM data object.'),
  {
    id: 'trigger',
    label: 'Trigger',
    description: 'Ways to start the flow.',
    icon: <PlayCircleOutlined />,
    children: [
      node('manual-run', 'Manual Run', <PlayCircleOutlined />, 'Start the flow by hand.'),
      node('webhook', 'Webhook', <Language />, 'Start the flow from an HTTP call.'),
      node('schedule', 'Schedule', <AltRoute />, 'Start the flow on a schedule.'),
    ],
  },
  {
    id: 'notify',
    label: 'Notify',
    description: 'Send a message.',
    icon: <Notifications />,
    children: [
      node('email', 'Email', <Notifications />, 'Send an email.'),
      node('in-app', 'In-app', <Notifications />, 'Send an in-app notification.'),
    ],
  },
  node('transform', 'Transform', <AltRoute />, 'Reshape records.'),
];

const manyNodes: CanvasNodePaletteItem<DropItem>[] = [
  ...Array.from({ length: 10 }, (_, index) =>
    node(`node-${index}`, `Node ${index + 1}`, <Apps />, `Description for node ${index + 1}.`),
  ),
  {
    id: 'big-group',
    label: 'Big Group',
    icon: <Language />,
    description: 'A group with many children.',
    children: Array.from({ length: 14 }, (_, index) =>
      node(`child-${index}`, `Child ${index + 1}`, <Language />, `Child ${index + 1} description.`),
    ),
  },
];

const longLabelNodes: CanvasNodePaletteItem<DropItem>[] = [
  node('long-1', 'Extremely Long Node Label', <Apps />, 'Truncates with the full text in the tooltip.'),
  node('long-2', 'Another Quite Long Label', <Apps />),
  {
    id: 'long-group',
    label: 'A Group With A Very Long Name',
    icon: <Language />,
    children: [node('long-child', 'Child With A Long Label Too', <Language />)],
  },
];

const mixedStateNodes: CanvasNodePaletteItem<DropItem>[] = [
  node('enabled', 'Enabled', <Apps />, 'A normal draggable node.'),
  node('disabled', 'Disabled', <Apps />, 'Cannot be dragged or selected.', { disabled: true }),
  {
    id: 'disabled-group',
    label: 'Locked Group',
    icon: <Language />,
    disabled: true,
    children: [node('hidden', 'Hidden', <Language />)],
  },
];

/** Canvas stand-in: a positioned container plus a drop target that lists what was dropped. */
const Stage = ({
  height = 480,
  children,
}: {
  height?: number;
  children: (props: { lastEvent: string; setLastEvent: (value: string) => void }) => ReactNode;
}) => {
  const [dropped, setDropped] = useState<string[]>([]);
  const [lastEvent, setLastEvent] = useState('Nothing selected yet.');
  const [{ isOver }, dropRef] = useDrop(() => ({
    accept: 'node',
    drop: (item: DropItem) => setDropped((previous) => [...previous, item.type]),
    collect: (monitor) => ({ isOver: monitor.isOver() }),
  }));

  return (
    <FabricBox
      ref={dropRef}
      sx={{
        position: 'relative',
        height,
        border: '1px solid',
        borderColor: isOver ? 'primary.main' : 'divider',
        backgroundColor: 'background.paper',
        overflow: 'hidden',
      }}
    >
      <FabricBox sx={{ p: 2, ml: 14 }}>
        <FabricText textVariant="bodySm" color="var(--mui-palette-text-secondary)">
          Drop nodes here. Dropped: {dropped.length ? dropped.join(', ') : 'none'}
        </FabricText>
        <FabricText textVariant="bodySm" color="var(--mui-palette-text-secondary)">
          {lastEvent}
        </FabricText>
      </FabricBox>
      {children({ lastEvent, setLastEvent })}
    </FabricBox>
  );
};

const meta = {
  title: 'Kits/Canvas Builder/Node Palette',
  component: FabricCanvasNodePalettePanel,
  tags: ['test'],
  parameters: { layout: 'padded' },
  args: { mode: 'edit', nodes: groupedNodes },
  argTypes: {
    mode: { control: 'radio', options: ['edit', 'view'] },
    showInViewMode: { control: 'boolean' },
    emptyMessage: { control: 'text' },
    dragItemType: { control: 'text' },
    nodes: { control: false },
    onNodeSelect: { control: false },
    onNodeDragStart: { control: false },
    renderNodeIcon: { control: false },
  },
  decorators: [
    (Story) => (
      <DndProvider backend={HTML5Backend}>
        <Story />
      </DndProvider>
    ),
  ],
} satisfies Meta<typeof FabricCanvasNodePalettePanel>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Playground: change `mode`, `showInViewMode`, and `emptyMessage` from the Controls panel. */
export const InteractiveControls: Story = {
  render: (args) => (
    <Stage>{() => <FabricCanvasNodePalettePanel {...args} />}</Stage>
  ),
};

/** Flat rail with no sub-options. */
export const Flat: Story = {
  render: () => (
    <Stage>
      {({ setLastEvent }) => (
        <FabricCanvasNodePalettePanel
          mode="edit"
          nodes={flatNodes}
          onNodeSelect={(item) => setLastEvent(`Selected: ${item.label}`)}
        />
      )}
    </Stage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const source = canvas.getByRole('button', { name: 'Data Source' });
    const target = canvas.getByRole('button', { name: 'Data Target' });
    const map = canvas.getByRole('button', { name: 'Map' });

    await userEvent.click(source);
    await expect(canvas.getByText('Selected: Data Source')).toBeInTheDocument();

    // Roving tabindex: only one entry is tabbable, and arrows/Home/End move between entries.
    await expect(source).toHaveFocus();
    await expect(target).toHaveAttribute('tabindex', '-1');
    await userEvent.keyboard('{ArrowDown}');
    await expect(target).toHaveFocus();
    await userEvent.keyboard('{End}');
    await expect(map).toHaveFocus();
    await userEvent.keyboard('{Home}');
    await expect(source).toHaveFocus();

    await userEvent.keyboard('{ArrowDown}{Enter}');
    await expect(canvas.getByText('Selected: Data Target')).toBeInTheDocument();
    await userEvent.keyboard('{ArrowDown}{ }');
    await expect(canvas.getByText('Selected: Transform')).toBeInTheDocument();
  },
};

/** Rail mixing plain nodes and groups; click a group to drill in, Esc or the back header to return. */
export const WithGroups: Story = {
  render: () => (
    <Stage>
      {({ setLastEvent }) => (
        <FabricCanvasNodePalettePanel
          mode="edit"
          nodes={groupedNodes}
          onNodeSelect={(item) => setLastEvent(`Selected: ${item.label}`)}
        />
      )}
    </Stage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Trigger' });
    await expect(trigger).toHaveAttribute('aria-haspopup', 'true');

    // Click opens the group, shows its children, and moves focus to the back header.
    await userEvent.click(trigger);
    const back = await canvas.findByRole('button', { name: 'Back to all nodes from Trigger' });
    await waitFor(() => expect(back).toHaveFocus());
    await expect(canvas.getByRole('button', { name: 'Webhook' })).toBeInTheDocument();
    await expect(canvas.queryByRole('button', { name: 'Data Source' })).not.toBeInTheDocument();

    // A child node can be selected.
    await userEvent.click(canvas.getByRole('button', { name: 'Webhook' }));
    await expect(canvas.getByText('Selected: Webhook')).toBeInTheDocument();

    // Esc returns to the main list and focus goes back to the group.
    await userEvent.keyboard('{Escape}');
    const triggerAgain = await canvas.findByRole('button', { name: 'Trigger' });
    await waitFor(() => expect(triggerAgain).toHaveFocus());
    await expect(canvas.getByRole('button', { name: 'Data Source' })).toBeInTheDocument();

    // ArrowRight opens, ArrowLeft returns.
    await userEvent.keyboard('{ArrowRight}');
    await canvas.findByRole('button', { name: 'Back to all nodes from Trigger' });
    await userEvent.keyboard('{ArrowLeft}');
    await waitFor(() => expect(canvas.getByRole('button', { name: 'Trigger' })).toHaveFocus());

    // The back header also returns.
    await userEvent.keyboard('{Enter}');
    await userEvent.click(await canvas.findByRole('button', { name: 'Back to all nodes from Trigger' }));
    await expect(await canvas.findByRole('button', { name: 'Data Source' })).toBeInTheDocument();
  },
};

/** A short canvas forces the rail and the drilled-in list to scroll instead of overflowing. */
export const ManyItemsScrolls: Story = {
  render: () => (
    <Stage height={360}>{() => <FabricCanvasNodePalettePanel mode="edit" nodes={manyNodes} />}</Stage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const isScrollable = () => {
      const list = canvas.getByRole('group').lastElementChild as HTMLElement;
      return list.scrollHeight > list.clientHeight;
    };

    await expect(isScrollable()).toBe(true);

    await userEvent.click(canvas.getByRole('button', { name: 'Big Group' }));
    await canvas.findByRole('button', { name: 'Back to all nodes from Big Group' });
    await expect(isScrollable()).toBe(true);
  },
};

export const LongLabels: Story = {
  render: () => (
    <Stage>{() => <FabricCanvasNodePalettePanel mode="edit" nodes={longLabelNodes} />}</Stage>
  ),
};

export const DisabledItems: Story = {
  render: () => (
    <Stage>
      {({ setLastEvent }) => (
        <FabricCanvasNodePalettePanel
          mode="edit"
          nodes={mixedStateNodes}
          onNodeSelect={(item) => setLastEvent(`Selected: ${item.label}`)}
        />
      )}
    </Stage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const disabled = canvas.getByRole('button', { name: 'Disabled' });
    const lockedGroup = canvas.getByRole('button', { name: 'Locked Group' });
    await expect(disabled).toHaveAttribute('aria-disabled', 'true');
    await expect(lockedGroup).toHaveAttribute('aria-disabled', 'true');

    await userEvent.click(disabled);
    await userEvent.click(lockedGroup);
    await expect(canvas.getByText('Nothing selected yet.')).toBeInTheDocument();
    await expect(canvas.queryByRole('button', { name: 'Hidden' })).not.toBeInTheDocument();

    // Disabled entries are skipped by Tab and the arrow keys.
    await expect(disabled).toHaveAttribute('tabindex', '-1');
    const enabled = canvas.getByRole('button', { name: 'Enabled' });
    await userEvent.click(enabled);
    await expect(enabled).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(enabled).toHaveFocus();
  },
};

/** View mode hides the panel unless `showInViewMode` is set; items are not draggable when shown. */
export const ViewModeShown: Story = {
  render: () => (
    <Stage>
      {() => <FabricCanvasNodePalettePanel mode="view" nodes={flatNodes} showInViewMode />}
    </Stage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Data Source' })).toBeInTheDocument();
  },
};

/** Default behavior: the panel renders nothing in view mode. */
export const HiddenInViewMode: Story = {
  render: () => (
    <Stage>{() => <FabricCanvasNodePalettePanel mode="view" nodes={flatNodes} />}</Stage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('group')).not.toBeInTheDocument();
    await expect(canvas.queryByRole('button', { name: 'Data Source' })).not.toBeInTheDocument();
  },
};

export const Empty: Story = {
  render: () => (
    <Stage>{() => <FabricCanvasNodePalettePanel mode="edit" nodes={[]} />}</Stage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('No nodes available.')).toBeInTheDocument();
  },
};
