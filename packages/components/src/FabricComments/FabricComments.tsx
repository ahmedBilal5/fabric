import { fontWeight, radii, spacing } from "@fabric-kit/design-tokens";
import type { DateInput } from "@fabric-kit/hooks";
import MoreHoriz from "@fabric-kit/icons/MoreHoriz";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import type { SxProps, Theme } from "@mui/material/styles";
import { type ReactNode, useState } from "react";
import { FabricAvatar } from "../FabricAvatar";
import { FabricButton } from "../FabricButton";
import type { FabricMenuItem } from "../FabricMenu";
import { FabricMenuButton } from "../FabricMenuButton";
import { FabricRelativeTime } from "../FabricRelativeTime";
import { FabricCommentComposer } from "./FabricCommentComposer";
import { type FabricMentionUser, parseMentions } from "./mentions";

/** The person who wrote a comment. */
export interface FabricCommentAuthor {
  /** Stable id, compared with `currentUserId` to offer Edit and Delete. */
  id: string;
  /** Display name. */
  name: string;
  /** Avatar image URL. */
  avatarSrc?: string;
}

/** One comment and its replies. */
export interface FabricComment {
  /** Stable, unique id. */
  id: string;
  /** Who wrote it. */
  author: FabricCommentAuthor;
  /** The text. Mentions are stored as `@[Name](id)`. Line breaks are kept. */
  body: string;
  /** When it was posted. */
  createdAt: DateInput;
  /** When it was last edited. Shows "Edited". */
  editedAt?: DateInput;
  /** Replies, oldest first. One level deep. */
  replies?: FabricComment[];
}

export interface FabricCommentsProps {
  /** Top-level comments, oldest first. */
  comments: FabricComment[];
  /** The signed-in user's id. Their own comments get Edit and Delete. */
  currentUserId?: string;
  /** People who can be @mentioned in the composer. */
  users?: FabricMentionUser[];
  /** Post a new comment (`parentId` for replies). Hide the composer by leaving it out. */
  onAdd?: (body: string, parentId?: string) => void | Promise<void>;
  /** Save an edited comment. Offered on the current user's comments. */
  onEdit?: (id: string, body: string) => void | Promise<void>;
  /** Delete a comment. Offered on the current user's comments. Confirm or offer undo in your handler. */
  onDelete?: (id: string) => void;
  /** Allow replies. @default true */
  allowReplies?: boolean;
  /** Show the composer above the list (newest-first feeds) or below it (conversations). @default "bottom" */
  composerPosition?: "top" | "bottom";
  /** Placeholder rows instead of comments. */
  loading?: boolean;
  /** Shown when there are no comments. @default "No comments yet." */
  emptyState?: ReactNode;
  /** BCP 47 locale for times. */
  locale?: string;
  /** Accessible name of the list. @default "Comments" */
  "aria-label"?: string;
  /** System styles on the root. */
  sx?: SxProps<Theme>;
}

/** Renders stored text with mentions highlighted; mentions of `currentUserId` stand out more. */
function CommentBody({ body, currentUserId }: { body: string; currentUserId?: string }) {
  return (
    <Box
      sx={{
        fontSize: "0.875rem",
        lineHeight: 1.55,
        color: "var(--mui-palette-text-primary)",
        whiteSpace: "pre-wrap",
        overflowWrap: "anywhere",
      }}
    >
      {parseMentions(body).map((s, i) =>
        s.type === "text" ? (
          <span key={i}>{s.text}</span>
        ) : (
          <Box
            key={i}
            component="span"
            data-mention={s.id}
            sx={{
              px: "2px",
              borderRadius: `${radii.sm}px`,
              fontWeight: fontWeight.medium,
              color: "var(--mui-palette-primary-main)",
              backgroundColor:
                s.id === currentUserId
                  ? "rgba(var(--mui-palette-primary-mainChannel) / 0.16)"
                  : "rgba(var(--mui-palette-primary-mainChannel) / 0.08)",
            }}
          >
            @{s.name}
          </Box>
        ),
      )}
    </Box>
  );
}

interface ItemProps extends Omit<FabricCommentsProps, "comments" | "sx" | "aria-label"> {
  comment: FabricComment;
  parentId?: string;
}

