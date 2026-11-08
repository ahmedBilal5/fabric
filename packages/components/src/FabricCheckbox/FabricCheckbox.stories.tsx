import BookmarkIcon from "@fabric-kit/icons/Bookmark";
import BookmarkBorderIcon from "@fabric-kit/icons/BookmarkBorder";
import { Box, Chip, Stack, Typography } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useMemo, useState } from "react";
import { expect, within } from "storybook/test";
import { CheckboxGroup } from "../FabricCheckboxGroup";
import { FabricCheckbox } from ".";

const meta = {
  title: "Components/FabricCheckbox",
  component: FabricCheckbox,
  tags: ["test"],
  parameters: {
    docs: {
      description: {
        component:
          "Extends MUI Checkbox with a `label` slot, uses " +
          "`onChange(event, checked)` for the MUI-standard signature (plus `onCheckedChange` " +
          "as a boolean shorthand) and supports `indeterminate`. Pair with `<CheckboxGroup>` for " +
          "multi-checkbox layouts.",
      },
    },
  },
  argTypes: {
    checked: { control: "boolean" },
    disabled: { control: "boolean" },
    required: { control: "boolean" },
    indeterminate: { control: "boolean" },
    size: { control: "inline-radio", options: ["small", "medium"] },
    color: {
      control: "select",
      options: ["default", "primary", "secondary", "error", "info", "success", "warning"],
    },
    labelPlacement: {
      control: "inline-radio",
      options: ["start", "end", "top", "bottom"],
    },
  },
} as Meta<typeof FabricCheckbox>;

export default meta;
type Story = StoryObj<typeof FabricCheckbox>;

// ─── Basics ─────────────────────────────────────────────────────────────────

export const Default: Story = {
  args: {
    label: "Include archived",
    checked: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const box = canvas.getByRole("checkbox", { name: /include archived/i });
    await expect(box).toBeChecked();
  },
};

export const BareNoLabel: Story = {
  name: "Bare (no label) — no FormControlLabel wrap",
  args: {
    checked: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Omit `label` and the wrapper renders just the `<Checkbox>` — no `<FormControlLabel>`, " +
          "no `<FormGroup>`, no extra DOM. Useful for DataGrid row-select cells.",
      },
    },
  },
};

export const AllSizes: Story = {
  render: () => (
    <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
      <FabricCheckbox label="Small" size="small" defaultChecked />
      <FabricCheckbox label="Medium" size="medium" defaultChecked />
    </Stack>
  ),
};

export const AllColors: Story = {
  render: () => (
    <Stack direction="row" spacing={2} sx={{ flexWrap: "wrap" }}>
      <FabricCheckbox label="Primary" color="primary" defaultChecked />
      <FabricCheckbox label="Secondary" color="secondary" defaultChecked />
      <FabricCheckbox label="Success" color="success" defaultChecked />
      <FabricCheckbox label="Warning" color="warning" defaultChecked />
      <FabricCheckbox label="Error" color="error" defaultChecked />
      <FabricCheckbox label="Info" color="info" defaultChecked />
    </Stack>
  ),
};

export const LabelPlacement: Story = {
  render: () => (
    <Stack spacing={2}>
      <FabricCheckbox label="End (default)" labelPlacement="end" defaultChecked />
      <FabricCheckbox label="Start" labelPlacement="start" defaultChecked />
      <FabricCheckbox label="Top" labelPlacement="top" defaultChecked />
      <FabricCheckbox label="Bottom" labelPlacement="bottom" defaultChecked />
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
      <FabricCheckbox label="Include archived" showInfo />
      <FabricCheckbox label="Include archived" showInfo defaultChecked />
    </Stack>
  ),
};

// ─── Advanced patterns ────────────────────────────────────────────────────────

