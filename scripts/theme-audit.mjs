// Theme audit: renders every Storybook story in several brand/mode combos and records
// render errors, axe color-contrast violations, Fabric-clay leaks into other brands and
// light surfaces in dark mode. Usage (after `pnpm storybook:build` and serving it):
//   node scripts/theme-audit.mjs http://localhost:6006 audit.json [story-id-filter]
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { chromium } from "playwright";

const [base, out, only] = process.argv.slice(2);
const axeSource = readFileSync(
  createRequire(import.meta.url).resolve("axe-core/axe.min.js"),
  "utf8",
);
const index = JSON.parse(readFileSync("storybook-static/index.json", "utf8")).entries;
let stories = Object.values(index).filter((e) => e.type === "story");
if (only) stories = stories.filter((s) => s.id.includes(only));
const COMBOS = [
  { brand: "fabric", mode: "light" },
  { brand: "fabric", mode: "dark" },
  { brand: "ocean", mode: "light" },
  { brand: "ocean", mode: "dark" },
];
// Fabric's clay family: should never appear when another brand is active.
const CLAY = [
  "178, 62, 42",
  "154, 51, 34",
  "224, 122, 95",
  "235, 142, 116",
  "242, 176, 157",
  "246, 231, 226",
  "127, 42, 28",
];

const browser = await chromium.launch();
const results = [];
const jobs = [];
for (const s of stories) for (const c of COMBOS) jobs.push({ s, c });
let next = 0;
const started = Date.now();

async function worker() {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  await page.addInitScript(() => {
    const mode = new URL(location.href).searchParams.get("auditMode");
    if (mode) localStorage.setItem("sb-addon-themes-3", JSON.stringify({ current: mode }));
  });
  while (next < jobs.length) {
    const { s, c } = jobs[next++];
    const errors = [];
    const onErr = (e) => errors.push(String(e).slice(0, 200));
    const onCon = (m) => {
      if (m.type() === "error") errors.push(m.text().slice(0, 200));
    };
    page.on("pageerror", onErr);
    page.on("console", onCon);
    const url = `${base}/iframe.html?id=${s.id}&viewMode=story&globals=brand:${c.brand}&auditMode=${c.mode}`;
    let data = null;
    try {
      await page.goto(url, { waitUntil: "load", timeout: 45000 });
      await page
        .waitForFunction(
          () =>
            document.querySelector("#storybook-root")?.childElementCount > 0 ||
            document.querySelector(".sb-show-errordisplay"),
          null,
          { timeout: 20000 },
        )
        .catch(() => {});
      await page.waitForTimeout(700);
      await page.addScriptTag({ content: axeSource });
      data = await page.evaluate(
        async ({ clay, brand, mode }) => {
          const root = document.querySelector("#storybook-root");
          const htmlMode = document.documentElement.classList.contains("dark") ? "dark" : "light";
          const axeRes = await window.axe.run(document, {
            runOnly: ["color-contrast"],
            resultTypes: ["violations"],
          });
          const contrast = axeRes.violations.flatMap((v) =>
            v.nodes.map((n) => ({
              target: n.target.join(" "),
              summary: (n.any[0]?.message || "").slice(0, 140),
            })),
          );
          const visible = (el) => {
            const r = el.getBoundingClientRect();
            const cs = getComputedStyle(el);
            return r.width > 2 && r.height > 2 && cs.visibility !== "hidden" && cs.opacity !== "0";
          };
          const desc = (el) =>
            `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ""}.${[...el.classList]
              .filter((c) => !c.startsWith("css-"))
              .slice(0, 3)
              .join(".")}`;
          const leaks = new Map();
          const lightInDark = new Map();
          const all = [...document.querySelectorAll("body *")].filter(
            (el) => !el.closest("script,style") && visible(el),
          );
          for (const el of all) {
            const cs = getComputedStyle(el);
            if (brand !== "fabric") {
              for (const prop of [
                "color",
                "backgroundColor",
                "borderTopColor",
                "fill",
                "stroke",
                "outlineColor",
              ]) {
                const v = cs[prop] || "";
                if (prop.startsWith("border") && cs.borderTopWidth === "0px") continue;
                if (prop === "outlineColor" && cs.outlineStyle === "none") continue;
                if (clay.some((c) => v.includes(c))) {
                  const k = `${desc(el)} ${prop}=${v}`;
                  leaks.set(k, (leaks.get(k) || 0) + 1);
                }
              }
            }
            if (mode === "dark") {
              const m = cs.backgroundColor.match(
                /rgba?\(([\d.]+), ([\d.]+), ([\d.]+)(?:, ([\d.]+))?/,
              );
              if (m && (m[4] === undefined || +m[4] > 0.5)) {
                const lum = (0.2126 * m[1] + 0.7152 * m[2] + 0.0722 * m[3]) / 255;
                const r = el.getBoundingClientRect();
                if (lum > 0.82 && r.width * r.height > 900) {
                  const k = `${desc(el)} bg=${cs.backgroundColor}`;
                  lightInDark.set(k, (lightInDark.get(k) || 0) + 1);
                }
              }
            }
          }
          return {
            htmlMode,
            empty: !root || root.childElementCount === 0,
            contrast,
            leaks: [...leaks.keys()].slice(0, 15),
            lightInDark: [...lightInDark.keys()].slice(0, 15),
          };
        },
        { clay: CLAY, brand: c.brand, mode: c.mode },
      );
    } catch (e) {
      errors.push(`AUDIT: ${String(e).slice(0, 160)}`);
    }
    page.off("pageerror", onErr);
    page.off("console", onCon);
    results.push({ id: s.id, title: s.title, name: s.name, ...c, errors, ...(data || {}) });
    if (results.length % 100 === 0) {
      console.log(
        `${results.length}/${jobs.length} in ${Math.round((Date.now() - started) / 1000)}s`,
      );
      writeFileSync(out, JSON.stringify(results));
    }
  }
  await ctx.close();
}

await Promise.all(Array.from({ length: 6 }, worker));
writeFileSync(out, JSON.stringify(results));
console.log(`done ${results.length} renders in ${Math.round((Date.now() - started) / 1000)}s`);
await browser.close();