function CommentItem({
  comment,
  parentId,
  currentUserId,
  users,
  onAdd,
  onEdit,
  onDelete,
  allowReplies = true,
  locale,
}: ItemProps) {
  const [editing, setEditing] = useState(false);
  const [replying, setReplying] = useState(false);
  const own = currentUserId != null && comment.author.id === currentUserId;
  const nested = parentId != null;
  const size = nested ? 24 : 32;

  const menu: FabricMenuItem[] = [];
  if (own && onEdit) menu.push({ label: "Edit", onClick: () => setEditing(true) });
  if (own && onDelete) {
    menu.push({
      label: "Delete",
      onClick: () => onDelete(comment.id),
      sx: { color: "var(--mui-palette-error-main)" },
    });
  }

  return (
    <Box
      component="li"
      sx={{
        display: "grid",
        gridTemplateColumns: `${size}px minmax(0, 1fr)`,
        columnGap: `${spacing.md}px`,
      }}
    >
      <FabricAvatar
        name={comment.author.name}
        src={comment.author.avatarSrc}
        size={size}
        aria-hidden
      />
      <Box sx={{ minWidth: 0 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            columnGap: `${spacing.sm}px`,
            minHeight: size,
          }}
        >
          <Box component="span" sx={{ fontWeight: fontWeight.semiBold, fontSize: "0.875rem" }}>
            {comment.author.name}
          </Box>
          <FabricRelativeTime
            date={comment.createdAt}
            locale={locale}
            sx={{ fontSize: "0.75rem", color: "var(--mui-palette-text-secondary)" }}
          />
          {comment.editedAt && (
            <Box
              component="span"
              sx={{ fontSize: "0.75rem", color: "var(--mui-palette-text-secondary)" }}
            >
              (edited)
            </Box>
          )}
          {menu.length > 0 && !editing && (
            <Box sx={{ ml: "auto" }}>
              <FabricMenuButton
                items={menu}
                icon={<MoreHoriz />}
                tooltip="Comment actions"
                triggerButtonProps={{
                  "aria-label": `Actions for ${comment.author.name}'s comment`,
                }}
              />
            </Box>
          )}
        </Box>

        {editing ? (
          <FabricCommentComposer
            initialValue={comment.body}
            users={users}
            autoFocus
            submitLabel="Save"
            aria-label="Edit comment"
            onCancel={() => setEditing(false)}
            onSubmit={async (body) => {
              await onEdit?.(comment.id, body);
              setEditing(false);
            }}
            sx={{ mt: `${spacing.xs}px` }}
          />
        ) : (
          <CommentBody body={comment.body} currentUserId={currentUserId} />
        )}

        {!nested && allowReplies && onAdd && !editing && !replying && (
          <FabricButton
            variant="text"
            size="small"
            onClick={() => setReplying(true)}
            sx={{ ml: "-8px", mt: "2px" }}
          >
            Reply
          </FabricButton>
        )}

        {!nested && (comment.replies?.length || replying) ? (
          <Box
            component="ul"
            aria-label={`Replies to ${comment.author.name}`}
            sx={{
              listStyle: "none",
              m: 0,
              mt: `${spacing.md}px`,
              p: 0,
              pl: `${spacing.md}px`,
              borderLeft: "2px solid var(--mui-palette-divider)",
              display: "flex",
              flexDirection: "column",
              gap: `${spacing.md}px`,
            }}
          >
            {comment.replies?.map((r) => (
              <CommentItem
                key={r.id}
                comment={r}
                parentId={comment.id}
                currentUserId={currentUserId}
                users={users}
                onAdd={onAdd}
                onEdit={onEdit}
                onDelete={onDelete}
                locale={locale}
              />
            ))}
            {replying && (
              <Box component="li">
                <FabricCommentComposer
                  users={users}
                  autoFocus
                  placeholder={`Reply to ${comment.author.name}…`}
                  submitLabel="Post reply"
                  onCancel={() => setReplying(false)}
                  onSubmit={async (body) => {
                    await onAdd?.(body, comment.id);
                    setReplying(false);
                  }}
                />
              </Box>
            )}
          </Box>
        ) : null}
      </Box>
    </Box>
  );
}

/**
 * FabricComments — a comment thread: comments with one level of replies, @mentions,
 * and edit and delete for your own comments.
 *
 * The thread shows what it's given and reports what people do. Your code saves
 * comments and decides who gets notified (`getMentionedIds(body)` lists the people
 * mentioned).
 *
 * @example
 * ```tsx
 * <FabricComments
 *   comments={comments}
 *   currentUserId={me.id}
 *   users={teamMembers}
 *   onAdd={(body, parentId) => api.addComment({ body, parentId })}
 *   onEdit={(id, body) => api.editComment(id, body)}
 *   onDelete={(id) => api.deleteComment(id)}
 * />
 * ```
 */
export function FabricComments({
  comments,
  composerPosition = "bottom",
  loading = false,
  emptyState = "No comments yet.",
  "aria-label": ariaLabel = "Comments",
  sx,
  ...itemProps
}: Readonly<FabricCommentsProps>) {
  const { onAdd, users } = itemProps;

  const composer = onAdd && (
    <FabricCommentComposer users={users} onSubmit={(body) => onAdd(body)} />
  );

  let list: ReactNode;
  if (loading) {
    list = (
      <Box
        aria-busy="true"
        aria-label={`Loading ${ariaLabel.toLowerCase()}`}
        sx={{ display: "grid", gap: `${spacing.lg}px` }}
      >
        {[0, 1].map((i) => (
          <Box key={i} sx={{ display: "flex", gap: `${spacing.md}px` }}>
            <Skeleton variant="circular" width={32} height={32} />
            <Box sx={{ flex: 1 }}>
              <Skeleton width="30%" />
              <Skeleton width={`${80 - i * 20}%`} />
            </Box>
          </Box>
        ))}
      </Box>
    );
  } else if (comments.length === 0) {
    list = (
      <Box sx={{ fontSize: "0.875rem", color: "var(--mui-palette-text-secondary)" }}>
        {emptyState}
      </Box>
    );
  } else {
    list = (
      <Box
        component="ul"
        aria-label={ariaLabel}
        sx={{
          listStyle: "none",
          m: 0,
          p: 0,
          display: "flex",
          flexDirection: "column",
          gap: `${spacing.lg}px`,
        }}
      >
        {comments.map((c) => (
          <CommentItem key={c.id} comment={c} {...itemProps} />
        ))}
      </Box>
    );
  }

  return (
    <Box
      sx={[
        { display: "flex", flexDirection: "column", gap: `${spacing.lg}px` },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {composerPosition === "top" && composer}
      {list}
      {composerPosition === "bottom" && composer}
    </Box>
  );
}
