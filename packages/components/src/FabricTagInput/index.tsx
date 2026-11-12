/**
 * FabricTagInput — type words and press Enter or comma to turn them into tags.
 *
 * For labels, keywords, email lists and other short free-form values. Backspace
 * in the empty box removes the last tag; pasting "a, b, c" adds three. Pass
 * `suggestions` to offer known tags as people type, `validate` to reject bad
 * ones with a message, and `maxTags` to cap the list. Duplicates are ignored,
 * ignoring case.
 *
 * @example
 * ```tsx
 * <FabricTagInput label="Labels" value={labels} onChange={setLabels} suggestions={["Urgent", "Billing"]} />
 * ```
 */

import type { AutocompleteChangeReason } from "@mui/material";
import { type ReactNode, type SyntheticEvent, useState } from "react";
import { FabricAutocomplete } from "../FabricAutocomplete";
import { FabricChip } from "../FabricChip";

export interface FabricTagInputProps {
  /** The tags. */
  value: string[];
  /** Called with the new list of tags. */
  onChange: (value: string[]) => void;
  /** Known tags offered as people type. Anything else can still be typed. */
  suggestions?: string[];
  /** Label above the box. */
  label?: ReactNode;
  /** Placeholder while there are no tags. @default "Type and press Enter" */
  placeholder?: string;
  /** Hint under the box. A rejected tag's message replaces it until the next change. */
  helperText?: ReactNode;
  /** Error state, e.g. from form validation. */
  error?: boolean;
  /** Disable the box. */
  disabled?: boolean;
  /** Most tags allowed. Further entries are refused with a message. */
  maxTags?: number;
  /** Return a message to refuse a tag, or nothing to accept it. */
  validate?: (tag: string) => string | null | undefined;
  /** Characters that end a tag as well as Enter. @default [","] */
  separators?: string[];
  /** Called when focus leaves the box. */
  onBlur?: () => void;
  /** Stretch to the container's width. @default true */
  fullWidth?: boolean;
}

/** Splits pasted or typed text on separators and new lines, trimming each part. */
export function splitTags(text: string, separators: string[] = [","]): string[] {
  const pattern = new RegExp(
    `[${separators.map((s) => s.replace(/[\\\]^-]/g, "\\$&")).join("")}\\n]`,
  );
  return text
    .split(pattern)
    .map((t) => t.trim())
    .filter(Boolean);
}

/** Adds tags to a list, skipping case-insensitive duplicates. */
export function addTags(current: string[], incoming: string[]): string[] {
  const seen = new Set(current.map((t) => t.toLowerCase()));
  const next = [...current];
  for (const tag of incoming) {
    if (!seen.has(tag.toLowerCase())) {
      seen.add(tag.toLowerCase());
      next.push(tag);
    }
  }
  return next;
}

/** A text box that turns typed words into removable tags. */
export function FabricTagInput({
  value,
  onChange,
  suggestions = [],
  label,
  placeholder = "Type and press Enter",
  helperText,
  error = false,
  disabled = false,
  maxTags,
  validate,
  separators = [","],
  onBlur,
  fullWidth = true,
}: Readonly<FabricTagInputProps>) {
  const [input, setInput] = useState("");
  const [problem, setProblem] = useState<string | null>(null);

  // Accepts what it can and explains the first refusal.
  const tryAdd = (tags: string[]) => {
    let next = value;
    let refused: string | null = null;
    for (const tag of tags) {
      if (maxTags !== undefined && next.length >= maxTags) {
        refused = `You can add up to ${maxTags} tags.`;
        break;
      }
      const message = validate?.(tag);
      if (message) {
        refused ??= message;
        continue;
      }
      next = addTags(next, [tag]);
    }
    setProblem(refused);
    if (next !== value) onChange(next);
    return refused === null;
  };

  const full = maxTags !== undefined && value.length >= maxTags;

  return (
    <FabricAutocomplete<string, true, false, true>
      multiple
      freeSolo
      fullWidth={fullWidth}
      disabled={disabled}
      // A full list offers nothing more to pick.
      options={full ? [] : suggestions}
      filterSelectedOptions
      value={value}
      inputValue={input}
      onInputChange={(_e: SyntheticEvent, text: string, reason) => {
        if (reason === "reset") return setInput("");
        const endsWithSeparator = separators.some((s) => text.endsWith(s));
        if (endsWithSeparator || text.includes("\n")) {
          const parts = splitTags(text, separators);
          if (tryAdd(parts)) setInput("");
          else setInput(text.replace(new RegExp(`[${separators.join("")}\\n]+$`), ""));
          return;
        }
        setProblem(null);
        setInput(text);
      }}
      onChange={(_e: SyntheticEvent, next: string[], reason: AutocompleteChangeReason) => {
        if (reason === "createOption" || reason === "selectOption") {
          const added = next[next.length - 1];
          if (tryAdd(splitTags(added, separators))) setInput("");
        } else {
          setProblem(null);
          onChange(next);
        }
      }}
      onBlur={() => {
        // Keep what was typed but not yet entered.
        if (input.trim()) {
          if (tryAdd(splitTags(input, separators))) setInput("");
        }
        onBlur?.();
      }}
      renderValue={(tags, getItemProps) =>
        tags.map((tag, index) => {
          const { key, onDelete, ...itemProps } = getItemProps({ index });
          return (
            <FabricChip
              key={key}
              label={tag}
              size="small"
              onDelete={disabled ? undefined : onDelete}
              {...itemProps}
            />
          );
        })
      }
      label={label}
      placeholder={value.length ? undefined : placeholder}
      error={error || problem !== null}
      helperText={problem ?? helperText}
      slotProps={{ listbox: { "aria-label": "Suggestions" } }}
    />
  );
}
