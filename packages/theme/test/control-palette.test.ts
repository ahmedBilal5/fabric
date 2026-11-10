import { describe, expect, it } from "vitest";
import { createFabricTheme, theme } from "../src";

const control = (t: typeof theme, scheme: "light" | "dark") =>
  t.colorSchemes[scheme]?.palette.control;

describe("palette.control", () => {
  it("keeps Fabric's own control colors", () => {
    expect(control(theme, "light")).toEqual({
      label: "#6B625A",
      labelHover: "#4A423C",
      underline: "#BFB8B0",
      disabled: "#D4CCC3",
    });
    expect(control(theme, "dark")?.label).toBe("#B5ACA3");
  });

  it("derives control colors from a brand's text and divider colors", () => {
    const brand = createFabricTheme({
      colorSchemes: {
        light: {
          palette: {
            text: { primary: "#1B2430", secondary: "#4F5B6B", disabled: "#97A3B3" },
            divider: "#D9E1EB",
          },
        },
      },
    });
    const c = control(brand, "light");
    expect(c?.label).toBe("#4F5B6B");
    // Each derived color sits between the two colors it mixes.
    expect(c?.labelHover).toBe("rgb(50, 61, 75)");
    expect(c?.underline).toBe("rgb(177, 188, 201)");
    expect(c?.disabled).toBe("rgb(191, 200, 213)");
    // The dark scheme was not overridden, so it keeps Fabric's colors.
    expect(control(brand, "dark")?.label).toBe("#B5ACA3");
  });

  it("lets an explicit control color win over the derived one", () => {
    const brand = createFabricTheme({
      colorSchemes: {
        light: { palette: { divider: "#D9E1EB", control: { disabled: "#CCCCCC" } } },
      },
    });
    expect(control(brand, "light")?.disabled).toBe("#CCCCCC");
  });

  it("leaves control colors alone when only the primary color changes", () => {
    const brand = createFabricTheme({
      colorSchemes: { light: { palette: { primary: { main: "#1F6FB2" } } } },
    });
    expect(control(brand, "light")).toEqual(control(theme, "light"));
  });
});
