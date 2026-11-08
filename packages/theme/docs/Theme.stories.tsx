import { Typography, useTheme } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  action as actionTokens,
  border,
  breakpoints as bpTokens,
  brand,
  dark,
  duration,
  easing,
  fontFamily,
  radii,
  spacing as spacingTokens,
  status,
  surface,
  text as textTokens,
} from "@fabric-kit/design-tokens";
import type React from "react";
import { DesignSystemProvider, ThemeModeSwitcher, useThemeMode } from "../src";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const useP = () => {
  const t = useTheme();
  return { ...(t.vars?.palette ?? t.palette) } as typeof t.palette;
};

const H2 = ({ children }: { children: React.ReactNode }) => {
  const p = useP();
  return (
    <h2
      style={{
        fontFamily: "'Geist', sans-serif",
        fontSize: 22,
        fontWeight: 700,
        color: p.text.primary,
        margin: "56px 0 6px",
        borderBottom: `2px solid ${p.divider}`,
        paddingBottom: 8,
      }}
    >
      {children}
    </h2>
  );
};

const H3 = ({ children }: { children: React.ReactNode }) => {
  const p = useP();
  return (
    <h3
      style={{
        fontFamily: "'Geist', sans-serif",
        fontSize: 16,
        fontWeight: 600,
        color: p.text.primary,
        margin: "28px 0 4px",
      }}
    >
      {children}
    </h3>
  );
};

const Desc = ({ children }: { children: React.ReactNode }) => {
  const p = useP();
  return (
    <p
      style={{
        fontSize: 13,
        color: p.text.secondary,
        margin: "0 0 16px",
        lineHeight: 1.6,
        maxWidth: 680,
      }}
    >
      {children}
    </p>
  );
};

const Code = ({ children }: { children: string }) => {
  const p = useP();
  return (
    <pre
      style={{
        padding: "14px 18px",
        borderRadius: 10,
        fontSize: 12.5,
        lineHeight: 1.6,
        backgroundColor: p.action.selected,
        color: p.text.primary,
        overflow: "auto",
        margin: "0 0 16px",
        fontFamily: "'Fira Code', 'Consolas', monospace",
      }}
    >
      {children}
    </pre>
  );
};

const InlineCode = ({ children }: { children: React.ReactNode }) => {
  const p = useP();
  return (
    <code
      style={{
        fontSize: 12,
        padding: "2px 7px",
        borderRadius: 5,
        backgroundColor: p.action.selected,
        color: p.text.secondary,
      }}
    >
      {children}
    </code>
  );
};

const Card = ({ children, label }: { children: React.ReactNode; label?: string }) => {
  const p = useP();
  return (
    <div
      style={{
        border: `1px solid ${p.divider}`,
        borderRadius: 10,
        padding: 16,
        backgroundColor: p.background.paper,
        position: "relative",
      }}
    >
      {label && (
        <div
          style={{
            position: "absolute",
            top: -10,
            left: 12,
            padding: "0 6px",
            backgroundColor: p.background.paper,
            fontSize: 11,
            color: p.text.secondary,
            fontFamily: "monospace",
          }}
        >
          {label}
        </div>
      )}
      {children}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  1. Header                                                          */
/* ------------------------------------------------------------------ */

const Header = () => {
  const p = useP();
  return (
    <header style={{ marginBottom: 40 }}>
      <h1
        style={{
          fontFamily: "'Geist', sans-serif",
          fontSize: 32,
          fontWeight: 700,
          color: p.text.primary,
          margin: "0 0 6px",
        }}
      >
        Theme System
      </h1>
      <p
        style={{
          fontSize: 15,
          color: p.text.secondary,
          margin: "0 0 24px",
          lineHeight: 1.6,
          maxWidth: 640,
        }}
      >
        <InlineCode>@fabric-kit/theme</InlineCode> is Fabric's MUI theme. It maps design tokens to MUI's palette, typography, spacing, elevation, and
        transition systems — with built-in light/dark mode via CSS variables.
      </p>
      <div
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          fontSize: 12,
          fontWeight: 600,
        }}
      >
        {[
          ["Design Tokens", "Token primitives (colors, spacing, type)"],
          ["Theme", "Maps tokens → MUI palette, typography, shadows…"],
          ["Provider", "React context + mode persistence"],
          ["Components", "Consume theme via sx, useTheme, styled()"],
        ].map(([title, desc]) => (
          <div
            key={title}
            style={{
              flex: "1 1 190px",
              padding: "14px 16px",
              borderRadius: 10,
              border: `1px solid ${p.divider}`,
              backgroundColor: p.background.paper,
            }}
          >
            <div style={{ color: p.primary.main, marginBottom: 4 }}>{title}</div>
            <div
              style={{ fontWeight: 400, fontSize: 12, color: p.text.secondary, lineHeight: 1.5 }}
            >
              {desc}
            </div>
          </div>
        ))}
      </div>
    </header>
  );
};

