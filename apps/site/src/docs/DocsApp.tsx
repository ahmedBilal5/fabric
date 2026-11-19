import { pages } from "virtual:docs-index";
import { useState } from "react";
import type { PageLink } from "../../docs-nav";
import { GITHUB_URL } from "../links";
import { SiteHeader } from "../SiteHeader";
import { DocsHome } from "./DocsHome";
import { DocsNav } from "./DocsNav";
import { mdxComponents } from "./mdx-components";
import type { DocsModule } from "./pages";
import { Toc } from "./Toc";

export interface DocsAppProps {
  /** Page slug; `""` is the docs home. */
  slug: string;
  /** The page's compiled MDX. Missing for the home page, or a slug with no page. */
  page?: DocsModule;
}

/** A docs page: the site header, the docs sidebar, the page and "On this page". */
export function DocsApp({ slug, page }: DocsAppProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const meta = pages[slug];
  const Content = page?.default;

  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <SiteHeader current="docs" />
      <div className="container docs">
        {slug !== "" && (
          <button
            type="button"
            className="docs__menu"
            aria-expanded={menuOpen}
            aria-controls="docs-nav"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? "Close docs menu" : "Docs menu"}
          </button>
        )}
        {/* The home page lists every page itself. */}
        {slug !== "" && (
          <nav id="docs-nav" className="docnav" aria-label="Docs" data-open={menuOpen || undefined}>
            <DocsNav slug={slug} />
          </nav>
        )}
        <main id="main" className="docs__main">
          {meta && Content ? (
            <article className="prose">
              <p className="docs__eyebrow">{meta.section}</p>
              <h1>{meta.title}</h1>
              <p className="lead docs__lead">{meta.description}</p>
              <Content components={mdxComponents} />
              <footer className="docs__foot">
                <a href={`${GITHUB_URL}/edit/main/${meta.file}`} className="docs__edit">
                  Edit this page on GitHub
                </a>
                <nav className="pager" aria-label="Previous and next page">
                  <Pager link={meta.prev} rel="prev" />
                  <Pager link={meta.next} rel="next" />
                </nav>
              </footer>
            </article>
          ) : slug === "" ? (
            <div className="prose">
              <DocsHome />
            </div>
          ) : (
            <div className="prose">
              <h1>No docs page here</h1>
              <p className="lead docs__lead">
                Pick a page from the menu, or search the docs at the top.
              </p>
            </div>
          )}
        </main>
        {page && <aside className="docs__toc">{<Toc items={page.toc} />}</aside>}
      </div>
    </>
  );
}

function Pager({ link, rel }: { link?: PageLink; rel: "prev" | "next" }) {
  if (!link) return <span />;
  return (
    <a href={link.href} rel={rel} className={`pager__link pager__link--${rel}`}>
      <span className="pager__dir">{rel === "prev" ? "Previous" : "Next"}</span>
      <span className="pager__label">
        {link.label}
        {!link.local && <span className="visually-hidden"> (Storybook)</span>}
      </span>
    </a>
  );
}
