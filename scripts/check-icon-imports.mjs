// Fails when code imports an icon that @fabric-kit/icons doesn't generate.
// The icon types use a wildcard module, so TypeScript can't catch a wrong name;
// without this check it only fails at bundle time.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const roots = ["packages", "apps", "docs"];
const skip = new Set(["node_modules", "dist", "storybook-static", ".turbo"]);
const iconDist = "packages/icons/dist";
const pattern = /@fabric-kit\/icons\/([A-Za-z0-9]+)/g;
const missing = [];

if (!existsSync(iconDist)) {
  console.log(
    "check-icon-imports: packages/icons/dist not built yet; run pnpm build first. Skipping.",
  );
  process.exit(0);
}

function walk(dir) {
  for (const name of readdirSync(dir)) {
    if (skip.has(name)) continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path);
    else if (/\.(tsx?|mdx)$/.test(name)) {
      for (const [, icon] of readFileSync(path, "utf8").matchAll(pattern)) {
        if (!existsSync(join(iconDist, `${icon}.js`))) missing.push(`${path}: ${icon}`);
      }
    }
  }
}
for (const root of roots) if (existsSync(root)) walk(root);

if (missing.length) {
  console.error(
    `Unknown icons (check the name in Foundations > Icons):\n  ${missing.join("\n  ")}`,
  );
  process.exit(1);
}
console.log("check-icon-imports: all icon imports resolve.");
