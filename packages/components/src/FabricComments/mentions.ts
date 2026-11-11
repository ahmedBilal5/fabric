/**
 * Mentions are stored in comment text as `@[Display Name](user-id)`, so the text
 * stays readable, survives edits of the person's name elsewhere, and can be parsed
 * on the server to send notifications.
 */

/** Someone who can be mentioned. */
export interface FabricMentionUser {
  /** Stable id, stored in the comment text. */
  id: string;
  /** Display name, shown after the @. */
  name: string;
  /** Avatar image URL. */
  avatarSrc?: string;
  /** Second line in the suggestions, e.g. an email or role. */
  description?: string;
}

/** A piece of comment text: plain text or a mention. */
export type MentionSegment =
  | { type: "text"; text: string }
  | { type: "mention"; id: string; name: string };

const MARKUP = /@\[([^\]\n]+)\]\(([^)\s]+)\)/g;

/** Splits stored comment text into text and mention segments. */
export function parseMentions(body: string): MentionSegment[] {
  const out: MentionSegment[] = [];
  let last = 0;
  for (const m of body.matchAll(MARKUP)) {
    const at = m.index ?? 0;
    if (at > last) out.push({ type: "text", text: body.slice(last, at) });
    out.push({ type: "mention", name: m[1], id: m[2] });
    last = at + m[0].length;
  }
  if (last < body.length) out.push({ type: "text", text: body.slice(last) });
  return out;
}

/** The ids of everyone mentioned in stored text, without duplicates. */
export function getMentionedIds(body: string): string[] {
  return [...new Set(parseMentions(body).flatMap((s) => (s.type === "mention" ? [s.id] : [])))];
}

/** Stored text → what the composer shows ("@Jane Doe"), plus the mentions it holds. */
export function mentionsToDisplay(body: string): { text: string; mentions: FabricMentionUser[] } {
  const mentions: FabricMentionUser[] = [];
  const text = parseMentions(body)
    .map((s) => {
      if (s.type === "text") return s.text;
      if (!mentions.some((m) => m.id === s.id)) mentions.push({ id: s.id, name: s.name });
      return `@${s.name}`;
    })
    .join("");
  return { text, mentions };
}

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Composer text → stored text. Each "@Name" of a mention the user picked becomes
 * `@[Name](id)`. Typed "@Name" text that wasn't picked from the list stays plain.
 * Longer names are matched first, so "@Jane Doe" wins over "@Jane".
 */
export function displayToMentions(text: string, mentions: FabricMentionUser[]): string {
  const byLength = [...mentions].sort((a, b) => b.name.length - a.name.length);
  if (byLength.length === 0) return text;
  const pattern = new RegExp(
    `@(${byLength.map((m) => escapeRegExp(m.name)).join("|")})(?![\\p{L}\\p{N}_])`,
    "gu",
  );
  return text.replace(pattern, (_all, name: string) => {
    const user = byLength.find((m) => m.name === name);
    return user ? `@[${user.name}](${user.id})` : `@${name}`;
  });
}

/**
 * The mention being typed at the caret: the text after an "@" that starts a word,
 * up to the caret. `null` when the caret isn't in a mention.
 */
export function activeMentionQuery(
  text: string,
  caret: number,
): { query: string; start: number } | null {
  const before = text.slice(0, caret);
  const m = /(^|\s)@([\p{L}\p{N}_.'-]{0,40})$/u.exec(before);
  if (!m) return null;
  return { query: m[2], start: before.length - m[2].length - 1 };
}

/** People whose name or description has a word starting with `query`. */
export function filterMentionUsers(
  users: FabricMentionUser[],
  query: string,
  limit = 8,
): FabricMentionUser[] {
  const q = query.toLocaleLowerCase();
  if (!q) return users.slice(0, limit);
  return users
    .filter((u) =>
      `${u.name} ${u.description ?? ""}`
        .toLocaleLowerCase()
        .split(/[\s@._-]+/)
        .some((w) => w.startsWith(q)),
    )
    .slice(0, limit);
}
