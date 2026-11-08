// Injects the server-rendered page into dist/index.html so the content is there without JavaScript.
import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const { render } = await import(pathToFileURL(join(root, "dist-ssr/entry-server.js")).href);
const file = join(root, "dist/index.html");
const html = readFileSync(file, "utf8").replace(
  '<div id="root"></div>',
  `<div id="root">${render()}</div>`,
);
writeFileSync(file, html);
rmSync(join(root, "dist-ssr"), { recursive: true, force: true });
console.log("prerendered dist/index.html");