/* ------------------------------------------------------------------ */
/*  2. Getting Started                                                 */
/* ------------------------------------------------------------------ */

const GettingStarted = () => (
  <>
    <H2>Getting Started</H2>
    <H3>With DesignSystemProvider (recommended)</H3>
    <Desc>
      Wrap your app root once. The provider injects the MUI theme, applies CssBaseline, persists the
      user's mode choice to localStorage, and watches for OS-level preference changes.
    </Desc>
    <Code>{`import { DesignSystemProvider } from '@fabric-kit/theme';

function App() {
  return (
    <DesignSystemProvider defaultMode="light">
      <YourApp />
    </DesignSystemProvider>
  );
}`}</Code>

    <H3>With ThemeProvider directly</H3>
    <Desc>
      If you only need the theme object (e.g. in tests or utilities that don't need mode
      persistence), use ThemeProvider with the exported theme.
    </Desc>
    <Code>{`import { ThemeProvider, theme } from '@fabric-kit/theme';
import { CssBaseline } from '@mui/material';

<ThemeProvider theme={theme}>
  <CssBaseline enableColorScheme />
  <YourApp />
</ThemeProvider>`}</Code>
  </>
);

/* ------------------------------------------------------------------ */
/*  3. Dark Mode                                                       */
/* ------------------------------------------------------------------ */

const ModeDemo = () => {
  const { mode, resolvedMode } = useThemeMode();
  const p = useP();
  return (
    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
      <ThemeModeSwitcher />
      <div style={{ fontSize: 13, color: p.text.secondary }}>
        mode: <strong style={{ color: p.text.primary }}>{mode}</strong>
        {" · "}resolved: <strong style={{ color: p.text.primary }}>{resolvedMode}</strong>
      </div>
    </div>
  );
};

