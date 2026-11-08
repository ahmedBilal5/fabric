import StarIcon from "@fabric-kit/icons/Star";
import StarBorderIcon from "@fabric-kit/icons/StarBorder";
import { Box, Chip, Stack, Typography } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, within } from "storybook/test";

import { FabricRadio } from ".";

const meta = {
  title: "Components/FabricRadio",
  component: FabricRadio,
  tags: ["test"],
  parameters: {
    docs: {
      description: {
        component:
          "**The single-radio primitive.** Rarely used standalone — radios almost always " +
          "live in a group (see `<FabricRadioGroup>` in the sidebar). This component exists " +
          "so `<FabricRadioGroup>` composes it internally (source of truth for radio visual " +
          "and behavior), and so consumers who need a compound layout can compose it themselves.\n\n" +
          "**Default size:** `medium` (24px); `small` (20px) is also available. " +
          "Glyphs, colors and label typography match " +
          "`<FabricCheckbox>` and `<FabricSwitch>`.",
      },
    },
  },
  argTypes: {
    checked: { control: "boolean" },
    disabled: { control: "boolean" },
    required: { control: "boolean" },
    size: { control: "inline-radio", options: ["small", "medium"] },
    color: {
      control: "select",
      options: ["default", "primary", "secondary", "error", "info", "success", "warning"],
    },
    labelPlacement: {
      control: "inline-radio",
      options: ["start", "end", "top", "bottom"],
    },
    labelSize: {
      control: "inline-radio",
      options: ["xs", "sm", "md", "lg"],
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

// ─── Basics ─────────────────────────────────────────────────────────────────

export const Default: Story = {
  args: {
    label: "Enable feature",
    defaultChecked: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("radio", { name: /enable feature/i })).toBeChecked();
  },
};

export const BareNoLabel: Story = {
  name: "Bare (no label)",
  args: {
    defaultChecked: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Omit `label` and the wrapper renders just `<Radio>` — no `<FormControlLabel>`, " +
          "no wrapper div. Used internally by `<FabricRadioGroup>` for exactly this reason.",
      },
    },
  },
};

// ─── Sizes ──────────────────────────────────────────────────────────────────

export const Sizes: Story = {
  name: "Sizes — medium (default) vs small",
  parameters: {
    docs: {
      description: {
        story:
          '`size="medium"` (24px) is the default. The `size` prop is forwarded from ' +
          "`<FabricRadioGroup>` too, so grouped radios inherit it automatically.",
      },
    },
  },
  render: () => (
    <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
      <FabricRadio label="Medium (default)" size="medium" defaultChecked />
      <FabricRadio label="Small" size="small" defaultChecked />
    </Stack>
  ),
};
export const ShowInfo: Story = {
  name: "Info icon",
  parameters: {
    docs: {
      description: {
        story:
          "`showInfo` adds the 16px info icon after the label. " +
          "Ignored when `label` is omitted.",
      },
    },
  },
  render: () => (
    <Stack spacing={2}>
      <FabricRadio label="Standard shipping" showInfo />
      <FabricRadio label="Standard shipping" showInfo defaultChecked />
    </Stack>
  ),
};
// ─── Colors ─────────────────────────────────────────────────────────────────

export const AllColors: Story = {
  name: "Colors — brand blue for primary, MUI palette for the rest",
  parameters: {
    docs: {
      description: {
        story:
          'The default `color="primary"` renders the theme primary (brand blue) when checked and ' +
          "`text.disabled` when off — matches `<FabricCheckbox>` and `<FabricSwitch>`. Other " +
          "MUI palette values (`success`, `error`, ...) pass through untouched.",
      },
    },
  },
  render: () => (
    <Stack direction="row" spacing={2} sx={{ flexWrap: "wrap" }}>
      <FabricRadio label="Primary" color="primary" defaultChecked />
      <FabricRadio label="Secondary" color="secondary" defaultChecked />
      <FabricRadio label="Success" color="success" defaultChecked />
      <FabricRadio label="Warning" color="warning" defaultChecked />
      <FabricRadio label="Error" color="error" defaultChecked />
      <FabricRadio label="Info" color="info" defaultChecked />
    </Stack>
  ),
};

// ─── States ─────────────────────────────────────────────────────────────────

export const AllStates: Story = {
  render: () => (
    <Stack spacing={1}>
      <FabricRadio label="Unchecked" />
      <FabricRadio label="Checked" defaultChecked />
      <FabricRadio label="Disabled" disabled />
      <FabricRadio label="Disabled + checked" disabled defaultChecked />
      <FabricRadio label="Required" required />
    </Stack>
  ),
};

// ─── Labels ─────────────────────────────────────────────────────────────────

export const LabelPlacement: Story = {
  render: () => (
    <Stack spacing={2}>
      <FabricRadio label="End (default)" labelPlacement="end" defaultChecked />
      <FabricRadio label="Start" labelPlacement="start" defaultChecked />
      <FabricRadio label="Top" labelPlacement="top" defaultChecked />
      <FabricRadio label="Bottom" labelPlacement="bottom" defaultChecked />
    </Stack>
  ),
};

