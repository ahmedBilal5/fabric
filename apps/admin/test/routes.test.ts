import { describe, expect, it } from "vitest";
import { matchRoute, navKeyFor, routePath, splitLocation } from "../src/routes";

describe("splitLocation", () => {
  it("splits the path and query, normalising slashes", () => {
    const { path, search } = splitLocation("customers/?q=acme&status=trial");
    expect(path).toBe("/customers");
    expect(search.get("q")).toBe("acme");
    expect(search.get("status")).toBe("trial");
  });

  it("treats an empty location as the home page", () => {
    expect(splitLocation("").path).toBe("/");
  });
});

describe("matchRoute", () => {
  it.each([
    ["/", { name: "dashboard" }],
    ["/customers", { name: "customers" }],
    ["/customers/new", { name: "customer-new" }],
    ["/customers/c-1004", { name: "customer", id: "c-1004" }],
    ["/customers/c-1004/edit", { name: "customer-edit", id: "c-1004" }],
    ["/settings", { name: "settings", section: undefined }],
    ["/settings/appearance", { name: "settings", section: "appearance" }],
  ])("%s", (path, route) => {
    expect(matchRoute(path)).toEqual(route);
  });

  it("gives not-found for unknown paths", () => {
    expect(matchRoute("/invoices")).toEqual({ name: "not-found", path: "/invoices" });
    expect(matchRoute("/customers/c-1/edit/more")).toMatchObject({ name: "not-found" });
    expect(matchRoute("/settings/profile/extra")).toMatchObject({ name: "not-found" });
  });

  it("decodes encoded IDs", () => {
    expect(matchRoute("/customers/a%2Fb")).toEqual({ name: "customer", id: "a/b" });
  });
});

describe("routePath", () => {
  it("is the inverse of matchRoute", () => {
    for (const route of [
      { name: "dashboard" },
      { name: "customers" },
      { name: "customer-new" },
      { name: "customer", id: "a/b" },
      { name: "customer-edit", id: "c-1001" },
      { name: "settings", section: "profile" },
    ] as const) {
      expect(matchRoute(routePath(route))).toEqual(route);
    }
  });
});

describe("navKeyFor", () => {
  it("highlights Customers for every customer page", () => {
    expect(navKeyFor({ name: "customer-edit", id: "x" })).toBe("customers");
    expect(navKeyFor({ name: "customer-new" })).toBe("customers");
    expect(navKeyFor({ name: "not-found", path: "/x" })).toBeUndefined();
  });
});