const DarkModeSection = () => {
  const p = useP();
  return (
    <>
      <H2>Dark Mode</H2>
      <Desc>
        The theme uses MUI's CSS variables mode with class-based toggling. A single theme object
        defines both light and dark color schemes. When the resolved mode changes, a class (
        <InlineCode>.light</InlineCode> or <InlineCode>.dark</InlineCode>) is applied to the{" "}
        <InlineCode>&lt;html&gt;</InlineCode> element, and all CSS variables update instantly — no
        React re-render required.
      </Desc>

      <H3>How it works</H3>
      <div
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          fontSize: 12,
          marginBottom: 20,
        }}
      >
        {[
          ["1", "createTheme()", 'cssVariables: { colorSchemeSelector: "class" }'],
          ["2", "CssBaseline", "Injects :root variables for both schemes"],
          ["3", "Class toggle", '<html class="dark"> swaps variable values'],
          ["4", "Components", "Read var(--mui-palette-*) — auto-update"],
        ].map(([n, title, desc]) => (
          <div
            key={n}
            style={{
              flex: "1 1 200px",
              padding: "12px 14px",
              borderRadius: 8,
              border: `1px solid ${p.divider}`,
              display: "flex",
              gap: 10,
              alignItems: "flex-start",
            }}
          >
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                backgroundColor: p.primary.main,
                color: p.primary.contrastText,
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              {n}
            </div>
            <div>
              <div style={{ fontWeight: 600, color: p.text.primary }}>{title}</div>
              <div style={{ color: p.text.secondary, lineHeight: 1.5, marginTop: 2 }}>{desc}</div>
            </div>
          </div>
        ))}
      </div>

      <H3>ThemeModeSwitcher</H3>
      <Desc>
        Drop-in button that cycles <strong>light → dark → system</strong>. Place it anywhere inside
        a DesignSystemProvider.
      </Desc>
      <Card label="Live demo (self-contained provider)">
        <DesignSystemProvider defaultMode="light">
          <ModeDemo />
        </DesignSystemProvider>
      </Card>

      <H3>useThemeMode hook</H3>
      <Desc>
        Access the current mode and setter programmatically. Must be called inside a
        DesignSystemProvider.
      </Desc>
      <Code>{`import { useThemeMode } from '@fabric-kit/theme';

const { mode, setMode, resolvedMode } = useThemeMode();
// mode:         'light' | 'dark' | 'system'
// resolvedMode: 'light' | 'dark'  (actual applied mode)
// setMode:      (mode) => void    (persists to localStorage)`}</Code>

      <H3>Persistence</H3>
      <Desc>
        The selected mode is stored in <InlineCode>localStorage</InlineCode> under the key{" "}
        <InlineCode>fabric-theme-mode</InlineCode>. On mount, the provider reads this value.
        If no stored preference exists, <InlineCode>defaultMode</InlineCode> is used. When mode is{" "}
        <InlineCode>"system"</InlineCode>, the provider listens to{" "}
        <InlineCode>prefers-color-scheme</InlineCode> media query changes in real time.
      </Desc>
    </>
  );
};

/* ------------------------------------------------------------------ */
/*  4. Palette                                                         */
/* ------------------------------------------------------------------ */

const PaletteSwatch = ({
  label,
  lightHex,
  darkHex,
  path,
}: {
  label: string;
  lightHex: string;
  darkHex: string;
  path: string;
}) => {
  const p = useP();
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 10px",
        borderRadius: 8,
        border: `1px solid ${p.divider}`,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <div
          style={{
            width: 36,
            height: 18,
            borderRadius: "6px 6px 0 0",
            backgroundColor: lightHex,
            border: "1px solid rgba(0,0,0,0.08)",
          }}
          title={`Light: ${lightHex}`}
        />
        <div
          style={{
            width: 36,
            height: 18,
            borderRadius: "0 0 6px 6px",
            backgroundColor: darkHex,
            border: "1px solid rgba(255,255,255,0.08)",
          }}
          title={`Dark: ${darkHex}`}
        />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 12, color: p.text.primary }}>{label}</div>
        <div style={{ fontSize: 11, color: p.text.secondary, fontFamily: "monospace" }}>{path}</div>
      </div>
    </div>
  );
};

