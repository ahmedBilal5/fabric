import { describe, expect, it } from "vitest";
import {
  buildDocs,
  compareTitles,
  navLabel,
  parseFrontmatter,
  resolveDocsLink,
  type SitePage,
  sitePageFrom,
  slugify,
  storybookHref,
  toStoryId,
} from "../docs-nav";
import { headingIds } from "../rehype-toc";

const BASE = "/fabric/";

const page = (over: Partial<SitePage>): SitePage => ({
  slug: "foundations/installation",
  nav: "Foundations/Installation",
  title: "Installation",
  description: "Add Fabric to an app.",
  file: "apps/site/content/docs/foundations/installation.mdx",
  replaces: ["foundations-installation--docs"],
  ...over,
});

describe("slugify", () => {
  it("lowercases and joins words with dashes", () => {
    expect(slugify("1. Install the core")).toBe("1-install-the-core");
    expect(slugify("Next.js (App Router)")).toBe("next-js-app-router");
    expect(slugify("The `sx` prop")).toBe("the-sx-prop");
    expect(slugify("Don’t stop")).toBe("dont-stop");
  });
});

describe("headingIds", () => {
  it("makes repeated headings unique", () => {
    expect(headingIds(["Usage", "Props", "Usage", "Usage"])).toEqual([
      "usage",
      "props",
      "usage-1",
      "usage-2",
    ]);
  });
  it("never returns an empty id", () => {
    expect(headingIds(["…"])).toEqual(["section"]);
  });
});

describe("toStoryId", () => {
  it("matches Storybook's ids", () => {
    expect(toStoryId("Foundations/Bundle Size", "Docs")).toBe("foundations-bundle-size--docs");
    expect(toStoryId("Components/FabricButton", "Overview")).toBe(
      "components-fabricbutton--overview",
    );
  });
});

describe("navLabel", () => {
  it("drops the section, Overview and the Fabric prefix", () => {
    expect(navLabel("Components/FabricButton")).toBe("Button");
    expect(navLabel("Components/useToast")).toBe("useToast");
    expect(navLabel("Foundations/Design Tokens/Overview")).toBe("Design Tokens");
    expect(navLabel("Kits/Layout/FabricPageHeader")).toBe("Layout / PageHeader");
    expect(navLabel("Kits/Overview")).toBe("Overview");
    expect(navLabel("Primitives")).toBe("Overview");
  });
  it("doesn't repeat a name", () => {
    expect(navLabel("Kits/Canvas Builder/FabricCanvasBuilder/Overview")).toBe("Canvas Builder");
  });
});

describe("compareTitles", () => {
  const sort = (titles: string[]) => [...titles].sort((a, b) => compareTitles(a, b));
  it("follows the Storybook order, then the alphabet", () => {
    expect(
      sort([
        "Kits/Overview",
        "Components/FabricTag",
        "Foundations/Bundle Size",
        "Components/FabricAlert",
        "Foundations/Welcome",
        "Foundations/Hooks and formatting",
        "Foundations/Installation",
      ]),
    ).toEqual([
      "Foundations/Welcome",
      "Foundations/Installation",
      "Foundations/Bundle Size",
      "Foundations/Hooks and formatting",
      "Components/FabricAlert",
      "Components/FabricTag",
      "Kits/Overview",
    ]);
  });
  it("puts a parent before its children and nested order applies", () => {
    expect(
      sort(["Kits/Layout/FabricPageHeader", "Kits/Layout/Overview", "Kits/Layout/FabricAppShell"]),
    ).toEqual([
      "Kits/Layout/Overview",
      "Kits/Layout/FabricAppShell",
      "Kits/Layout/FabricPageHeader",
    ]);
    expect(sort(["Primitives/FabricFlex", "Primitives"])).toEqual([
      "Primitives",
      "Primitives/FabricFlex",
    ]);
  });
  it("puts unknown sections at the star", () => {
    expect(sort(["Kits/Overview", "Zebra/Thing", "Charts/Introduction"])).toEqual([
      "Charts/Introduction",
      "Zebra/Thing",
      "Kits/Overview",
    ]);
  });
});

