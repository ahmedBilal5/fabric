/**
 * `npm create @fabric-kit/app@latest [folder]`
 *
 * Asks for a folder when none is given, copies the starter template into it, and
 * prints the next steps for the package manager the user ran it with.
 */

import { readFileSync } from "node:fs";
import { basename, relative, resolve } from "node:path";
import { createInterface } from "node:readline/promises";
import { fileURLToPath } from "node:url";
import { detectPackageManager, scaffold, toPackageName, validateName } from "./scaffold.js";

const HELP = `Create a React app with Fabric.

Usage:
  npm create @fabric-kit/app@latest [folder]
  pnpm create @fabric-kit/app [folder]

The folder must be new or empty. Its name becomes the package name.

Options:
  -h, --help   Show this help
`;

async function ask(question: string, fallback: string): Promise<string> {
  if (!process.stdin.isTTY) return fallback;
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    const answer = (await rl.question(`${question} (${fallback}) `)).trim();
    return answer || fallback;
  } finally {
    rl.close();
  }
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes("-h") || args.includes("--help")) {
    process.stdout.write(HELP);
    return;
  }
  const unknown = args.find((a) => a.startsWith("-"));
  if (unknown) throw new Error(`Unknown option ${unknown}. Run with --help to see the options.`);

  const folder = args[0] ?? (await ask("Where should the app go?", "my-fabric-app"));
  const targetDir = resolve(process.cwd(), folder);
  const name = toPackageName(basename(targetDir));
  const problem = validateName(name);
  if (problem)
    throw new Error(`Can't make a package name from "${basename(targetDir)}". ${problem}`);

  const versions = JSON.parse(readFileSync(new URL("./versions.json", import.meta.url), "utf8"));
  const templateDir = fileURLToPath(new URL("../template", import.meta.url));
  const files = scaffold({ templateDir, targetDir, name, versions });

  const pm = detectPackageManager(process.env.npm_config_user_agent);
  const run = pm === "npm" ? "npm run" : pm;
  const where = relative(process.cwd(), targetDir) || ".";
  process.stdout.write(
    [
      "",
      `Created ${name} in ${where} (${files.length} files).`,
      "",
      "Next:",
      ...(where === "." ? [] : [`  cd ${where.includes(" ") ? `"${where}"` : where}`]),
      `  ${pm} install`,
      `  ${run} dev`,
      "",
      "Docs: https://ahmedbilal5.github.io/fabric/docs/",
      "",
    ].join("\n"),
  );
}

main().catch((error: unknown) => {
  process.stderr.write(`\n${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
});
