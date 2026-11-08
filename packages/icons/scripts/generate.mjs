/**
 * Builds `dist/` from `svg/*.svg` and `icons.manifest.json`. Icons in an optional `Logos`
 * category are read from `logos/` (multi-color brand marks), all others from `svg/`.
 *
 * Output: one `dist/<Name>.js` per icon, mirroring the `@mui/icons-material/<Name>` paths of the
 * installed MUI version. Fabric icons are `createSvgIcon` components; every other MUI icon is a
 * stub that re-exports MUI's. A Fabric icon replaces the MUI icon of the same name and its
 * Outlined/Rounded/Sharp/TwoTone variants. `dist/index.js` exports the Fabric set only.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const manifest = JSON.parse(readFileSync(join(root, "icons.manifest.json"), "utf8"));

/**
 * Optional default colors per icon name, for icons that should not follow `currentColor`.
 * Callers can still override via `color` / `htmlColor`. Empty by default.
 */
const DEFAULT_COLORS = {};

const NUMBERS = {
  1: "One",
  2: "Two",
  3: "Three",
  4: "Four",
  5: "Five",
  6: "Six",
  7: "Seven",
  8: "Eight",
  9: "Nine",
  10: "Ten",
  11: "Eleven",
  12: "Twelve",
  13: "Thirteen",
  14: "Fourteen",
  15: "Fifteen",
  16: "Sixteen",
  17: "Seventeen",
  18: "Eighteen",
  19: "Nineteen",
  20: "Twenty",
  21: "TwentyOne",
  22: "TwentyTwo",
  23: "TwentyThree",
  24: "TwentyFour",
  30: "Thirty",
  50: "Fifty",
  60: "Sixty",
  123: "OneTwoThree",
  360: "ThreeSixty",
};

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/** `snake_case` → PascalCase. A leading number becomes words, like MUI (`3d_rotation` → `ThreeDRotation`). */
function toPascalCase(name) {
  const [first, ...rest] = name.split("_");
  const lead = first.match(/^(\d+)(.*)$/);
  let head = cap(first);
  if (lead) {
    const word = NUMBERS[lead[1]];
    if (!word) throw new Error(`No word for leading number in "${name}"`);
    head = word + cap(lead[2]);
  }
  return head + rest.map(cap).join("");
}

const ATTRS = { "fill-rule": "fillRule", "clip-rule": "clipRule" };

function styleToObject(style) {
  return Object.fromEntries(
    style
      .split(";")
      .filter(Boolean)
      .map((decl) => {
        const i = decl.indexOf(":");
        const key = decl
          .slice(0, i)
          .trim()
          .replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        return [key, decl.slice(i + 1).trim()];
      }),
  );
}

/** Turns the body of one SVG file into `jsx(...)` calls. */
function toJsx(svg) {
  const elements = [...svg.matchAll(/<(path|rect|circle)\s([^>]*?)\/>/g)].map(([, tag, attrs]) => {
    const props = {};
    for (const [, key, value] of attrs.matchAll(/([\w-]+)="([^"]*)"/g)) {
      if (key === "style") props.style = styleToObject(value);
      else props[ATTRS[key] ?? key] = value;
    }
    return { tag, props };
  });
  if (elements.length === 0) throw new Error("SVG has no drawable elements");
  const call = ({ tag, props }, key) =>
    `/*#__PURE__*/_jsx("${tag}", ${JSON.stringify(props)}${key === undefined ? "" : `, "${key}"`})`;
  return elements.length === 1 ? call(elements[0]) : `[${elements.map(call).join(", ")}]`;
}

function iconModule(name, pascal, svg) {
  const lines = [
    '"use client";',
    'import { createSvgIcon } from "@mui/material/SvgIcon";',
    'import { jsx as _jsx } from "react/jsx-runtime";',
  ];
  const color = DEFAULT_COLORS[name];
  if (!color) {
    lines.push(`export default createSvgIcon(${toJsx(svg)}, "${pascal}");`);
  } else {
    lines.push(
      'import { forwardRef } from "react";',
      `const Base = createSvgIcon(${toJsx(svg)}, "${pascal}");`,
      `const ${pascal} = forwardRef(function ${pascal}(props, ref) {`,
      `  return _jsx(Base, { htmlColor: "${color}", ...props, ref });`,
      "});",
      `${pascal}.muiName = Base.muiName;`,
      `export default ${pascal};`,
    );
  }
  return `${lines.join("\n")}\n`;
}

const VARIANTS = ["Outlined", "Rounded", "Sharp", "TwoTone"];