const paletteGroups = [
  {
    title: "Brand / Primary",
    desc: "The primary action color used for buttons, links, and focus states.",
    items: [
      {
        label: "primary.main",
        l: brand.primary,
        d: dark.brand.primary,
        path: "palette.primary.main",
      },
      {
        label: "primary.light",
        l: brand.primaryLight,
        d: dark.brand.primaryLight,
        path: "palette.primary.light",
      },
      {
        label: "primary.dark",
        l: actionTokens.primaryHover,
        d: brand.primary,
        path: "palette.primary.dark",
      },
      {
        label: "primary.contrastText",
        l: textTokens.inverse,
        d: dark.text.inverse,
        path: "palette.primary.contrastText",
      },
    ],
  },
  {
    title: "Secondary",
    desc: "Accent color for secondary actions and highlights.",
    items: [
      {
        label: "secondary.main",
        l: brand.secondary,
        d: dark.brand.secondary,
        path: "palette.secondary.main",
      },
      {
        label: "secondary.contrastText",
        l: textTokens.inverse,
        d: dark.text.inverse,
        path: "palette.secondary.contrastText",
      },
    ],
  },
  {
    title: "Status",
    desc: "Semantic colors for success, error, warning, and informational states.",
    items: [
      { label: "error.main", l: status.error, d: dark.status.error, path: "palette.error.main" },
      {
        label: "warning.main",
        l: status.warning,
        d: dark.status.warning,
        path: "palette.warning.main",
      },
      {
        label: "success.main",
        l: status.success,
        d: dark.status.success,
        path: "palette.success.main",
      },
      { label: "info.main", l: status.info, d: dark.status.info, path: "palette.info.main" },
    ],
  },
  {
    title: "Text",
    desc: "Text foreground colors. Use text.primary for body copy, text.secondary for labels and hints.",
    items: [
      {
        label: "text.primary",
        l: textTokens.primary,
        d: dark.text.primary,
        path: "palette.text.primary",
      },
      {
        label: "text.secondary",
        l: textTokens.secondary,
        d: dark.text.secondary,
        path: "palette.text.secondary",
      },
      {
        label: "text.disabled",
        l: textTokens.disabled,
        d: dark.text.disabled,
        path: "palette.text.disabled",
      },
    ],
  },
  {
    title: "Surfaces & Backgrounds",
    desc: "Background fills for pages, cards, and containers.",
    items: [
      {
        label: "background.default",
        l: surface.secondary,
        d: dark.surface.secondary,
        path: "palette.background.default",
      },
      {
        label: "background.paper",
        l: surface.primary,
        d: dark.surface.primary,
        path: "palette.background.paper",
      },
      { label: "divider", l: border.default, d: dark.border.default, path: "palette.divider" },
    ],
  },
  {
    title: "Action",
    desc: "Interactive state colors for hover, focus, selected, and disabled states.",
    items: [
      {
        label: "action.active",
        l: actionTokens.primary,
        d: dark.action.primary,
        path: "palette.action.active",
      },
      {
        label: "action.hover",
        l: actionTokens.selected,
        d: "rgba(122,180,224,0.08)",
        path: "palette.action.hover",
      },
      {
        label: "action.selected",
        l: actionTokens.selected,
        d: dark.action.selected,
        path: "palette.action.selected",
      },
      {
        label: "action.disabled",
        l: actionTokens.disabled,
        d: dark.action.disabled,
        path: "palette.action.disabled",
      },
      {
        label: "action.disabledBg",
        l: surface.tertiary,
        d: dark.surface.tertiary,
        path: "palette.action.disabledBackground",
      },
    ],
  },
];

const PaletteSection = () => {
  const p = useP();
  return (
    <>
      <H2>Palette</H2>
      <Desc>
        Design tokens are mapped to MUI's palette structure. Each swatch shows the light value (top
        half) and dark value (bottom half). Use the <InlineCode>sx</InlineCode> path to reference
        colors: <InlineCode>{'sx={{ color: "text.secondary" }}'}</InlineCode>.
      </Desc>
      <div
        style={{
          display: "flex",
          gap: 4,
          marginBottom: 16,
          fontSize: 11,
          color: p.text.secondary,
        }}
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
          <span
            style={{
              width: 12,
              height: 8,
              borderRadius: "3px 3px 0 0",
              backgroundColor: p.text.disabled,
              display: "inline-block",
            }}
          />{" "}
          Light
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, marginLeft: 8 }}>
          <span
            style={{
              width: 12,
              height: 8,
              borderRadius: "0 0 3px 3px",
              backgroundColor: p.text.primary,
              display: "inline-block",
            }}
          />{" "}
          Dark
        </span>
      </div>

      {paletteGroups.map(({ title, desc, items }) => (
        <div key={title} style={{ marginBottom: 24 }}>
          <H3>{title}</H3>
          <Desc>{desc}</Desc>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {items.map(({ label, l, d, path }) => (
              <PaletteSwatch key={label} label={label} lightHex={l} darkHex={d} path={path} />
            ))}
          </div>
        </div>
      ))}

      <H3>Usage in code</H3>
      <Code>{`// sx prop — simplest, recommended
<Box sx={{ bgcolor: 'background.paper', color: 'text.primary' }} />

// useTheme — for inline styles that need dark-mode support
const theme = useTheme();
<div style={{ color: theme.vars.palette.text.primary }} />

// Direct CSS variable — works in plain CSS / style tags
.myClass { color: var(--mui-palette-text-primary); }`}</Code>
    </>
  );
};

