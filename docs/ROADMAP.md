# Fabric roadmap

Fabric ships the pieces of a business app (app shell, search, chatbot, data grid, about 40 components) but not the screens. This roadmap closes that gap in five phases, ending with a complete example admin app.

Phases run in order. Items inside a phase are independent, so they can be built in parallel. Every item is a GitHub issue labelled by phase and size; the pinned [Roadmap issue (#42)](https://github.com/ahmedBilal5/fabric/issues/42) links them all and tracks what's done.

This file is the source of truth for scope. Issue state is the source of truth for progress.

## Phase 0: Quick wins (done, PR #43)

Small, high-use pieces that every later phase builds on.

| Issue | Item                 | What ships                                                                                                             | Package     | Size |
| ----- | -------------------- | ---------------------------------------------------------------------------------------------------------------------- | ----------- | ---- |
| #1    | `useConfirm()`       | Promise-based confirm dialog on FabricDialog: `await confirm({ title, body, danger })`                                 | components  | S    |
| #2    | `useToast()`         | Queued toasts on FabricSnackbar, with action and undo support                                                          | components  | S    |
| #3    | Brand-neutral tokens | Move the leftover warm greys (disabled tab fill, tab text, field labels) into the theme palette so every brand applies | theme       | S    |
| #4    | FabricPageHeader     | Title, breadcrumbs, status chip, primary and secondary actions, overflow menu, optional tabs                           | layout      | M    |
| #5    | FabricEmptyState     | First-run, no-results and error variants, with an illustration slot and a call to action                               | components  | S    |
| #6    | System pages         | 404, 403, 500, maintenance and no-access pages, built on FabricEmptyState                                              | patterns    | S    |
| #7    | `@fabric-kit/hooks`  | `useDisclosure`, `useDebounce`, `useHotkeys`, `useClipboard`, `useLocalStorage`                                        | new package | M    |
| #8    | Formatting helpers   | Locale-aware dates, numbers, currency, relative time and file sizes on `Intl`                                          | hooks       | S    |

## Phase 1: List and detail pages (done, PR #45)

List and detail screens are most of a business app. This phase turns the data grid and page header into full page patterns, with a story for each assembled page.

| Issue | Item                               | What ships                                                                                    | Package    | Size |
| ----- | ---------------------------------- | --------------------------------------------------------------------------------------------- | ---------- | ---- |
| #9    | FabricFilterBar                    | Search, filter buttons, "clear all", and filters synced to the URL                            | patterns   | M    |
| #10   | Saved views                        | Save, rename and switch named filter and column sets                                          | datagrid   | M    |
| #11   | FabricBulkActionBar                | Appears on row selection with a count, actions and "select all N"                             | datagrid   | S    |
| #12   | List page pattern                  | Page header, filter bar, grid, bulk actions, empty and no-results states, export              | patterns   | M    |
| #13   | FabricKeyValueList                 | Label and value pairs for record summaries, one or two columns, with a copyable value variant | components | S    |
| #14   | FabricActivityFeed                 | Dated events with actor, action and target; reused later by the audit log                     | components | M    |
| #15   | Status indicator and relative time | Status dot with label, and "3 min ago" text that updates itself                               | components | S    |
| #16   | Detail page pattern                | Header with status and actions, key-value summary, tabbed sections, activity side panel       | patterns   | M    |
| #17   | Comments and threads               | Comment list, reply box, @mentions                                                            | components | L    |

## Phase 2: Forms (done)

Form library bindings come first, because every new input and the form page depend on them. File upload sits here because nearly every business app needs it.

| Issue | Item                    | What ships                                                                                   | Package     | Size |
| ----- | ----------------------- | -------------------------------------------------------------------------------------------- | ----------- | ---- |
| #18   | `@fabric-kit/forms`     | react-hook-form and zod bindings for every Fabric input, with error and helper text wired up | new package | L    |
| #19   | Form layout             | Form sections, field rows, a sticky save and cancel bar, an error summary                    | forms       | M    |
| #20   | Form page pattern       | Read-only and edit modes, an "unsaved changes" warning on navigation                         | patterns    | M    |
| #21   | FabricFileUpload        | Drag-and-drop zone, file list, progress, retry and remove                                    | components  | L    |
| #22   | Number inputs           | Stepper buttons, currency, percent and unit suffixes                                         | components  | M    |
| #23   | Specialised text inputs | Password with strength meter, one-time code, phone with country code, tag input              | components  | M    |
| #24   | Date-range presets      | "Last 7 days", "This quarter" and custom presets on the range picker                         | date-picker | S    |
| #25   | Settings page pattern   | Left section nav and grouped rows (label, description, control)                              | patterns    | M    |
| #26   | Wizard pattern          | FabricStepper plus per-step validation, back and next, and a review step                     | forms       | M    |

Suggested order: #18 first, then #19 and #20 (they need it). #21–#25 don't depend on forms and can go in any order. #26 needs #18.

## Phase 3: Dashboards (next)

A charts package unlocks dashboards. It builds on the free, MIT-licensed tier of MUI X Charts, which keeps the no-paid-dependencies rule.

| Issue | Item                 | What ships                                                                           | Package     | Size |
| ----- | -------------------- | ------------------------------------------------------------------------------------ | ----------- | ---- |
| #27   | `@fabric-kit/charts` | Themed bar, line, area, pie and sparkline charts that follow the brand and dark mode | new package | L    |
| #28   | FabricStatCard       | Value, change versus the previous period, and an optional sparkline                  | charts      | S    |
| #29   | Meters               | Progress and quota meters ("8 of 10 seats")                                          | components  | S    |
| #30   | Dashboard pattern    | Chart cards in a responsive widget grid, with a page header and date-range filter    | patterns    | M    |

## Phase 4: Example admin app

One complete app built only from Phases 0 to 3. It shows the tagline better than any single component, and it tests that the patterns fit together.

| Issue | Item                | What ships                                                                       | Package     | Size |
| ----- | ------------------- | -------------------------------------------------------------------------------- | ----------- | ---- |
| #31   | Example admin app   | List, detail, form, settings and dashboard pages over mock data, in `apps/`      | new app     | L    |
| #32   | Landing-page demo   | The example app embedded or linked from the landing site                         | site        | S    |
| #33   | `create-fabric-app` | A starter template that scaffolds the app shell, theme and one page of each kind | new package | M    |

## Later

Worth building but not ordered yet. Pick them up when the phases above are done, or sooner if someone wants one.

| Issue | Area                   | Items                                                                                                                                                                                                                             |
| ----- | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| #34   | Business-app kits      | Users and team management (invite, members, roles); permissions matrix; billing (plan cards, usage, invoices); API keys and webhooks; approval flow; CSV import wizard; export dialog; notification preferences; audit-log viewer |
| #35   | Advanced inputs        | Rich text and markdown editors; filter or query builder; schedule (cron) picker; user, team and role picker; time-zone, country and language selects; inline edit; colour picker; rating; range slider                            |
| #36   | Data display           | Kanban board; calendar and agenda views; card lists and galleries                                                                                                                                                                 |
| #37   | Overlays and feedback  | Command palette for actions (⌘K); hover cards; guided tours and onboarding checklists; page loading bar; keyboard-shortcut help dialog                                                                                            |
| #38   | Theme extras           | Density setting (compact or comfortable); high-contrast theme; interactive theme builder in the docs that outputs `createFabricTheme` code                                                                                        |
| #39   | i18n and accessibility | Translations for built-in strings; right-to-left layout; skip link, live-region announcer, visually hidden text, focus helpers                                                                                                    |
| #40   | Design handoff         | Tokens exported as CSS variables and JSON; a Figma kit                                                                                                                                                                            |
| #41   | Quality                | Visual regression tests; a bundle-size budget; a guide to adopting Fabric in an existing MUI app                                                                                                                                  |

## Definition of done

An item is done when it ships with all of these:

- Colours, spacing and type from the theme only, so Fabric, Ocean and Forest all apply in light and dark mode
- Keyboard and screen-reader support, checked with the Storybook accessibility panel
- Storybook stories for every variant and a docs page with usage guidance
- Unit tests for behaviour, and a changeset
- No paid MUI X packages and no new heavy dependencies without discussion

## Decisions

- **Tracking:** every item is a GitHub issue, labelled by phase and size. The pinned [Roadmap issue](https://github.com/ahmedBilal5/fabric/issues/42) links them all.
- **Page patterns** go in `@fabric-kit/patterns`, not `@fabric-kit/layout`.
- **Hooks and formatting helpers** ship as one package, `@fabric-kit/hooks`.
- **Rich text editor:** still open. Quill was removed when the version-history kit was made generic: it was hard-wired to preview Quill content, so it now takes a preview function and works with any content format. Fabric no longer depends on any editor, so the choice (Tiptap, Lexical or another) is free. Ask the maintainer before picking one.
