import { sections } from "virtual:docs-index";

/**
 * The docs sidebar: every page, grouped by section. Pages that haven't moved out of
 * Storybook yet are marked and open there.
 */
export function DocsNav({ slug }: { slug?: string }) {
  return (
    <>
      {sections.map((section) => (
        <section key={section.title} className="docnav__section">
          <h2 className="docnav__title">{section.title}</h2>
          <ul className="docnav__list">
            {section.items.map((item) => {
              const current = item.local && item.slug === slug;
              return (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="docnav__link"
                    aria-current={current ? "page" : undefined}
                  >
                    {item.label}
                    {!item.local && (
                      <>
                        <span className="docnav__ext" aria-hidden="true">
                          ↗
                        </span>
                        <span className="visually-hidden"> (Storybook)</span>
                      </>
                    )}
                  </a>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </>
  );
}
