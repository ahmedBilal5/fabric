import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  textVariant,
} from "@fabric-kit/design-tokens";
import type React from "react";

const heading: React.CSSProperties = {
  fontFamily: "'Geist', sans-serif",
  fontSize: 20,
  fontWeight: 600,
  margin: "48px 0 4px",
  color: "var(--mui-palette-text-primary)",
};
const desc: React.CSSProperties = {
  fontSize: 13,
  color: "var(--mui-palette-text-secondary)",
  margin: "0 0 20px",
  maxWidth: 560,
  lineHeight: 1.55,
};
const card: React.CSSProperties = {
  padding: "16px 20px",
  borderRadius: 10,
  border: "1px solid var(--mui-palette-divider)",
  backgroundColor: "var(--mui-palette-background-paper)",
};

/* ---- Font Families ---- */
const FamilyShowcase = () => (
  <section>
    <h3 style={{ ...heading, marginTop: 0 }}>Font Families</h3>
    <p style={desc}>
      One family, Geist, for headings and body, and Geist Mono for code and figures.
    </p>
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: 12,
      }}
    >
      {Object.entries(fontFamily).map(([role, family]) => (
        <div key={role} style={card}>
          <code style={{ fontSize: 11, color: "var(--mui-palette-text-secondary)" }}>
            fontFamily.{role}
          </code>
          <div
            style={{
              fontFamily: family,
              fontSize: 24,
              fontWeight: role === "heading" ? 700 : 400,
              marginTop: 8,
              color: "var(--mui-palette-text-primary)",
              lineHeight: 1.3,
            }}
          >
            Aa Bb Cc 123
          </div>
          <div style={{ fontSize: 12, color: "var(--mui-palette-text-secondary)", marginTop: 4 }}>
            {family}
          </div>
        </div>
      ))}
    </div>
  </section>
);

/* ---- Size Scale ---- */
const SizeScale = () => (
  <section>
    <h3 style={heading}>Font Size Scale</h3>
    <p style={desc}>8-step scale from 10px to 32px. Use token names, never raw rem values.</p>
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {Object.entries(fontSize).map(([name, val]) => (
        <div
          key={name}
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 16,
            padding: "8px 16px",
            borderRadius: 8,
            backgroundColor: "var(--mui-palette-background-paper)",
            border: "1px solid var(--mui-palette-divider)",
          }}
        >
          <code
            style={{
              width: 40,
              fontSize: 12,
              color: "var(--mui-palette-primary-main)",
              fontWeight: 600,
            }}
          >
            {name}
          </code>
          <span style={{ width: 60, fontSize: 12, color: "var(--mui-palette-text-secondary)" }}>
            {val}
          </span>
          <span
            style={{ fontSize: val, color: "var(--mui-palette-text-primary)", lineHeight: 1.4 }}
          >
            The quick brown fox
          </span>
        </div>
      ))}
    </div>
  </section>
);

/* ---- Weights ---- */
const WeightScale = () => (
  <section>
    <h3 style={heading}>Font Weights</h3>
    <p style={desc}>Four weights from regular to bold.</p>
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        gap: 12,
      }}
    >
      {Object.entries(fontWeight).map(([name, val]) => (
        <div key={name} style={card}>
          <code style={{ fontSize: 11, color: "var(--mui-palette-text-secondary)" }}>
            fontWeight.{name}
          </code>
          <div
            style={{
              fontSize: 28,
              fontWeight: val,
              marginTop: 6,
              color: "var(--mui-palette-text-primary)",
              lineHeight: 1.2,
            }}
          >
            Ag
          </div>
          <div style={{ fontSize: 12, color: "var(--mui-palette-text-secondary)", marginTop: 2 }}>
            {val}
          </div>
        </div>
      ))}
    </div>
  </section>
);

