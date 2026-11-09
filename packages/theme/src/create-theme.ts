import {
  action,
  appShell,
  border,
  brand,
  breakpoints,
  chip,
  dark,
  drawerWidth,
  duration,
  easing,
  field,
  fluidFontSize,
  fontFamily,
  fontSize,
  fontSizePx,
  fontWeight,
  letterSpacing,
  lineHeight,
  opacity,
  picker,
  radii,
  scrollbar,
  scrollbarSize,
  shadows,
  spacing,
  status,
  statusText,
  surface,
  text,
  textVariant,
  zIndex,
} from "@fabric-kit/design-tokens";
import {
  alpha,
  createTheme,
  darken,
  lighten,
  type Theme,
  type ThemeOptions,
  ThemeProvider,
} from "@mui/material/styles";

type StatusTokens = Record<
  | "queued"
  | "running"
  | "success"
  | "warning"
  | "cancelled"
  | "error"
  | "suspended"
  | "archived"
  | "unknown",
  string
>;
type SurfaceTokens = Record<
  | "queued"
  | "running"
  | "success"
  | "warningBg"
  | "cancelled"
  | "error"
  | "suspended"
  | "archived"
  | "unknown",
  string
>;

type StatusTextTokens = Record<"running" | "success" | "warning" | "cancelled" | "error", string>;

const buildSemantic = (s: StatusTokens, bg: SurfaceTokens, t: StatusTextTokens) => ({
  queued: { main: s.queued, bg: bg.queued },
  running: { main: s.running, bg: bg.running, text: t.running },
  success: { main: s.success, bg: bg.success, text: t.success },
  warning: { main: s.warning, bg: bg.warningBg, text: t.warning },
  cancelled: { main: s.cancelled, bg: bg.cancelled, text: t.cancelled },
  error: { main: s.error, bg: bg.error, text: t.error },
  suspended: { main: s.suspended, bg: bg.suspended },
  archived: { main: s.archived, bg: bg.archived },
  unknown: { main: s.unknown, bg: bg.unknown },
});

type ChipStatusKey = keyof StatusTokens;
interface ChipTone {
  bg: string;
  text: string;
  border: string;
  solid: string;
  onSolid: string;
}

/** Resolves the chip colors (bg / text / stroke / solid) for one color scheme. */
const chipTone = (scheme: "light" | "dark", color: string, disabled: boolean) => {
  const isDark = scheme === "dark";
  const set = isDark ? dark.chip : chip;
  const surfaces: SurfaceTokens = isDark ? dark.surface : surface;
  const statuses: StatusTokens = isDark ? dark.status : status;
  const onSolid = isDark ? dark.text.inverse : text.inverse;

  if (disabled) {
    return { ...set.disabled, solid: set.disabled.bg, onSolid: set.disabled.text };
  }
  if (color === "default") return { ...set.default, onSolid };
  if (!(color in statuses) || color === "info") return undefined;

  const key = color as ChipStatusKey;
  return {
    bg: surfaces[key === "warning" ? "warningBg" : key],
    text: isDark ? dark.status[key] : chip.text[key],
    border: key === "suspended" ? surfaces.suspended : statuses[key],
    solid: statuses[key],
    onSolid,
  } satisfies ChipTone;
};

/** A chip variant's colors for one scheme, as custom properties (see `chipColorStyles`). */
const chipVariantVars = (variant: string, tone: ChipTone) => {
  if (variant === "outlined") {
    return {
      "--fabric-chip-bg": "transparent",
      "--fabric-chip-fg": tone.text,
      "--fabric-chip-border": tone.border,
    };
  }
  if (variant === "filledAlt") {
    return { "--fabric-chip-bg": tone.solid, "--fabric-chip-fg": tone.onSolid };
  }
  return { "--fabric-chip-bg": tone.bg, "--fabric-chip-fg": tone.text };
};

/**
 * Paints a chip variant; `filledAlt` is the solid fill with inverse text. The dark
 * scheme only swaps custom properties, so it never outranks an `sx` color: a
 * `.dark &` rule setting `background-color` directly would beat `sx` in dark mode.
 */
const chipColorStyles = (theme: Theme, variant: string, light: ChipTone, night: ChipTone) => ({
  ...chipVariantVars(variant, light),
  ...theme.applyStyles("dark", chipVariantVars(variant, night)),
  backgroundColor: "var(--fabric-chip-bg)",
  color: "var(--fabric-chip-fg)",
  ...(variant === "outlined" ? { borderColor: "var(--fabric-chip-border)" } : { border: "none" }),
});

const lightPalette = {
  // Auto-picked contrast text (e.g. on success or warning fills) must meet WCAG AA.
  contrastThreshold: 4.5,
  primary: {
    main: brand.primary,
    light: brand.primaryLight,
    dark: action.primaryHover,
    contrastText: text.inverse,
  },
  secondary: { main: brand.secondary, contrastText: text.inverse },
  error: { main: status.error },
  warning: { main: status.warning },
  success: { main: status.success },
  info: { main: status.info, light: surface.info },
  semantic: buildSemantic(status, surface, statusText),
  appShell: {
    text: appShell.text,
    hover: appShell.hover,
    press: brand.navy,
    toggleBg: appShell.toggleBg,
    toggleBgHover: appShell.toggleBgHover,
    toggleBgPress: appShell.toggleBgPress,
    badgeBg: appShell.badgeBg,
  },
  // standard_grid: header fill (background base/builder/select #F6E7E2), row
  // separator (#EFEBE6), footer line (stroke border #E6E1DB) and "no data available" text
  // (typography disabled #CBC4BD) reuse existing tokens.
  datagrid: {
    headerBg: surface.brandLight,
    rowLine: border.light,
    footerLine: border.default,
    emptyText: chip.disabled.text,
  },
  text: { primary: text.primary, secondary: text.secondary, disabled: text.disabled },
  background: { default: surface.secondary, paper: surface.primary, warning: surface.warning },
  divider: border.default,
  action: {
    active: action.primary,
    hover: action.selected,
    selected: action.selected,
    disabled: action.disabled,
    disabledBackground: surface.tertiary,
  },
};

