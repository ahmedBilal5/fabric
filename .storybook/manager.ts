import { addons } from "storybook/manager-api";
import { create } from "storybook/theming/create";

addons.setConfig({
  sidebar: {
    showRoots: true,
  },
  theme: create({
    base: "light",
    brandTitle: "Fabric",
    brandUrl: "../",
    brandImage: "./fabric-logo.svg",
    brandTarget: "_self",

    colorPrimary: "#B23E2A",
    colorSecondary: "#E07A5F",

    appBg: "#F8F6F3",
    appContentBg: "#ffffff",
    appBorderColor: "#E6E1DB",
    appBorderRadius: 8,

    textColor: "#2E2925",
    textInverseColor: "#ffffff",
    textMutedColor: "#6E655D",

    barTextColor: "#6E655D",
    barSelectedColor: "#B23E2A",
    barHoverColor: "#E07A5F",
    barBg: "#ffffff",

    inputBg: "#ffffff",
    inputBorder: "#E6E1DB",
    inputTextColor: "#2E2925",
    inputBorderRadius: 6,

    fontBase: "'Geist', sans-serif",
    fontCode: "'Geist Mono', ui-monospace, monospace",
  }),
});
