import { type AnchorHTMLAttributes, createElement, type MouseEvent } from "react";
import { NAVIGATE_URL } from "storybook/internal/core-events";
import { addons } from "storybook/preview-api";

export interface DocLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  /** Storybook path, e.g. `/docs/foundations-installation--docs`. */
  to: string;
}

/**
 * A link between Storybook pages for JSX in MDX. A plain `<a href="?path=…">` loads
 * the page inside the preview frame, without the sidebar. This asks the manager to
 * navigate instead, like Storybook's own markdown links. Modified clicks
 * (new tab, etc.) still get a real URL to the manager.
 */
export function DocLink({ to, onClick, ...rest }: DocLinkProps) {
  const query = `?path=${to}`;
  // createElement, not JSX: files in .storybook/ use the classic JSX transform.
  return createElement("a", {
    ...rest,
    href: `./${query}`,
    target: "_top",
    onClick: (event: MouseEvent<HTMLAnchorElement>) => {
      onClick?.(event);
      if (event.defaultPrevented) return;
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
        return;
      event.preventDefault();
      addons.getChannel().emit(NAVIGATE_URL, query);
    },
  });
}
