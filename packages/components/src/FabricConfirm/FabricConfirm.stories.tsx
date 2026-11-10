import Delete from "@fabric-kit/icons/Delete";
import { FabricInline, FabricStack, FabricText } from "@fabric-kit/primitives";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, screen, userEvent, waitFor, within } from "storybook/test";
import { FabricButton } from "../FabricButton/FabricButton";
import { type FabricConfirmOptions, FabricConfirmProvider, useConfirm } from ".";

const meta = {
  title: "Components/useConfirm",
  component: FabricConfirmProvider,
  tags: ["test"],
  decorators: [
    (Story) => (
      <FabricConfirmProvider>
        <Story />
      </FabricConfirmProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "`useConfirm()` returns `confirm(options)`, which opens a FabricDialog and resolves to " +
          "`true` when the user confirms and `false` when they cancel or dismiss it. Mount " +
          "`FabricConfirmProvider` once near the root of the app.",
      },
    },
  },
} satisfies Meta<typeof FabricConfirmProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A button that asks for confirmation and prints the answer. */
function Ask({ label, options }: { label: string; options: FabricConfirmOptions }) {
  const confirm = useConfirm();
  const [answer, setAnswer] = useState<string>("No answer yet");
  return (
    <FabricStack gap="md" align="flex-start">
      <FabricButton
        variant="outlined"
        onClick={async () => setAnswer((await confirm(options)) ? "Confirmed" : "Cancelled")}
      >
        {label}
      </FabricButton>
      <FabricText variant="body2" color="text.secondary" aria-live="polite">
        {answer}
      </FabricText>
    </FabricStack>
  );
}

export const Basic: Story = {
  render: () => (
    <Ask
      label="Publish changes"
      options={{
        title: "Publish 12 changes?",
        description: "Everyone in Acme Workspace will see them right away.",
        confirmLabel: "Publish",
      }}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Publish changes" }));
    const dialog = await screen.findByRole("alertdialog");
    await waitFor(() => expect(within(dialog).getByText("Publish 12 changes?")).toBeVisible());
    // Non-destructive: focus starts on the confirm button.
    await waitFor(() =>
      expect(within(dialog).getByRole("button", { name: "Publish" })).toHaveFocus(),
    );
    await userEvent.click(within(dialog).getByRole("button", { name: "Publish" }));
    await waitFor(async () => expect(await canvas.findByText("Confirmed")).toBeVisible());
  },
};

export const Danger: Story = {
  render: () => (
    <Ask
      label="Delete invoices"
      options={{
        title: "Delete 3 invoices?",
        description: "They move to the trash and are deleted for good after 30 days.",
        confirmLabel: "Delete",
        danger: true,
        icon: <Delete />,
      }}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Delete invoices" }));
    const dialog = await screen.findByRole("alertdialog");
    // Destructive: focus starts on Cancel, so Enter can't delete by accident.
    await waitFor(() =>
      expect(within(dialog).getByRole("button", { name: "Cancel" })).toHaveFocus(),
    );
    await userEvent.keyboard("{Escape}");
    await waitFor(async () => expect(await canvas.findByText("Cancelled")).toBeVisible());
  },
};

export const TypeToConfirm: Story = {
  render: () => (
    <Ask
      label="Delete workspace"
      options={{
        title: "Delete the Northwind workspace?",
        description: "All 214 records and their history are deleted. This can't be undone.",
        confirmLabel: "Delete",
        typeToConfirm: true,
      }}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Delete workspace" }));
    const dialog = await screen.findByRole("alertdialog");
    const del = within(dialog).getByRole("button", { name: "Delete" });
    await expect(del).toBeDisabled();
    await userEvent.type(within(dialog).getByRole("textbox"), "delete");
    await expect(del).toBeEnabled();
    await userEvent.click(del);
    await waitFor(async () => expect(await canvas.findByText("Confirmed")).toBeVisible());
  },
};

export const Acknowledge: Story = {
  render: () => (
    <Ask
      label="Show notice"
      options={{
        title: "Export started",
        description: "We'll email you a link when the file is ready.",
        confirmLabel: "Got it",
        hideCancel: true,
      }}
    />
  ),
};

/** Requests made while a dialog is open wait their turn. */
export const Queued: Story = {
  render: function Render() {
    const confirm = useConfirm();
    const [log, setLog] = useState<string[]>([]);
    return (
      <FabricStack gap="md" align="flex-start">
        <FabricButton
          variant="outlined"
          onClick={() => {
            for (const name of ["Acme", "Northwind", "Contoso"]) {
              confirm({ title: `Archive ${name}?`, confirmLabel: "Archive" }).then((ok) =>
                setLog((l) => [...l, `${name}: ${ok ? "archived" : "kept"}`]),
              );
            }
          }}
        >
          Archive three accounts
        </FabricButton>
        <FabricInline gap="sm">
          {log.map((line) => (
            <FabricText key={line} variant="body2" color="text.secondary">
              {line}
            </FabricText>
          ))}
        </FabricInline>
      </FabricStack>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Archive three accounts" }));
    for (const [name, choice] of [
      ["Acme", "Archive"],
      ["Northwind", "Cancel"],
      ["Contoso", "Archive"],
    ] as const) {
      const dialog = await screen.findByRole("alertdialog");
      await waitFor(async () => expect(await within(dialog).findByText(`Archive ${name}?`)).toBeVisible());
      await userEvent.click(within(dialog).getByRole("button", { name: choice }));
      await waitFor(() => expect(screen.queryByText(`Archive ${name}?`)).toBeNull());
    }
    await waitFor(async () => expect(await canvas.findByText("Contoso: archived")).toBeVisible());
    await waitFor(() => expect(canvas.getByText("Northwind: kept")).toBeVisible());
  },
};