const require = createRequire(import.meta.url);
// MUI's `exports` map hides package.json, so locate the package through a known icon.
const muiDir = dirname(require.resolve("@mui/icons-material/Add"));
const muiNames = readdirSync(muiDir)
  .filter((f) => f.endsWith(".js") && !f.endsWith(".mjs") && f !== "index.js")
  .map((f) => f.slice(0, -3))
  .filter((n) => /^[A-Z0-9]/.test(n) && existsSync(join(muiDir, `${n}.d.ts`)));

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

const seen = new Map();
const categories = {};
const icons = [];
for (const [category, names] of Object.entries(manifest)) {
  categories[category] = [];
  for (const name of names) {
    const pascal = toPascalCase(name);
    // File names must stay unique on case-insensitive file systems.
    const lower = pascal.toLowerCase();
    if (seen.has(lower) || lower === "index") {
      throw new Error(`Name clash: ${name} → ${pascal} (with ${seen.get(lower) ?? "index"})`);
    }
    seen.set(lower, name);
    categories[category].push(pascal);
    icons.push(pascal);
    const folder = category === "Logos" ? "logos" : "svg";
    const svg = readFileSync(join(root, folder, `${name}.svg`), "utf8");
    writeFileSync(join(dist, `${pascal}.js`), iconModule(name, pascal, svg));
  }
}

// Fabric variants: a Fabric `N` also replaces MUI's `N<Variant>` unless Fabric defines that itself.
const written = new Set(icons);
const muiSet = new Set(muiNames);
const lowerWritten = new Set(icons.map((n) => n.toLowerCase()));
let variantOverrides = 0;
for (const pascal of icons) {
  for (const variant of VARIANTS) {
    const alias = pascal + variant;
    if (written.has(alias) || !muiSet.has(alias)) continue;
    writeFileSync(join(dist, `${alias}.js`), `export { default } from "./${pascal}.js";\n`);
    written.add(alias);
    lowerWritten.add(alias.toLowerCase());
    variantOverrides++;
  }
}

let stubs = 0;
for (const name of muiNames) {
  if (written.has(name)) continue;
  if (lowerWritten.has(name.toLowerCase())) {
    // Differs only by case from a Fabric icon (e.g. Addchart vs AddChart); Fabric wins.
    console.warn(`Skipped MUI icon ${name}: case-insensitive clash with a Fabric icon`);
    continue;
  }
  writeFileSync(
    join(dist, `${name}.js`),
    `export { default } from "@mui/icons-material/${name}";\n`,
  );
  stubs++;
}

// Every icon module shares this type; package.json `exports` points all subpaths at it.
writeFileSync(join(dist, "icon.d.ts"), "export { default } from '@mui/material/SvgIcon';\n");

const reexports = icons.map((n) => `export { default as ${n} } from "./${n}.js";`).join("\n");
const typeReexports = icons.map((n) => `export { default as ${n} } from "./icon.js";`).join("\n");
writeFileSync(join(dist, "index.js"), `${reexports}\n`);
writeFileSync(join(dist, "index.d.ts"), `${typeReexports}\n`);

// Gallery data: category names only, plus one lazy module per category so the gallery loads icons on demand.
const slug = (category) => category.toLowerCase().replace(/[^a-z0-9]+/g, "-");
mkdirSync(join(dist, "categories"), { recursive: true });
for (const [category, names] of Object.entries(categories)) {
  writeFileSync(
    join(dist, "categories", `${slug(category)}.js`),
    `${names.map((n) => `export { default as ${n} } from "../${n}.js";`).join("\n")}\n`,
  );
}
writeFileSync(
  join(dist, "fabric-icons.js"),
  `export const fabricIconCategories = ${JSON.stringify(categories)};\n`,
);
writeFileSync(
  join(dist, "fabric-icons.d.ts"),
  "export declare const fabricIconCategories: Record<string, string[]>;\n",
);
const loaders = Object.keys(categories)
  .map((c) => `  ${JSON.stringify(c)}: () => import("./categories/${slug(c)}.js"),`)
  .join("\n");
writeFileSync(
  join(dist, "fabric-icon-loaders.js"),
  `export const fabricIconLoaders = {\n${loaders}\n};\n`,
);
writeFileSync(
  join(dist, "fabric-icon-loaders.d.ts"),
  `import type { ComponentType } from "react";
import type { SvgIconProps } from "@mui/material/SvgIcon";
export declare const fabricIconLoaders: Record<
  string,
  () => Promise<Record<string, ComponentType<SvgIconProps>>>
>;
`,
);

console.log(
  `Generated ${icons.length} Fabric icons, ${variantOverrides} variant overrides, ${stubs} MUI stubs.`,
);
