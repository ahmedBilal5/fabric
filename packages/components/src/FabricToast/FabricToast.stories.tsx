import { FabricInline, FabricStack, FabricText } from "@fabric-kit/primitives";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, screen, userEvent, waitFor, within } from "storybook/test";
import { FabricButton } from "../FabricButton/FabricButton";
import { FabricToastProvider, useToast } from ".";

const meta = {
  title: "Components/useToast",
  component: FabricToastProvider,
  tags: ["test"],
  decorators: [
    (Story) => (
      <FabricToastProvider>
        <Story />
      </FabricToastProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "`useToast()` returns `toast(options)` with `success`, `info`, `warning`, `error` and " +
          "`dismiss` helpers. Toasts queue and show one at a time. Mount `FabricToastProvider` " +
          "once near the root of the app.",
      },
    },
  },
} satisfies Meta<typeof FabricToastProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Severities: Story = {
  render: function Render() {
    const toast = useToast();
    return (
      <FabricInline gap="sm">
        <FabricButton variant="outlined" onClick={() => toast.success("Invoice sent")}>
          Success
        </FabricButton>
        <FabricButton
          variant="outlined"
          onClick={() =>
            toast.info("Import running", { message: "We'll let you know when it finishes." })
          }
        >
          Info
        </FabricButton>
        <FabricButton
          variant="outlined"
          onClick={() =>
            toast.warning("2 rows skipped", { message: "They were missing an email address." })
          }
        >
          Warning
        </FabricButton>
        <FabricButton
          variant="outlined"
          onClick={() =>
            toast.error("Couldn't save", { message: "Check your connection and try again." })
          }
        >
          Error
        </FabricButton>
      </FabricInline>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Success" }));
    await waitFor(async () => expect(await screen.findByText("Invoice sent")).toBeVisible());
    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    await waitFor(() => expect(screen.queryByText("Invoice sent")).toBeNull());
  },
};

export const WithUndo: Story = {
  render: function Render() {
    const toast = useToast();
    const [count, setCount] = useState(3);
    return (
      <FabricStack gap="md" align="flex-start">
        <FabricText variant="body2">{count} invoices</FabricText>
        <FabricButton
          variant="outlined"
          disabled={count === 0}
          onClick={() => {
            const before = count;
            setCount(0);
            toast({
              title: `${before} invoices deleted`,
              action: { label: "Undo", onClick: () => setCount(before) },
            });
          }}
        >
          Delete all
        </FabricButton>
      </FabricStack>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Delete all" }));
    await waitFor(async () => expect(await canvas.findByText("0 invoices")).toBeVisible());
    await userEvent.click(await screen.findByRole("button", { name: "Undo" }));
    await waitFor(async () => expect(await canvas.findByText("3 invoices")).toBeVisible());
  },
};

/** Several toasts at once show one after another. */
export const Queued: Story = {
  render: function Render() {
    const toast = useToast();
    return (
      <FabricButton
        variant="outlined"
        onClick={() => {
          toast.success("Acme synced", { duration: 1500 });
          toast.success("Northwind synced", { duration: 1500 });
          toast.success("Contoso synced", { duration: 1500 });
        }}
      >
        Sync three accounts
      </FabricButton>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Sync three accounts" }));
    await waitFor(async () => expect(await screen.findByText("Acme synced")).toBeVisible());
    await expect(screen.queryByText("Northwind synced")).toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    await waitFor(async () => expect(await screen.findByText("Northwind synced")).toBeVisible());
  },
};

export const Persistent: Story = {
  render: function Render() {
    const toast = useToast();
    const [id, setId] = useState<number | null>(null);
    return (
      <FabricInline gap="sm">
        <FabricButton
          variant="outlined"
          onClick={() =>
            setId(
              toast.info("Uploading 4 files", {
                message: "Keep this tab open until the upload finishes.",
                duration: null,
              }),
            )
          }
        >
          Start upload
        </FabricButton>
        <FabricButton
          variant="outlined"
          disabled={id === null}
          onClick={() => {
            if (id !== null) toast.dismiss(id);
            setId(null);
          }}
        >
          Finish upload
        </FabricButton>
      </FabricInline>
    );
  },
};

export const TopRight: Story = {
  decorators: [
    (Story) => (
      <FabricToastProvider vertical="top" horizontal="right">
        <Story />
      </FabricToastProvider>
    ),
  ],
  render: function Render() {
    const toast = useToast();
    return (
      <FabricButton variant="outlined" onClick={() => toast.success("Settings saved")}>
        Save settings
      </FabricButton>
    );
  },
};