/* ---- Line Heights ---- */
const LineHeightScale = () => (
  <section>
    <h3 style={heading}>Line Heights</h3>
    <p style={desc}>
      Five levels controlling vertical rhythm. Tighter for headings, looser for readability.
    </p>
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {Object.entries(lineHeight).map(([name, val]) => (
        <div
          key={name}
          style={{
            ...card,
            display: "grid",
            gridTemplateColumns: "100px 50px 1fr",
            alignItems: "start",
            gap: 16,
          }}
        >
          <code style={{ fontSize: 12, color: "var(--mui-palette-primary-main)", fontWeight: 600 }}>
            {name}
          </code>
          <span style={{ fontSize: 12, color: "var(--mui-palette-text-secondary)" }}>{val}</span>
          <span style={{ fontSize: 14, lineHeight: val, color: "var(--mui-palette-text-primary)" }}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua.
          </span>
        </div>
      ))}
    </div>
  </section>
);

/* ---- Text Variants ---- */
const VariantCards = () => {
  const groups = {
    Display: ["displayLg", "displayMd", "displaySm"],
    "Page Title": ["pageTitleLg", "pageTitleMd"],
    Headings: ["headingXl", "headingLg", "headingMd", "headingSm", "headingSmAlt", "headingXs"],
    Body: ["bodyLg", "bodyMd", "bodySm"],
    "UI Text": ["uiLg", "uiMd", "uiSm", "uiXxs"],
  };

  return (
    <section>
      <h3 style={heading}>Text Variants</h3>
      <p style={desc}>
        Composite presets combining family, size, weight, and line-height. Use via{" "}
        <code style={{ fontSize: 12 }}>{'<FabricText textVariant="bodyMd">'}</code>.
      </p>
      {Object.entries(groups).map(([group, keys]) => (
        <div key={group} style={{ marginBottom: 28 }}>
          <h4
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--mui-palette-text-secondary)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              margin: "0 0 10px",
            }}
          >
            {group}
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {keys.map((key) => {
              const v = textVariant[key as keyof typeof textVariant];
              return (
                <div
                  key={key}
                  style={{
                    ...card,
                    display: "grid",
                    gridTemplateColumns: "120px 1fr",
                    alignItems: "center",
                    gap: 20,
                  }}
                >
                  <div>
                    <code
                      style={{
                        fontSize: 12,
                        color: "var(--mui-palette-primary-main)",
                        fontWeight: 600,
                      }}
                    >
                      {key}
                    </code>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--mui-palette-text-secondary)",
                        marginTop: 2,
                      }}
                    >
                      {v.fontSize} · {v.fontWeight} · {v.lineHeight}
                    </div>
                  </div>
                  <div
                    style={{
                      fontFamily: v.fontFamily,
                      fontSize: v.fontSize,
                      fontWeight: v.fontWeight,
                      lineHeight: v.lineHeight,
                      color: "var(--mui-palette-text-primary)",
                    }}
                  >
                    The quick brown fox jumps over the lazy dog
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </section>
  );
};

/* ---- Page ---- */
const TypographyPage = () => (
  <div style={{ maxWidth: 960 }}>
    <h2
      style={{
        fontFamily: "'Geist', sans-serif",
        fontSize: 28,
        fontWeight: 700,
        color: "var(--mui-palette-text-primary)",
        margin: "0 0 4px",
      }}
    >
      Typography
    </h2>
    <p
      style={{
        fontSize: 14,
        color: "var(--mui-palette-text-secondary)",
        margin: "0 0 8px",
        maxWidth: 640,
        lineHeight: 1.6,
      }}
    >
      Type tokens for Fabric. Import from{" "}
      <code style={{ fontSize: 12 }}>@fabric-kit/design-tokens</code>.
    </p>

    <FamilyShowcase />
    <SizeScale />
    <WeightScale />
    <LineHeightScale />
    <VariantCards />
  </div>
);

const meta: Meta = {
  title: "Foundations/Design Tokens",
  component: TypographyPage,
  parameters: { layout: "padded" },
};
export default meta;

export const Typography: StoryObj = {};