const darkPalette = {
  contrastThreshold: 4.5,
  primary: {
    main: dark.brand.primary,
    light: dark.brand.primaryLight,
    dark: brand.primary,
    contrastText: dark.text.inverse,
  },
  secondary: { main: dark.brand.secondary, contrastText: dark.text.inverse },
  error: { main: dark.status.error },
  warning: { main: dark.status.warning },
  success: { main: dark.status.success },
  info: { main: dark.status.info, light: dark.status.infoLight },
  // The design has no dark semantic text colors; the (already light) dark status colors are legible on
  // the translucent dark surface tints, so they double as the dark text colors.
  semantic: buildSemantic(dark.status, dark.surface, dark.status),
  appShell: {
    text: dark.appShell.text,
    hover: dark.appShell.hover,
    press: dark.brand.navy,
    toggleBg: dark.appShell.toggleBg,
    toggleBgHover: dark.appShell.toggleBgHover,
    toggleBgPress: dark.appShell.toggleBgPress,
    badgeBg: dark.appShell.badgeBg,
  },
  datagrid: {
    headerBg: dark.surface.brandLight,
    rowLine: dark.border.light,
    footerLine: dark.border.default,
    emptyText: dark.chip.disabled.text,
  },
  text: {
    primary: dark.text.primary,
    secondary: dark.text.secondary,
    disabled: dark.text.disabled,
  },
  background: {
    default: dark.surface.secondary,
    paper: dark.surface.primary,
    warning: dark.surface.warning,
  },
  divider: dark.border.default,
  action: {
    active: dark.action.primary,
    hover: dark.action.primaryHover,
    selected: dark.action.selected,
    disabled: dark.action.disabled,
    disabledBackground: dark.surface.tertiary,
  },
};

type ButtonSemantic = "error" | "info" | "success" | "warning";

interface ButtonStateColors {
  main: string;
  hover: string;
  press: string;
  disabledBorder: string;
  subtleText: string;
  /** Label on a filled semantic button. */
  semanticLabel: string;
  semantic: Record<ButtonSemantic, string>;
}

// Existing tokens closest to the hover (#9A3322) and press (#2A2420) colors,
// typography/light (#6B625A) and disable_alt (#EAE6E1). Disabled fills and labels use MUI's defaults.
const lightButtonColors: ButtonStateColors = {
  main: "var(--mui-palette-primary-main)",
  hover: "var(--mui-palette-primary-dark)",
  press: brand.navy,
  disabledBorder: "var(--mui-palette-divider)",
  subtleText: "var(--mui-palette-text-secondary)",
  semanticLabel: text.inverse,
  semantic: {
    error: status.error,
    info: status.info,
    success: status.success,
    warning: status.warning,
  },
};

// Dark buttons hover to the lighter primary shade, since a darker one disappears on dark surfaces.
const darkButtonColors: ButtonStateColors = {
  main: "var(--mui-palette-primary-main)",
  hover: "var(--mui-palette-primary-light)",
  press: "var(--mui-palette-primary-main)",
  disabledBorder: "var(--mui-palette-divider)",
  subtleText: "var(--mui-palette-text-secondary)",
  semanticLabel: dark.text.inverse,
  semantic: {
    error: dark.status.error,
    info: dark.brand.info,
    success: dark.status.success,
    warning: dark.status.warning,
  },
};

// Filled semantic buttons rest at full color so their labels meet WCAG AA; hover darkens
// with an overlay, which works for any palette color.
const SEMANTIC_HOVER_OVERLAY = "inset 0 0 0 999px rgba(0, 0, 0, 0.1)";

const isButtonSemantic = (color: string | undefined): color is ButtonSemantic =>
  color === "error" || color === "info" || color === "success" || color === "warning";

// Only primary and the four semantic colors have tuned styles; secondary/inherit keep MUI defaults.
const buttonStateStyles = (
  c: ButtonStateColors,
  { variant, color }: { variant?: string; color?: string },
) => {
  if (color === "primary" && variant === "contained") {
    return {
      "&:hover": { backgroundColor: c.hover },
      "&:active": { backgroundColor: c.press },
      "&.Mui-selected": { backgroundColor: c.main },
    };
  }
  if (color === "primary" && variant === "outlined") {
    return {
      color: c.subtleText,
      borderColor: c.main,
      "&:hover": { color: c.hover, borderColor: c.hover, backgroundColor: "transparent" },
      "&:active": { color: c.press, borderColor: c.press },
      "&.Mui-selected": { color: c.main, borderColor: c.main },
      "&.Mui-disabled": { borderColor: c.disabledBorder },
    };
  }
  if (color === "primary" && variant === "text") {
    return {
      color: c.subtleText,
      "&:hover": { color: c.hover, backgroundColor: "transparent" },
      "&:active": { color: c.press },
      "&.Mui-selected": { color: c.main },
    };
  }
  // The design's `button_semantic/error_outline` is drawn in the primary blue by mistake; it is red here.
  if (color === "error" && variant === "outlined") {
    const base = c.semantic.error;
    return {
      color: base,
      borderColor: base,
      "&:hover": { backgroundColor: alpha(base, opacity[5]) },
      "&:active": { backgroundColor: alpha(base, opacity[10]) },
      "&.Mui-selected": { backgroundColor: alpha(base, opacity[10]) },
      "&.Mui-disabled": { borderColor: c.disabledBorder },
    };
  }
  if (isButtonSemantic(color) && variant === "contained") {
    const base = c.semantic[color];
    return {
      color: c.semanticLabel,
      backgroundColor: base,
      "&:hover": { backgroundColor: base, boxShadow: SEMANTIC_HOVER_OVERLAY },
      "&.Mui-selected": { backgroundColor: alpha(base, opacity[50]) },
      "&.Mui-disabled": {
        color: c.semanticLabel,
        backgroundColor: alpha(base, opacity[10]),
      },
    };
  }
  return {};
};

const FIELD_BORDER = "color-mix(in srgb, var(--mui-palette-text-primary) 45%, transparent)";
const FIELD_BORDER_HOVER = "color-mix(in srgb, var(--mui-palette-text-primary) 70%, transparent)";

