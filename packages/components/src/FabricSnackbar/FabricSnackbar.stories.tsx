import { Button, Stack } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, screen, userEvent, within } from "storybook/test";
import { FabricButton } from "../FabricButton/FabricButton";
import { FabricSnackbar, type FabricSnackbarProps } from ".";

const meta = {
  title: "Components/FabricSnackbar",
  component: FabricSnackbar,
  tags: ["test"],
  parameters: {
    docs: {
      description: {
        component:
          "Design-system toast/snackbar. Composes MUI `Snackbar` + `FabricAlert` " +
          "(`standardAlt`: white fill, semantic border, text and icon) with a drop shadow. " +
          "`title` accepts any `ReactNode` and renders as the FabricAlert title. " +
          "`vertical` / `horizontal` default to `'top'` / `'right'` and compose into MUI's " +
          "`anchorOrigin`. `onClose` keeps MUI's `(event, reason) => void` signature, and " +
          "`topOffset` pushes the toast below a fixed banner. Every story below opens from a " +
          "button because MUI " +
          "Snackbar is a fixed-position portal and permanently-open stories overflow " +
          "Storybook's canvas iframe.",
      },
    },
  },
  argTypes: {
    severity: {
      control: "select",
      options: ["success", "info", "warning", "error"],
    },
    vertical: { control: "radio", options: ["top", "bottom"] },
    horizontal: { control: "radio", options: ["left", "center", "right"] },
    autoHideDuration: { control: "number" },
    topOffset: { control: "number" },
    title: { control: "text" },
    open: { table: { disable: true } },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

// Button-trigger render. MUI Snackbar is a fixed-position portal — leaving
// stories permanently `open` overflows Storybook's canvas iframe. Match the
// Button opens the snackbar; its onClose handler closes it.
const SnackbarWithTrigger = ({
  buttonLabel = "Open snackbar",
  ...args
}: Partial<FabricSnackbarProps> & { buttonLabel?: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <FabricButton onClick={() => setOpen(true)}>{buttonLabel}</FabricButton>
      {/* @ts-expect-error MUI 9 strict ref typing conflicts with Partial spread in stories */}
      <FabricSnackbar
        {...args}
        open={open}
        onClose={(_event, reason) => {
          if (reason !== "clickaway") setOpen(false);
        }}
      />
    </>
  );
};

// ─── Basics ─────────────────────────────────────────────────────────────────

export const Primary: Story = {
  args: {
    severity: "success",
    vertical: "top",
    horizontal: "right",
    autoHideDuration: 5000,
    title: "Changes saved",
    children: "Your edits are live.",
  },
  render: (args) => <SnackbarWithTrigger {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /open snackbar/i }));
    // Snackbar is a fixed-position portal.
    await expect(await screen.findByText("Changes saved")).toBeInTheDocument();
  },
};

export const AllSeverities: Story = {
  name: "All severities",
  parameters: {
    docs: {
      description: {
        story:
          "Each button opens the snackbar for its severity — only one is visible at a " +
          "time (portal positioning). Each severity uses the matching FabricAlert " +
          "`subVariant` color and icon.",
      },
    },
  },
  render: () => {
    const [active, setActive] = useState<"success" | "info" | "warning" | "error" | null>(null);
    const labels = {
      success: "Changes saved successfully",
      info: "Refresh running in the background",
      warning: "Some fields require review",
      error: "Failed to save — try again",
    } as const;
    return (
      <>
        <Stack direction="row" spacing={1}>
          {(["success", "info", "warning", "error"] as const).map((sev) => (
            <FabricButton key={sev} color={sev} variant="outlined" onClick={() => setActive(sev)}>
              {sev[0].toUpperCase() + sev.slice(1)}
            </FabricButton>
          ))}
        </Stack>
        <FabricSnackbar
          open={active !== null}
          severity={active ?? "info"}
          title={active ? labels[active] : ""}
          autoHideDuration={4000}
          onClose={(_event, reason) => {
            if (reason !== "clickaway") setActive(null);
          }}
        />
      </>
    );
  },
};

