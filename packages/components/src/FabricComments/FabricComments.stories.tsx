import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { type FabricComment, FabricCommentComposer, FabricComments, type FabricMentionUser } from ".";

const MIN = 60_000;
const now = Date.now();

const USERS: FabricMentionUser[] = [
  { id: "u-jane", name: "Jane Doe", description: "Finance lead" },
  { id: "u-sam", name: "Sam Lee", description: "Account manager" },
  { id: "u-priya", name: "Priya Patel", description: "Billing" },
  { id: "u-alex", name: "Alex Kim", description: "Support" },
];
const ME = USERS[0];
const author = (u: FabricMentionUser) => ({ id: u.id, name: u.name });

const THREAD: FabricComment[] = [
  {
    id: "c1",
    author: author(USERS[1]),
    body: "Northwind asked for the PO number on this one. @[Jane Doe](u-jane) can you add it before we resend?",
    createdAt: now - 3 * 60 * MIN,
    replies: [
      {
        id: "c1r1",
        author: author(ME),
        body: "Added. It's PO-88213.",
        createdAt: now - 2 * 60 * MIN,
        editedAt: now - 110 * MIN,
      },
      {
        id: "c1r2",
        author: author(USERS[1]),
        body: "Thanks! Resending now.",
        createdAt: now - 100 * MIN,
      },
    ],
  },
  {
    id: "c2",
    author: author(USERS[2]),
    body: "Payment landed this morning.\nMarking as paid. cc @[Sam Lee](u-sam)",
    createdAt: now - 12 * MIN,
  },
];

let next = 1;

function Thread(props: Partial<React.ComponentProps<typeof FabricComments>>) {
  const [comments, setComments] = useState(props.comments ?? THREAD);
  return (
    <FabricComments
      users={USERS}
      currentUserId={ME.id}
      {...props}
      comments={comments}
      onAdd={async (body, parentId) => {
        props.onAdd?.(body, parentId);
        const c: FabricComment = { id: `new-${next++}`, author: author(ME), body, createdAt: Date.now() };
        setComments((cs) =>
          parentId
            ? cs.map((x) => (x.id === parentId ? { ...x, replies: [...(x.replies ?? []), c] } : x))
            : [...cs, c],
        );
      }}
      onEdit={async (id, body) => {
        props.onEdit?.(id, body);
        const edit = (c: FabricComment): FabricComment =>
          c.id === id
            ? { ...c, body, editedAt: Date.now() }
            : { ...c, replies: c.replies?.map(edit) };
        setComments((cs) => cs.map(edit));
      }}
      onDelete={(id) => {
        props.onDelete?.(id);
        setComments((cs) =>
          cs.filter((c) => c.id !== id).map((c) => ({ ...c, replies: c.replies?.filter((r) => r.id !== id) })),
        );
      }}
    />
  );
}

const meta = {
  title: "Components/FabricComments",
  component: FabricComments,
  tags: ["test"],
  args: { comments: THREAD, onAdd: fn(), onEdit: fn(), onDelete: fn() },
  argTypes: {
    comments: { control: false },
    users: { control: false },
    composerPosition: { control: "radio", options: ["top", "bottom"] },
  },
  decorators: [(Story) => <div style={{ maxWidth: 640 }}>{Story()}</div>],
} satisfies Meta<typeof FabricComments>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => <Thread {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("list", { name: "Comments" })).toBeVisible();
    await expect(canvas.getByRole("list", { name: "Replies to Sam Lee" })).toBeVisible();
    // Mentions are highlighted.
    await expect(canvasElement.querySelector('[data-mention="u-jane"]')).toHaveTextContent("@Jane Doe");
    // Only your own comments have actions.
    await expect(canvas.getAllByRole("button", { name: /^Actions for/ })).toHaveLength(1);
  },
};

/** Type "@" to mention someone: arrows move, Enter picks, ⌘/Ctrl+Enter posts. */
export const MentionSomeone: Story = {
  render: (args) => <Thread {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const box = canvas.getByRole("textbox", { name: "Add a comment" });
    await userEvent.click(box);
    await userEvent.type(box, "Over to @pr");
    const list = await within(document.body).findByRole("listbox", { name: "People" });
    await expect(within(list).getAllByRole("option")).toHaveLength(1);
    await expect(box).toHaveAttribute("aria-expanded", "true");
    await userEvent.keyboard("{Enter}");
    await expect(box).toHaveValue("Over to @Priya Patel ");
    await userEvent.type(box, "for billing.");
    await userEvent.keyboard("{Control>}{Enter}{/Control}");
    await expect(args.onAdd).toHaveBeenCalledWith("Over to @[Priya Patel](u-priya) for billing.", undefined);
    await waitFor(() => expect(box).toHaveValue(""));
    await expect(canvasElement.querySelector('[data-mention="u-priya"]')).toBeInTheDocument();
  },
};

export const ReplyAndEdit: Story = {
  render: (args) => <Thread {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);

    await userEvent.click(canvas.getAllByRole("button", { name: "Reply" })[1]);
    const reply = canvas.getByRole("textbox", { name: "Reply to Priya Patel" });
    await expect(reply).toHaveFocus();
    await userEvent.type(reply, "Great, thanks!");
    await userEvent.click(canvas.getByRole("button", { name: "Post reply" }));
    await expect(args.onAdd).toHaveBeenCalledWith("Great, thanks!", "c2");
    await waitFor(() => expect(canvas.getByRole("list", { name: "Replies to Priya Patel" })).toBeVisible());

    await userEvent.click(canvas.getAllByRole("button", { name: /^Actions for Jane Doe/ })[0]);
    await userEvent.click(await body.findByRole("menuitem", { name: "Edit" }));
    const edit = canvas.getByRole("textbox", { name: "Edit comment" });
    await userEvent.clear(edit);
    await userEvent.type(edit, "Added: PO-88213.");
    await userEvent.click(canvas.getByRole("button", { name: "Save" }));
    await expect(args.onEdit).toHaveBeenCalledWith("c1r1", "Added: PO-88213.");
    await waitFor(() => expect(canvas.getByText("Added: PO-88213.")).toBeVisible());
  },
};

export const Empty: Story = { args: { comments: [] }, render: (args) => <Thread {...args} /> };

export const Loading: Story = { args: { loading: true }, render: (args) => <Thread {...args} /> };

/** Read-only: leave out `onAdd`, `onEdit` and `onDelete`. */
export const ReadOnly: Story = {
  args: { onAdd: undefined, onEdit: undefined, onDelete: undefined, currentUserId: undefined },
  render: (args) => <FabricComments {...args} />,
};

export const LongContent: Story = {
  args: {
    comments: [
      {
        id: "long",
        author: { id: "u-alex", name: "Alexandria Konstantinopoulou-Whitfield" },
        body: `${"This comment is long on purpose to check wrapping. ".repeat(6)}https://example.com/a/very/long/link/that/does/not/break/naturally/anywhere/at/all`,
        createdAt: now - 26 * 60 * MIN,
      },
    ],
  },
  render: (args) => <Thread {...args} />,
};

/** The composer on its own, for custom layouts. */
export const ComposerOnly: Story = {
  render: () => <FabricCommentComposer users={USERS} onSubmit={fn()} />,
};