/* ------------------------------------------------------------------ */
/*  5. Typography                                                      */
/* ------------------------------------------------------------------ */

const typoVariants: { variant: string; role: string }[] = [
  { variant: "h1", role: "Page title" },
  { variant: "h2", role: "Section title" },
  { variant: "h3", role: "Subsection" },
  { variant: "h4", role: "Card heading" },
  { variant: "h5", role: "Small heading" },
  { variant: "h6", role: "Label heading" },
  { variant: "subtitle1", role: "Large label" },
  { variant: "subtitle2", role: "Small label" },
  { variant: "body1", role: "Body copy (default)" },
  { variant: "body2", role: "Secondary body" },
  { variant: "button", role: "Button text" },
  { variant: "caption", role: "Helper / caption" },
  { variant: "overline", role: "Overline / tag" },
];

const TypographySection = () => {
  const t = useTheme();
  const p = useP();
  return (
    <>
      <H2>Typography</H2>
      <Desc>
        All 13 MUI typography variants are mapped to design tokens. Headings use{" "}
        <InlineCode>{fontFamily.heading}</InlineCode>, body text uses{" "}
        <InlineCode>{fontFamily.body}</InlineCode>. No text transform is applied to buttons.
      </Desc>

      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {typoVariants.map(({ variant, role }) => {
          const spec = t.typography[variant as keyof typeof t.typography] as Record<
            string,
            unknown
          >;
          return (
            <div
              key={variant}
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 12,
                padding: "10px 14px",
                borderRadius: 8,
                border: `1px solid ${p.divider}`,
              }}
            >
              <code
                style={{
                  width: 80,
                  flexShrink: 0,
                  fontSize: 11,
                  fontWeight: 600,
                  color: p.primary.main,
                }}
              >
                {variant}
              </code>
              <div style={{ flex: 1 }}>
                <Typography variant={variant as any} sx={{ lineHeight: 1.3 }}>
                  The quick brown fox
                </Typography>
              </div>
              <div
                style={{
                  flexShrink: 0,
                  textAlign: "right",
                  fontSize: 11,
                  color: p.text.secondary,
                  lineHeight: 1.5,
                }}
              >
                <div>{role}</div>
                <div style={{ fontFamily: "monospace" }}>
                  {spec?.fontSize as string} · {spec?.fontWeight as string}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <H3>Font families</H3>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 8 }}>
        {(
          [
            ["Heading", fontFamily.heading, "h1–h6, subtitle, button, overline"],
            ["Body", fontFamily.body, "body1, body2, caption"],
          ] as const
        ).map(([label, family, usage]) => (
          <Card key={label} label={label}>
            <div
              style={{
                fontFamily: family,
                fontSize: 20,
                fontWeight: 600,
                color: p.text.primary,
                marginBottom: 4,
              }}
            >
              AaBbCc 0123
            </div>
            <div style={{ fontSize: 12, color: p.text.secondary, fontFamily: "monospace" }}>
              {family}
            </div>
            <div style={{ fontSize: 11, color: p.text.secondary, marginTop: 4 }}>
              Used by: {usage}
            </div>
          </Card>
        ))}
      </div>
    </>
  );
};

/* ------------------------------------------------------------------ */
/*  6. Spacing                                                         */
/* ------------------------------------------------------------------ */