export const LabelSize: Story = {
  name: "labelSize — token-driven label typography",
  parameters: {
    docs: {
      description: {
        story:
          "`labelSize` maps to the `fontSize` design tokens (`xs`, `sm`, `md`, `lg`). " +
          "Ignored when `disableTypography` is set — that path lets consumers pass their " +
          "own pre-styled `<Typography>` label.",
      },
    },
  },
  render: () => (
    <Stack spacing={1}>
      <FabricRadio label="Extra small label" labelSize="xs" defaultChecked />
      <FabricRadio label="Small label" labelSize="sm" defaultChecked />
      <FabricRadio label="Medium label (MUI default size)" labelSize="md" defaultChecked />
      <FabricRadio label="Large label" labelSize="lg" defaultChecked />
    </Stack>
  ),
};

export const RichLabel: Story = {
  name: "ReactNode label",
  parameters: {
    docs: {
      description: {
        story:
          "`label: ReactNode` — icons, chips, colored spans, any React tree. Useful for " +
          "compound composition when `<FabricRadioGroup>` 's `options[]` API is too rigid.",
      },
    },
  },
  render: () => (
    <Stack spacing={2}>
      <FabricRadio
        defaultChecked
        label={
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <StarIcon fontSize="small" color="warning" />
            <Typography variant="body2">Starred item</Typography>
            <Chip label="premium" size="small" color="primary" />
          </Stack>
        }
      />
      <FabricRadio
        label={
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <StarBorderIcon fontSize="small" />
            <Typography variant="body2">Regular item</Typography>
          </Stack>
        }
      />
    </Stack>
  ),
};

// ─── Handlers ───────────────────────────────────────────────────────────────

export const OnChangeWithEvent: Story = {
  name: "onChange(event, checked) — MUI signature preserved",
  parameters: {
    docs: {
      description: {
        story:
          "The full MUI `onChange(event, checked)` signature is available — consumers can " +
          "`event.stopPropagation()`, read `event.target.name`, or wire react-hook-form.",
      },
    },
  },
  render: () => {
    const [checked, setChecked] = useState(false);
    const [rowClicks, setRowClicks] = useState(0);

    return (
      <Stack spacing={2}>
        <Typography variant="body2" color="text.secondary">
          Click the radio: only the radio handler fires (event stopped).
          <br />
          Click anywhere else on the row: row handler fires.
        </Typography>
        <Box
          sx={{
            p: 2,
            border: 1,
            borderColor: "divider",
            borderRadius: 1,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
          onClick={() => setRowClicks((n) => n + 1)}
        >
          <FabricRadio
            checked={checked}
            onChange={(event, next) => {
              event.stopPropagation();
              setChecked(next);
            }}
          />
          <Typography>Selectable row</Typography>
        </Box>
        <Chip label={`Row clicks: ${rowClicks}`} />
      </Stack>
    );
  },
};

export const OnCheckedChangeShorthand: Story = {
  name: "onCheckedChange — boolean shorthand",
  parameters: {
    docs: {
      description: {
        story:
          "For consumers who just want the boolean and never touch the event. Fires " +
          "**after** `onChange` with the same value.",
      },
    },
  },
  render: () => {
    const [value, setValue] = useState(false);
    return (
      <Stack spacing={1}>
        <FabricRadio label="Simple boolean handler" checked={value} onCheckedChange={setValue} />
        <Typography variant="caption" color="text.secondary">
          Value: {String(value)}
        </Typography>
      </Stack>
    );
  },
};

// ─── Kitchen sink ───────────────────────────────────────────────────────────

export const KitchenSink: Story = {
  render: () => (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Typography variant="overline">Basic states</Typography>
        <Stack direction="row" spacing={2}>
          <FabricRadio label="Off" />
          <FabricRadio label="On" defaultChecked />
          <FabricRadio label="Disabled" disabled />
          <FabricRadio label="Required" required />
        </Stack>
      </Stack>

      <Stack spacing={1}>
        <Typography variant="overline">Sizes</Typography>
        <Stack direction="row" spacing={2}>
          <FabricRadio label="Medium (default)" size="medium" defaultChecked />
          <FabricRadio label="Small" size="small" defaultChecked />
        </Stack>
      </Stack>

      <Stack spacing={1}>
        <Typography variant="overline">Label sizes</Typography>
        <Stack direction="row" spacing={2}>
          <FabricRadio label="xs" labelSize="xs" defaultChecked />
          <FabricRadio label="sm" labelSize="sm" defaultChecked />
          <FabricRadio label="md" labelSize="md" defaultChecked />
          <FabricRadio label="lg" labelSize="lg" defaultChecked />
        </Stack>
      </Stack>
    </Stack>
  ),
};
