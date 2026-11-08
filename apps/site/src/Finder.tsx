import { useId, useMemo, useRef, useState } from "react";
import { docsUrl } from "./links";

const COMPONENTS = [
  "Accordion",
  "ActionBar",
  "Alert",
  "Autocomplete",
  "Avatar",
  "AvatarGroup",
  "Badge",
  "Breadcrumbs",
  "Button",
  "Card",
  "Checkbox",
  "CheckboxGroup",
  "Chip",
  "CircularProgress",
  "Dialog",
  "Divider",
  "Drawer",
  "IconButton",
  "Menu",
  "MenuButton",
  "Pagination",
  "ProgressChip",
  "Radio",
  "RadioGroup",
  "Select",
  "Skeleton",
  "Snackbar",
  "Stepper",
  "Switch",
  "Tabs",
  "Tag",
  "TextField",
  "ToggleButtonGroup",
  "Tooltip",
];

const ENTRIES = [
  { name: "Installation", group: "Guide", path: "foundations-installation--docs" },
  { name: "Theming", group: "Guide", path: "foundations-theming--docs" },
  { name: "Icons", group: "Guide", path: "foundations-icons-overview--docs" },
  { name: "App shell and layout", group: "Kit", path: "kits-layout-overview--docs" },
  { name: "Global search", group: "Kit", path: "kits-global-search-fabricglobalsearch--docs" },
  { name: "Chat assistant", group: "Kit", path: "kits-chatbot-overview--docs" },
  { name: "Version history", group: "Kit", path: "kits-versioning-overview--docs" },
  {
    name: "Workflow canvas",
    group: "Kit",
    path: "kits-canvas-builder-fabriccanvasbuilder-overview--docs",
  },
  { name: "Data grid", group: "Data", path: "components-fabricdatagrid--docs" },
  ...COMPONENTS.map((name) => ({
    name,
    group: "Component",
    path: `components-fabric${name.toLowerCase()}--overview`,
  })),
];

/** The nav's search pill: filters Fabric's components and guides and opens their docs. */
export function Finder() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return ENTRIES.filter((e) => e.name.toLowerCase().includes(q)).slice(0, 7);
  }, [query]);

  const go = (path: string) => {
    window.location.href = docsUrl(path);
  };

  return (
    <div className="finder">
      <label htmlFor={`${listId}-input`} className="visually-hidden">
        Find a component
      </label>
      <input
        ref={inputRef}
        id={`${listId}-input`}
        className="finder__input"
        type="search"
        placeholder="Find a component"
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
            go(results[active].path);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
      />
      {open && results.length > 0 && (
        <div id={listId} role="listbox" className="finder__list">
          {results.map((entry, index) => (
            <div
              key={entry.path}
              id={`${listId}-${index}`}
              role="option"
              tabIndex={-1}
              aria-selected={index === active}
              className="finder__option"
              onMouseDown={(e) => {
                e.preventDefault();
                go(entry.path);
              }}
              onMouseEnter={() => setActive(index)}
            >
              <span>{entry.name}</span>
              <span className="finder__group">{entry.group}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
