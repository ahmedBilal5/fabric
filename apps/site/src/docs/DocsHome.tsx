import { sections } from "virtual:docs-index";
import { slugify } from "../../docs-nav";
import { CREATE_COMMAND, docsUrl, STORYBOOK_URL } from "../links";

/** The docs landing page: how to start, then every section and its pages. */
export function DocsHome() {
  const moved = sections.flatMap((s) => s.items).filter((i) => i.local).length;
  return (
    <>
      <h1>Documentation</h1>
      <p className="lead docs__lead">
        Guides, components, patterns and kits for Fabric. New here? Start a new app with{" "}
        <code>{CREATE_COMMAND}</code>, or follow the{" "}
        <a href={docsUrl("foundations-installation--docs")}>installation guide</a> to add Fabric to
        an MUI app you already have.
      </p>
      <p className="docs__note">
        The docs are moving here from Storybook. {moved} pages have moved so far; pages marked{" "}
        <span aria-hidden="true">↗</span>
        <span className="visually-hidden">Storybook</span> still open in{" "}
        <a href={STORYBOOK_URL}>Storybook</a>, which stays the place to try every component with
        live controls.
      </p>
      <div className="docs__sections">
        {sections.map((section) => (
          <section
            key={section.title}
            className="docs__card"
            aria-labelledby={`s-${slugify(section.title)}`}
          >
            <h2 id={`s-${slugify(section.title)}`}>{section.title}</h2>
            <ul>
              {section.items.map((item) => (
                <li key={item.href}>
                  <a href={item.href}>
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
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
