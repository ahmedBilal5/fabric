---
"@fabric-kit/components": minor
---

New components for record pages:

- `FabricStatus`: a colored status dot with a label, with an optional pulse for work in progress.
- `FabricRelativeTime`: "3 minutes ago" in a `<time>` element that updates itself, with the exact time on hover and focus.
- `FabricKeyValueList`: label and value pairs in one or two columns, side by side or stacked, with copyable values, hints and an empty-value placeholder.
- `FabricActivityFeed`: who did what and when, grouped by day, with icon markers, content blocks, loading, empty and "Show more" states.
- `FabricComments` and `FabricCommentComposer`: comment threads with one level of replies, @mentions, editing and deleting your own comments, and ⌘/Ctrl+Enter to post. `parseMentions`, `getMentionedIds`, `mentionsToDisplay` and `displayToMentions` work with the stored `@[Name](id)` format.
