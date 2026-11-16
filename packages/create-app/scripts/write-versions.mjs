// Records the current version of every public @fabric-kit package in dist/versions.json.
// The CLI swaps the template's `workspace:^` ranges for these, so a new app installs
// the versions published alongside this release of @fabric-kit/create-app.
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const packagesDir = join(here, "..", "..");
const skip = new Set(["node_modules", "dist", "template", ".turbo"]);
const versions = {};

function walk(dir, depth) {
  const manifest = join(dir, "package.json");
  if (existsSync(manifest)) {
    const pkg = JSON.parse(readFileSync(manifest, "utf8"));
    if (pkg.name?.startsWith("@fabric-kit/") && !pkg.private) versions[pkg.name] = pkg.version;
  }
  if (depth === 0) return;
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (!skip.has(name) && statSync(path).isDirectory()) walk(path, depth - 1);
  }
}
walk(packagesDir, 2);

const sorted = Object.fromEntries(Object.entries(versions).sort(([a], [b]) => a.localeCompare(b)));
writeFileSync(join(here, "..", "dist", "versions.json"), `${JSON.stringify(sorted, null, 2)}\n`);
console.log(`@fabric-kit/create-app: recorded ${Object.keys(sorted).length} package versions`);