export const Indeterminate: Story = {
  name: "Indeterminate",
  parameters: {
    docs: {
      description: {
        story:
          "`indeterminate` is now a first-class prop, typed and discoverable via autocomplete. " +
          "Consumers no longer need to bypass to raw `@mui/material/Checkbox` for tree-select-all " +
          "patterns.",
      },
    },
  },
  render: () => {
    const [children, setChildren] = useState([true, false, true]);
    const allChecked = children.every(Boolean);
    const someChecked = children.some(Boolean);

    return (
      <Stack spacing={1}>
        <FabricCheckbox
          label="All items"
          checked={allChecked}
          indeterminate={!allChecked && someChecked}
          onChange={(_e, checked) => setChildren(children.map(() => checked))}
        />
        {children.map((c, i) => (
          <Box key={i} sx={{ pl: 4 }}>
            <FabricCheckbox
              label={`Item ${i + 1}`}
              checked={c}
              onChange={(_e, checked) =>
                setChildren(children.map((v, idx) => (idx === i ? checked : v)))
              }
            />
          </Box>
        ))}
      </Stack>
    );
  },
};

export const StopPropagation: Story = {
  name: "Row click + stopPropagation",
  parameters: {
    docs: {
      description: {
        story:
          "`onChange` receives the event, so a checkbox inside a clickable row can call " +
          "`event.stopPropagation()` to keep the row click from firing.",
      },
    },
  },
  render: () => {
    const [rowClicks, setRowClicks] = useState(0);
    const [checkClicks, setCheckClicks] = useState(0);
    const [checked, setChecked] = useState(false);

    return (
      <Stack spacing={2}>
        <Typography variant="body2" color="text.secondary">
          Click the checkbox: only the checkbox handler fires (event stopped).
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
          <FabricCheckbox
            checked={checked}
            onChange={(event, next) => {
              event.stopPropagation();
              setChecked(next);
              setCheckClicks((n) => n + 1);
            }}
          />
          <Typography>Table row — click the checkbox, then the row</Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Chip label={`Checkbox clicks: ${checkClicks}`} />
          <Chip label={`Row clicks: ${rowClicks}`} />
        </Stack>
      </Stack>
    );
  },
};

export const OnCheckedChangeShorthand: Story = {
  name: "onCheckedChange (boolean shorthand)",
  parameters: {
    docs: {
      description: {
        story:
          "When you only need the boolean, `onCheckedChange(checked)` is a shorthand for `onChange`.",
      },
    },
  },
  render: () => {
    const [value, setValue] = useState(false);
    return (
      <Stack spacing={1}>
        <FabricCheckbox label="Simple boolean handler" checked={value} onCheckedChange={setValue} />
        <Typography variant="caption" color="text.secondary">
          Value: {String(value)}
        </Typography>
      </Stack>
    );
  },
};

export const DisabledAndRequired: Story = {
  name: "Disabled + Required propagate to label",
  parameters: {
    docs: {
      description: {
        story:
          "When disabled, both the input AND the label are greyed. When required, " +
          "the asterisk is visible on the label. `disabled` and `required` propagate " +
          "down to the FormControlLabel.",
      },
    },
  },
  render: () => (
    <Stack spacing={1}>
      <FabricCheckbox label="Enabled, not required" />
      <FabricCheckbox label="Disabled" disabled />
      <FabricCheckbox label="Disabled + checked" disabled defaultChecked />
      <FabricCheckbox label="Required" required />
      <FabricCheckbox label="Required + disabled" required disabled />
    </Stack>
  ),
};

export const CustomIcons: Story = {
  render: () => (
    <Stack direction="row" spacing={2}>
      <FabricCheckbox
        label="Bookmark"
        icon={<BookmarkBorderIcon />}
        checkedIcon={<BookmarkIcon />}
        defaultChecked
      />
    </Stack>
  ),
};

export const DisableTypography: Story = {
  name: "disableTypography (avoid double-wrap)",
  parameters: {
    docs: {
      description: {
        story:
          "Passing a `<Typography>`-wrapped label without `disableTypography` used to produce two nested " +
          "<Typography> elements. Set `disableTypography` and the wrapper skips its own wrap.",
      },
    },
  },
  render: () => (
    <FabricCheckbox
      disableTypography
      label={
        <Typography variant="body2" sx={{ fontWeight: 600, color: "primary.main" }}>
          Custom-styled label (no double-wrap)
        </Typography>
      }
      defaultChecked
    />
  ),
};