const baseThemeOptions: ThemeOptions = {
  cssVariables: { colorSchemeSelector: "class" },
  colorSchemes: {
    light: { palette: lightPalette },
    dark: { palette: darkPalette },
  },
  typography: {
    fontFamily: fontFamily.body,
    fontSize: fontSizePx.md,
    fontWeightRegular: fontWeight.regular,
    fontWeightMedium: fontWeight.medium,
    fontWeightBold: fontWeight.bold,
    h1: {
      fontFamily: fontFamily.heading,
      fontSize: fluidFontSize["4xl"],
      fontWeight: fontWeight.bold,
      lineHeight: lineHeight.tight,
    },
    h2: {
      fontFamily: fontFamily.heading,
      fontSize: fluidFontSize["3xl"],
      fontWeight: fontWeight.semiBold,
      lineHeight: lineHeight.tight,
    },
    h3: {
      fontFamily: fontFamily.heading,
      fontSize: fluidFontSize["2xl"],
      fontWeight: fontWeight.semiBold,
      lineHeight: lineHeight.snug,
    },
    h4: {
      fontFamily: fontFamily.heading,
      fontSize: fluidFontSize.xl,
      fontWeight: fontWeight.medium,
      lineHeight: lineHeight.snug,
    },
    h5: {
      fontFamily: fontFamily.heading,
      fontSize: fluidFontSize.lg,
      fontWeight: fontWeight.medium,
      lineHeight: lineHeight.normal,
    },
    h6: {
      fontFamily: fontFamily.heading,
      fontSize: fontSize.md,
      fontWeight: fontWeight.semiBold,
      lineHeight: lineHeight.normal,
    },
    subtitle1: {
      fontFamily: fontFamily.body,
      fontSize: fluidFontSize.lg,
      fontWeight: fontWeight.semiBold,
      lineHeight: lineHeight.normal,
    },
    subtitle2: {
      fontFamily: fontFamily.body,
      fontSize: fontSize.md,
      fontWeight: fontWeight.semiBold,
      lineHeight: lineHeight.normal,
    },
    body1: {
      fontFamily: fontFamily.body,
      fontSize: fontSize.md,
      fontWeight: fontWeight.regular,
      lineHeight: lineHeight.normal,
    },
    body2: {
      fontFamily: fontFamily.body,
      fontSize: fontSize.sm,
      fontWeight: fontWeight.regular,
      lineHeight: lineHeight.normal,
    },
    button: {
      fontFamily: fontFamily.heading,
      fontSize: fontSize.md,
      fontWeight: fontWeight.medium,
      textTransform: "none",
    },
    caption: {
      fontFamily: fontFamily.body,
      fontSize: fontSize.sm,
      fontWeight: fontWeight.regular,
      lineHeight: lineHeight.normal,
    },
    overline: {
      fontFamily: fontFamily.body,
      fontSize: fontSize.xs,
      fontWeight: fontWeight.semiBold,
      textTransform: "uppercase",
      letterSpacing: "0.08em",
    },
  },
  spacing: (factor: number) => `${factor * spacing.xs}px`,
  shape: { borderRadius: radii.md },
  shadows: [
    shadows.none,
    shadows.xs,
    shadows.xs,
    shadows.sm,
    shadows.sm,
    shadows.md,
    shadows.md,
    shadows.md,
    shadows.md,
    shadows.lg,
    shadows.lg,
    shadows.lg,
    shadows.lg,
    shadows.lg,
    shadows.lg,
    shadows.lg,
    shadows.lg,
    shadows.xl,
    shadows.xl,
    shadows.xl,
    shadows.xl,
    shadows.xl,
    shadows.xl,
    shadows.xl,
    shadows.xl,
  ] as unknown as ThemeOptions["shadows"],
  zIndex: {
    mobileStepper: zIndex.base,
    fab: zIndex.fab,
    speedDial: zIndex.speedDial,
    appBar: zIndex.appBar,
    drawer: zIndex.drawer,
    modal: zIndex.modal,
    snackbar: zIndex.snackbar,
    tooltip: zIndex.tooltip,
  },
  breakpoints: {
    values: {
      xs: breakpoints.xs,
      sm: breakpoints.sm,
      md: breakpoints.md,
      lg: breakpoints.lg,
      xl: breakpoints.xl,
      "2xl": breakpoints["2xl"],
    },
  },
  transitions: {
    duration: {
      shortest: duration.fast,
      shorter: duration.fast,
      short: duration.normal,
      standard: duration.normal,
      complex: duration.slow,
      enteringScreen: duration.normal,
      leavingScreen: duration.normal,
    },
    easing: {
      easeInOut: easing.inOut,
      easeOut: easing.out,
      easeIn: easing.in,
      sharp: easing.default,
    },
  },
  components: {
    // The default grey avatar (e.g. the "+3" in an avatar group) keeps readable text in both modes.
    MuiAvatar: {
      styleOverrides: {
        colorDefault: {
          backgroundColor: "var(--mui-palette-text-secondary)",
          color: "var(--mui-palette-background-paper)",
        },
      },
    },
    // A visible focus ring on every button-like control, in addition to the focus ripple.
    MuiButtonBase: {
      styleOverrides: {
        root: {
          "&.Mui-focusVisible": {
            outline: "2px solid var(--mui-palette-primary-main)",
            outlineOffset: 2,
          },
        },
      },
    },
    // Chip sizes, typography and colors.
    MuiChip: {
      styleOverrides: {
        root: ({ ownerState, theme }) => {
          const isSmall = ownerState.size === "small";
          const light = chipTone("light", String(ownerState.color), !!ownerState.disabled);
          const night = chipTone("dark", String(ownerState.color), !!ownerState.disabled);
          const variant = String(ownerState.variant);
          return {
            height: isSmall ? 18 : 26,
            paddingLeft: spacing.sm,
            paddingRight: spacing.xs,
            fontSize: isSmall ? 10 : 12,
            lineHeight: isSmall ? "14px" : "18px",
            fontWeight: fontWeight.semiBold,
            letterSpacing: "0.5px",
            "&.Mui-disabled": { opacity: 1 },
            "& .MuiChip-label": { padding: "0 4px 0 0" },
            "& .MuiChip-avatar": {
              width: 16,
              height: 16,
              margin: "0 4px 0 0",
              fontSize: 10,
            },
            "& .MuiChip-icon": {
              fontSize: isSmall ? 12 : 16,
              margin: "0 4px 0 0",
              color: "inherit",
            },
            "& .MuiChip-deleteIcon": {
              width: 12,
              height: 12,
              margin: 0,
              color: "inherit",
              "&:hover, &:active": { color: "inherit", opacity: 0.7 },
            },
            // Thumbnail chip: tighter inset around the 16px avatar.
            "&:has(.MuiChip-avatar)": {
              paddingLeft: isSmall ? 2 : spacing.xs,
              ...(isSmall && { height: 20, paddingTop: 2, paddingBottom: 2 }),
            },
            ...(light && night && chipColorStyles(theme, variant, light, night)),
          };
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: ({ theme, ownerState }) => ({
          borderRadius: radii.md,
          textTransform: "capitalize",
          fontFamily: fontFamily.body,
          fontWeight: fontWeight.semiBold,
          letterSpacing: letterSpacing.wide,
          lineHeight: textVariant.uiLg.lineHeight,
          ...buttonStateStyles(lightButtonColors, ownerState),
          ...theme.applyStyles("dark", buttonStateStyles(darkButtonColors, ownerState)),
        }),
      },
    },
    // Fields: 8px radius, 1px border that only changes for
    // focus (Fabric addition) and error, 16/24 value text, 8 padding (40px, small 32px).
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: radii.lg,
          backgroundColor: "var(--mui-palette-background-paper)",
          color: "var(--mui-palette-text-primary)",
          fontSize: fontSize.lg,
          lineHeight: "24px",
          "&.MuiInputBase-adornedStart": { paddingLeft: spacing.sm },
          "&.MuiInputBase-adornedEnd": { paddingRight: spacing.sm },
          // padding lives on the textarea so its resize handle sits in the box
          // corner; the end icon is pinned top right; a start adornment holds wrapping chips.
          "&.MuiInputBase-multiline, &.MuiInputBase-multiline.MuiInputBase-adornedStart, &.MuiInputBase-multiline.MuiInputBase-adornedEnd":
            {
              padding: 0,
              alignItems: "flex-start",
              flexWrap: "wrap",
              position: "relative",
              "& .MuiInputAdornment-positionEnd": {
                position: "absolute",
                top: spacing.md,
                right: spacing.sm,
                margin: 0,
                height: 24,
                maxHeight: 24,
              },
              "& .MuiInputAdornment-positionStart": {
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: spacing.sm,
                height: "auto",
                maxHeight: "none",
                margin: 0,
                padding: `${spacing.md}px 0 ${spacing.md}px ${spacing.sm}px`,
                whiteSpace: "normal",
              },
            },
          // Field edges reach 3:1 against the surface in both modes (WCAG 1.4.11).
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: FIELD_BORDER,
            padding: "0 6px",
            "& legend": {
              fontSize: 8,
              fontWeight: fontWeight.semiBold,
              letterSpacing: "0.5px",
              // Unlabelled fields render a zero-width `span.notranslate`; padding it
              // would cut an empty notch into the top border.
              "& > span:not(.notranslate)": { paddingLeft: spacing.xs, paddingRight: spacing.xs },
            },
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: FIELD_BORDER_HOVER,
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "var(--mui-palette-primary-main)",
            borderWidth: 1,
          },
          "&.Mui-error .MuiOutlinedInput-notchedOutline": {
            borderColor: "var(--mui-palette-error-main)",
          },
          "&.Mui-disabled": {
            color: "var(--mui-palette-text-disabled)",
            "& .MuiOutlinedInput-notchedOutline": { borderColor: "var(--mui-palette-divider)" },
          },
          "& .MuiInputAdornment-root": { color: field.label },
          "&:hover:not(.Mui-focused, .Mui-disabled) .MuiInputAdornment-root": {
            color: field.labelHover,
          },
          "& .MuiInputAdornment-root .MuiIconButton-root, &.Mui-focused .MuiInputAdornment-root": {
            color: "var(--mui-palette-text-primary)",
          },
          "&.Mui-disabled .MuiInputAdornment-root, &.Mui-disabled .MuiInputAdornment-root .MuiIconButton-root":
            { color: "var(--mui-palette-text-disabled)" },
          ...theme.applyStyles("dark", {
            "& .MuiInputAdornment-root": { color: dark.field.label },
            "&:hover:not(.Mui-focused, .Mui-disabled) .MuiInputAdornment-root": {
              color: dark.field.labelHover,
            },
          }),
        }),
        input: ({ ownerState }) =>
          ownerState.multiline
            ? {
                flex: "1 1 96px",
                boxSizing: "border-box",
                padding: `${spacing.md}px ${spacing.sm}px`,
                resize: "vertical",
                // Keep text clear of the absolutely positioned end icon.
                ".MuiInputBase-adornedEnd > &": { paddingRight: 40 },
                "&::placeholder": { color: "var(--mui-palette-text-disabled)", opacity: 1 },
              }
            : {
                height: 24,
                padding:
                  ownerState.size === "small"
                    ? `${spacing.xs}px ${spacing.sm}px`
                    : `${spacing.sm}px`,
                "&::placeholder": { color: "var(--mui-palette-text-disabled)", opacity: 1 },
              },
      },
    },
    // Autocomplete keeps the 40px / 32px field height with a single value; chips still wrap.
    MuiAutocomplete: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            paddingTop: 0,
            paddingBottom: 0,
            "& .MuiAutocomplete-input": { paddingTop: spacing.sm, paddingBottom: spacing.sm },
          },
          "& .MuiOutlinedInput-root.MuiInputBase-sizeSmall": {
            paddingTop: 0,
            paddingBottom: 0,
            "& .MuiAutocomplete-input": { paddingTop: spacing.xs, paddingBottom: spacing.xs },
          },
        },
      },
    },
    // 36px, no radius, bottom stroke only.
    MuiInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: "var(--mui-palette-background-paper)",
          color: "var(--mui-palette-text-primary)",
          fontSize: fontSize.lg,
          lineHeight: "24px",
          minHeight: 36,
          "label + &, .MuiInputLabel-root + &": { marginTop: 0 },
          "&::before": { borderBottomColor: field.underline },
          "&:hover:not(.Mui-disabled, .Mui-error)::before": {
            borderBottomColor: field.underline,
          },
          "&::after": { borderBottomColor: "var(--mui-palette-primary-main)" },
          "&.Mui-error::before": { borderBottomColor: "var(--mui-palette-error-main)" },
          ...theme.applyStyles("dark", {
            "&::before": { borderBottomColor: dark.field.underline },
          }),
        }),
        input: {
          height: 24,
          padding: `${spacing.sm - 2}px ${spacing.sm}px`,
          "&::placeholder": { color: "var(--mui-palette-text-disabled)", opacity: 1 },
        },
      },
    },
    MuiInputAdornment: {
      styleOverrides: {
        positionStart: { marginRight: spacing.xs },
        positionEnd: { marginLeft: spacing.xs },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: ({ ownerState, theme }) =>
          ownerState.variant === "standard"
            ? {
                fontSize: fontSize.md,
                lineHeight: "20px",
                fontWeight: fontWeight.semiBold,
                letterSpacing: "0.5px",
                color: field.label,
                transform: "translate(12px, 8px) scale(1)",
                zIndex: 1,
                "&.MuiInputLabel-shrink": {
                  transform: "translate(10px, -6px) scale(0.5714)",
                  color: "var(--mui-palette-text-primary)",
                  backgroundColor: "var(--mui-palette-background-paper)",
                  padding: "0 4px",
                  borderRadius: radii.md,
                },
                "&.Mui-focused, &.Mui-error": { color: "var(--mui-palette-text-primary)" },
                "&.Mui-disabled": { color: "var(--mui-palette-text-disabled)" },
                ...theme.applyStyles("dark", { color: dark.field.label }),
              }
            : ownerState.variant === "outlined"
              ? {
                  fontSize: fontSize.md,
                  lineHeight: "20px",
                  fontWeight: fontWeight.semiBold,
                  letterSpacing: "0.5px",
                  color: field.label,
                  maxWidth: "calc(100% - 24px)",
                  transform: `translate(12px, ${ownerState.size === "small" ? 6 : 10}px) scale(1)`,
                  // Floated label: 8px (14 * 0.5714) centered on the top border.
                  "&.MuiInputLabel-shrink": {
                    transform: "translate(10px, -6px) scale(0.5714)",
                    maxWidth: "calc(175% - 24px)",
                    color: "var(--mui-palette-text-primary)",
                  },
                  "&.Mui-focused, &.Mui-error": { color: "var(--mui-palette-text-primary)" },
                  "&.Mui-disabled": { color: "var(--mui-palette-text-disabled)" },
                  ...theme.applyStyles("dark", { color: dark.field.label }),
                }
              : {},
      },
    },
    MuiFormLabel: {
      styleOverrides: { asterisk: { color: "var(--mui-palette-error-main)" } },
    },
    MuiFormControl: {
      styleOverrides: {
        root: ({ theme }) => ({
          "&:hover .MuiInputLabel-outlined:not(.MuiInputLabel-shrink, .Mui-disabled, .Mui-error), &:hover .MuiInputLabel-standard:not(.MuiInputLabel-shrink, .Mui-disabled, .Mui-error)":
            {
              color: field.labelHover,
              ...theme.applyStyles("dark", { color: dark.field.labelHover }),
            },
          // Resting label sits after a leading icon (8 padding + 24 icon + 4 gap + 4 inset).
          "&:has(.MuiInputBase-adornedStart) .MuiInputLabel-outlined:not(.MuiInputLabel-shrink)": {
            transform: "translate(40px, 10px) scale(1)",
            "&.MuiInputLabel-sizeSmall": { transform: "translate(40px, 6px) scale(1)" },
          },
        }),
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          fontSize: fontSize.sm,
          lineHeight: "14px",
          letterSpacing: 0,
          marginTop: 2,
          // Helper text is readable secondary text; only a disabled field greys it out.
          color: "var(--mui-palette-text-secondary)",
          "&.Mui-disabled": { color: "var(--mui-palette-text-disabled)" },
          "&.Mui-error": { color: "var(--mui-palette-error-main)" },
        },
        contained: { marginLeft: spacing.sm, marginRight: spacing.sm },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        "*::-webkit-scrollbar": { width: scrollbarSize.thickness, height: scrollbarSize.thickness },
        "*::-webkit-scrollbar-thumb": {
          backgroundColor: scrollbar.thumb,
          borderRadius: radii.full,
        },
        // Bulletproof dark-mode text color for MUI x-date-pickers.
        // Bypasses the CssVarsProvider mechanism entirely — pins the picker
        // segments to the dark palette hex when the host toggles `.dark`.
        // Storybook's dark-mode addon and consumer apps both toggle `.dark` /
        // `.light` on <html>. Works regardless of whether MUI's CSS variables
        // are actually swapping.
        ".dark .MuiPickersSectionList-root, .dark .MuiPickersSectionList-section, .dark .MuiPickersSectionList-sectionContent, .dark .MuiPickersInputBase-root, .dark .MuiPickersOutlinedInput-input, .dark .MuiPickersFilledInput-input":
          {
            color: "var(--mui-palette-text-primary)",
          },
        ".light .MuiPickersSectionList-root, .light .MuiPickersSectionList-section, .light .MuiPickersSectionList-sectionContent, .light .MuiPickersInputBase-root, .light .MuiPickersOutlinedInput-input, .light .MuiPickersFilledInput-input":
          {
            color: "var(--mui-palette-text-primary)",
          },
        ".dark .Mui-disabled.MuiPickersInputBase-root .MuiPickersSectionList-root, .dark .Mui-disabled.MuiPickersInputBase-root .MuiPickersSectionList-sectionContent":
          { color: "var(--mui-palette-text-disabled)" },
        ".light .Mui-disabled.MuiPickersInputBase-root .MuiPickersSectionList-root, .light .Mui-disabled.MuiPickersInputBase-root .MuiPickersSectionList-sectionContent":
          { color: "var(--mui-palette-text-disabled)" },
        // Icons inside the pickers should also invert.
        ".dark .MuiPickersInputBase-root .MuiSvgIcon-root, .dark .MuiPickersTextField-root .MuiSvgIcon-root":
          {
            color: dark.field.label,
          },
        ".light .MuiPickersInputBase-root .MuiSvgIcon-root, .light .MuiPickersTextField-root .MuiSvgIcon-root":
          {
            color: field.label,
          },
        // Picker floating labels use the MuiInputLabel / MuiFormControl overrides.
        // Placeholder text inside the section list (before user selects a
        // date — the "MM/DD/YYYY" hint) uses the same `sectionContent` class
        // but with `data-content=""` or similar empty state — falls through
        // the rule above. But if MUI treats placeholder differently, catch it
        // with the placeholder pseudo too.
        '.dark .MuiPickersSectionList-sectionContent[data-content=""]': {
          color: "var(--mui-palette-text-disabled)",
        },
        '.light .MuiPickersSectionList-sectionContent[data-content=""]': {
          color: "var(--mui-palette-text-disabled)",
        },
        // Picker outline uses its own class (`.MuiPickersOutlinedInput-notchedOutline`),
        // not `.MuiOutlinedInput-notchedOutline`, so MUI's `divider` never
        // reaches it. Pin explicitly for both modes. Hover keeps the border.
        ".MuiPickersOutlinedInput-notchedOutline": { borderColor: FIELD_BORDER },
        ".dark .MuiPickersOutlinedInput-root.Mui-error .MuiPickersOutlinedInput-notchedOutline": {
          borderColor: dark.status.error,
        },
        ".light .MuiPickersOutlinedInput-root.Mui-error .MuiPickersOutlinedInput-notchedOutline": {
          borderColor: status.error,
        },
        ".dark .MuiPickersOutlinedInput-root.Mui-focused .MuiPickersOutlinedInput-notchedOutline, .light .MuiPickersOutlinedInput-root.Mui-focused .MuiPickersOutlinedInput-notchedOutline":
          {
            borderColor: "var(--mui-palette-primary-main)",
            borderWidth: 1,
          },
        // number inputs: Chrome/Edge inject an off-white spinner background
        // that leaks through in dark mode. Reset it.
        '.dark input[type="number"]': {
          backgroundColor: "transparent",
          colorScheme: "dark",
        },
        '.light input[type="number"]': {
          backgroundColor: "transparent",
          colorScheme: "light",
        },
        // MUI X DataGrid: selected row + column menu portal.
        // DataGrid computes --DataGrid-containerBackground in JS as a static
        // hex at render time so it never switches with the CSS class toggle.
        // Pin it per mode so selected-row alpha blending uses the right base.
        ".dark .MuiDataGrid-root": {
          "--DataGrid-containerBackground": "var(--mui-palette-background-default)",
          "--DataGrid-rowBorderColor": "var(--mui-palette-divider)",
          color: "var(--mui-palette-text-primary)",
        },
        ".dark .MuiDataGrid-panelContent": {
          backgroundColor: "var(--mui-palette-background-paper)",
          color: "var(--mui-palette-text-primary)",
        },
        ".dark .MuiDataGrid-panelFooter": {
          backgroundColor: "var(--mui-palette-background-paper)",
          color: "var(--mui-palette-text-primary)",
        },
        // // Column menu renders in a portal outside the DataGrid DOM tree.
        ".dark .MuiDataGrid-panel .MuiPaper-root, .dark .MuiDataGrid-menu .MuiPaper-root": {
          backgroundColor: "var(--mui-palette-background-paper)",
          color: "var(--mui-palette-text-primary)",
        },
        ".dark .MuiDataGrid-panel .MuiSvgIcon-root, .dark .MuiDataGrid-menu .MuiSvgIcon-root": {
          color: "var(--mui-palette-text-secondary)",
        },
        // Filter panel inputs + selects
        ".dark .MuiDataGrid-panel .MuiInputBase-root, .dark .MuiDataGrid-panel .MuiSelect-select": {
          color: "var(--mui-palette-text-primary)",
        },
        ".dark .MuiDataGrid-panel .MuiInputLabel-root, .dark .MuiDataGrid-panel .MuiFormLabel-root":
          {
            color: "var(--mui-palette-text-secondary)",
          },
        ".dark .MuiDataGrid-panel .MuiOutlinedInput-notchedOutline": {
          borderColor: "var(--mui-palette-divider)",
        },
        ".dark .MuiDataGrid-panel .MuiSelect-icon": {
          color: "var(--mui-palette-text-secondary)",
        },
        // // Column visibility / management panel (portal)
        ".dark .MuiDataGrid-columnsManagement, .dark .MuiDataGrid-columnsPanel": {
          backgroundColor: "var(--mui-palette-background-paper)",
          color: "var(--mui-palette-text-primary)",
        },
        ".dark .MuiDataGrid-paper, .dark .MuiDataGrid-panelContent": {
          backgroundColor: "var(--mui-palette-background-paper)",
          color: "var(--mui-palette-text-primary)",
        },
        // Grid popups share the column-menu look in dark mode: row fill + MUI elevation-1 overlay.
        // The filter panel had no overlay and its Column / Operator dropdowns had the stronger
        // elevation-8 one. The dropdowns are plain MUI menus in a portal, so they are scoped to an
        // open grid panel instead of changing every menu.
        ".dark .MuiDataGrid-paper": {
          backgroundImage: "var(--mui-overlays-1)",
        },
        ".dark .MuiDataGrid-paper .MuiDataGrid-panelContent, .dark .MuiDataGrid-paper .MuiDataGrid-panelFooter":
          {
            backgroundColor: "transparent",
          },
        ".dark body:has(.MuiDataGrid-panel) .MuiMenu-paper": {
          backgroundImage: "var(--mui-overlays-1)",
        },
        ".dark .MuiDataGrid-columnHeaders .MuiDataGrid-filler": {
          backgroundColor: "var(--mui-palette-background-paper)",
          color: "var(--mui-palette-text-primary)",
        },
        ".dark .MuiDataGrid-columnHeaders .MuiDataGrid-scrollbarFiller": {
          backgroundColor: "var(--mui-palette-background-paper)",
          color: "var(--mui-palette-text-primary)",
        },
        //for the dropdown list in filter operator and column
        ".dark .MuiPaper-root.MuiPopover-paper.MuiMenu-paper": {
          backgroundColor: "var(--mui-palette-background-paper)",
          color: "var(--mui-palette-text-primary)",
        },
        //for the dropdown list in filter operator and column hover
        ".dark .MuiButtonBase-root.MuiMenuItem-root:hover": {
          backgroundColor: "var(--mui-palette-action-selected)",
        },
        //for the expand icon in tree data
        ".dark .MuiDataGrid-row .MuiButtonBase-root.MuiIconButton-root": {
          color: "var(--mui-palette-text-primary)",
        },
        ".dark .MuiDataGrid-row.Mui-selected .MuiButtonBase-root.MuiIconButton-root": {
          color: dark.text.inverse,
        },
        // Column menu item hover
        ".dark .MuiDataGrid-menu .MuiMenuItem-root:hover": {
          backgroundColor: "var(--mui-palette-action-selected)",
        },
        // Hover sits between the row fill and the selected-row blue (same tint as menu-item hover).
        ".dark .MuiDataGrid-row:hover": {
          backgroundColor: "var(--mui-palette-action-selected) !important",
        },
        // Same for light: MUI's own hover is almost white, so it barely shows.
        ".light .MuiDataGrid-row:hover:not(.Mui-selected)": {
          backgroundColor: "var(--mui-palette-action-selected) !important",
        },
        ".dark .MuiDataGrid-row.Mui-selected": {
          backgroundColor: "var(--mui-palette-primary-main) !important",
          color: "var(--mui-palette-primary-contrastText) !important",
        },
        ".dark .MuiDataGrid-row.Mui-selected:hover": {
          backgroundColor: "var(--mui-palette-primary-main) !important",
          color: "var(--mui-palette-primary-contrastText) !important",
        },

        // MUI x-date-pickers render their calendar + digital-clock popovers
        // via a portal on <body>. The portal sits outside any theme-scoped
        // container, so it defaults to MUI's light `background.paper`. Pin
        // the popper paper + every inner surface for both modes.
        ".dark .MuiPickersPopper-paper, .dark .MuiPickersLayout-root, .dark .MuiDateCalendar-root, .dark .MuiYearCalendar-root, .dark .MuiMonthCalendar-root, .dark .MuiMultiSectionDigitalClock-root, .dark .MuiPickersToolbar-root, .dark .MuiPickersActionBar-root":
          {
            backgroundColor: "var(--mui-palette-background-paper)",
            color: "var(--mui-palette-text-primary)",
          },
        ".light .MuiPickersPopper-paper, .light .MuiPickersLayout-root, .light .MuiDateCalendar-root, .light .MuiYearCalendar-root, .light .MuiMonthCalendar-root, .light .MuiMultiSectionDigitalClock-root, .light .MuiPickersToolbar-root, .light .MuiPickersActionBar-root":
          {
            backgroundColor: "var(--mui-palette-background-paper)",
            color: "var(--mui-palette-text-primary)",
          },
        // Calendar header (month/year label + arrow buttons) + weekday labels.
        ".dark .MuiPickersCalendarHeader-root, .dark .MuiPickersCalendarHeader-label, .dark .MuiPickersCalendarHeader-switchViewButton, .dark .MuiPickersArrowSwitcher-button":
          {
            color: "var(--mui-palette-text-primary)",
          },
        ".light .MuiPickersCalendarHeader-root, .light .MuiPickersCalendarHeader-label, .light .MuiPickersCalendarHeader-switchViewButton, .light .MuiPickersArrowSwitcher-button":
          {
            color: "var(--mui-palette-text-primary)",
          },
        // The design date-dropdown: arrows and weekday labels are muted, Sundays are red.
        ".light .MuiPickersArrowSwitcher-button": { color: picker.nav },
        ".dark .MuiPickersArrowSwitcher-button": { color: dark.picker.nav },
        ".light .MuiDayCalendar-weekDayLabel": { color: picker.weekday },
        ".dark .MuiDayCalendar-weekDayLabel": { color: dark.picker.weekday },
        // Sunday is the first column (default week start).
        ".light .MuiDayCalendar-header > .MuiDayCalendar-weekDayLabel:nth-child(7n+1), .light .MuiDayCalendar-weekContainer > .MuiPickerDay-root:nth-child(7n+1)":
          { color: `${picker.sunday} !important` },
        ".dark .MuiDayCalendar-header > .MuiDayCalendar-weekDayLabel:nth-child(7n+1), .dark .MuiDayCalendar-weekContainer > .MuiPickerDay-root:nth-child(7n+1)":
          { color: `${dark.picker.sunday} !important` },
        // Individual day cells: neutral text; MUI's selected/today states
        // are re-asserted below to win by cascade order (declared last).
        // MUI 9.x renders class as `.MuiPickerDay-*` (singular). Older
        // consumer overrides may have used `.MuiPickersDay-*` (plural) —
        // include both for safety. Uses `!important` because MUI's own
        // styled component injects `color: text.primary` at same-specificity
        // AFTER our CssBaseline block loads (Emotion runtime insertion order),
        // so equal-specificity rules lose the cascade fight.
        ".dark .MuiPickerDay-root, .dark .MuiPickersDay-root": {
          color: `var(--mui-palette-text-primary) !important`,
        },
        ".light .MuiPickerDay-root, .light .MuiPickersDay-root": {
          color: `var(--mui-palette-text-primary) !important`,
        },
        ".dark .MuiPickerDay-root.Mui-disabled, .dark .MuiPickersDay-root.Mui-disabled": {
          color: `var(--mui-palette-text-disabled) !important`,
        },
        ".light .MuiPickerDay-root.Mui-disabled, .light .MuiPickersDay-root.Mui-disabled": {
          color: `var(--mui-palette-text-disabled) !important`,
        },
        // The design: days from neighbouring months keep their color but are faded.
        ".MuiPickerDay-dayOutsideMonth, .MuiPickersDay-dayOutsideMonth": { opacity: 0.4 },
        // Digital clock section (hours / minutes / AM-PM columns): text +
        // divider between columns.
        ".dark .MuiMultiSectionDigitalClock-root .MuiMenuItem-root:not(.Mui-selected)": {
          color: dark.picker.nav,
        },
        ".light .MuiMultiSectionDigitalClock-root .MuiMenuItem-root:not(.Mui-selected)": {
          color: picker.nav,
        },
        ".dark .MuiMultiSectionDigitalClockSection-root": {
          borderColor: "var(--mui-palette-divider)",
        },
        ".light .MuiMultiSectionDigitalClockSection-root": {
          borderColor: "var(--mui-palette-divider)",
        },
        // Selected day/time cell: a light primary tint with normal text in light mode,
        // a solid primary fill with contrast text in dark mode.
        ".dark .MuiPickersDay-root.Mui-selected, .dark .MuiPickerDay-root.Mui-selected, .dark .MuiYearCalendar-button.Mui-selected, .dark .MuiMonthCalendar-button.Mui-selected, .dark .MuiMultiSectionDigitalClock-root .MuiMenuItem-root.Mui-selected":
          {
            backgroundColor: "var(--mui-palette-primary-main) !important",
            color: "var(--mui-palette-primary-contrastText) !important",
          },
        ".light .MuiPickersDay-root.Mui-selected, .light .MuiPickerDay-root.Mui-selected, .light .MuiYearCalendar-button.Mui-selected, .light .MuiMonthCalendar-button.Mui-selected, .light .MuiMultiSectionDigitalClock-root .MuiMenuItem-root.Mui-selected":
          {
            backgroundColor: "rgba(var(--mui-palette-primary-mainChannel) / 0.14) !important",
            color: `var(--mui-palette-text-primary) !important`,
          },
      },
    },
    MuiContainer: {
      defaultProps: { maxWidth: "xl" as const },
    },
    // Dialogs follow the "Popup Message": 8px panel with the panel shadow, a 24/32
    // Medium title bar (16/24 padding), a 24px padded 16/24 body and a 16/24 padded footer.
    MuiDialog: {
      styleOverrides: {
        paper: ({ theme: t }) => ({
          borderRadius: radii.lg,
          boxShadow: shadows.panel,
          "&.MuiDialog-paperFullScreen": { borderRadius: 0 },
          // Prevent dialogs from overflowing on small screens (full-screen dialogs stay edge-to-edge)
          [t.breakpoints.down("sm")]: {
            "&:not(.MuiDialog-paperFullScreen)": {
              margin: `${spacing.sm}px`,
              maxWidth: `calc(100% - ${spacing.lg}px)`,
              maxHeight: `calc(100% - ${spacing.lg}px)`,
            },
          },
        }),
      },
    },
    // The design title is #1F1A17; `text.heading` (#2A2420) is the nearest existing token.
    MuiDialogTitle: {
      styleOverrides: {
        root: ({ theme: t }) => ({
          padding: `${spacing.lg}px ${spacing.xl}px`,
          fontFamily: textVariant.headingXl.fontFamily,
          fontSize: textVariant.headingXl.fontSize,
          fontWeight: fontWeight.medium,
          lineHeight: textVariant.headingXl.lineHeight,
          textTransform: "capitalize",
          color: text.heading,
          ...t.applyStyles("dark", { color: dark.text.heading }),
        }),
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: `${spacing.xl}px`,
          fontFamily: textVariant.bodyLg.fontFamily,
          fontSize: textVariant.bodyLg.fontSize,
          lineHeight: textVariant.bodyLg.lineHeight,
          // MUI removes the top padding after a title; Fabric keeps the full 24px.
          ".MuiDialogTitle-root + &": { paddingTop: spacing.xl },
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: { padding: `${spacing.lg}px ${spacing.xl}px` },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: ({ theme: t }) => ({
          // Drawers should not exceed viewport on mobile
          [t.breakpoints.down("sm")]: {
            maxWidth: drawerWidth.mobileMax,
          },
        }),
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: ({ theme: t }) => ({
          [t.breakpoints.down("sm")]: {
            minHeight: 40,
          },
        }),
      },
    },
    // MUI x-date-pickers segment-based inputs don't inherit from text.primary
    // out of the box; route them through the palette so dark mode works
    // everywhere without per-site sx overrides. Cast is required because we
    // don't depend on `@mui/x-date-pickers` at the theme package level (would
    // pull the whole picker surface into this package's peer dep graph).
    ...({
      // Same 16/24 value text as `MuiOutlinedInput`; disabled values go grey like the text field.
      MuiPickersSectionList: {
        styleOverrides: {
          root: {
            color: "var(--mui-palette-text-primary)",
            fontSize: fontSize.lg,
            lineHeight: "24px",
          },
          section: { color: "var(--mui-palette-text-primary)" },
          sectionContent: { color: "var(--mui-palette-text-primary)", lineHeight: "24px" },
        },
      },
      MuiPickersTextField: {
        styleOverrides: {
          root: { color: "var(--mui-palette-text-primary)" },
        },
      },
      MuiPickersInputBase: {
        styleOverrides: {
          root: {
            color: "var(--mui-palette-text-primary)",
            fontSize: fontSize.lg,
            lineHeight: "24px",
          },
          sectionContent: { fontSize: fontSize.lg, lineHeight: "24px" },
        },
      },
      MuiPickersOutlinedInput: {
        styleOverrides: {
          root: {
            color: "var(--mui-palette-text-primary)",
            borderRadius: radii.lg,
            backgroundColor: "var(--mui-palette-background-paper)",
          },
          // 24px text + 8px top/bottom = the 40px field height.
          sectionsContainer: { padding: `${spacing.sm}px 0` },
        },
      },
      MuiPickersFilledInput: {
        styleOverrides: {
          root: { color: "var(--mui-palette-text-primary)" },
        },
      },
      // The design date-dropdown: 32px day cells with 8px radius and 1px gap, 16px text.
      MuiPickerDay: {
        styleOverrides: {
          root: {
            color: "var(--mui-palette-text-primary)",
            width: 32,
            height: 32,
            margin: "0 0.5px",
            borderRadius: radii.lg,
            fontSize: fontSize.lg,
          },
        },
      },
      MuiPickersDay: {
        styleOverrides: {
          root: {
            color: "var(--mui-palette-text-primary)",
            width: 32,
            height: 32,
            margin: "0 0.5px",
            borderRadius: radii.lg,
            fontSize: fontSize.lg,
          },
        },
      },
      MuiDayCalendar: {
        styleOverrides: {
          slideTransition: { minHeight: 198 },
          weekDayLabel: {
            width: 32,
            height: 32,
            margin: "0 0.5px",
            fontSize: fontSize.lg,
            color: "var(--mui-palette-text-secondary)",
          },
        },
      },
      MuiPickersCalendarHeader: {
        styleOverrides: {
          root: {
            color: "var(--mui-palette-text-primary)",
            paddingLeft: 8,
            paddingRight: 4,
            marginTop: 4,
            marginBottom: 4,
          },
          label: {
            color: "var(--mui-palette-text-primary)",
            fontSize: fontSize.lg,
            fontWeight: fontWeight.semiBold,
            whiteSpace: "nowrap",
          },
          switchViewButton: { color: "var(--mui-palette-text-primary)" },
        },
      },
      MuiPickersArrowSwitcher: {
        styleOverrides: {
          button: { color: "var(--mui-palette-text-primary)", borderRadius: radii.md },
        },
      },
      MuiPickerPopper: {
        styleOverrides: {
          paper: {
            borderRadius: radii.lg,
            boxShadow: "0 4px 8px rgba(42, 36, 32, 0.25)",
            padding: 4,
          },
        },
      },
      MuiDateCalendar: {
        styleOverrides: { root: { width: 232, height: "auto", minHeight: 0 } },
      },
      MuiYearCalendar: {
        styleOverrides: { root: { width: 232, maxHeight: 240, scrollbarWidth: "thin" } },
      },
      MuiMonthCalendar: {
        styleOverrides: { root: { width: 232 } },
      },
      // The design time columns: 32px cells (8px radius) in 44px columns, five rows visible, no dividers.
      MuiMultiSectionDigitalClock: {
        styleOverrides: {
          root: {
            color: "var(--mui-palette-text-primary)",
            width: "auto",
            border: 0,
            "& .MuiMenuItem-root": { fontSize: fontSize.lg },
            "& .MuiMenuItem-root:not(.Mui-selected)": { color: picker.nav },
          },
        },
      },
      MuiMultiSectionDigitalClockSection: {
        styleOverrides: {
          root: { width: 44, maxHeight: 166, borderLeft: 0 },
          item: {
            width: 32,
            minHeight: 32,
            height: 32,
            padding: 0,
            margin: "1px 6px",
            justifyContent: "center",
            borderRadius: radii.lg,
          },
        },
      },
    } as Record<string, unknown>),
  },
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" && value !== null && Object.getPrototypeOf(value) === Object.prototype
  );
}

