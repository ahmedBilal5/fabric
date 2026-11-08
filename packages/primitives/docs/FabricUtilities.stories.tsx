import { useTheme } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  FabricCenter,
  FabricContainer,
  FabricFlex,
  FabricGrow,
  FabricSpacer,
  FabricStack,
  FabricText,
} from "../src";

const useVars = () => {
  const t = useTheme();
  return (t.vars?.palette ?? t.palette) as typeof t.palette;
};

const meta: Meta = {
  title: "Primitives/Utilities",
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj;

/* ---- FabricCenter ---- */

export const Center: Story = {
  render: () => {
    const p = useVars();
    return (
      <FabricStack gap="md">
        <FabricText size="lg" sx={{ fontWeight: 600 }}>
          FabricCenter
        </FabricText>
        <FabricText size="sm" sx={{ color: "text.secondary" }}>
          Centers children both horizontally and vertically. Give it a height to see the effect.
        </FabricText>
        <FabricCenter sx={{ height: 120, border: `1px dashed ${p.divider}`, borderRadius: 2 }}>
          <div
            style={{
              padding: "8px 24px",
              borderRadius: 6,
              backgroundColor: p.primary.main,
              color: p.primary.contrastText,
              fontWeight: 500,
              fontSize: 13,
            }}
          >
            Centered content
          </div>
        </FabricCenter>
      </FabricStack>
    );
  },
};

/* ---- FabricGrow ---- */

export const Grow: Story = {
  render: () => {
    const p = useVars();
    return (
      <FabricStack gap="md">
        <FabricText size="lg" sx={{ fontWeight: 600 }}>
          FabricGrow
        </FabricText>
        <FabricText size="sm" sx={{ color: "text.secondary" }}>
          Fills remaining flex space (flex: 1, minWidth: 0). Use inside FabricFlex to push siblings
          apart.
        </FabricText>
        <FabricFlex gap="sm" sx={{ border: `1px dashed ${p.divider}`, borderRadius: 2, p: 1 }}>
          <div
            style={{
              padding: "8px 16px",
              borderRadius: 6,
              backgroundColor: p.action.selected,
              color: p.text.primary,
              fontSize: 13,
            }}
          >
            Fixed
          </div>
          <FabricGrow
            sx={{
              p: 1.5,
              borderRadius: "6px",
              backgroundColor: p.primary.main,
              color: p.primary.contrastText,
              fontSize: 13,
              textAlign: "center",
            }}
          >
            Grows to fill
          </FabricGrow>
          <div
            style={{
              padding: "8px 16px",
              borderRadius: 6,
              backgroundColor: p.action.selected,
              color: p.text.primary,
              fontSize: 13,
            }}
          >
            Fixed
          </div>
        </FabricFlex>
      </FabricStack>
    );
  },
};

/* ---- FabricSpacer ---- */

export const SpacerFixed: Story = {
  name: "Spacer (fixed size)",
  render: () => {
    const p = useVars();
    return (
      <FabricStack gap="md">
        <FabricText size="lg" sx={{ fontWeight: 600 }}>
          FabricSpacer — fixed size
        </FabricText>
        <FabricText size="sm" sx={{ color: "text.secondary" }}>
          Creates a fixed-size aria-hidden gap between items.
        </FabricText>
        <FabricStack gap="sm">
          {(["sm", "md", "lg", "xl", "2xl"] as const).map((s) => (
            <FabricFlex key={s} align="center">
              <div
                style={{
                  padding: "6px 12px",
                  borderRadius: 6,
                  backgroundColor: p.primary.main,
                  color: p.primary.contrastText,
                  fontSize: 13,
                }}
              >
                Before
              </div>
              <FabricSpacer size={s} />
              <div
                style={{
                  padding: "6px 12px",
                  borderRadius: 6,
                  backgroundColor: p.action.selected,
                  color: p.text.primary,
                  fontSize: 13,
                }}
              >
                After (size="{s}")
              </div>
            </FabricFlex>
          ))}
        </FabricStack>
      </FabricStack>
    );
  },
};

export const SpacerFlex: Story = {
  name: "Spacer (flex)",
  render: () => {
    const p = useVars();
    return (
      <FabricStack gap="md">
        <FabricText size="lg" sx={{ fontWeight: 600 }}>
          FabricSpacer — flex
        </FabricText>
        <FabricText size="sm" sx={{ color: "text.secondary" }}>
          Acts as a flex-grow spacer, pushing siblings apart.
        </FabricText>
        <FabricFlex
          align="center"
          sx={{ border: `1px dashed ${p.divider}`, borderRadius: 2, p: 1 }}
        >
          <div style={{ fontWeight: 600, color: p.text.primary }}>Logo</div>
          <FabricSpacer flex />
          <div
            style={{
              padding: "6px 14px",
              borderRadius: 6,
              backgroundColor: p.primary.main,
              color: p.primary.contrastText,
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            Sign In
          </div>
        </FabricFlex>
      </FabricStack>
    );
  },
};

/* ---- FabricContainer ---- */

export const Container: Story = {
  render: () => {
    const p = useVars();
    return (
      <FabricStack gap="md">
        <FabricText size="lg" sx={{ fontWeight: 600 }}>
          FabricContainer
        </FabricText>
        <FabricText size="sm" sx={{ color: "text.secondary" }}>
          Centered max-width wrapper. Wraps MUI Container.
        </FabricText>
        <FabricStack gap="sm">
          {(["sm", "md", "lg", "xl"] as const).map((mw) => (
            <FabricContainer key={mw} maxWidth={mw}>
              <div
                style={{
                  padding: 16,
                  borderRadius: 6,
                  textAlign: "center",
                  backgroundColor: p.action.selected,
                  color: p.text.primary,
                  fontSize: 13,
                }}
              >
                maxWidth="{mw}"
              </div>
            </FabricContainer>
          ))}
        </FabricStack>
      </FabricStack>
    );
  },
};