describe("parseFrontmatter and sitePageFrom", () => {
  const src = `---\ntitle: Bundle size\ndescription: "Keep it small: here's how."\nnav: Foundations/Bundle Size\nreplaces: [a--docs, 'b--overview']\n---\n\nBody`;
  it("reads strings, quoted strings and lists", () => {
    expect(parseFrontmatter(src)).toEqual({
      title: "Bundle size",
      description: "Keep it small: here's how.",
      nav: "Foundations/Bundle Size",
      replaces: ["a--docs", "b--overview"],
    });
  });
  it("defaults replaces to the Storybook docs id of nav", () => {
    const p = sitePageFrom("x.mdx", "x", src.replace(/replaces:.*\n/, ""));
    expect(p.replaces).toEqual(["foundations-bundle-size--docs"]);
  });
  it("throws when a field is missing", () => {
    expect(() => sitePageFrom("x.mdx", "x", "---\ntitle: X\n---\n")).toThrow(/needs a "nav"/);
  });
});

describe("buildDocs", () => {
  const stories = [
    { title: "Foundations/Installation", id: "foundations-installation--docs" },
    { title: "Foundations/Welcome", id: "foundations-welcome--docs" },
    { title: "Foundations/Theming", id: "foundations-theming--docs" },
    { title: "Components/FabricButton", id: "components-fabricbutton--overview" },
  ];
  const data = buildDocs(stories, [page({})], BASE);

  it("groups and sorts every page, with moved pages local", () => {
    expect(data.sections.map((s) => s.title)).toEqual(["Foundations", "Components"]);
    expect(data.sections[0].items.map((i) => [i.label, i.local, i.href])).toEqual([
      ["Welcome", false, "/fabric/storybook/?path=/docs/foundations-welcome--docs"],
      ["Installation", true, "/fabric/docs/foundations/installation/"],
      ["Theming", false, "/fabric/storybook/?path=/docs/foundations-theming--docs"],
    ]);
  });
  it("redirects the replaced Storybook id", () => {
    expect(data.redirects).toEqual({
      "foundations-installation--docs": "/fabric/docs/foundations/installation/",
    });
  });
  it("links each page to its neighbours, across sections", () => {
    const meta = data.pages["foundations/installation"];
    expect(meta.prev?.label).toBe("Welcome");
    expect(meta.next).toEqual({
      label: "Theming",
      href: "/fabric/storybook/?path=/docs/foundations-theming--docs",
      local: false,
    });
    expect(meta.section).toBe("Foundations");
  });
  it("rejects two pages in the same place", () => {
    expect(() => buildDocs([], [page({}), page({ slug: "other" })], BASE)).toThrow(
      /Two docs pages/,
    );
  });
});

describe("resolveDocsLink", () => {
  const data = {
    redirects: { "foundations-bundle-size--docs": "/fabric/docs/foundations/bundle-size/" },
  };
  const known = new Set(["foundations-theming--docs"]);
  const resolve = (href: string) => resolveDocsLink(href, data, known, BASE);

  it("sends moved pages to the docs site, keeping the hash", () => {
    expect(resolve("?path=/docs/foundations-bundle-size--docs#4-chunks")).toBe(
      "/fabric/docs/foundations/bundle-size/#4-chunks",
    );
  });
  it("sends other docs pages to Storybook", () => {
    expect(resolve("?path=/docs/foundations-theming--docs")).toBe(
      storybookHref(BASE, "foundations-theming--docs"),
    );
  });
  it("sends single stories to Storybook without checking them", () => {
    expect(resolve("?path=/story/components-fabricbutton--primary")).toBe(
      "/fabric/storybook/?path=/story/components-fabricbutton--primary",
    );
  });
  it("returns undefined for a docs page that doesn't exist", () => {
    expect(resolve("?path=/docs/nope--docs")).toBeUndefined();
  });
  it("leaves other links alone", () => {
    expect(resolve("https://mui.com")).toBe("https://mui.com");
    expect(resolve("#requirements")).toBe("#requirements");
  });
});
