import { knownIds, redirects } from "virtual:docs-index";
import { type ComponentProps, type ReactNode, useRef, useState } from "react";
import { resolveDocsLink } from "../../docs-nav";

const base = import.meta.env.BASE_URL;

/** Links in a docs page. Storybook-style `?path=/docs/<id>` links go to the moved page or to Storybook. */
function A({ href = "", children, ...rest }: ComponentProps<"a">) {
  const to = resolveDocsLink(href, { redirects }, knownIds, base);
  // Fails the prerender, so a typo in a docs link can't ship.
  if (to === undefined) throw new Error(`Docs link to a page that doesn't exist: ${href}`);
  const external = /^https?:\/\//.test(to);
  return (
    <a href={to} {...rest} {...(external ? { rel: "noreferrer" } : {})}>
      {children}
    </a>
  );
}

function heading(Tag: "h2" | "h3") {
  return function Heading({ id, children, ...rest }: ComponentProps<"h2">) {
    return (
      <Tag id={id} {...rest}>
        {children}
        {id && (
          <a className="prose__anchor" href={`#${id}`}>
            <span aria-hidden="true">#</span>
            <span className="visually-hidden">Link to this section</span>
          </a>
        )}
      </Tag>
    );
  };
}

/** Code blocks: the highlighted code from Shiki, with a copy button. */
function Pre({ children, ...rest }: ComponentProps<"pre">) {
  const [copied, setCopied] = useState(false);
  const pre = useRef<HTMLPreElement>(null);
  return (
    <div className="code">
      {/* biome-ignore lint/a11y/noNoninteractiveTabindex: lets keyboard users scroll long lines */}
      <pre ref={pre} {...rest} tabIndex={0}>
        {children}
      </pre>
      <button
        type="button"
        className="code__copy"
        onClick={async () => {
          await navigator.clipboard?.writeText(pre.current?.textContent ?? "");
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
      >
        {copied ? "Copied" : "Copy"}
        <span className="visually-hidden"> code</span>
      </button>
      <span role="status" className="visually-hidden">
        {copied ? "Code copied" : ""}
      </span>
    </div>
  );
}

/** Wide tables scroll inside the column instead of the page. */
function Table(props: ComponentProps<"table">) {
  return (
    // biome-ignore lint/a11y/noNoninteractiveTabindex: lets keyboard users scroll a wide table
    <div className="prose__table" tabIndex={0}>
      <table {...props} />
    </div>
  );
}

export const mdxComponents: Record<string, (props: { children?: ReactNode }) => ReactNode> = {
  a: A,
  h2: heading("h2"),
  h3: heading("h3"),
  pre: Pre,
  table: Table,
};