// ─── CheckboxGroup ──────────────────────────────────────────────────────────

export const Group_Vertical: StoryObj<typeof CheckboxGroup> = {
  name: "CheckboxGroup — vertical",
  render: () => {
    const [values, setValues] = useState({ a: false, b: true, c: false });
    return (
      <CheckboxGroup label="Notification channels">
        <FabricCheckbox
          label="Email"
          checked={values.a}
          onCheckedChange={(v) => setValues({ ...values, a: v })}
        />
        <FabricCheckbox
          label="SMS"
          checked={values.b}
          onCheckedChange={(v) => setValues({ ...values, b: v })}
        />
        <FabricCheckbox
          label="Push"
          checked={values.c}
          onCheckedChange={(v) => setValues({ ...values, c: v })}
        />
      </CheckboxGroup>
    );
  },
};

export const Group_Horizontal: StoryObj<typeof CheckboxGroup> = {
  name: "CheckboxGroup — horizontal",
  render: () => (
    <CheckboxGroup label="Filters" row helperText="Choose one or more">
      <FabricCheckbox label="Open" defaultChecked />
      <FabricCheckbox label="In Progress" />
      <FabricCheckbox label="Done" defaultChecked />
      <FabricCheckbox label="Archived" />
    </CheckboxGroup>
  ),
};

export const Group_Error: StoryObj<typeof CheckboxGroup> = {
  name: "CheckboxGroup — error state",
  render: () => (
    <CheckboxGroup label="Required agreements" error helperText="You must accept both to continue">
      <FabricCheckbox label="Terms of service" />
      <FabricCheckbox label="Privacy policy" />
    </CheckboxGroup>
  ),
};

export const Group_SelectAll: StoryObj<typeof CheckboxGroup> = {
  name: "CheckboxGroup — select-all pattern",
  parameters: {
    docs: {
      description: {
        story:
          'A "select all" parent built with `indeterminate`: it shows a dash when only some ' +
          "children are checked.",
      },
    },
  },
  render: () => {
    const options = ["Products", "Categories", "Attributes", "Media"];
    const [selected, setSelected] = useState<string[]>(["Products"]);
    const allChecked = selected.length === options.length;
    const someChecked = selected.length > 0 && !allChecked;

    const toggleAll = (checked: boolean) => setSelected(checked ? options : []);
    const toggleOne = (opt: string, checked: boolean) =>
      setSelected(checked ? [...selected, opt] : selected.filter((s) => s !== opt));

    const summary = useMemo(
      () => `${selected.length} of ${options.length} selected`,
      [selected, options.length],
    );

    return (
      <CheckboxGroup label="Sync scope" helperText={summary}>
        <FabricCheckbox
          label="Select all"
          checked={allChecked}
          indeterminate={someChecked}
          onCheckedChange={toggleAll}
        />
        <Box sx={{ pl: 4, display: "flex", flexDirection: "column" }}>
          {options.map((opt) => (
            <FabricCheckbox
              key={opt}
              label={opt}
              checked={selected.includes(opt)}
              onCheckedChange={(v) => toggleOne(opt, v)}
            />
          ))}
        </Box>
      </CheckboxGroup>
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
          <FabricCheckbox label="Unchecked" />
          <FabricCheckbox label="Checked" defaultChecked />
          <FabricCheckbox label="Indeterminate" indeterminate />
          <FabricCheckbox label="Disabled" disabled />
          <FabricCheckbox label="Required" required />
        </Stack>
      </Stack>

      <Stack spacing={1}>
        <Typography variant="overline">Grouped</Typography>
        <CheckboxGroup label="Preferences" row>
          <FabricCheckbox label="Dark mode" defaultChecked />
          <FabricCheckbox label="Notifications" />
          <FabricCheckbox label="Analytics" defaultChecked />
        </CheckboxGroup>
      </Stack>
    </Stack>
  ),
};
