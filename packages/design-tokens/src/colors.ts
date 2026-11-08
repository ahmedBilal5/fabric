/**
 * Fabric color tokens. Components read these through the MUI theme's CSS
 * variables, so prefer `var(--mui-palette-*)` in styles and use these values
 * only where a raw color is unavoidable (e.g. canvas drawing, charts).
 *
 * The brand is a warm clay (`brand.primary`) on warm neutrals; status colors
 * keep their conventional hues (green success, amber warning, red error,
 * blue info and running). Every token has a dark-scheme counterpart in `dark`.
 */
// --- Brand ---
export const brand = {
  primary: "#B23E2A",
  primaryLight: "#E07A5F",
  secondary: "#C2410C",
  navy: "#2A2420",
  yellow: "#FFC000",
  info: "#00AEEF",
  grayDark: "#58595B",
  grayLight: "#D1D3D4",
} as const;

// --- Text ---
export const text = {
  primary: "#2E2925",
  secondary: "#6E655D",
  medium: "#4A423C",
  muted: "#7D756D",
  disabled: "#A8A099",
  inverse: "#ffffff",
  heading: "#2A2420",
} as const;

// --- Surface / Background ---
export const surface = {
  primary: "#ffffff",
  secondary: "#F8F6F3",
  tertiary: "#F3F0EC",
  brandLight: "#F6E7E2",
  info: "#e6f7fe",
  warning: "#fff6d9",
  overlay: "rgba(42, 36, 32, 0.08)",
  // Semantic backgrounds
  queued: "#F5F5F5",
  running: "#EBF9FF",
  success: "#F2FAF0",
  warningBg: "#FEF6EC",
  cancelled: "#FCF1ED",
  error: "#FFEBEB",
  suspended: "#EBEBEB",
  archived: "#E7E9EE",
  unknown: "#E7ECEE",
} as const;

export const scrollbar = {
  thumb: "#979797",
} as const;

// --- Border ---
export const border = {
  default: "#E6E1DB",
  light: "#EFEBE6",
  strong: "#A8A099",
  focus: "#B23E2A",
} as const;

// --- Status ---
// Light-mode status colors meet WCAG AA (4.5:1) with white text on top, so they work
// as fills, borders and icons alike. Use `statusText` for text on the pale tints.
export const status = {
  success: "#2E7D32",
  warning: "#B45309",
  error: "#C60000",
  info: "#1F6FB2",
  published: "#0277BD",
  queued: "#666666",
  running: "#0277BD",
  cancelled: "#C2410C",
  suspended: "#757575",
  archived: "#6B5F55",
  unknown: "#455A64",
} as const;

export const statusText = {
  running: "#01579B",
  success: "#276A2B",
  warning: "#92400E",
  cancelled: "#B0431C",
  error: "#A30000",
} as const;

// --- Chip ---
export const chip = {
  text: {
    queued: "#455A64",
    running: "#01579B",
    success: "#276A2B",
    warning: "#92400E",
    cancelled: "#B0431C",
    error: "#A30000",
    suspended: "#616161",
    archived: "#5F554C",
    unknown: "#455A64",
  },
  default: { bg: "#F6F4F1", text: "#6B625A", border: "#E6E1DB", solid: "#6E655D" },
  disabled: { bg: "#F6F4F1", text: "#CBC4BD", border: "#EAE6E1" },
} as const;

// --- Tag ---
export const tag = {
  textHover: "#4A423C",
  dualSub: "#9A3322",
} as const;

// --- Field ---
export const field = {
  label: "#6B625A",
  labelHover: "#4A423C",
  underline: "#BFB8B0",
} as const;

// --- Picker ---
export const picker = {
  sunday: "#A30000",
  selected: "#F6E2DB",
  weekday: "#4A423C",
  nav: "#6B625A",
} as const;

// --- Tab ---
export const tab = {
  hover: "#9A3322",
  disabled: "#D4CCC3",
  text: "#6B625A",
  textHover: "#4A423C",
  hoverBg: "#F6E7E2",
  pressText: "#1F1A17",
} as const;

export const stepper = {
  checkedBg: "#F1F9F1",
  disabledBg: "#EAE6E1",
  label: "#1F1A17",
} as const;

// --- Menu ---
export const menu = {
  textHover: "#9A3322",
  bgHover: "#FAF8F6",
  bgPress: "#F3F0EC",
} as const;

export const accordion = {
  hoverBg: "#FAF8F6",
} as const;

export const appShell = {
  text: "#6B625A",
  hover: "#9A3322",
  toggleBg: "#F6F4F1",
  toggleBgHover: "#FAF8F6",
  toggleBgPress: "#F3F0EC",
  badgeBg: "#D4CCC3",
} as const;

// --- Action (interactive elements) ---
export const action = {
  primary: "#B23E2A",
  primaryHover: "#9A3322",
  primaryActive: "#7F2A1C",
  secondary: "#2A2420",
  secondaryHover: "#2A2521",
  disabled: "#A8A099",
  selected: "#F3F0EC",
} as const;

// --- Labels (categorical) ---
export const labels = {
  gray: "#8c8c8c",
  blue: "#2563eb",
  red: "#dc2626",
  yellow: "#ca8a04",
  green: "#16a34a",
  purple: "#9333ea",
  cyan: "#0891b2",
  brown: "#92400e",
  pink: "#db2777",
} as const;

