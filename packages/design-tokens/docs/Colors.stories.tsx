import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  action,
  border,
  brand,
  dark,
  labels,
  status,
  statusText,
  surface,
  text,
} from "@fabric-kit/design-tokens";
import type React from "react";
import { useState } from "react";

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

const Swatch = ({
  name,
  hex,
  darkHex,
  tokenPath,
}: {
  name: string;
  hex: string;
  darkHex?: string;
  tokenPath: string;
}) => {
  const [copied, setCopied] = useState("");
  const copy = (v: string) => {
    navigator.clipboard.writeText(v);
    setCopied(v);
    setTimeout(() => setCopied(""), 1200);
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 12px",
        borderRadius: 10,
        border: "1px solid var(--mui-palette-divider)",
        backgroundColor: "var(--mui-palette-background-paper)",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <div
          style={{
            width: 44,
            height: darkHex ? 20 : 44,
            borderRadius: darkHex ? "8px 8px 0 0" : 8,
            backgroundColor: hex,
            border: "1px solid rgba(0,0,0,0.08)",
          }}
          title={`Light: ${hex}`}
        />
        {darkHex && (
          <div
            style={{
              width: 44,
              height: 20,
              borderRadius: "0 0 8px 8px",
              backgroundColor: darkHex,
              border: "1px solid rgba(255,255,255,0.08)",
            }}
            title={`Dark: ${darkHex}`}
          />
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 13, color: "var(--mui-palette-text-primary)" }}>
          {name}
        </div>
        <div
          style={{
            fontSize: 11,
            color: "var(--mui-palette-text-secondary)",
            cursor: "pointer",
            fontFamily: "monospace",
          }}
          onClick={() => copy(tokenPath)}
          title="Click to copy import path"
        >
          {copied === tokenPath ? "✓ copied" : tokenPath}
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 2 }}>
          <code
            style={{ fontSize: 11, cursor: "pointer", color: "var(--mui-palette-text-secondary)" }}
            onClick={() => copy(hex)}
            title="Click to copy"
          >
            {copied === hex ? "✓" : hex}
          </code>
          {darkHex && (
            <code
              style={{
                fontSize: 11,
                cursor: "pointer",
                color: "var(--mui-palette-text-secondary)",
              }}
              onClick={() => copy(darkHex)}
              title="Click to copy dark value"
            >
              {copied === darkHex ? "✓" : `dark: ${darkHex}`}
            </code>
          )}
        </div>
      </div>
    </div>
  );
};

const PaletteGroup = ({
  title,
  description,
  lightTokens,
  darkTokens,
  tokenPrefix,
}: {
  title: string;
  description: string;
  lightTokens: Record<string, string>;
  darkTokens?: Record<string, string>;
  tokenPrefix: string;
}) => (
  <section>
    <h3 style={heading}>{title}</h3>
    <p style={desc}>{description}</p>
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
        gap: 12,
      }}
    >
      {Object.entries(lightTokens).map(([key, hex]) => (
        <Swatch
          key={key}
          name={key}
          hex={hex}
          darkHex={darkTokens?.[key as keyof typeof darkTokens]}
          tokenPath={`${tokenPrefix}.${key}`}
        />
      ))}
    </div>
  </section>
);

const ColorsPage = () => (
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
      Color Tokens
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
      Semantic color tokens for Fabric. Import from{" "}
      <code style={{ fontSize: 12 }}>@fabric-kit/design-tokens</code>. Each swatch shows the light
      value on top and the dark-mode override below. Click any value to copy.
    </p>
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 12px",
        borderRadius: 6,
        backgroundColor: "var(--mui-palette-action-selected)",
        fontSize: 12,
        color: "var(--mui-palette-text-secondary)",
        marginBottom: 8,
      }}
    >
      <span style={{ width: 12, height: 6, borderRadius: 2, backgroundColor: brand.primary }} />{" "}
      Light
      <span
        style={{ width: 12, height: 6, borderRadius: 2, backgroundColor: dark.brand.primary }}
      />{" "}
      Dark
    </div>

    <PaletteGroup
      title="Brand"
      description="Core brand identity colors. Use for primary actions, links, and brand presence."
      lightTokens={brand}
      darkTokens={dark.brand}
      tokenPrefix="brand"
    />
    <PaletteGroup
      title="Text"
      description="Semantic text colors for content hierarchy. Never hardcode hex — use these tokens to ensure legibility across light and dark modes."
      lightTokens={text}
      darkTokens={dark.text}
      tokenPrefix="text"
    />
    <PaletteGroup
      title="Surface"
      description="Background colors for containers, cards, panels, and overlays. primary = main card surface, secondary = page background."
      lightTokens={surface}
      darkTokens={dark.surface}
      tokenPrefix="surface"
    />
    <PaletteGroup
      title="Border"
      description="Stroke colors for dividers, card borders, and input outlines."
      lightTokens={border}
      darkTokens={dark.border}
      tokenPrefix="border"
    />
    <PaletteGroup
      title="Status"
      description="Feedback colors for success, warning, error, and informational states."
      lightTokens={status}
      darkTokens={dark.status}
      tokenPrefix="status"
    />
    <PaletteGroup
      title="Status Text"
      description="Darker shade of each status color, for text on the matching surface tint."
      lightTokens={statusText}
      tokenPrefix="statusText"
    />
    <PaletteGroup
      title="Action"
      description="Interactive element colors — buttons, links, selection states, disabled indicators."
      lightTokens={action}
      darkTokens={dark.action}
      tokenPrefix="action"
    />
    <PaletteGroup
      title="Labels"
      description="Categorical label colors for tags, badges, and status indicators. Fixed across modes."
      lightTokens={labels}
      tokenPrefix="labels"
    />
  </div>
);

const meta: Meta = {
  title: "Foundations/Design Tokens",
  component: ColorsPage,
  parameters: { layout: "padded" },
};
export default meta;

export const Colors: StoryObj = {};