// ─── Variants ───────────────────────────────────────────────────────────────

export const TitleOnly: Story = {
  name: "Title only (no body)",
  args: {
    severity: "error",
    title: "Table not selected — cannot be added to GroupBy",
    autoHideDuration: 5000,
  },
  render: (args) => <SnackbarWithTrigger {...args} buttonLabel="Open title-only" />,
};

export const BodyOnly: Story = {
  name: "Body only (no title)",
  args: {
    severity: "info",
    children: "A dataset refresh is running in the background.",
    autoHideDuration: 5000,
  },
  render: (args) => <SnackbarWithTrigger {...args} buttonLabel="Open body-only" />,
};

export const RichTitle: Story = {
  name: "Rich title (ReactNode)",
  parameters: {
    docs: {
      description: {
        story:
          "`title` is a `ReactNode`: compose icons, formatted spans or keyboard shortcuts.",
      },
    },
  },
  render: () => (
    <SnackbarWithTrigger
      buttonLabel="Open rich-title"
      severity="warning"
      autoHideDuration={6000}
      title={
        <>
          <strong>Warning:</strong> unsaved changes will be lost if you navigate away.
        </>
      }
    >
      Save your work before switching workspaces.
    </SnackbarWithTrigger>
  ),
};

// ─── Positioning ────────────────────────────────────────────────────────────

export const TopLeft: Story = {
  name: "Position — top-left",
  args: {
    severity: "info",
    title: "Top-left placement",
    vertical: "top",
    horizontal: "left",
    autoHideDuration: 5000,
  },
  render: (args) => <SnackbarWithTrigger {...args} buttonLabel="Open top-left" />,
};

export const BottomCenter: Story = {
  name: "Position — bottom-center",
  args: {
    severity: "success",
    title: "Bottom-center placement",
    vertical: "bottom",
    horizontal: "center",
    autoHideDuration: 5000,
  },
  render: (args) => <SnackbarWithTrigger {...args} buttonLabel="Open bottom-center" />,
};

// ─── topOffset ────────────────────────────────────

export const TopOffset: Story = {
  name: "topOffset (below a fixed banner)",
  parameters: {
    docs: {
      description: {
        story:
          "`topOffset` pushes a top-anchored toast down, e.g. below a 40px `FabricBanner`.",
      },
    },
  },
  args: {
    severity: "info",
    title: "Offset below a banner",
    topOffset: 40,
    children: "Moved down 40px so a fixed banner above stays visible.",
    autoHideDuration: 5000,
  },
  render: (args) => <SnackbarWithTrigger {...args} buttonLabel="Open with topOffset" />,
};

// ─── Consumer overrides ─────────────────────────────────────────────────────

export const AlertPropsOverride: Story = {
  name: "alertProps override",
  parameters: {
    docs: {
      description: {
        story:
          "`alertProps` forwards to the inner FabricAlert — pass `sx`, `className`, or a " +
          "custom `action` button. Consumer `sx` keys win over DS defaults.",
      },
    },
  },
  render: () => (
    <SnackbarWithTrigger
      buttonLabel="Open with action button"
      severity="info"
      title="Custom action"
      autoHideDuration={6000}
      alertProps={{
        action: (
          <Button color="inherit" size="small">
            RETRY
          </Button>
        ),
        sx: { minWidth: 420 },
      }}
    >
      Include an inline action button.
    </SnackbarWithTrigger>
  ),
};

// ─── Kitchen sink ───────────────────────────────────────────────────────────

export const KitchenSink: Story = {
  name: "Kitchen sink",
  args: {
    severity: "warning",
    title: "Almost done",
    autoHideDuration: 8000,
    vertical: "top",
    horizontal: "right",
    topOffset: 40,
    children: "Rich body content with token-driven styles and outlined severity icon.",
  },
  render: (args) => <SnackbarWithTrigger {...args} buttonLabel="Open kitchen sink" />,
};
