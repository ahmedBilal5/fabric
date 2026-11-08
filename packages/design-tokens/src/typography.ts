/** Typography tokens: one family (Geist) for headings and body, Geist Mono for code and figures. */
export const fontFamily = {
  heading: "'Geist', ui-sans-serif, system-ui, sans-serif",
  body: "'Geist', ui-sans-serif, system-ui, sans-serif",
  mono: "'Geist Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
} as const;

export const fontWeight = {
  regular: 400,
  medium: 500,
  semiBold: 600,
  bold: 700,
} as const;

export const fontSize = {
  xs: "0.625rem", // 10px
  sm: "0.75rem", // 12px
  md: "0.875rem", // 14px
  lg: "1rem", // 16px
  xl: "1.125rem", // 18px
  "2xl": "1.25rem", // 20px
  "3xl": "1.5rem", // 24px
  "4xl": "2rem", // 32px
} as const;

export const fontSizePx = {
  md: 14,
} as const;

export const lineHeight = {
  tight: 1.25,
  snug: 1.375,
  normal: 1.5,
  relaxed: 1.625,
  loose: 2,
} as const;

export type FontFamily = typeof fontFamily;
export type FontWeight = typeof fontWeight;
export type FontSize = typeof fontSize;
export type FontSizePx = typeof fontSizePx;
export type LineHeight = typeof lineHeight;

export const textVariant = {
  /** The design: Display Large. Marketing pages, dashboard title, main landing page section. */
  displayLg: {
    fontFamily: fontFamily.heading,
    fontSize: "3rem",
    fontWeight: fontWeight.bold,
    lineHeight: 1.333,
  },
  /** The design: Display Medium. Second hero text, secondary major sections or feature highlights. */
  displayMd: {
    fontFamily: fontFamily.heading,
    fontSize: "2.25rem",
    fontWeight: fontWeight.bold,
    lineHeight: 1.111,
  },
  /** The design: Display Small. Secondary banner or tertiary headings. */
  displaySm: {
    fontFamily: fontFamily.heading,
    fontSize: "1.5rem",
    fontWeight: fontWeight.bold,
    lineHeight: 1.5,
  },
  /** The design: Page Title (lg). Main page or module titles. */
  pageTitleLg: {
    fontFamily: fontFamily.heading,
    fontSize: "1rem",
    fontWeight: fontWeight.medium,
    lineHeight: 1.25,
  },
  /** The design: Page Title (md). Card titles, widget headers, drawer titles. */
  pageTitleMd: {
    fontFamily: fontFamily.heading,
    fontSize: "0.875rem",
    fontWeight: fontWeight.medium,
    lineHeight: 1.286,
  },
  /**
   * The design: Heading 1. Major sections within content areas. The primary heading on pages, used for
   * top-level page titles or key sections. This should be the most prominent text on the page.
   */
  headingXl: {
    fontFamily: fontFamily.heading,
    fontSize: "1.5rem",
    fontWeight: fontWeight.semiBold,
    lineHeight: 1.333,
  },
  /**
   * The design: Heading 2. Sub-sections within primary sections. Secondary headings that divide major
   * content sections. Can be used for subsections or important categories within the page.
   */
  headingLg: {
    fontFamily: fontFamily.heading,
    fontSize: "1.25rem",
    fontWeight: fontWeight.semiBold,
    lineHeight: 1.4,
  },
  /**
   * The design: Heading 3. Tertiary headings, typically used for even more granular divisions within a
   * section. Can also be used for sub-subsections or important points within a list.
   */
  headingMd: {
    fontFamily: fontFamily.heading,
    fontSize: "1.125rem",
    fontWeight: fontWeight.semiBold,
    lineHeight: 1.333,
  },
  /**
   * The design: Heading 4. Smaller headings that still need prominence but don't need to stand out as
   * much as h1, h2, or h3. Can be used for entry-level section titles or smaller subsections.
   */
  headingSm: {
    fontFamily: fontFamily.heading,
    fontSize: "1rem",
    fontWeight: fontWeight.bold,
    lineHeight: 1.25,
  },
  /**
   * The design: Heading 4 - Alt. Alternative heading style when consistency with a less aggressive
   * style is needed (perhaps for captions or supporting headings).
   */
  headingSmAlt: {
    fontFamily: fontFamily.heading,
    fontSize: "1rem",
    fontWeight: fontWeight.semiBold,
    lineHeight: 1.25,
  },
  /**
   * The design: Heading 5. Small section titles or more descriptive headings, typically for minor
   * subsections. Works for tertiary details or elements within a component.
   */
  headingXs: {
    fontFamily: fontFamily.heading,
    fontSize: "0.875rem",
    fontWeight: fontWeight.semiBold,
    lineHeight: 1.286,
  },
  /** The design: Body Primary. Primary content, paragraphs, article text. */
  bodyLg: {
    fontFamily: fontFamily.body,
    fontSize: "1rem",
    fontWeight: fontWeight.regular,
    lineHeight: 1.5,
  },
  /** The design: Body Secondary. Default body text, descriptions, meta info. */
  bodyMd: {
    fontFamily: fontFamily.body,
    fontSize: "0.875rem",
    fontWeight: fontWeight.regular,
    lineHeight: 1.429,
  },
  /** The design: Body Tertiary. Table cells, tertiary info, footnotes. */
  bodySm: {
    fontFamily: fontFamily.body,
    fontSize: "0.75rem",
    fontWeight: fontWeight.regular,
    lineHeight: 1.5,
  },
  /** The design: UI Large. Input labels, toggle labels, buttons (default), tabs. */
  uiLg: {
    fontFamily: fontFamily.body,
    fontSize: "0.875rem",
    fontWeight: fontWeight.medium,
    lineHeight: 1.429,
  },
  /** The design: UI Medium. Dropdown items, list row labels, tooltip content. */
  uiMd: {
    fontFamily: fontFamily.body,
    fontSize: "0.8125rem",
    fontWeight: fontWeight.medium,
    lineHeight: 1.385,
  },
  /** The design: UI Small (xs). Badge text, value labels, button microcopy, date/time stamps. */
  uiSm: {
    fontFamily: fontFamily.body,
    fontSize: "0.625rem",
    fontWeight: fontWeight.medium,
    lineHeight: 1.6,
  },
  /** The design: UI Small (xxs). Icon labels, status dots, UI indicators, micro tags. */
  uiXxs: {
    fontFamily: fontFamily.body,
    fontSize: "0.5rem",
    fontWeight: fontWeight.medium,
    lineHeight: 1.75,
  },
} as const;

export type TextVariant = typeof textVariant;
export type TextVariantKey = keyof TextVariant;

/**
 * Fluid font sizes using clamp() for smooth scaling between sm (600px) and xl (1440px).
 * Labels and captions stay fixed — they're already small enough for mobile.
 */
export const fluidFontSize = {
  "4xl": "clamp(1.5rem, 1.143rem + 1.19vw, 2rem)", // 24px → 32px
  "3xl": "clamp(1.25rem, 1.071rem + 0.6vw, 1.5rem)", // 20px → 24px
  "2xl": "clamp(1.125rem, 1.036rem + 0.3vw, 1.25rem)", // 18px → 20px
  xl: "clamp(1rem, 0.911rem + 0.3vw, 1.125rem)", // 16px → 18px
  lg: "clamp(0.9375rem, 0.893rem + 0.15vw, 1rem)", // 15px → 16px
  md: fontSize.md, // 14px (fixed)
  sm: fontSize.sm, // 12px (fixed)
  xs: fontSize.xs, // 10px (fixed)
} as const;

export type FluidFontSize = typeof fluidFontSize;