const SpacingSection = () => {
  const t = useTheme();
  const p = useP();
  const factors = [0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10, 12];
  return (
    <>
      <H2>Spacing</H2>
      <Desc>
        The spacing function multiplies the factor by the base unit (
        <InlineCode>{spacingTokens.xs}px</InlineCode>). Use it via{" "}
        <InlineCode>{"theme.spacing(n)"}</InlineCode> or shorthand{" "}
        <InlineCode>{"sx={{ p: 2 }}"}</InlineCode> (= {spacingTokens.xs * 2}px).
      </Desc>
      <Code>{`theme.spacing(1)  → '${t.spacing(1)}'
theme.spacing(2)  → '${t.spacing(2)}'
theme.spacing(3)  → '${t.spacing(3)}'

// sx shorthand — p, m, gap all use the spacing function
<Box sx={{ p: 2, gap: 1.5, mt: 4 }} />`}</Code>

      <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 12 }}>
        {factors.map((f) => (
          <div key={f} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <code
              style={{
                width: 50,
                fontSize: 11,
                color: p.primary.main,
                fontWeight: 600,
                textAlign: "right",
              }}
            >
              {f}
            </code>
            <div
              style={{
                height: 18,
                borderRadius: 4,
                width: f * spacingTokens.xs,
                backgroundColor: p.primary.main,
                transition: "background-color 0.2s",
              }}
            />
            <span style={{ fontSize: 11, color: p.text.secondary }}>{f * spacingTokens.xs}px</span>
          </div>
        ))}
      </div>
    </>
  );
};

/* ------------------------------------------------------------------ */
/*  7. Elevation / Shadows                                             */
/* ------------------------------------------------------------------ */

const ElevationSection = () => {
  const t = useTheme();
  const p = useP();
  const levels = [
    { label: "none", idx: 0, token: "shadows.none" },
    { label: "xs", idx: 1, token: "shadows.xs" },
    { label: "sm", idx: 3, token: "shadows.sm" },
    { label: "md", idx: 5, token: "shadows.md" },
    { label: "lg", idx: 9, token: "shadows.lg" },
    { label: "xl", idx: 17, token: "shadows.xl" },
  ];
  return (
    <>
      <H2>Elevation</H2>
      <Desc>
        MUI's 25-level shadow scale is populated from 6 design token tiers. Use{" "}
        <InlineCode>{"sx={{ boxShadow: 3 }}"}</InlineCode> or the <InlineCode>elevation</InlineCode>{" "}
        prop on Paper / Card.
      </Desc>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {levels.map(({ label, idx, token }) => (
          <div
            key={label}
            style={{
              width: 120,
              height: 80,
              borderRadius: 10,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: t.shadows[idx],
              backgroundColor: p.background.paper,
              border: idx === 0 ? `1px dashed ${p.divider}` : "none",
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 600, color: p.text.primary }}>{label}</div>
            <div style={{ fontSize: 11, color: p.text.secondary }}>elevation {idx}</div>
            <code style={{ fontSize: 10, color: p.text.secondary }}>{token}</code>
          </div>
        ))}
      </div>
    </>
  );
};

/* ------------------------------------------------------------------ */
/*  8. Shape                                                           */
/* ------------------------------------------------------------------ */

const ShapeSection = () => {
  const p = useP();
  const radiiEntries = Object.entries(radii) as [string, number | string][];
  return (
    <>
      <H2>Shape & Border Radius</H2>
      <Desc>
        The theme's default <InlineCode>borderRadius</InlineCode> is{" "}
        <InlineCode>{radii.md}px</InlineCode> (radii.md). Buttons use{" "}
        <InlineCode>radii.full</InlineCode> for pill shapes. The full radius scale:
      </Desc>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {radiiEntries.map(([name, value]) => (
          <div
            key={name}
            style={{
              width: 80,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                border: `2px solid ${p.primary.main}`,
                borderRadius: value,
                backgroundColor: p.action.selected,
              }}
            />
            <code style={{ fontSize: 11, fontWeight: 600, color: p.primary.main }}>{name}</code>
            <span style={{ fontSize: 10, color: p.text.secondary }}>
              {value}
              {typeof value === "number" ? "px" : ""}
            </span>
          </div>
        ))}
      </div>
    </>
  );
};

