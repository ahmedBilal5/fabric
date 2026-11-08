import { useTheme } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type React from "react";
import {
  FabricCenter,
  FabricContainer,
  FabricDivider,
  FabricFlex,
  FabricGrid,
  FabricGrow,
  FabricInline,
  FabricSpacer,
  FabricStack,
  FabricSurface,
  FabricText,
} from "../src";

/* Use vars.palette so inline styles respond to dark-mode class toggle */
const useVarsTheme = () => {
  const t = useTheme();
  return { palette: (t.vars?.palette ?? t.palette) as typeof t.palette };
};

/* ------------------------------------------------------------------ */
/*  Shared helpers                                                     */
/* ------------------------------------------------------------------ */

const Chip = ({ children }: { children: React.ReactNode }) => {
  const t = useVarsTheme();
  return (
    <div
      style={{
        padding: "6px 14px",
        borderRadius: 6,
        backgroundColor: "var(--mui-palette-primary-main)",
        color: "var(--mui-palette-primary-contrastText)",
        fontSize: 13,
        fontWeight: 500,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </div>
  );
};

const DemoBox = ({ children, label }: { children: React.ReactNode; label?: string }) => {
  const t = useVarsTheme();
  return (
    <div
      style={{
        border: `1px dashed var(--mui-palette-divider)`,
        borderRadius: 10,
        padding: 16,
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
            backgroundColor: "var(--mui-palette-background-paper)",
            fontSize: 11,
            color: "var(--mui-palette-text-secondary)",
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

const Section = ({
  title,
  description,
  code,
  children,
}: {
  title: string;
  description: string;
  code: string;
  children: React.ReactNode;
}) => {
  const t = useVarsTheme();
  return (
    <section style={{ marginBottom: 48 }}>
      <h3
        style={{
          fontFamily: "'Geist', sans-serif",
          fontSize: 18,
          fontWeight: 600,
          color: "var(--mui-palette-text-primary)",
          margin: "0 0 4px",
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: 13,
          color: "var(--mui-palette-text-secondary)",
          margin: "0 0 6px",
          lineHeight: 1.5,
        }}
      >
        {description}
      </p>
      <code
        style={{
          display: "inline-block",
          fontSize: 12,
          padding: "3px 10px",
          borderRadius: 6,
          backgroundColor: "var(--mui-palette-action-selected)",
          color: "var(--mui-palette-text-secondary)",
          marginBottom: 12,
        }}
      >
        {code}
      </code>
      {children}
    </section>
  );
};

/* ------------------------------------------------------------------ */
/*  Layout primitives                                                  */
/* ------------------------------------------------------------------ */

const LayoutSection = () => {
  const t = useVarsTheme();
  return (
    <>
      <Section
        title="FabricFlex"
        description="General-purpose flexbox container. Controls direction, gap, alignment, wrapping — all with token-based spacing."
        code='<FabricFlex gap="md" align="center" direction="row">'
      >
        <FabricFlex gap="sm" direction="column">
          <DemoBox label='gap="md" (row)'>
            <FabricFlex gap="md" align="center">
              <Chip>Item 1</Chip>
              <Chip>Item 2</Chip>
              <Chip>Item 3</Chip>
            </FabricFlex>
          </DemoBox>
          <DemoBox label='direction="column" gap="lg"'>
            <FabricFlex direction="column" gap="lg">
              <Chip>Row A</Chip>
              <Chip>Row B</Chip>
            </FabricFlex>
          </DemoBox>
          <DemoBox label='wrap={true} gap="sm"'>
            <FabricFlex wrap gap="sm" sx={{ maxWidth: 280 }}>
              {["Alpha", "Beta", "Gamma", "Delta", "Epsilon", "Zeta"].map((s) => (
                <Chip key={s}>{s}</Chip>
              ))}
            </FabricFlex>
          </DemoBox>
        </FabricFlex>
      </Section>

      <Section
        title="FabricStack"
        description="Vertical stack (column direction) with token gap. Shorthand for FabricFlex direction=column."
        code='<FabricStack gap="md" align="stretch">'
      >
        <DemoBox label='gap="md"'>
          <FabricStack gap="md">
            <Chip>First</Chip>
            <Chip>Second</Chip>
            <Chip>Third</Chip>
          </FabricStack>
        </DemoBox>
      </Section>

      <Section
        title="FabricInline"
        description="Horizontal flow that wraps automatically — ideal for tag lists, chips, and toolbars."
        code='<FabricInline gap="sm">'
      >
        <DemoBox label='gap="sm" (wraps at container edge)'>
          <FabricInline gap="sm" sx={{ maxWidth: 320 }}>
            {["React", "TypeScript", "MUI", "Storybook", "Fabric", "Tokens", "Design System"].map(
              (tag) => (
                <div
                  key={tag}
                  style={{
                    padding: "4px 12px",
                    borderRadius: 16,
                    fontSize: 13,
                    backgroundColor: "var(--mui-palette-background-default)",
                    border: `1px solid var(--mui-palette-divider)`,
                    color: "var(--mui-palette-text-primary)",
                  }}
                >
                  {tag}
                </div>
              ),
            )}
          </FabricInline>
        </DemoBox>
      </Section>

      <Section
        title="FabricCenter"
        description="Centers children both horizontally and vertically within its bounds."
        code="<FabricCenter>"
      >
        <DemoBox label="Centers both axes">
          <FabricCenter sx={{ height: 100 }}>
            <div
              style={{
                padding: "8px 24px",
                borderRadius: 6,
                backgroundColor: "var(--mui-palette-text-primary)",
                color: "var(--mui-palette-background-paper)",
                fontWeight: 500,
              }}
            >
              Centered content
            </div>
          </FabricCenter>
        </DemoBox>
      </Section>

      <Section
        title="FabricGrid"
        description="CSS Grid container with token-based gap and template shorthand props."
        code='<FabricGrid columns="1fr 1fr 1fr" gap="md">'
      >
        <DemoBox label='columns="repeat(3, 1fr)" gap="sm"'>
          <FabricGrid columns="repeat(3, 1fr)" gap="sm">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                style={{
                  padding: 12,
                  borderRadius: 6,
                  textAlign: "center",
                  backgroundColor: "var(--mui-palette-action-selected)",
                  color: "var(--mui-palette-text-primary)",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                Cell {n}
              </div>
            ))}
          </FabricGrid>
        </DemoBox>
      </Section>

      <Section
        title="FabricGrow & FabricSpacer"
        description="FabricGrow fills available flex space (flex: 1). FabricSpacer creates fixed or flex-based whitespace."
        code="<FabricSpacer flex /> or <FabricSpacer size=&quot;xl&quot; />"
      >
        <FabricStack gap="sm">
          <DemoBox label="FabricSpacer flex — pushes right">
            <FabricFlex align="center">
              <div style={{ fontWeight: 600, color: "var(--mui-palette-text-primary)" }}>Logo</div>
              <FabricSpacer flex />
              <Chip>Sign In</Chip>
            </FabricFlex>
          </DemoBox>
          <DemoBox label='FabricSpacer size="xl" — fixed 24px gap'>
            <FabricFlex align="center">
              <Chip>Before</Chip>
              <FabricSpacer size="xl" />
              <Chip>After (24px gap)</Chip>
            </FabricFlex>
          </DemoBox>
          <DemoBox label="FabricGrow — fills remaining space">
            <FabricFlex gap="sm">
              <div
                style={{
                  padding: 12,
                  borderRadius: 6,
                  backgroundColor: "var(--mui-palette-action-selected)",
                  color: "var(--mui-palette-text-primary)",
                  fontSize: 13,
                }}
              >
                Fixed
              </div>
              <FabricGrow
                sx={{
                  p: 1.5,
                  borderRadius: "6px",
                  backgroundColor: "var(--mui-palette-primary-main)",
                  color: "var(--mui-palette-primary-contrastText)",
                  fontSize: 13,
                  textAlign: "center",
                }}
              >
                Grows to fill
              </FabricGrow>
              <div
                style={{
                  padding: 12,
                  borderRadius: 6,
                  backgroundColor: "var(--mui-palette-action-selected)",
                  color: "var(--mui-palette-text-primary)",
                  fontSize: 13,
                }}
              >
                Fixed
              </div>
            </FabricFlex>
          </DemoBox>
        </FabricStack>
      </Section>

      <Section
        title="FabricContainer"
        description="Centered max-width container. Wraps MUI Container for page-level horizontal containment."
        code="<FabricContainer maxWidth=&quot;md&quot;>"
      >
        <DemoBox label='maxWidth="sm"'>
          <FabricContainer maxWidth="sm">
            <div
              style={{
                padding: 16,
                borderRadius: 6,
                textAlign: "center",
                backgroundColor: "var(--mui-palette-action-selected)",
                color: "var(--mui-palette-text-primary)",
                fontSize: 13,
              }}
            >
              Content constrained to sm breakpoint
            </div>
          </FabricContainer>
        </DemoBox>
      </Section>
    </>
  );
};

/* ------------------------------------------------------------------ */
/*  Content primitives                                                 */
/* ------------------------------------------------------------------ */

const ContentSection = () => {
  const t = useVarsTheme();
  return (
    <>
      <Section
        title="FabricText"
        description="Typography primitive with token-based sizing and composite text variants. Wraps MUI Typography."
        code='<FabricText size="lg"> or <FabricText textVariant="headingMd">'
      >
        <FabricStack gap="sm">
          <DemoBox label="Size scale (xs → 4xl)">
            <FabricStack gap="xs">
              {(["xs", "sm", "md", "lg", "xl", "2xl", "3xl", "4xl"] as const).map((s) => (
                <FabricFlex key={s} gap="sm" align="baseline">
                  <code
                    style={{
                      width: 36,
                      fontSize: 11,
                      color: "var(--mui-palette-primary-main)",
                      fontWeight: 600,
                    }}
                  >
                    {s}
                  </code>
                  <FabricText size={s}>The quick brown fox</FabricText>
                </FabricFlex>
              ))}
            </FabricStack>
          </DemoBox>
          <DemoBox label="Text variants">
            <FabricStack gap="xs">
              {(
                [
                  "headingLg",
                  "headingMd",
                  "headingSm",
                  "bodyLg",
                  "bodyMd",
                  "bodySm",
                  "uiLg",
                  "uiMd",
                ] as const
              ).map((v) => (
                <FabricFlex key={v} gap="sm" align="baseline">
                  <code
                    style={{
                      width: 90,
                      fontSize: 11,
                      color: "var(--mui-palette-primary-main)",
                      fontWeight: 600,
                    }}
                  >
                    {v}
                  </code>
                  <FabricText textVariant={v}>The quick brown fox</FabricText>
                </FabricFlex>
              ))}
            </FabricStack>
          </DemoBox>
          <DemoBox label="truncate">
            <div style={{ maxWidth: 240 }}>
              <FabricText truncate>
                This text will be truncated with an ellipsis when it overflows the container width
              </FabricText>
            </div>
          </DemoBox>
        </FabricStack>
      </Section>

      <Section
        title="FabricSurface"
        description="Semantic background container. Wraps MUI Paper with named variants."
        code='<FabricSurface variant="outlined">'
      >
        <FabricFlex gap="md" wrap>
          {(["primary", "secondary", "outlined"] as const).map((v) => (
            <FabricSurface key={v} variant={v} sx={{ p: 2.5, width: 180, borderRadius: "10px" }}>
              <code style={{ fontSize: 11, color: "var(--mui-palette-text-secondary)" }}>variant="{v}"</code>
              <FabricText size="sm" sx={{ mt: 0.5 }}>
                Content inside a {v} surface
              </FabricText>
            </FabricSurface>
          ))}
        </FabricFlex>
      </Section>

      <Section
        title="FabricDivider"
        description="Horizontal rule with token-based vertical spacing. Wraps MUI Divider."
        code='<FabricDivider spacing="md" />'
      >
        <FabricStack gap="sm">
          {(["none", "sm", "md", "lg", "xl"] as const).map((s) => (
            <DemoBox key={s} label={`spacing="${s}"`}>
              <FabricText size="sm">Content above</FabricText>
              <FabricDivider spacing={s} />
              <FabricText size="sm">Content below</FabricText>
            </DemoBox>
          ))}
        </FabricStack>
      </Section>
    </>
  );
};

/* ------------------------------------------------------------------ */
/*  Props reference                                                    */
/* ------------------------------------------------------------------ */

const propsData = [
  { name: "FabricFlex", props: "gap · direction · align · justify · wrap", base: "Box" },
  { name: "FabricStack", props: "gap · align · justify", base: "Box" },
  { name: "FabricInline", props: "gap · align", base: "Box" },
  { name: "FabricCenter", props: "(no custom props)", base: "Box" },
  { name: "FabricGrow", props: "(flex: 1, minWidth: 0)", base: "Box" },
  { name: "FabricSpacer", props: "size · flex", base: "Box" },
  { name: "FabricGrid", props: "gap · columns · rows · align · justify", base: "Box" },
  { name: "FabricContainer", props: "(MUI Container props)", base: "Container" },
  { name: "FabricText", props: "size · textVariant · truncate", base: "Typography" },
  { name: "FabricSurface", props: "variant", base: "Paper" },
  { name: "FabricDivider", props: "spacing", base: "Divider" },
];

const PropsReference = () => {
  const t = useVarsTheme();
  return (
    <section style={{ marginTop: 48 }}>
      <h3
        style={{
          fontFamily: "'Geist', sans-serif",
          fontSize: 18,
          fontWeight: 600,
          color: "var(--mui-palette-text-primary)",
          margin: "0 0 12px",
        }}
      >
        Quick Reference
      </h3>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: `2px solid var(--mui-palette-divider)`, textAlign: "left" }}>
            <th style={{ padding: "8px 12px", color: "var(--mui-palette-text-primary)" }}>Primitive</th>
            <th style={{ padding: "8px 12px", color: "var(--mui-palette-text-primary)" }}>Custom Props</th>
            <th style={{ padding: "8px 12px", color: "var(--mui-palette-text-primary)" }}>Extends</th>
          </tr>
        </thead>
        <tbody>
          {propsData.map(({ name, props, base }) => (
            <tr key={name} style={{ borderBottom: `1px solid var(--mui-palette-divider)` }}>
              <td style={{ padding: "8px 12px" }}>
                <code style={{ color: "var(--mui-palette-primary-main)", fontWeight: 600, fontSize: 12 }}>
                  {name}
                </code>
              </td>
              <td style={{ padding: "8px 12px", color: "var(--mui-palette-text-secondary)" }}>{props}</td>
              <td style={{ padding: "8px 12px" }}>
                <code style={{ fontSize: 11, color: "var(--mui-palette-text-secondary)" }}>MUI {base}</code>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ fontSize: 12, color: "var(--mui-palette-text-secondary)", marginTop: 8 }}>
        All <code style={{ fontSize: 11 }}>gap</code> and{" "}
        <code style={{ fontSize: 11 }}>spacing</code> props accept the{" "}
        <code style={{ fontSize: 11 }}>Space</code> type: none · xs · sm · md · lg · xl · 2xl · 3xl
        · 4xl
      </p>
    </section>
  );
};

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

const PrimitivesPage = () => {
  const t = useVarsTheme();
  return (
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
        Primitives
      </h2>
      <p
        style={{
          fontSize: 14,
          color: "var(--mui-palette-text-secondary)",
          margin: "0 0 32px",
          maxWidth: 640,
          lineHeight: 1.6,
        }}
      >
        Low-level layout and content building blocks. Structure-first, token-driven, fully
        compatible with MUI's <code style={{ fontSize: 12 }}>sx</code> prop. Import from{" "}
        <code style={{ fontSize: 12 }}>@fabric-kit/primitives</code>.
      </p>

      <LayoutSection />
      <ContentSection />
      <PropsReference />
    </div>
  );
};

const _PrimitiveStoryShell = ({
  title,
  description,
  code,
  children,
}: {
  title: string;
  description: string;
  code: string;
  children: React.ReactNode;
}) => {
  const t = useVarsTheme();
  return (
    <div style={{ maxWidth: 760 }}>
      <h2
        style={{
          fontFamily: "'Geist', sans-serif",
          fontSize: 24,
          fontWeight: 700,
          color: "var(--mui-palette-text-primary)",
          margin: "0 0 6px",
        }}
      >
        {title}
      </h2>
      <p
        style={{
          fontSize: 14,
          color: "var(--mui-palette-text-secondary)",
          margin: "0 0 10px",
          lineHeight: 1.6,
        }}
      >
        {description}
      </p>
      <code
        style={{
          display: "inline-block",
          padding: "4px 10px",
          borderRadius: 6,
          backgroundColor: "var(--mui-palette-action-selected)",
          color: "var(--mui-palette-text-secondary)",
          fontSize: 12,
          marginBottom: 14,
        }}
      >
        {code}
      </code>
      <DemoBox>{children}</DemoBox>
    </div>
  );
};

const meta: Meta = {
  title: "Primitives",
  component: PrimitivesPage,
  parameters: { layout: "padded" },
};

export default meta;

export const OverviewAndPhilosophy: StoryObj = {
  name: "Overview",
};