/**Random colors that fall outside of all color groups */
export const others = {
  blue: "#0a6fc4",
  black: "#000000",
  gray: "#958C83",
  lightGray: "#CBC4BD",
} as const;
// --- Dark mode overrides ---
export const dark = {
  brand: {
    primary: "#EB8E74",
    primaryLight: "#F2B09D",
    secondary: "#f0915e",
    navy: "#E3DBD3",
    yellow: "#ffd54d",
    info: "#67d4f1",
    grayDark: "#a3a5a8",
    grayLight: "#6b6e70",
  },
  text: {
    primary: "#F0ECE8",
    secondary: "#B5ACA3",
    medium: "#CFC7BF",
    muted: "#958C83",
    disabled: "#776E66",
    inverse: "#151210",
    heading: "#F0ECE8",
  },
  surface: {
    primary: "#2A2420",
    secondary: "#151210",
    tertiary: "#2A2521",
    brandLight: "#2A2521",
    info: "#1A2630",
    warning: "#2a2010",
    overlay: "rgba(0, 0, 0, 0.4)",
    queued: "rgba(158, 158, 158, 0.16)",
    running: "rgba(103, 212, 241, 0.16)",
    success: "rgba(74, 222, 128, 0.16)",
    warningBg: "rgba(251, 191, 36, 0.16)",
    cancelled: "rgba(240, 145, 94, 0.16)",
    error: "rgba(248, 113, 113, 0.16)",
    suspended: "rgba(158, 158, 158, 0.16)",
    archived: "rgba(150, 140, 130, 0.16)",
    unknown: "rgba(150, 140, 130, 0.16)",
  },
  border: { default: "#4A423B", light: "#3A332E", strong: "#6E655D", focus: "#EB8E74" },
  status: {
    success: "#4ade80",
    warning: "#fbbf24",
    error: "#f87171",
    info: "#67B6F1",
    infoLight: "rgba(103, 182, 241, 0.24)",
    published: "#67d4f1",
    queued: "#b0b0b0",
    running: "#67d4f1",
    cancelled: "#f0915e",
    suspended: "#bdbdbd",
    archived: "#B0A79E",
    unknown: "#958C83",
  },
  // Status text in dark mode reuses dark.status.*
  chip: {
    default: {
      bg: "rgba(150, 140, 130, 0.16)",
      text: "#B5ACA3",
      border: "#4A423B",
      solid: "#A39B94",
    },
    disabled: { bg: "rgba(150, 140, 130, 0.08)", text: "#776E66", border: "#3A332E" },
  },
  tag: {
    textHover: "#E3DBD3",
    dualSub: "#E07A5F",
  },
  field: {
    label: "#B5ACA3",
    labelHover: "#E3DBD3",
    underline: "#5E5650",
  },
  picker: {
    sunday: "#e57373",
    selected: "rgba(235, 142, 116, 0.24)",
    weekday: "#B5ACA3",
    nav: "#B5ACA3",
  },
  tab: {
    hover: "#E07A5F",
    disabled: "#776E66",
    text: "#B5ACA3",
    textHover: "#E3DBD3",
    hoverBg: "rgba(235, 142, 116, 0.12)",
    pressText: "#F0ECE8",
  },
  // Opaque so the connector line never shows through a step icon.
  stepper: {
    checkedBg: "#1c434a",
    disabledBg: "#3A332E",
    label: "#F0ECE8",
  },
  menu: {
    textHover: "#F2B09D",
    bgHover: "rgba(235, 142, 116, 0.12)",
    bgPress: "rgba(235, 142, 116, 0.2)",
  },
  accordion: {
    hoverBg: "rgba(235, 142, 116, 0.06)",
  },
  appShell: {
    text: "#B5ACA3",
    hover: "#E07A5F",
    toggleBg: "rgba(150, 140, 130, 0.12)",
    toggleBgHover: "rgba(150, 140, 130, 0.16)",
    toggleBgPress: "rgba(150, 140, 130, 0.24)",
    badgeBg: "#4A423B",
  },
  action: {
    primary: "#EB8E74",
    primaryHover: "rgba(235, 142, 116, 0.08)",
    primaryActive: "#E07A5F",
    secondary: "#E3DBD3",
    secondaryHover: "#F0ECE8",
    disabled: "#776E66",
    selected: "rgba(235, 142, 116, 0.12)",
  },
} as const;

export type BrandColors = typeof brand;
export type TextColors = typeof text;
export type SurfaceColors = typeof surface;
export type ScrollbarColors = typeof scrollbar;
export type BorderColors = typeof border;
export type StatusColors = typeof status;
export type StatusTextColors = typeof statusText;
export type ChipColors = typeof chip;
export type TagColors = typeof tag;
export type FieldColors = typeof field;
export type PickerColors = typeof picker;
export type TabColors = typeof tab;
export type StepperColors = typeof stepper;
export type MenuColors = typeof menu;
export type AccordionColors = typeof accordion;
export type AppShellColors = typeof appShell;
export type ActionColors = typeof action;
export type LabelColors = typeof labels;
export type DarkColors = typeof dark;