/* ------------------------------------------------------------------ */
/*  9. Breakpoints                                                     */
/* ------------------------------------------------------------------ */

const BreakpointsSection = () => {
  const p = useP();
  const bps = [
    { name: "xs", value: bpTokens.xs },
    { name: "sm", value: bpTokens.sm },
    { name: "md", value: bpTokens.md },
    { name: "lg", value: bpTokens.lg },
    { name: "xl", value: bpTokens.xl },
  ];
  const max = bpTokens.xl;
  return (
    <>
      <H2>Breakpoints</H2>
      <Desc>
        Standard responsive breakpoints. Use <InlineCode>{'theme.breakpoints.up("md")'}</InlineCode>{" "}
        in styled components, or responsive <InlineCode>sx</InlineCode> shorthand like{" "}
        <InlineCode>{"sx={{ p: { xs: 1, md: 3 } }}"}</InlineCode>.
      </Desc>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {bps.map(({ name, value }) => (
          <div key={name} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <code style={{ width: 24, fontSize: 12, fontWeight: 600, color: p.primary.main }}>
              {name}
            </code>
            <div
              style={{
                height: 16,
                borderRadius: 4,
                backgroundColor: p.primary.main,
                width: `${(value / max) * 100}%`,
                minWidth: 20,
                transition: "width 0.3s",
              }}
            />
            <span style={{ fontSize: 11, color: p.text.secondary }}>{value}px</span>
          </div>
        ))}
      </div>
    </>
  );
};

/* ------------------------------------------------------------------ */
/*  10. Transitions                                                    */
/* ------------------------------------------------------------------ */

const TransitionsSection = () => {
  const p = useP();
  const durations = [
    { name: "fast", value: duration.fast, mapped: "shortest / shorter" },
    { name: "normal", value: duration.normal, mapped: "short / standard / entering / leaving" },
    { name: "slow", value: duration.slow, mapped: "complex" },
  ];
  const easings = [
    { name: "default", value: easing.default, mapped: "sharp" },
    { name: "inOut", value: easing.inOut, mapped: "easeInOut" },
    { name: "out", value: easing.out, mapped: "easeOut" },
    { name: "in", value: easing.in, mapped: "easeIn" },
  ];
  return (
    <>
      <H2>Transitions</H2>
      <Desc>
        Duration and easing tokens mapped to MUI's transition system. Use{" "}
        <InlineCode>
          {'theme.transitions.create("opacity", { duration: theme.transitions.duration.short })'}
        </InlineCode>
        .
      </Desc>
      <H3>Duration</H3>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 20 }}>
        {durations.map(({ name, value, mapped }) => (
          <div key={name} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <code style={{ width: 56, fontSize: 11, fontWeight: 600, color: p.primary.main }}>
              {name}
            </code>
            <div
              style={{
                height: 14,
                borderRadius: 4,
                backgroundColor: p.primary.main,
                width: value * 0.8,
                transition: "width 0.3s",
              }}
            />
            <span style={{ fontSize: 11, color: p.text.secondary }}>
              {value}ms → {mapped}
            </span>
          </div>
        ))}
      </div>
      <H3>Easing</H3>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {easings.map(({ name, value, mapped }) => (
          <div
            key={name}
            style={{
              padding: "10px 14px",
              borderRadius: 8,
              border: `1px solid ${p.divider}`,
              flex: "1 1 160px",
            }}
          >
            <code style={{ fontSize: 11, fontWeight: 600, color: p.primary.main }}>{name}</code>
            <div
              style={{
                fontSize: 11,
                color: p.text.secondary,
                fontFamily: "monospace",
                marginTop: 2,
              }}
            >
              {value}
            </div>
            <div style={{ fontSize: 10, color: p.text.secondary, marginTop: 2 }}>MUI: {mapped}</div>
          </div>
        ))}
      </div>
    </>
  );
};