/** Deep-merges plain objects; arrays, functions and other values in `source` replace `target`. */
function deepmerge<T>(target: T, source: unknown): T {
  if (!isPlainObject(target) || !isPlainObject(source)) return (source ?? target) as T;
  const out: Record<string, unknown> = { ...target };
  for (const [key, value] of Object.entries(source)) {
    out[key] = key in out ? deepmerge(out[key], value) : value;
  }
  return out as T;
}

/** Fabric's default theme. */
export const theme = createTheme(baseThemeOptions);

/**
 * Builds a Fabric theme with your overrides deep-merged over Fabric's options.
 * Use it to change the brand color, fonts, radii or any component override,
 * then pass the result to `DesignSystemProvider`'s `theme` prop.
 *
 * @example
 * ```ts
 * const brandTheme = createFabricTheme({
 *   colorSchemes: {
 *     light: { palette: { primary: { main: "#2563EB" } } },
 *     dark: { palette: { primary: { main: "#93C5FD" } } },
 *   },
 *   typography: { fontFamily: "'Inter', sans-serif" },
 * });
 * ```
 */
export function createFabricTheme(overrides: ThemeOptions = {}, ...args: object[]): Theme {
  const merged = deepmerge(baseThemeOptions, overrides);
  const userSchemes = (overrides.colorSchemes ?? {}) as Record<string, { palette?: PaletteLike }>;
  const mergedSchemes = (merged.colorSchemes ?? {}) as Record<string, { palette?: PaletteLike }>;

  for (const scheme of ["light", "dark"] as const) {
    const user = userSchemes[scheme]?.palette;
    const palette = mergedSchemes[scheme]?.palette;
    if (!user || !palette) continue;

    // A palette color you override replaces Fabric's whole color, so MUI derives
    // matching light/dark/contrast shades instead of keeping Fabric's.
    for (const key of ["primary", "secondary"] as const) {
      if (user[key]) palette[key] = { ...user[key] };
    }

    // Values Fabric derives from its brand color follow your primary color.
    const main = user.primary?.main;
    if (typeof main === "string") {
      palette.action = {
        ...palette.action,
        active: user.action?.active ?? main,
        // Dark mode tints hover and selection with the brand color.
        ...(scheme === "dark" && {
          hover: user.action?.hover ?? alpha(main, 0.08),
          selected: user.action?.selected ?? alpha(main, 0.12),
        }),
      };
      palette.appShell = {
        ...palette.appShell,
        hover:
          user.appShell?.hover ?? (scheme === "light" ? darken(main, 0.15) : lighten(main, 0.25)),
      };
      palette.datagrid = {
        ...palette.datagrid,
        headerBg:
          user.datagrid?.headerBg ??
          (scheme === "light" ? lighten(main, 0.88) : darken(main, 0.72)),
      };
    }
  }

  return createTheme(merged, ...args);
}

/** The palette keys `createFabricTheme` reads and adjusts. */
interface PaletteLike {
  primary?: { main?: string; [key: string]: unknown };
  secondary?: { main?: string; [key: string]: unknown };
  action?: { active?: string; hover?: string; selected?: string; [key: string]: unknown };
  appShell?: { hover?: string; [key: string]: unknown };
  datagrid?: { headerBg?: string; [key: string]: unknown };
  [key: string]: unknown;
}

export { baseThemeOptions, ThemeProvider };
