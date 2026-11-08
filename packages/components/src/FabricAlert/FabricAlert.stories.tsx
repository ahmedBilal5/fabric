import CheckCircleIcon from "@fabric-kit/icons/CheckCircle";
import RefreshIcon from "@fabric-kit/icons/Refresh";
import { Box, Stack } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, within } from "storybook/test";
import { FabricButton } from "../FabricButton";
import { FabricAlert, type FabricAlertProps } from ".";

const VARIANTS = ["standard", "standardAlt", "outlined", "filled"] as const;

const SUB_VARIANTS = [
  { name: "criticalUrgent", title: "Urgent" },
  { name: "cancelledExpire", title: "Cancelled" },
  { name: "warningFailed", title: "Warning" },
  { name: "runningInProgressInfo", title: "In-Progress" },
  { name: "completeSuccess", title: "Success" },
] as const;

const meta: Meta<FabricAlertProps> = {
  title: "Components/FabricAlert",
  component: FabricAlert,
  tags: ["test"],
  argTypes: {
    variant: {
      control: "select",
      options: VARIANTS,
    },
    subVariant: {
      control: "select",
      options: SUB_VARIANTS.map((sub) => sub.name),
    },
  },
  args: {
    variant: "standard",
    subVariant: "runningInProgressInfo",
  },
  parameters: {
    docs: {
      description: {
        component:
          "Alert / inline banner — pick a `variant` and a `subVariant`. Extends MUI Alert with an optional `title` prop, opt-in `collapsible` (Collapse animation) and `autoHideMs` (auto-close).",
      },
    },
  },
};
export default meta;
type Story = StoryObj<FabricAlertProps>;

export const Default: Story = {
  render: (args) => (
    <Box sx={{ width: 500 }}>
      <FabricAlert {...args}>This is an informational alert.</FabricAlert>
    </Box>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // MUI Alert renders with role="alert" so screen readers announce it.
    await expect(canvas.getByRole("alert")).toHaveTextContent(/informational alert/i);
  },
};

export const SubVariants: Story = {
  name: "Sub-variants",
  render: () => (
    <Stack spacing={2} sx={{ width: 500 }}>
      <FabricAlert subVariant="criticalUrgent">Connection to source failed.</FabricAlert>
      <FabricAlert subVariant="cancelledExpire">The scheduled run was cancelled.</FabricAlert>
      <FabricAlert subVariant="warningFailed">Schema drift detected.</FabricAlert>
      <FabricAlert subVariant="runningInProgressInfo">3 new records were merged.</FabricAlert>
      <FabricAlert subVariant="completeSuccess">Sync completed successfully.</FabricAlert>
    </Stack>
  ),
};

export const Variants: Story = {
  name: "Variants × sub-variants",
  parameters: { layout: "padded" },
  render: () => (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(440px, 1fr))",
        gap: 3,
      }}
    >
      {VARIANTS.map((variant) => (
        <Stack key={variant} spacing={2}>
          {SUB_VARIANTS.map((sub) => (
            <FabricAlert
              key={sub.name}
              variant={variant}
              subVariant={sub.name}
              title={sub.title}
              onClose={() => {}}
            >
              {`${variant} / ${sub.name}`}
            </FabricAlert>
          ))}
        </Stack>
      ))}
    </Box>
  ),
  play: async ({ canvasElement }) => {
    // 4 variants × 5 sub-variants, each announced as an alert.
    await expect(within(canvasElement).getAllByRole("alert")).toHaveLength(20);
  },
};

export const WithTitle: Story = {
  render: () => (
    <Stack spacing={2} sx={{ width: 500 }}>
      <FabricAlert subVariant="completeSuccess" title="Import complete">
        1,204 records imported. 3 duplicates were skipped.
      </FabricAlert>
      <FabricAlert subVariant="warningFailed" title="Approaching quota">
        This workspace is at 87% of its storage quota.
      </FabricAlert>
      <FabricAlert subVariant="criticalUrgent" title="Sync failed">
        SFTP host <code>sftp.acme.com</code> refused the connection.
      </FabricAlert>
    </Stack>
  ),
};

export const WithAction: Story = {
  name: "With action button",
  render: (args) => (
    <Box sx={{ width: 500 }}>
      <FabricAlert
        {...args}
        subVariant="criticalUrgent"
        title="Sync failed"
        action={
          <FabricButton color="inherit" size="small" startIcon={<RefreshIcon />}>
            Retry
          </FabricButton>
        }
      >
        Connection to source refused. Try again or check the credentials.
      </FabricAlert>
    </Box>
  ),
  args: { onClose: fn() },
  play: async ({ canvasElement, args }) => {
    // The action and the close button render side by side.
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", { name: /retry/i })).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: /close/i }));
    await expect(args.onClose).toHaveBeenCalledOnce();
  },
};

export const WithCloseButton: Story = {
  name: "Dismissible",
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <Box sx={{ width: 500 }}>
        {open ? (
          <FabricAlert subVariant="runningInProgressInfo" onClose={() => setOpen(false)}>
            You can dismiss this banner.
          </FabricAlert>
        ) : (
          <FabricButton onClick={() => setOpen(true)}>Reopen</FabricButton>
        )}
      </Box>
    );
  },
};

export const Collapsible: Story = {
  name: "Collapsible animation",
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <Box sx={{ width: 500 }}>
        <FabricAlert
          collapsible
          open={open}
          subVariant="completeSuccess"
          onClose={() => setOpen(false)}
        >
          Collapses on close instead of disappearing instantly.
        </FabricAlert>
        {!open && (
          <FabricButton sx={{ mt: 2 }} onClick={() => setOpen(true)}>
            Reopen
          </FabricButton>
        )}
      </Box>
    );
  },
};

export const AutoHide: Story = {
  name: "Auto-hide after 3s",
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <Box sx={{ width: 500 }}>
        <FabricAlert
          collapsible
          open={open}
          subVariant="completeSuccess"
          autoHideMs={3000}
          onClose={() => setOpen(false)}
        >
          I will disappear in 3 seconds.
        </FabricAlert>
        {!open && (
          <FabricButton sx={{ mt: 2 }} onClick={() => setOpen(true)}>
            Reopen
          </FabricButton>
        )}
      </Box>
    );
  },
};

export const CustomIcon: Story = {
  name: "Custom icon",
  render: () => (
    <Box sx={{ width: 500 }}>
      <FabricAlert subVariant="completeSuccess" icon={<CheckCircleIcon />}>
        A one-off icon overrides the sub-variant default.
      </FabricAlert>
    </Box>
  ),
};

export const NoIcon: Story = {
  name: "Suppress icon",
  render: () => (
    <Box sx={{ width: 500 }}>
      <FabricAlert subVariant="runningInProgressInfo" icon={false}>
        Passing <code>{"icon={false}"}</code> hides the icon slot entirely.
      </FabricAlert>
    </Box>
  ),
};

export const RichContent: Story = {
  render: () => (
    <Box sx={{ width: 500 }}>
      <FabricAlert subVariant="warningFailed" title="Multiple issues detected">
        <ul style={{ margin: "4px 0 0 16px", padding: 0 }}>
          <li>3 records failed validation</li>
          <li>1 field mapping is ambiguous</li>
          <li>2 duplicate keys were skipped</li>
        </ul>
      </FabricAlert>
    </Box>
  ),
};
