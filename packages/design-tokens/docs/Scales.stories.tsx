import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  breakpoints,
  containerWidth,
  controlHeight,
  dialogWidth,
  duration,
  easing,
  iconSize,
  opacity,
  panelWidth,
  radii,
  shadows,
  spacing,
  zIndex,
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
  padding: "14px 16px",
  borderRadius: 10,
  border: "1px solid var(--mui-palette-divider)",
  backgroundColor: "var(--mui-palette-background-paper)",
};

/* ---- Spacing ---- */
const SpacingSection = () => (
  <section>
    <h3 style={{ ...heading, marginTop: 0 }}>Spacing</h3>
    <p style={desc}>9-step spatial scale from 0 to 64px. Used for padding, margins, and gaps.</p>
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {Object.entries(spacing).map(([name, px]) => (
        <div
          key={name}
          style={{
            display: "grid",
            gridTemplateColumns: "50px 50px 1fr",
            alignItems: "center",
            gap: 12,
            padding: "6px 16px",
            borderRadius: 8,
            backgroundColor: "var(--mui-palette-background-paper)",
            border: "1px solid var(--mui-palette-divider)",
          }}
        >
          <code style={{ fontSize: 12, color: "var(--mui-palette-primary-main)", fontWeight: 600 }}>
            {name}
          </code>
          <span style={{ fontSize: 12, color: "var(--mui-palette-text-secondary)" }}>{px}px</span>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div
              style={{
                width: Math.max(px as number, 2),
                height: 20,
                backgroundColor: "var(--mui-palette-primary-main)",
                borderRadius: 3,
                opacity: px === 0 ? 0.2 : 1,
                transition: "width 0.2s",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  </section>
);

/* ---- Breakpoints ---- */
const BreakpointSection = () => (
  <section>
    <h3 style={heading}>Breakpoints</h3>
    <p style={desc}>
      6-step responsive breakpoint scale. Used by the MUI theme, responsive props, and Show/Hide
      components.
    </p>
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {Object.entries(breakpoints).map(([name, px]) => (
        <div
          key={name}
          style={{
            display: "grid",
            gridTemplateColumns: "50px 60px 1fr",
            alignItems: "center",
            gap: 12,
            padding: "6px 16px",
            borderRadius: 8,
            backgroundColor: "var(--mui-palette-background-paper)",
            border: "1px solid var(--mui-palette-divider)",
          }}
        >
          <code style={{ fontSize: 12, color: "var(--mui-palette-primary-main)", fontWeight: 600 }}>
            {name}
          </code>
          <span style={{ fontSize: 12, color: "var(--mui-palette-text-secondary)" }}>{px}px</span>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                width: `${Math.min(((px as number) / 1920) * 100, 100)}%`,
                minWidth: px === 0 ? 2 : undefined,
                height: 20,
                backgroundColor: "var(--mui-palette-primary-main)",
                borderRadius: 3,
                opacity: px === 0 ? 0.2 : 1,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  </section>
);

/* ---- Radii ---- */
const RadiiSection = () => (
  <section>
    <h3 style={heading}>Border Radii</h3>
    <p style={desc}>Corner radius tokens from sharp to pill-shaped.</p>
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
      {Object.entries(radii).map(([name, val]) => (
        <div key={name} style={{ textAlign: "center", width: 80 }}>
          <div
            style={{
              width: 64,
              height: 64,
              margin: "0 auto",
              backgroundColor: "var(--mui-palette-primary-main)",
              opacity: 0.15,
              border: "2px solid var(--mui-palette-primary-main)",
              borderRadius: val === 9999 ? "50%" : val,
            }}
          />
          <code
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "var(--mui-palette-primary-main)",
              display: "block",
              marginTop: 6,
            }}
          >
            {name}
          </code>
          <div style={{ fontSize: 11, color: "var(--mui-palette-text-secondary)" }}>
            {val === 9999 ? "50%" : `${val}px`}
          </div>
        </div>
      ))}
    </div>
  </section>
);

/* ---- Shadows ---- */
const ShadowSection = () => (
  <section>
    <h3 style={heading}>Elevation & Shadows</h3>
    <p style={desc}>
      Shadow tokens for depth hierarchy — from subtle card lifts to modal overlays.
    </p>
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        gap: 16,
      }}
    >
      {Object.entries(shadows).map(([name, val]) => (
        <div
          key={name}
          style={{
            padding: 20,
            borderRadius: 12,
            backgroundColor: "var(--mui-palette-background-paper)",
            boxShadow: val,
            border:
              val === "none" ? "1px dashed var(--mui-palette-divider)" : "1px solid transparent",
            minHeight: 80,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
          }}
        >
          <code style={{ fontSize: 12, fontWeight: 600, color: "var(--mui-palette-primary-main)" }}>
            {name}
          </code>
          <div
            style={{
              fontSize: 11,
              color: "var(--mui-palette-text-secondary)",
              marginTop: 2,
              wordBreak: "break-all",
              lineHeight: 1.4,
            }}
          >
            {val === "none" ? "none" : `${val.slice(0, 40)}…`}
          </div>
        </div>
      ))}
    </div>
  </section>
);

/* ---- Z-Index ---- */
const ZIndexSection = () => (
  <section>
    <h3 style={heading}>Z-Index</h3>
    <p style={desc}>Layering hierarchy ensuring predictable stacking order.</p>
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {Object.entries(zIndex).map(([name, val]) => {
        const maxVal = 9999;
        const pct = Math.min((((val as number) + 1) / maxVal) * 100, 100);
        return (
          <div
            key={name}
            style={{
              display: "grid",
              gridTemplateColumns: "80px 60px 1fr",
              alignItems: "center",
              gap: 12,
              padding: "6px 16px",
              borderRadius: 8,
              backgroundColor: "var(--mui-palette-background-paper)",
              border: "1px solid var(--mui-palette-divider)",
            }}
          >
            <code
              style={{ fontSize: 12, color: "var(--mui-palette-primary-main)", fontWeight: 600 }}
            >
              {name}
            </code>
            <span style={{ fontSize: 12, color: "var(--mui-palette-text-secondary)" }}>{val}</span>
            <div
              style={{
                height: 8,
                backgroundColor: "var(--mui-palette-action-selected)",
                borderRadius: 4,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${pct}%`,
                  height: "100%",
                  backgroundColor: "var(--mui-palette-primary-main)",
                  borderRadius: 4,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  </section>
);

/* ---- Sizing ---- */
const SizingSection = () => (
  <section>
    <h3 style={heading}>Sizing</h3>
    <p style={desc}>Standard sizes for icons and form controls.</p>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
      <div>
        <h4
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--mui-palette-text-secondary)",
            margin: "0 0 10px",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          Icon Sizes
        </h4>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {Object.entries(iconSize).map(([name, px]) => (
            <div
              key={name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                ...card,
                padding: "8px 12px",
              }}
            >
              <div
                style={{
                  width: px,
                  height: px,
                  borderRadius: 3,
                  backgroundColor: "var(--mui-palette-primary-main)",
                }}
              />
              <code
                style={{ fontSize: 12, fontWeight: 600, color: "var(--mui-palette-primary-main)" }}
              >
                {name}
              </code>
              <span
                style={{
                  fontSize: 12,
                  color: "var(--mui-palette-text-secondary)",
                  marginLeft: "auto",
                }}
              >
                {px}px
              </span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h4
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--mui-palette-text-secondary)",
            margin: "0 0 10px",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          Control Heights
        </h4>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {Object.entries(controlHeight).map(([name, px]) => (
            <div
              key={name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                ...card,
                padding: "8px 12px",
              }}
            >
              <div
                style={{
                  width: 48,
                  height: px,
                  borderRadius: 6,
                  border: "2px solid var(--mui-palette-primary-main)",
                  opacity: 0.5,
                }}
              />
              <code
                style={{ fontSize: 12, fontWeight: 600, color: "var(--mui-palette-primary-main)" }}
              >
                {name}
              </code>
              <span
                style={{
                  fontSize: 12,
                  color: "var(--mui-palette-text-secondary)",
                  marginLeft: "auto",
                }}
              >
                {px}px
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

/* ---- Layout ---- */
const LayoutSection = () => (
  <section>
    <h3 style={heading}>Layout Widths</h3>
    <p style={desc}>Fixed widths for panels, dialogs, and page containers.</p>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
      {[
        { title: "Panel", tokens: panelWidth, prefix: "panelWidth" },
        { title: "Dialog", tokens: dialogWidth, prefix: "dialogWidth" },
        { title: "Container", tokens: containerWidth, prefix: "containerWidth" },
      ].map(({ title, tokens, prefix }) => (
        <div key={title}>
          <h4
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--mui-palette-text-secondary)",
              margin: "0 0 10px",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            {title}
          </h4>
          {Object.entries(tokens).map(([name, px]) => (
            <div
              key={name}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                ...card,
                padding: "8px 12px",
                marginBottom: 6,
              }}
            >
              <code
                style={{ fontSize: 12, fontWeight: 600, color: "var(--mui-palette-primary-main)" }}
              >
                {name}
              </code>
              <span style={{ fontSize: 12, color: "var(--mui-palette-text-secondary)" }}>
                {px}px
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  </section>
);

/* ---- Animation ---- */
const AnimationSection = () => (
  <section>
    <h3 style={heading}>Animation</h3>
    <p style={desc}>Duration and easing tokens for consistent motion.</p>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
      <div>
        <h4
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--mui-palette-text-secondary)",
            margin: "0 0 10px",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          Duration
        </h4>
        {Object.entries(duration).map(([name, ms]) => (
          <div
            key={name}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              ...card,
              padding: "8px 12px",
              marginBottom: 6,
            }}
          >
            <code
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "var(--mui-palette-primary-main)",
                width: 60,
              }}
            >
              {name}
            </code>
            <div
              style={{
                flex: 1,
                height: 6,
                backgroundColor: "var(--mui-palette-action-selected)",
                borderRadius: 3,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${Math.min((ms as number) / 5, 100)}%`,
                  height: "100%",
                  backgroundColor: "var(--mui-palette-primary-main)",
                  borderRadius: 3,
                }}
              />
            </div>
            <span
              style={{
                fontSize: 12,
                color: "var(--mui-palette-text-secondary)",
                width: 45,
                textAlign: "right",
              }}
            >
              {ms}ms
            </span>
          </div>
        ))}
      </div>
      <div>
        <h4
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--mui-palette-text-secondary)",
            margin: "0 0 10px",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          Easing
        </h4>
        {Object.entries(easing).map(([name, val]) => (
          <div
            key={name}
            style={{
              display: "flex",
              justifyContent: "space-between",
              ...card,
              padding: "8px 12px",
              marginBottom: 6,
            }}
          >
            <code
              style={{ fontSize: 12, fontWeight: 600, color: "var(--mui-palette-primary-main)" }}
            >
              {name}
            </code>
            <span style={{ fontSize: 12, color: "var(--mui-palette-text-secondary)" }}>{val}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ---- Opacity ---- */
const OpacitySection = () => (
  <section>
    <h3 style={heading}>Opacity</h3>
    <p style={desc}>Opacity levels for disabled states, overlays, and muted content.</p>
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {Object.entries(opacity).map(([name, val]) => (
        <div key={name} style={{ textAlign: "center", width: 72 }}>
          <div
            style={{
              width: 56,
              height: 56,
              margin: "0 auto",
              borderRadius: 8,
              backgroundColor: "var(--mui-palette-primary-main)",
              opacity: val as number,
              border: "1px solid var(--mui-palette-divider)",
            }}
          />
          <code
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "var(--mui-palette-primary-main)",
              display: "block",
              marginTop: 4,
            }}
          >
            {name}
          </code>
          <div style={{ fontSize: 11, color: "var(--mui-palette-text-secondary)" }}>{val}</div>
        </div>
      ))}
    </div>
  </section>
);

/* ---- Page ---- */
const ScalesPage = () => (
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
      Scales & Tokens
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
      Spacing, radii, shadows, sizing, layout, animation, and opacity tokens. Import from{" "}
      <code style={{ fontSize: 12 }}>@fabric-kit/design-tokens</code>.
    </p>

    <SpacingSection />
    <BreakpointSection />
    <RadiiSection />
    <ShadowSection />
    <ZIndexSection />
    <SizingSection />
    <LayoutSection />
    <AnimationSection />
    <OpacitySection />
  </div>
);

const meta: Meta = {
  title: "Foundations/Design Tokens",
  component: ScalesPage,
  parameters: { layout: "padded" },
};
export default meta;

export const Scales: StoryObj = {};
