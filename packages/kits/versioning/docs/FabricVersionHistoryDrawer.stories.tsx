import { FabricButton } from "@fabric-kit/components";
import { FabricStack, FabricText } from "@fabric-kit/primitives";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { FabricVersionHistoryDrawer } from "../src/FabricVersionHistoryDrawer/FabricVersionHistoryDrawer";
import type { FabricVersion } from "../src/types";

const now = Date.now();
const hoursAgo = (h: number) => new Date(now - h * 3_600_000);

const VERSIONS: FabricVersion[] = [
  { id: "d5", status: "draft", author: "Priya Shah", updatedAt: hoursAgo(0.2) },
  { id: "d4", status: "draft", author: "Priya Shah", updatedAt: hoursAgo(1) },
  { id: "d3", status: "draft", author: "Marcus Lee", updatedAt: hoursAgo(3) },
  { id: "p3", status: "published", label: "Launch copy", isCurrent: true, author: "Marcus Lee", updatedAt: hoursAgo(26) },
  { id: "d2", status: "draft", author: "Ana Torres", updatedAt: hoursAgo(30) },
  { id: "p2", status: "published", label: "Legal review", author: "Ana Torres", updatedAt: hoursAgo(72) },
  { id: "p1", status: "published", label: "First draft", author: "Priya Shah", updatedAt: hoursAgo(240) },
];

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function Preview({ version }: { version: FabricVersion }) {
  return (
    <FabricStack gap="md">
      <FabricText textVariant="headingSm">Spring product launch</FabricText>
      <FabricText textVariant="bodyMd" color="text.secondary">
        {version.label ? `Version "${version.label}"` : "Autosaved draft"} by {version.author}.
      </FabricText>
      <FabricText textVariant="bodyMd">
        Our new collection arrives March 3. Early access opens to members a week before, with free
        shipping on every order over $50.
      </FabricText>
    </FabricStack>
  );
}

const meta = {
  title: "Kits/Versioning/FabricVersionHistoryDrawer",
  component: FabricVersionHistoryDrawer,
  parameters: {
    layout: "fullscreen",
    docs: {
      story: { inline: false, iframeHeight: 640 },
      description: {
        component:
          "A drawer that lists a document's versions on a timeline. Published versions show their " +
          "name; runs of autosaves collapse into groups. Every action (preview, rename, restore, " +
          "duplicate, delete) appears only when you pass its handler.",
      },
    },
  },
  args: {
    open: true,
    onClose: fn(),
    versions: VERSIONS,
    onRestore: fn(async () => wait(600)),
    onDuplicate: fn(async () => wait(300)),
    onDelete: fn(async () => wait(600)),
    onRename: fn(async () => wait(300)),
    renderPreview: (version: FabricVersion) => <Preview version={version} />,
    onError: fn(),
  },
} satisfies Meta<typeof FabricVersionHistoryDrawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Click a published version's name to rename it. Enter saves, Escape cancels. */
export const Rename: Story = {
  play: async ({ canvasElement, args }) => {
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(await body.findByRole("button", { name: "Legal review" }));
    const input = await body.findByLabelText("Version name");
    await userEvent.clear(input);
    await userEvent.type(input, "Approved by legal{Enter}");
    await expect(args.onRename).toHaveBeenCalled();
  },
};

/** Restore asks for confirmation and shows a spinner while `onRestore` runs. */
export const RestoreFlow: Story = {
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const [, , second] = await body.findAllByRole("button", { name: "Version actions" });
    await userEvent.click(second);
    await userEvent.click(await body.findByRole("menuitem", { name: "Restore" }));
    await waitFor(() => expect(body.getByText("Restore this version?")).toBeVisible());
  },
};

/** Without edit handlers, or with `readOnly`, only Preview remains. */
export const ReadOnly: Story = {
  args: { readOnly: true },
};

/** If a handler throws, `onError` is called and the dialog stays open. */
export const ActionFails: Story = {
  args: {
    onRestore: fn(async () => {
      await wait(400);
      throw new Error("Server unavailable");
    }),
  },
};

export const Empty: Story = {
  args: { versions: [] },
};

/** A typical page: a button opens the drawer and restoring updates the list. */
export const Interactive: Story = {
  args: { open: false },
  render: (args) => {
    const [open, setOpen] = useState(false);
    const [versions, setVersions] = useState(VERSIONS);
    return (
      <FabricStack sx={{ p: 3 }} align="start">
        <FabricButton variant="outlined" onClick={() => setOpen(true)}>
          Version history
        </FabricButton>
        <FabricVersionHistoryDrawer
          {...args}
          open={open}
          versions={versions}
          onClose={() => setOpen(false)}
          onRestore={async (version) => {
            await wait(500);
            setVersions((list) => list.map((v) => ({ ...v, isCurrent: v.id === version.id })));
          }}
          onDelete={async (version) => {
            await wait(400);
            setVersions((list) => list.filter((v) => v.id !== version.id));
          }}
          onRename={async (version, label) => {
            setVersions((list) => list.map((v) => (v.id === version.id ? { ...v, label } : v)));
          }}
        />
      </FabricStack>
    );
  },
};
