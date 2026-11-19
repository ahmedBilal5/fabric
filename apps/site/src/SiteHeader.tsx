import { Finder } from "./Finder";
import { docsUrl, EXAMPLE_APP_URL, GITHUB_URL } from "./links";

/** The site's top bar: wordmark, docs search and the main links. Shared by every page. */
export function SiteHeader({ current }: { current?: "docs" }) {
  return (
    <header className="nav">
      <div className="container nav__inner">
        <Wordmark />
        <Finder />
        <nav aria-label="Primary" className="nav__links">
          <a href={EXAMPLE_APP_URL}>Example app</a>
          <a href={docsUrl()} aria-current={current === "docs" ? "true" : undefined}>
            Docs
          </a>
          <a href={GITHUB_URL}>GitHub</a>
        </nav>
      </div>
    </header>
  );
}

function Wordmark() {
  return (
    <a className="wordmark" href={import.meta.env.BASE_URL} aria-label="Fabric home">
      <svg viewBox="0 0 48 48" width="28" height="28" aria-hidden="true">
        <g className="wordmark__weft">
          <rect x="6" y="12" width="36" height="6" rx="3" />
          <rect x="6" y="21" width="36" height="6" rx="3" />
          <rect x="6" y="30" width="36" height="6" rx="3" />
        </g>
        <g className="wordmark__warp">
          <rect x="12" y="6" width="6" height="36" rx="3" />
          <rect x="21" y="6" width="6" height="36" rx="3" />
          <rect x="30" y="6" width="6" height="36" rx="3" />
        </g>
        <g className="wordmark__weft">
          <rect x="10" y="12" width="10" height="6" />
          <rect x="28" y="12" width="10" height="6" />
          <rect x="19" y="21" width="10" height="6" />
          <rect x="10" y="30" width="10" height="6" />
          <rect x="28" y="30" width="10" height="6" />
        </g>
      </svg>
      Fabric
    </a>
  );
}
