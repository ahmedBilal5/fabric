import type { SvgIconProps } from "@mui/material/SvgIcon";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import Bookmark from "@fabric-kit/icons/Bookmark";
import { fabricIconLoaders } from "../dist/fabric-icon-loaders.js";
import { fabricIconCategories } from "../dist/fabric-icons.js";

type IconComponent = React.ComponentType<SvgIconProps>;

const total = Object.values(fabricIconCategories).reduce((n, list) => n + list.length, 0);
const BATCH = 120;

/** True once the element has come within `margin` px of the viewport. */
function useNearViewport(ref: React.RefObject<Element | null>, margin: number) {
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setNear(true);
        observer.disconnect();
      },
      { rootMargin: `${margin}px` },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, margin]);
  return near;
}

const heading: React.CSSProperties = {
  fontFamily: "'Geist', sans-serif",
  fontSize: 16,
  fontWeight: 600,
  margin: "32px 0 12px",
  color: "var(--mui-palette-text-primary)",
};

const tile: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 6,
  padding: "12px 4px",
  borderRadius: 8,
  border: "1px solid var(--mui-palette-divider)",
  background: "var(--mui-palette-background-paper)",
  color: "var(--mui-palette-text-primary)",
  cursor: "pointer",
  font: "inherit",
};

type GalleryArgs = Pick<SvgIconProps, "fontSize" | "color">;

interface CategorySectionProps extends GalleryArgs {
  category: string;
  names: readonly string[];
  copied: string;
  onCopy: (name: string) => void;
}

/** Loads the category's icons only once it nears the viewport, and renders them in batches. */
const CategorySection = ({ category, names, fontSize, color, copied, onCopy }: CategorySectionProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [icons, setIcons] = useState<Record<string, IconComponent> | null>(null);
  const [limit, setLimit] = useState(BATCH);
  const nearSection = useNearViewport(sectionRef, 600);

  useEffect(() => {
    if (nearSection && !icons) fabricIconLoaders[category]().then(setIcons);
  }, [nearSection, icons, category]);

  // Re-observing after each batch re-fires the callback if the sentinel is still in view.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !icons || limit >= names.length) return;
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setLimit((l) => l + BATCH),
      { rootMargin: "600px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [icons, limit, names.length]);

  return (
    <section ref={sectionRef}>
      <h3 style={heading}>
        {category} ({names.length})
      </h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
          gap: 8,
          minHeight: icons ? undefined : 96,
        }}
      >
        {icons &&
          names.slice(0, limit).map((name) => {
            const Icon = icons[name];
            return (
              <button key={name} type="button" title={name} style={tile} onClick={() => onCopy(name)}>
                <Icon fontSize={fontSize} color={color} />
                <span
                  style={{
                    fontSize: 11,
                    maxWidth: "100%",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {copied === name ? "Copied!" : name}
                </span>
              </button>
            );
          })}
      </div>
      <div ref={sentinelRef} />
    </section>
  );
};

const IconGallery = ({ fontSize, color }: GalleryArgs) => {
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState("");
  const q = query.trim().toLowerCase();

  const groups = useMemo(
    () =>
      Object.entries(fabricIconCategories)
        .map(([category, names]) => [category, names.filter((n) => n.toLowerCase().includes(q))] as const)
        .filter(([, names]) => names.length > 0),
    [q],
  );

  const copy = (name: string) => {
    navigator.clipboard.writeText(`import ${name} from "@fabric-kit/icons/${name}";`);
    setCopied(name);
    setTimeout(() => setCopied(""), 1200);
  };

  return (
    <div>
      <input
        type="search"
        aria-label="Search icons"
        placeholder={`Search ${total} icons`}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{
          width: 320,
          height: 40,
          padding: "0 12px",
          borderRadius: 4,
          border: "1px solid var(--mui-palette-divider)",
          background: "var(--mui-palette-background-paper)",
          color: "var(--mui-palette-text-primary)",
          font: "inherit",
        }}
      />
      <p style={{ fontSize: 13, color: "var(--mui-palette-text-secondary)" }}>
        Click an icon to copy its import.
      </p>
      {groups.map(([category, names]) => (
        <CategorySection
          key={category}
          category={category}
          names={names}
          fontSize={fontSize}
          color={color}
          copied={copied}
          onCopy={copy}
        />
      ))}
    </div>
  );
};

const meta: Meta<typeof IconGallery> = {
  title: "Foundations/Icons",
  component: IconGallery,
  parameters: { layout: "padded" },
  argTypes: {
    fontSize: { control: "inline-radio", options: ["small", "medium", "large", "inherit"] },
    color: {
      control: "select",
      options: ["inherit", "action", "disabled", "primary", "secondary", "error", "info", "success", "warning"],
    },
  },
  args: { fontSize: "medium", color: "inherit" },
};

export default meta;

export const Gallery: StoryObj<typeof IconGallery> = {};

/** Same props as MUI icons: `fontSize`, `color`, `htmlColor` and `sx`. */
export const Customizing: StoryObj = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
      <Bookmark fontSize="small" />
      <Bookmark />
      <Bookmark fontSize="large" />
      <Bookmark sx={{ fontSize: 56 }} />
      <Bookmark color="primary" />
      <Bookmark color="error" />
      <Bookmark htmlColor="#7B1FA2" />
      <Bookmark sx={{ fontSize: 40, color: "success.main" }} />
    </div>
  ),
};
