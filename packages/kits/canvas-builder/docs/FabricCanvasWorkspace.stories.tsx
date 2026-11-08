import React, { useMemo, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  FabricBox,
  FabricButton,
} from '@fabric-kit/components';
import Apps from "@fabric-kit/icons/Apps";
import Link from "@fabric-kit/icons/Link";
import Notifications from "@fabric-kit/icons/Notifications";
import PlayArrow from "@fabric-kit/icons/PlayArrow";
import Publish from "@fabric-kit/icons/Publish";
import Settings from "@fabric-kit/icons/Settings";
import {
  FabricCanvasValidationWidget,
  FabricCanvasWorkspaceTopBar,
  type CanvasValidationGroup,
  type CanvasTopBarAction,
} from '../src';

const validationGroups: CanvasValidationGroup[] = [
  {
    id: 'webhook-warning',
    nodeId: 'node-webhook',
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
    nodeId: 'node-notification',
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

const meta = {
  title: 'Kits/Canvas Builder/Workspace Components',
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const ValidationWidget: Story = {
  render: () => {
    const [activePopoverId, setActivePopoverId] = useState<string | null>(null);
    return (
      <FabricBox sx={{ p: 2 }}>
        <FabricCanvasValidationWidget
          popoverId="global-validation"
          activePopoverId={activePopoverId}
          onActivePopoverChange={setActivePopoverId}
          groups={validationGroups}
          renderNodeIcon={(nodeType) =>
            nodeType === 'webhook' ? (
              <Link sx={{ color: 'text.secondary' }} />
            ) : nodeType === 'notification' ? (
              <Notifications sx={{ color: 'text.secondary' }} />
            ) : null
          }
        />
      </FabricBox>
    );
  },
};

export const WorkspaceTopBar: Story = {
  parameters: {
    layout: 'fullscreen',
  },
  render: () => {
    const [activePopoverId, setActivePopoverId] = useState<string | null>(null);
    const actions = useMemo<CanvasTopBarAction[]>(
      () => [
        {
          id: 'validation',
          slot: 'validation',
          content: (
            <FabricCanvasValidationWidget
              popoverId="topbar-validation"
              activePopoverId={activePopoverId}
              onActivePopoverChange={setActivePopoverId}
              groups={validationGroups}
              renderNodeIcon={(nodeType) =>
                nodeType === 'webhook' ? (
                  <Link sx={{ color: 'text.secondary' }} />
                ) : nodeType === 'notification' ? (
                  <Notifications sx={{ color: 'text.secondary' }} />
                ) : null
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
          label: 'View',
        },
        {
          id: 'settings',
          slot: 'settings',
          label: 'Settings',
          icon: <Settings sx={{ width: 16, height: 16 }} />,
        },
        {
          id: 'publish',
          slot: 'publish',
          label: 'Publish',
          icon: <Publish sx={{ width: 16, height: 16 }} />,
        },
        {
          id: 'version-history',
          slot: 'versionHistory',
          label: 'Version history',
        },
      ],
      [activePopoverId],
    );

    return (
      <FabricCanvasWorkspaceTopBar
        title="Sample workflow"
        mode="edit"
        onBack={() => undefined}
        titleIcon={<Apps sx={{ width: 24, height: 24 }} />}
        actions={actions}
        statusSlot={
          <FabricButton
            size="small"
            variant="text"
            sx={{
              color: 'text.secondary',
              textTransform: 'none',
              fontSize: '10px',
              fontWeight: 500,
              lineHeight: 1.6,
            }}
          >
            Autosaved
          </FabricButton>
        }
        modeLabels={{ edit: 'Edit Mode', view: 'Read Only' }}
      />
    );
  },
};
