import StarIcon from "@fabric-kit/icons/Star";
import StarBorderIcon from "@fabric-kit/icons/StarBorder";
import { Box, Chip, Stack, Typography } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";

import { FabricRadioGroup, type RadioOption } from ".";

const meta = {
  title: "Components/FabricRadioGroup",
  component: FabricRadioGroup,
  tags: ["test"],
  parameters: {
    docs: {
      description: {
        component:
          "Radio-group form control. Each group gets a unique `useId()`-generated " +
          "name, so several groups on one page keep their selections independent. Uses " +
          "`onChange(event, value)` for the MUI-standard signature (plus `onValueChange(value)` " +
          "shorthand), stable keys prevent focus loss on parent re-render, ARIA linkage via " +
          "`useId()`, and typed `ReactNode` labels.",
      },
    },
  },
} as Meta<typeof FabricRadioGroup>;

export default meta;
type Story = StoryObj<typeof FabricRadioGroup>;

const fruitOptions: RadioOption[] = [
  { value: "apple", label: "Apple" },
  { value: "orange", label: "Orange" },
  { value: "banana", label: "Banana" },
];

const permissionOptions: RadioOption[] = [
  { value: "read", label: "Read only" },
  { value: "write", label: "Read & Write" },
  { value: "owner", label: "Owner" },
];

// ─── Basics ─────────────────────────────────────────────────────────────────

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState("apple");
    return (
      <FabricRadioGroup
        label="Choose a fruit"
        options={fruitOptions}
        value={value}
        onValueChange={setValue}
      />
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const apple = canvas.getByRole("radio", { name: /apple/i });
    const orange = canvas.getByRole("radio", { name: /orange/i });
    await expect(apple).toBeChecked();
    await userEvent.click(orange);
    await expect(orange).toBeChecked();
    await expect(apple).not.toBeChecked();
  },
};

export const RowLayout: Story = {
  render: () => {
    const [value, setValue] = useState("read");
    return (
      <FabricRadioGroup
        label="Access level"
        options={permissionOptions}
        value={value}
        onValueChange={setValue}
        row
      />
    );
  },
};

export const NoGroupLabel: Story = {
  render: () => {
    const [value, setValue] = useState("apple");
    return <FabricRadioGroup options={fruitOptions} value={value} onValueChange={setValue} />;
  },
};

export const SizeVariants: Story = {
  name: "Sizes — medium (default) vs small",
  parameters: {
    docs: {
      description: {
        story:
          'FabricRadioGroup defaults to `size="medium"` (24px). ' +
          'Pass `size="small"` for a denser 20px radio. The size cascades to every ' +
          "`<FabricRadio>` inside the group (the group renders FabricRadio internally, so " +
          "the token styling is identical across sizes and matches standalone FabricRadio " +
          "instances).",
      },
    },
  },
  render: () => {
    const [small, setSmall] = useState("apple");
    const [medium, setMedium] = useState("orange");
    return (
      <Stack spacing={3}>
        <FabricRadioGroup
          label="Medium (default)"
          options={fruitOptions}
          value={medium}
          onValueChange={setMedium}
        />
        <FabricRadioGroup
          label="Small"
          options={fruitOptions}
          value={small}
          onValueChange={setSmall}
          size="small"
        />
      </Stack>
    );
  },
};

// ─── Interaction patterns ──────────────────────────────────────────────────────

export const MultipleGroupsIndependent: Story = {
  name: "Independent groups",
  parameters: {
    docs: {
      description: {
        story:
          "Each group gets its own `name` from `useId()`, so groups on the same page never share " +
          "state. Try it: selecting in group A doesn't affect group B.",
      },
    },
  },
  render: () => {
    const [fruit, setFruit] = useState("apple");
    const [access, setAccess] = useState("read");
    return (
      <Stack spacing={3}>
        <FabricRadioGroup
          label="Fruit (group A)"
          options={fruitOptions}
          value={fruit}
          onValueChange={setFruit}
        />
        <FabricRadioGroup
          label="Access (group B)"
          options={permissionOptions}
          value={access}
          onValueChange={setAccess}
        />
        <Stack direction="row" spacing={2}>
          <Chip label={`Fruit: ${fruit}`} />
          <Chip label={`Access: ${access}`} />
        </Stack>
      </Stack>
    );
  },
};