/* ------------------------------------------------------------------ */
/*  11. Component Overrides                                            */
/* ------------------------------------------------------------------ */

const OverridesSection = () => {
  const p = useP();
  return (
    <>
      <H2>Component Overrides</H2>
      <Desc>
        The theme applies global overrides to selected MUI components. These ensure visual
        consistency without extra styling at the consumption layer.
      </Desc>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Card label="MuiButton">
          <div style={{ fontSize: 13, color: p.text.primary, lineHeight: 1.6 }}>
            <strong>Pill radius</strong> — <InlineCode>borderRadius: radii.full</InlineCode>
            <br />
            <strong>No text transform</strong> — <InlineCode>textTransform: "none"</InlineCode>
          </div>
        </Card>
        <Card label="MuiCssBaseline">
          <div style={{ fontSize: 13, color: p.text.primary, lineHeight: 1.6 }}>
            <strong>Custom scrollbars</strong> — tokenized thickness, rounded, tokenized thumb
            <br />
            Applied via <InlineCode>*::-webkit-scrollbar</InlineCode> overrides
          </div>
        </Card>
      </div>
    </>
  );
};

/* ------------------------------------------------------------------ */
/*  13. API Reference                                                  */
/* ------------------------------------------------------------------ */

const apiExports = [
  [
    "theme",
    "Theme",
    "Pre-built MUI theme object with CSS variables, light/dark schemes, and all token mappings",
  ],
  [
    "baseThemeOptions",
    "ThemeOptions",
    "Raw options object passed to createTheme — extend for custom overrides",
  ],
  ["ThemeProvider", "Component", "Re-export of MUI ThemeProvider"],
  [
    "DesignSystemProvider",
    "Component",
    "Full provider: ThemeProvider + CssBaseline + mode persistence + OS detection",
  ],
  ["useThemeMode", "Hook", "Access { mode, setMode, resolvedMode } from the design system context"],
  ["ThemeModeSwitcher", "Component", "Icon button cycling light → dark → system"],
];

const ApiSection = () => {
  const p = useP();
  return (
    <>
      <H2>API Reference</H2>
      <Desc>
        Everything exported from <InlineCode>@fabric-kit/theme</InlineCode>:
      </Desc>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead>
          <tr style={{ borderBottom: `2px solid ${p.divider}`, textAlign: "left" }}>
            <th style={{ padding: "8px 10px", color: p.text.primary }}>Export</th>
            <th style={{ padding: "8px 10px", color: p.text.primary }}>Type</th>
            <th style={{ padding: "8px 10px", color: p.text.primary }}>Description</th>
          </tr>
        </thead>
        <tbody>
          {apiExports.map(([name, type, desc]) => (
            <tr key={name} style={{ borderBottom: `1px solid ${p.divider}` }}>
              <td style={{ padding: "6px 10px" }}>
                <code style={{ color: p.primary.main, fontWeight: 600, fontSize: 11 }}>{name}</code>
              </td>
              <td style={{ padding: "6px 10px" }}>
                <code style={{ fontSize: 11, color: p.text.secondary }}>{type}</code>
              </td>
              <td style={{ padding: "6px 10px", color: p.text.secondary, lineHeight: 1.5 }}>
                {desc}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

const ThemePage = () => (
  <div style={{ maxWidth: 960 }}>
    <Header />
    <GettingStarted />
    <DarkModeSection />
    <PaletteSection />
    <TypographySection />
    <SpacingSection />
    <ElevationSection />
    <ShapeSection />
    <BreakpointsSection />
    <TransitionsSection />
    <OverridesSection />
    <ApiSection />
  </div>
);

const meta: Meta = {
  title: "Foundations/Theme",
  component: ThemePage,
  parameters: { layout: "padded" },
};

export default meta;

export const OverviewAndUsage: StoryObj = {
  name: "Overview",
};
