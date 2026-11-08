import { Stack, Typography } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { spacing } from "@fabric-kit/design-tokens";
import { FabricFlex } from "@fabric-kit/primitives";
import { useMemo, useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { FabricCheckbox } from "../FabricCheckbox";
import { CheckboxGroup } from ".";

const meta = {
  title: "Components/FabricCheckboxGroup",
  component: CheckboxGroup,
  tags: ["test"],
  parameters: {
    docs: {
      description: {
        component:
          "A labelled group of checkboxes that answer one question. It renders MUI's " +
          "`FormControl` + `FormLabel` + `FormGroup` so screen readers announce the group label.\n\n" +
          "**Compound API:** children are `<FabricCheckbox>` instances. The group does not own " +
          "the values — it provides layout (`row`), an accessible label, helper text, and error " +
          'state wiring via `useId()`. Consumers who want "select all" or "N of M selected" ' +
          "compose it themselves (see the `SelectAllPattern` story). Those patterns are product-" +
          "specific and don't belong in a base component.",
      },
    },
  },
  argTypes: {
    row: { control: "boolean" },
    error: { control: "boolean" },
    disabled: { control: "boolean" },
    label: { control: "text" },
    helperText: { control: "text" },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

// ─── Basics ─────────────────────────────────────────────────────────────────

export const Default: Story = {
  render: () => {
    const [values, setValues] = useState({ email: false, sms: true, push: false });
    return (
      <CheckboxGroup label="Notification channels">
        <FabricCheckbox
          label="Email"
          checked={values.email}
          onCheckedChange={(v) => setValues({ ...values, email: v })}
        />
        <FabricCheckbox
          label="SMS"
          checked={values.sms}
          onCheckedChange={(v) => setValues({ ...values, sms: v })}
        />
        <FabricCheckbox
          label="Push"
          checked={values.push}
          onCheckedChange={(v) => setValues({ ...values, push: v })}
        />
      </CheckboxGroup>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const email = canvas.getByRole("checkbox", { name: /email/i });
    // Initial state: only SMS is checked.
    await expect(email).not.toBeChecked();
    await expect(canvas.getByRole("checkbox", { name: /sms/i })).toBeChecked();
    // Click through the group's internal state.
    await userEvent.click(email);
    await expect(email).toBeChecked();
  },
};

export const Horizontal: Story = {
  name: "Horizontal (row)",
  parameters: {
    docs: {
      description: {
        story:
          "`row` lays checkboxes horizontally. Useful for compact filters or short option lists.",
      },
    },
  },
  render: () => (
    <CheckboxGroup label="Filters" row helperText="Choose one or more">
      <FabricCheckbox label="Open" defaultChecked />
      <FabricCheckbox label="In Progress" />
      <FabricCheckbox label="Done" defaultChecked />
      <FabricCheckbox label="Archived" />
    </CheckboxGroup>
  ),
};

export const HelperText: Story = {
  name: "Helper text",
  render: () => (
    <CheckboxGroup label="Preferences" helperText="You can change these later">
      <FabricCheckbox label="Dark mode" defaultChecked />
      <FabricCheckbox label="Reduced motion" />
      <FabricCheckbox label="Compact layout" />
    </CheckboxGroup>
  ),
};

export const ErrorState: Story = {
  name: "Error state",
  parameters: {
    docs: {
      description: {
        story:
          "When `error` is set, the group label and helper text render in the theme's error " +
          "color. Consumer decides the validation rule; the component only visualizes the state.",
      },
    },
  },
  render: () => (
    <CheckboxGroup label="Required agreements" error helperText="You must accept both to continue">
      <FabricCheckbox label="Terms of service" />
      <FabricCheckbox label="Privacy policy" />
    </CheckboxGroup>
  ),
};

// ─── Advanced patterns ──────────────────────────────────────────────────────

export const SelectAllPattern: Story = {
  name: "Select-all pattern (indeterminate)",
  parameters: {
    docs: {
      description: {
        story:
          'A "select all" parent built with `indeterminate` on `<FabricCheckbox>`. It shows a ' +
          "dash when only some children are checked.",
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
        <FabricFlex direction="column" sx={{ pl: `${spacing.lg}px` }}>
          {options.map((opt) => (
            <FabricCheckbox
              key={opt}
              label={opt}
              checked={selected.includes(opt)}
              onCheckedChange={(v) => toggleOne(opt, v)}
            />
          ))}
        </FabricFlex>
      </CheckboxGroup>
    );
  },
};

export const DisabledGroup: Story = {
  name: "Disabled group",
  parameters: {
    docs: {
      description: {
        story:
          "`disabled` on the group propagates to every checkbox via MUI's FormControl context.",
      },
    },
  },
  render: () => (
    <CheckboxGroup label="Locked settings" disabled helperText="Contact an admin to change these">
      <FabricCheckbox label="Auto-backup" defaultChecked />
      <FabricCheckbox label="Encryption at rest" defaultChecked />
      <FabricCheckbox label="Audit logging" defaultChecked />
    </CheckboxGroup>
  ),
};

// ─── Kitchen sink ───────────────────────────────────────────────────────────

export const KitchenSink: Story = {
  render: () => {
    const [values, setValues] = useState({
      channels: { email: true, sms: false, push: true },
      prefs: { dark: true, motion: false, compact: false },
    });

    return (
      <Stack spacing={4}>
        <Stack spacing={1}>
          <Typography variant="overline">Vertical group</Typography>
          <CheckboxGroup label="Notification channels" helperText="Choose one or more">
            <FabricCheckbox
              label="Email"
              checked={values.channels.email}
              onCheckedChange={(v) =>
                setValues({ ...values, channels: { ...values.channels, email: v } })
              }
            />
            <FabricCheckbox
              label="SMS"
              checked={values.channels.sms}
              onCheckedChange={(v) =>
                setValues({ ...values, channels: { ...values.channels, sms: v } })
              }
            />
            <FabricCheckbox
              label="Push"
              checked={values.channels.push}
              onCheckedChange={(v) =>
                setValues({ ...values, channels: { ...values.channels, push: v } })
              }
            />
          </CheckboxGroup>
        </Stack>

        <Stack spacing={1}>
          <Typography variant="overline">Horizontal group</Typography>
          <CheckboxGroup label="Preferences" row>
            <FabricCheckbox
              label="Dark mode"
              checked={values.prefs.dark}
              onCheckedChange={(v) => setValues({ ...values, prefs: { ...values.prefs, dark: v } })}
            />
            <FabricCheckbox
              label="Reduced motion"
              checked={values.prefs.motion}
              onCheckedChange={(v) =>
                setValues({ ...values, prefs: { ...values.prefs, motion: v } })
              }
            />
            <FabricCheckbox
              label="Compact"
              checked={values.prefs.compact}
              onCheckedChange={(v) =>
                setValues({ ...values, prefs: { ...values.prefs, compact: v } })
              }
            />
          </CheckboxGroup>
        </Stack>

        <Stack spacing={1}>
          <Typography variant="overline">Error state</Typography>
          <CheckboxGroup label="Required agreements" error helperText="You must accept both">
            <FabricCheckbox label="Terms of service" />
            <FabricCheckbox label="Privacy policy" />
          </CheckboxGroup>
        </Stack>
      </Stack>
    );
  },
};
