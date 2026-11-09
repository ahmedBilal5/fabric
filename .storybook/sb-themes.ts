import { create } from "storybook/theming/create";

/**
 * Storybook UI themes (sidebar, toolbar and docs chrome) in Fabric's colors.
 * Plain values: the manager bundle doesn't resolve workspace packages.
 * Kept in sync with `@fabric-kit/design-tokens` by hand.
 */
const shared = {
  brandTitle: "Fabric",
  brandUrl: "../",
  brandTarget: "_self",
  appBorderRadius: 8,
  inputBorderRadius: 6,
  fontBase: "'Geist', ui-sans-serif, system-ui, sans-serif",
  fontCode: "'Geist Mono', ui-monospace, monospace",
} as const;

export const sbLightTheme = create({
  ...shared,
  base: "light",
  brandImage: "./fabric-logo.svg",
  colorPrimary: "#B23E2A",
  colorSecondary: "#B23E2A",
  appBg: "#F8F6F3",
  appContentBg: "#FFFFFF",
  appPreviewBg: "#FFFFFF",
  appBorderColor: "#E6E1DB",
  textColor: "#2E2925",
  textInverseColor: "#FFFFFF",
  textMutedColor: "#6E655D",
  barTextColor: "#6E655D",
  barSelectedColor: "#B23E2A",
  barHoverColor: "#B23E2A",
  barBg: "#FFFFFF",
  buttonBg: "#F8F6F3",
  buttonBorder: "#E6E1DB",
  booleanBg: "#F1EDE8",
  booleanSelectedBg: "#FFFFFF",
  inputBg: "#FFFFFF",
  inputBorder: "#D9D2CA",
  inputTextColor: "#2E2925",
});

export const sbDarkTheme = create({
  ...shared,
  base: "dark",
  brandImage: "./fabric-logo-dark.svg",
  colorPrimary: "#EB8E74",
  colorSecondary: "#C9553E",
  appBg: "#1C1815",
  appContentBg: "#151210",
  appPreviewBg: "#151210",
  appBorderColor: "#3A332E",
  textColor: "#F0ECE8",
  textInverseColor: "#151210",
  textMutedColor: "#B5ACA3",
  barTextColor: "#B5ACA3",
  barSelectedColor: "#EB8E74",
  barHoverColor: "#F2B09D",
  barBg: "#2A2420",
  buttonBg: "#2A2420",
  buttonBorder: "#4A423B",
  booleanBg: "#151210",
  booleanSelectedBg: "#3A332E",
  inputBg: "#151210",
  inputBorder: "#4A423B",
  inputTextColor: "#F0ECE8",
});
