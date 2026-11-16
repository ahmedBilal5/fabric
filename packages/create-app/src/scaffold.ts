/**
 * Copies the starter template into a new folder and turns it into the user's app:
 * the package gets their name, `workspace:^` ranges become published versions, and
 * `_gitignore` becomes `.gitignore` (npm drops `.gitignore` files from packages).
 */

import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { join, relative } from "node:path";

/** The template's own package name, replaced with the user's everywhere it appears. */
export const TEMPLATE_NAME = "fabric-app-template";

/** Never copied: install and build output from developing the template in the monorepo. */
const SKIP = new Set(["node_modules", "dist", ".turbo", ".vite"]);
const RENAME: Record<string, string> = { _gitignore: ".gitignore" };
/** Files where the template's name is replaced with the app's. */
const TEXT = /\.(json|md|html)$/;

/**
 * Why a package name is invalid, or `null` when it's fine. Follows npm's rules:
 * lowercase, URL-safe, at most 214 characters, optionally scoped.
 */
export function validateName(name: string): string | null {
  if (!name) return "Enter a name for the app.";
  if (name.length > 214) return "Use 214 characters or fewer.";
  if (name !== name.toLowerCase()) return "Use lowercase letters only.";
  if (/^[._]/.test(name)) return "Don't start the name with a dot or an underscore.";
  if (!/^(?:@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/.test(name))
    return "Use letters, numbers, dashes, dots and underscores only.";
  return null;
}

/** A valid package name from a folder name: `My App!` → `my-app`. */
export function toPackageName(folder: string): string {
  return folder
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-._~]/g, "")
    .replace(/^[._-]+/, "")
    .replace(/-+/g, "-");
}

/** True when the folder doesn't exist, or holds nothing but a `.git` folder. */
export function isEmptyDir(dir: string): boolean {
  if (!existsSync(dir)) return true;
  return readdirSync(dir).every((name) => name === ".git");
}

type Manifest = Record<string, unknown> & {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

/**
 * The template's package.json for a new app: renamed, version 0.1.0, and every
 * `workspace:` range replaced with `^<version>` from `versions`.
 */
export function rewriteManifest(
  manifest: Manifest,
  name: string,
  versions: Record<string, string>,
): Manifest {
  const pin = (deps?: Record<string, string>) => {
    if (!deps) return deps;
    return Object.fromEntries(
      Object.entries(deps).map(([dep, range]) => {
        if (!range.startsWith("workspace:")) return [dep, range];
        const version = versions[dep];
        if (!version) throw new Error(`No published version recorded for ${dep}.`);
        return [dep, `^${version}`];
      }),
    );
  };
  return {
    ...manifest,
    name,
    version: "0.1.0",
    dependencies: pin(manifest.dependencies),
    devDependencies: pin(manifest.devDependencies),
  };
}

export interface ScaffoldOptions {
  /** The template folder. */
  templateDir: string;
  /** Where the app goes. Created if needed; must be empty. */
  targetDir: string;
  /** The app's package name. */
  name: string;
  /** Published versions of the `@fabric-kit/*` packages. */
  versions: Record<string, string>;
}

/** Writes the app and returns the files it created, relative to `targetDir`. */
export function scaffold({ templateDir, targetDir, name, versions }: ScaffoldOptions): string[] {
  const problem = validateName(name);
  if (problem) throw new Error(`"${name}" isn't a valid package name. ${problem}`);
  if (!isEmptyDir(targetDir)) throw new Error(`${targetDir} isn't empty. Pick a new folder.`);

  const written: string[] = [];
  const copy = (from: string, to: string) => {
    mkdirSync(to, { recursive: true });
    for (const entry of readdirSync(from)) {
      if (SKIP.has(entry) || entry.endsWith(".tsbuildinfo")) continue;
      const source = join(from, entry);
      const target = join(to, RENAME[entry] ?? entry);
      if (statSync(source).isDirectory()) {
        copy(source, target);
      } else if (entry === "package.json" && from === templateDir) {
        const manifest = JSON.parse(readFileSync(source, "utf8")) as Manifest;
        writeFileSync(
          target,
          `${JSON.stringify(rewriteManifest(manifest, name, versions), null, 2)}\n`,
        );
        written.push(relative(targetDir, target));
      } else if (TEXT.test(entry)) {
        writeFileSync(target, readFileSync(source, "utf8").replaceAll(TEMPLATE_NAME, name));
        written.push(relative(targetDir, target));
      } else {
        copyFileSync(source, target);
        written.push(relative(targetDir, target));
      }
    }
  };
  copy(templateDir, targetDir);
  return written.sort();
}

/** The package manager that ran us, from `npm_config_user_agent` (e.g. "pnpm/9.15.0 …"). */
export function detectPackageManager(userAgent = ""): "npm" | "pnpm" | "yarn" | "bun" {
  const name = userAgent.split("/")[0];
  return name === "pnpm" || name === "yarn" || name === "bun" ? name : "npm";
}
