---
"@fabric-kit/hooks": patch
---

`formatRelativeTime` and `useRelativeTime` count days by the calendar: 26 hours ago just after midnight now reads "2 days ago", matching the date, instead of "yesterday".
