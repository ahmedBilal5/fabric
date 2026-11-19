import { sections } from "virtual:docs-index";
import { useId, useMemo, useRef, useState } from "react";
import type { NavItem } from "../docs-nav";

type Entry = NavItem & { group: string };

const ENTRIES: Entry[] = sections.flatMap((s) =>
  s.items.map((item) => ({ ...item, group: s.title })),
);

/** Shows names that start with the query first, then other matches. */
function search(query: string): Entry[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const rank = (e: Entry) => {
    const name = e.label.toLowerCase();
    if (name.startsWith(q) || `fabric${name}`.startsWith(q)) return 0;
    if (name.includes(q)) return 1;
    return e.title.toLowerCase().includes(q) ? 2 : -1;
  };
  return ENTRIES.map((entry) => ({ entry, rank: rank(entry) }))
    .filter((r) => r.rank >= 0)
    .sort((a, b) => a.rank - b.rank)
    .slice(0, 8)
    .map((r) => r.entry);
}

/**
 * The nav's search pill: finds any docs page (components, patterns, guides, kits) and
 * opens it, on the docs site or, until it moves, in Storybook. The list comes from the
 * repo's docs pages at build time (`docs-index.ts`).
 */
export function Finder() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => search(query), [query]);

  const go = (href: string) => {
    window.location.href = href;
  };

  return (
    <div className="finder">
      <label htmlFor={`${listId}-input`} className="visually-hidden">
        Search the docs
      </label>
      <input
        ref={inputRef}
        id={`${listId}-input`}
        className="finder__input"
        type="search"
        placeholder="Search the docs"
        autoComplete="off"
        role="combobox"
        aria-expanded={open && results.length > 0}
        aria-controls={listId}
        aria-activedescendant={open && results[active] ? `${listId}-${active}` : undefined}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setActive(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive((i) => Math.min(i + 1, results.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((i) => Math.max(i - 1, 0));
          } else if (e.key === "Enter" && results[active]) {
            go(results[active].href);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
      />
      {open && results.length > 0 && (
        <div id={listId} role="listbox" className="finder__list">
          {results.map((entry, index) => (
            <div
              key={entry.href}
              id={`${listId}-${index}`}
              role="option"
              tabIndex={-1}
              aria-selected={index === active}
              className="finder__option"
              onMouseDown={(e) => {
                e.preventDefault();
                go(entry.href);
              }}
              onMouseEnter={() => setActive(index)}
            >
              <span>{entry.label}</span>
              <span className="finder__group">{entry.group}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
