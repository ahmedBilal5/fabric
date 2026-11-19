// Prerenders the landing page and every docs page, so their text is in the HTML
// without JavaScript and the browser only hydrates them.
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const server = await import(pathToFileURL(join(root, "dist-ssr/entry-server.js")).href);
const SITE = "https://ahmedbilal5.github.io";
const base = process.env.SITE_BASE ?? "/fabric/";

const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// The landing page.
const index = join(dist, "index.html");
writeFileSync(
  index,
  readFileSync(index, "utf8").replace(
    '<div id="root"></div>',
    `<div id="root">${server.render()}</div>`,
  ),
);

// Docs pages: one folder per page, so URLs end in a slash and need no server rewrites.
const template = join(dist, "docs.html");
const html = readFileSync(template, "utf8").replace(
  "/*redirects*/ {}",
  JSON.stringify(server.redirects),
);
for (const slug of server.docsSlugs) {
  const { title, description } = server.docsHead(slug);
  const url = `${SITE}${base}docs/${slug ? `${slug}/` : ""}`;
  const head = [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(description)}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(description)}" />`,
  ].join("\n    ");
  const out = join(dist, "docs", slug, "index.html");
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(
    out,
    html
      .replace("<!--head-->", head)
      .replace('<div id="root"></div>', `<div id="root">${server.renderDocs(slug)}</div>`),
  );
}
rmSync(template);
rmSync(join(root, "dist-ssr"), { recursive: true, force: true });
console.log(`prerendered the landing page and ${server.docsSlugs.length} docs pages`);