export const OnChangeWithEvent: Story = {
  name: "onChange(event, value) handler",
  parameters: {
    docs: {
      description: {
        story:
          "`onChange` uses MUI's `(event, value)` signature. If you need `event.stopPropagation()` or " +
          "`event.target.name` can access them; consumers who just want the value use " +
          "`onValueChange` (the shorthand).",
      },
    },
  },
  render: () => {
    const [value, setValue] = useState("apple");
    const [rowClicks, setRowClicks] = useState(0);

    return (
      <Stack spacing={2}>
        <Box
          sx={{
            p: 2,
            border: 1,
            borderColor: "divider",
            borderRadius: 1,
            cursor: "pointer",
          }}
          onClick={() => setRowClicks((n) => n + 1)}
        >
          <FabricRadioGroup
            label="Radio inside a clickable row"
            options={fruitOptions}
            value={value}
            onChange={(event, next) => {
              event.stopPropagation();
              setValue(next);
            }}
          />
        </Box>
        <Chip label={`Row clicks (should stay 0): ${rowClicks}`} />
      </Stack>
    );
  },
};

export const HelperTextAndError: Story = {
  render: () => {
    const [value, setValue] = useState("");
    const showError = value === "";
    return (
      <FabricRadioGroup
        label="Choose a plan"
        options={[
          { value: "free", label: "Free" },
          { value: "pro", label: "Pro" },
          { value: "enterprise", label: "Enterprise" },
        ]}
        value={value}
        onValueChange={setValue}
        error={showError}
        helperText={showError ? "Selection required" : `You picked: ${value}`}
      />
    );
  },
};

export const WarningVariant: Story = {
  name: 'variant="warning"',
  parameters: {
    docs: {
      description: {
        story:
          '`variant="warning"` ' +
          "shows the amber selected-background for cases where the choice needs to draw attention " +
          "(destructive actions, confirmations).",
      },
    },
  },
  render: () => {
    const [value, setValue] = useState("keep");
    return (
      <FabricRadioGroup
        label="Confirm action"
        options={[
          { value: "keep", label: "Keep the record" },
          { value: "archive", label: "Archive the record" },
          { value: "delete", label: "Delete permanently" },
        ]}
        value={value}
        onValueChange={setValue}
        variant="warning"
      />
    );
  },
};

export const DisabledOptions: Story = {
  render: () => {
    const [value, setValue] = useState("read");
    return (
      <FabricRadioGroup
        label="Access level (some disabled)"
        options={[
          { value: "read", label: "Read only" },
          { value: "write", label: "Read & Write", disabled: true },
          { value: "owner", label: "Owner", disabled: true },
        ]}
        value={value}
        onValueChange={setValue}
      />
    );
  },
};

export const RichLabels: Story = {
  name: "ReactNode labels",
  parameters: {
    docs: {
      description: {
        story:
          "`RadioOption.label` is a `ReactNode`, so it accepts " +
          "any content — icons, badges, colored text.",
      },
    },
  },
  render: () => {
    const [value, setValue] = useState("starred");
    return (
      <FabricRadioGroup
        label="Sort by"
        options={[
          {
            value: "starred",
            label: (
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <StarIcon fontSize="small" color="warning" />
                <Typography>Starred first</Typography>
              </Stack>
            ),
          },
          {
            value: "recent",
            label: (
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <StarBorderIcon fontSize="small" />
                <Typography>Most recent</Typography>
                <Chip label="new" size="small" color="primary" />
              </Stack>
            ),
          },
        ]}
        value={value}
        onValueChange={setValue}
      />
    );
  },
};

// ─── Kitchen sink ───────────────────────────────────────────────────────────

export const KitchenSink: Story = {
  render: () => {
    const [values, setValues] = useState({ a: "apple", b: "read", c: "free" });
    return (
      <Stack spacing={3}>
        <FabricRadioGroup
          label="Fruit"
          options={fruitOptions}
          value={values.a}
          onValueChange={(v) => setValues({ ...values, a: v })}
        />
        <FabricRadioGroup
          label="Access (row layout)"
          options={permissionOptions}
          value={values.b}
          onValueChange={(v) => setValues({ ...values, b: v })}
          row
        />
        <FabricRadioGroup
          label="Plan (with helper text)"
          options={[
            { value: "free", label: "Free" },
            { value: "pro", label: "Pro" },
          ]}
          value={values.c}
          onValueChange={(v) => setValues({ ...values, c: v })}
          helperText="You can change this later"
        />
      </Stack>
    );
  },
};
