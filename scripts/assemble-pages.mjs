// Combines the landing site and Storybook into one GitHub Pages artifact:
//   _site/        <- apps/site/dist (served at /fabric/)
//   _site/docs/   <- storybook-static (served at /fabric/docs/)
import { cpSync, existsSync, rmSync, writeFileSync } from "node:fs";

const out = "_site";
for (const dir of ["apps/site/dist", "storybook-static"]) {
  if (!existsSync(dir))
    throw new Error(`Missing ${dir}. Run pnpm site:build and pnpm storybook:build first.`);
}
rmSync(out, { recursive: true, force: true });
cpSync("apps/site/dist", out, { recursive: true });
cpSync("storybook-static", `${out}/docs`, { recursive: true });
// GitHub Pages runs Jekyll by default, which drops files starting with "_" (Storybook ships some).
writeFileSync(`${out}/.nojekyll`, "");
console.log(`Pages artifact ready in ${out}/`);
