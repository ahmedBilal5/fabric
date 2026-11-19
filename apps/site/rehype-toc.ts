/**
 * A rehype plugin for the docs MDX: gives every h2 and h3 an id (for links and the
 * "On this page" list) and exports that list from the page module as `toc`.
 */

import { parse } from "acorn";
import { slugify } from "./docs-nav";

export interface TocItem {
  id: string;
  text: string;
  depth: 2 | 3;
}

interface HastNode {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
  data?: unknown;
}

function textOf(node: HastNode): string {
  if (node.type === "text") return node.value ?? "";
  return (node.children ?? []).map(textOf).join("");
}

function walk(node: HastNode, visit: (node: HastNode) => void) {
  visit(node);
  for (const child of node.children ?? []) walk(child, visit);
}

/** Ids for the headings, unique within the page (`usage`, `usage-1`, …). */
export function headingIds(texts: string[]): string[] {
  const seen = new Map<string, number>();
  return texts.map((text) => {
    const base = slugify(text) || "section";
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count ? `${base}-${count}` : base;
  });
}

export function rehypeToc() {
  return (tree: HastNode) => {
    const headings: HastNode[] = [];
    walk(tree, (node) => {
      if (node.type === "element" && (node.tagName === "h2" || node.tagName === "h3"))
        headings.push(node);
    });
    const texts = headings.map(textOf);
    const ids = headingIds(texts);
    const toc: TocItem[] = headings.map((node, i) => {
      node.properties = { ...node.properties, id: ids[i] };
      return { id: ids[i], text: texts[i].trim(), depth: node.tagName === "h2" ? 2 : 3 };
    });
    const value = `export const toc = ${JSON.stringify(toc)};`;
    tree.children?.unshift({
      type: "mdxjsEsm",
      value,
      data: { estree: parse(value, { ecmaVersion: "latest", sourceType: "module" }) },
    });
  };
}
