import { useEffect, useState } from "react";
import type { TocItem } from "../../rehype-toc";

/** "On this page": the page's h2 and h3 headings, with the one in view marked. */
export function Toc({ items }: { items: TocItem[] }) {
  const [active, setActive] = useState<string>();

  useEffect(() => {
    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);
    if (!headings.length || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length) setActive(visible[0].target.id);
      },
      // A heading counts as current once it reaches the top third of the screen.
      { rootMargin: "0px 0px -66% 0px" },
    );
    for (const el of headings) observer.observe(el);
    return () => observer.disconnect();
  }, [items]);

  if (items.length < 2) return null;
  return (
    <nav className="toc" aria-labelledby="toc-title">
      <h2 id="toc-title" className="toc__title">
        On this page
      </h2>
      <ul className="toc__list">
        {items.map((item) => (
          <li key={item.id} className={item.depth === 3 ? "toc__sub" : undefined}>
            <a
              href={`#${item.id}`}
              className="toc__link"
              aria-current={active === item.id ? "location" : undefined}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
