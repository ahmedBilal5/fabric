import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";
import {
  detectPackageManager,
  isEmptyDir,
  rewriteManifest,
  scaffold,
  TEMPLATE_NAME,
  toPackageName,
  validateName,
} from "../src/scaffold";

const realTemplate = fileURLToPath(new URL("../template", import.meta.url));
const temps: string[] = [];
const temp = () => {
  const dir = mkdtempSync(join(tmpdir(), "create-fabric-app-"));
  temps.push(dir);
  return dir;
};
afterEach(() => {
  for (const dir of temps.splice(0)) rmSync(dir, { recursive: true, force: true });
});

/** Every @fabric-kit package the real template uses, at a made-up version. */
function versionsFor(templateDir: string) {
  const pkg = JSON.parse(readFileSync(join(templateDir, "package.json"), "utf8"));
  return Object.fromEntries(
    Object.keys({ ...pkg.dependencies, ...pkg.devDependencies })
      .filter((d) => d.startsWith("@fabric-kit/"))
      .map((d) => [d, "1.2.3"]),
  );
}

describe("validateName", () => {
  it.each(["my-app", "app2", "@acme/admin", "a.b_c~d"])("accepts %s", (name) => {
    expect(validateName(name)).toBeNull();
  });

  it.each([
    ["", "Enter a name"],
    ["My-App", "lowercase"],
    [".hidden", "dot"],
    ["my app", "Use letters"],
    ["a".repeat(215), "214"],
  ])("rejects %j", (name, message) => {
    expect(validateName(name)).toContain(message);
  });
});

describe("toPackageName", () => {
  it("makes a valid name from a folder name", () => {
    expect(toPackageName("My Fabric App!")).toBe("my-fabric-app");
    expect(toPackageName("  _Admin  ")).toBe("admin");
    expect(validateName(toPackageName("Über Tool (v2)"))).toBeNull();
  });
});

describe("rewriteManifest", () => {
  const manifest = {
    name: TEMPLATE_NAME,
    version: "0.0.0",
    private: true,
    dependencies: { "@fabric-kit/theme": "workspace:^", react: "^18.3.1" },
    devDependencies: { vite: "^7.0.0" },
  };

  it("renames the app and pins workspace packages to published versions", () => {
    const out = rewriteManifest(manifest, "my-app", { "@fabric-kit/theme": "0.4.1" });
    expect(out).toMatchObject({
      name: "my-app",
      version: "0.1.0",
      private: true,
      dependencies: { "@fabric-kit/theme": "^0.4.1", react: "^18.3.1" },
      devDependencies: { vite: "^7.0.0" },
    });
  });

  it("fails loudly when a version is missing, instead of writing a broken range", () => {
    expect(() => rewriteManifest(manifest, "my-app", {})).toThrow("@fabric-kit/theme");
  });
});

describe("isEmptyDir", () => {
  it("allows a missing folder or one with only .git", () => {
    const dir = temp();
    expect(isEmptyDir(join(dir, "nope"))).toBe(true);
    mkdirSync(join(dir, ".git"));
    expect(isEmptyDir(dir)).toBe(true);
    writeFileSync(join(dir, "notes.txt"), "hi");
    expect(isEmptyDir(dir)).toBe(false);
  });
});

describe("scaffold", () => {
  it("copies the real template into a working app", () => {
    const target = join(temp(), "my-app");
    const files = scaffold({
      templateDir: realTemplate,
      targetDir: target,
      name: "my-app",
      versions: versionsFor(realTemplate),
    });

    expect(files).toEqual(
      expect.arrayContaining([
        ".gitignore",
        "index.html",
        "package.json",
        "README.md",
        "tsconfig.json",
        "vite.config.ts",
        join("src", "main.tsx"),
        join("src", "theme.ts"),
        join("src", "pages", "HomePage.tsx"),
        join("src", "pages", "ProjectsPage.tsx"),
        join("src", "pages", "ProjectPage.tsx"),
        join("src", "pages", "ProjectFormPage.tsx"),
        join("src", "pages", "SettingsPage.tsx"),
        join("src", "pages", "NotFoundPage.tsx"),
      ]),
    );
    expect(files.some((f) => f.includes("node_modules") || f.startsWith("dist"))).toBe(false);
    expect(existsSync(join(target, "_gitignore"))).toBe(false);

    const pkg = JSON.parse(readFileSync(join(target, "package.json"), "utf8"));
    expect(pkg.name).toBe("my-app");
    expect(JSON.stringify(pkg)).not.toContain("workspace:");
    expect(pkg.dependencies["@fabric-kit/patterns"]).toBe("^1.2.3");
    expect(readFileSync(join(target, "README.md"), "utf8")).toMatch(/^# my-app/);
    expect(readFileSync(join(target, "index.html"), "utf8")).toContain("<title>my-app</title>");
  });

  it("skips install and build output", () => {
    const template = temp();
    writeFileSync(join(template, "package.json"), JSON.stringify({ name: TEMPLATE_NAME }));
    for (const dir of ["node_modules/x", "dist", "src"])
      mkdirSync(join(template, dir), { recursive: true });
    writeFileSync(join(template, "node_modules/x/index.js"), "");
    writeFileSync(join(template, "dist/index.js"), "");
    writeFileSync(join(template, "tsconfig.tsbuildinfo"), "");
    writeFileSync(join(template, "src/main.ts"), "");
    const target = join(temp(), "app");
    expect(
      scaffold({ templateDir: template, targetDir: target, name: "app", versions: {} }),
    ).toEqual(["package.json", join("src", "main.ts")]);
  });

  it("refuses a folder that isn't empty, and a bad name", () => {
    const target = temp();
    writeFileSync(join(target, "keep.txt"), "");
    expect(() =>
      scaffold({
        templateDir: realTemplate,
        targetDir: target,
        name: "app",
        versions: versionsFor(realTemplate),
      }),
    ).toThrow("isn't empty");
    expect(() =>
      scaffold({
        templateDir: realTemplate,
        targetDir: join(target, "x"),
        name: "Bad Name",
        versions: {},
      }),
    ).toThrow("valid package name");
  });
});

describe("detectPackageManager", () => {
  it("reads npm_config_user_agent", () => {
    expect(detectPackageManager("pnpm/9.15.0 npm/? node/v22.0.0 linux x64")).toBe("pnpm");
    expect(detectPackageManager("yarn/4.1.0 npm/? node/v22.0.0")).toBe("yarn");
    expect(detectPackageManager("npm/10.8.0 node/v22.0.0")).toBe("npm");
    expect(detectPackageManager(undefined)).toBe("npm");
  });
});
