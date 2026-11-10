import { fontWeight, radii, shadows, spacing, zIndex } from "@fabric-kit/design-tokens";
import { formatHotkey } from "@fabric-kit/hooks";
import Box from "@mui/material/Box";
import Popper from "@mui/material/Popper";
import type { SxProps, Theme } from "@mui/material/styles";
import {
  type ChangeEvent,
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { FabricAvatar } from "../FabricAvatar";
import { FabricButton } from "../FabricButton";
import { FabricTextField } from "../FabricTextField/FabricTextField";
import {
  activeMentionQuery,
  displayToMentions,
  type FabricMentionUser,
  filterMentionUsers,
  mentionsToDisplay,
} from "./mentions";

export interface FabricCommentComposerProps {
  /**
   * Called with the stored text (mentions as `@[Name](id)`) when the user posts.
   * Return a promise to show the button's loading state; the box clears when it resolves.
   */
  onSubmit: (body: string) => void | Promise<void>;
  /** Shows a Cancel button, e.g. for replies and edits. */
  onCancel?: () => void;
  /** Starting text in stored form, for editing a comment. */
  initialValue?: string;
  /** People who can be @mentioned. */
  users?: FabricMentionUser[];
  /** Placeholder text. @default "Add a comment…" */
  placeholder?: string;
  /** Label of the post button. @default "Comment" */
  submitLabel?: ReactNode;
  /** Accessible name of the text box. @default the placeholder */
  "aria-label"?: string;
  /** Focus the box on mount, e.g. when opening a reply. */
  autoFocus?: boolean;
  /** Disable the box and buttons. */
  disabled?: boolean;
  /** Minimum rows of the text box. @default 2 */
  minRows?: number;
  /** System styles on the root. */
  sx?: SxProps<Theme>;
}

/**
 * FabricCommentComposer — a text box for writing a comment, with @mention
 * suggestions and ⌘/Ctrl+Enter to post.
 *
 * Typing "@" opens a list of people; arrow keys move, Enter or Tab picks, Escape
 * closes. Picked mentions are posted as `@[Name](id)` so your server can notify
 * people (`getMentionedIds` lists them).
 */
export function FabricCommentComposer({
  onSubmit,
  onCancel,
  initialValue = "",
  users = [],
  placeholder = "Add a comment…",
  submitLabel = "Comment",
  "aria-label": ariaLabel,
  autoFocus = false,
  disabled = false,
  minRows = 2,
  sx,
}: Readonly<FabricCommentComposerProps>) {
  const listId = useId();
  const hintId = useId();
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const initial = useRef(mentionsToDisplay(initialValue));
  const [text, setText] = useState(initial.current.text);
  const [mentions, setMentions] = useState<FabricMentionUser[]>(initial.current.mentions);
  const [query, setQuery] = useState<{ query: string; start: number } | null>(null);
  const [active, setActive] = useState(0);
  const [busy, setBusy] = useState(false);

  const suggestions = query ? filterMentionUsers(users, query.query) : [];
  const open = suggestions.length > 0;
  const shortcut = formatHotkey("mod+enter");

  useEffect(() => {
    if (autoFocus) {
      const el = inputRef.current;
      el?.focus();
      el?.setSelectionRange(el.value.length, el.value.length);
    }
  }, [autoFocus]);

  const updateQuery = (value: string, caret: number) => {
    const next = users.length ? activeMentionQuery(value, caret) : null;
    setQuery(next);
    setActive(0);
  };

  const onChange = (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setText(e.target.value);
    updateQuery(e.target.value, e.target.selectionStart ?? e.target.value.length);
  };

  const pick = (user: FabricMentionUser) => {
    if (!query) return;
    const caret = inputRef.current?.selectionStart ?? text.length;
    const insert = `@${user.name} `;
    const next = text.slice(0, query.start) + insert + text.slice(caret);
    setText(next);
    setMentions((m) => (m.some((x) => x.id === user.id) ? m : [...m, user]));
    setQuery(null);
    const pos = query.start + insert.length;
    requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(pos, pos);
    });
  };

  const submit = async () => {
    const trimmed = text.trim();
    if (!trimmed || busy || disabled) return;
    const body = displayToMentions(trimmed, mentions);
    setBusy(true);
    try {
      await onSubmit(body);
      setText("");
      setMentions([]);
    } finally {
      setBusy(false);
    }
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (open) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const step = e.key === "ArrowDown" ? 1 : -1;
        setActive((i) => (i + step + suggestions.length) % suggestions.length);
        return;
      }
      if ((e.key === "Enter" && !e.metaKey && !e.ctrlKey) || e.key === "Tab") {
        e.preventDefault();
        pick(suggestions[active]);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        setQuery(null);
        return;
      }
    }
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      void submit();
    } else if (e.key === "Escape" && onCancel && !text.trim()) {
      onCancel();
    }
  };

  const optionId = (i: number) => `${listId}-opt-${i}`;

  return (
    <Box
      sx={[
        { display: "flex", flexDirection: "column", gap: `${spacing.sm}px` },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <FabricTextField
        multiline
        minRows={minRows}
        maxRows={12}
        fullWidth
        value={text}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onClick={(e) => {
          const t = e.target as HTMLTextAreaElement;
          updateQuery(t.value, t.selectionStart ?? t.value.length);
        }}
        onBlur={() => setQuery(null)}
        placeholder={placeholder}
        disabled={disabled || busy}
        inputRef={inputRef}
        slotProps={{
          htmlInput: {
            "aria-label": ariaLabel ?? placeholder.replace(/…$/, ""),
            "aria-describedby": hintId,
            "aria-autocomplete": users.length ? "list" : undefined,
            "aria-controls": open ? listId : undefined,
            "aria-expanded": users.length ? open : undefined,
            "aria-activedescendant": open ? optionId(active) : undefined,
          },
        }}
      />
      <Popper
        open={open}
        anchorEl={inputRef.current}
        placement="bottom-start"
        sx={{ zIndex: zIndex.modal + 1 }}
      >
        <Box
          component="ul"
          id={listId}
          role="listbox"
          aria-label="People"
          sx={{
            listStyle: "none",
            m: 0,
            mt: `${spacing.xs}px`,
            p: `${spacing.xs}px`,
            minWidth: 240,
            maxHeight: 280,
            overflowY: "auto",
            borderRadius: `${radii.lg}px`,
            boxShadow: shadows.dropdown,
            backgroundColor: "var(--mui-palette-background-paper)",
          }}
        >
          {suggestions.map((u, i) => (
            <Box
              component="li"
              key={u.id}
              id={optionId(i)}
              role="option"
              aria-selected={i === active}
              // Keep focus in the text box.
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => pick(u)}
              onMouseEnter={() => setActive(i)}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: `${spacing.sm}px`,
                px: `${spacing.sm}px`,
                py: `${spacing.xs + 2}px`,
                borderRadius: `${radii.md}px`,
                cursor: "pointer",
                backgroundColor: i === active ? "var(--mui-palette-action-selected)" : undefined,
              }}
            >
              <FabricAvatar name={u.name} src={u.avatarSrc} size={24} aria-hidden />
              <Box sx={{ minWidth: 0 }}>
                <Box sx={{ fontSize: "0.875rem", fontWeight: fontWeight.medium }}>{u.name}</Box>
                {u.description && (
                  <Box sx={{ fontSize: "0.75rem", color: "var(--mui-palette-text-secondary)" }}>
                    {u.description}
                  </Box>
                )}
              </Box>
            </Box>
          ))}
        </Box>
      </Popper>
      <Box sx={{ display: "flex", alignItems: "center", gap: `${spacing.sm}px` }}>
        <Box
          id={hintId}
          sx={{ fontSize: "0.75rem", color: "var(--mui-palette-text-secondary)", mr: "auto" }}
        >
          {users.length ? "Type @ to mention someone. " : ""}
          {shortcut} to post.
        </Box>
        {onCancel && (
          <FabricButton variant="text" size="small" onClick={onCancel} disabled={busy}>
            Cancel
          </FabricButton>
        )}
        <FabricButton
          variant="contained"
          size="small"
          onClick={() => void submit()}
          disabled={disabled || !text.trim()}
          loading={busy}
        >
          {submitLabel}
        </FabricButton>
      </Box>
    </Box>
  );
}
