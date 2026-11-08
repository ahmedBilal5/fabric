import PublicIcon from "@fabric-kit/icons/Public";
import StarIcon from "@fabric-kit/icons/Star";
import { Chip, MenuItem, Stack, Typography } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, screen, userEvent, within } from "storybook/test";

import { FabricSelect, type SelectOption } from ".";

const meta = {
  title: "Components/FabricSelect",
  component: FabricSelect,
  tags: ["test"],
  parameters: {
    docs: {
      description: {
        component:
          "A single-value select. Extends MUI `Select` (all `SelectProps<string>` work) and " +
          "adds a data-driven `options` API with an icon and label per item, plus built-in " +
          "`label`, `error`, `helperText` and `placeholder`. You can pass `<MenuItem>` " +
          "children instead of, or as well as, `options`.",
      },
    },
  },
  argTypes: {
    size: { control: "inline-radio", options: ["small", "medium"] },
    required: { control: "boolean" },
    error: { control: "boolean" },
    placeholder: { control: "text" },
    label: { control: "text" },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

const fruitOptions: SelectOption[] = [
  { value: "apple", label: "Apple" },
  { value: "orange", label: "Orange" },
  { value: "banana", label: "Banana" },
];

const iconOptions: SelectOption[] = [
  { value: "starred", label: "Starred", icon: <StarIcon fontSize="small" color="warning" /> },
  { value: "public", label: "Public", icon: <PublicIcon fontSize="small" color="primary" /> },
];

// ─── Basics ─────────────────────────────────────────────────────────────────

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState("apple");
    return (
      <FabricSelect label="Fruit" value={value} onValueChange={setValue} options={fruitOptions} />
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox", { name: /fruit/i });
    await userEvent.click(trigger);
    // MUI Select renders its listbox in a Portal.
    await expect(await screen.findByRole("option", { name: "Orange" })).toBeInTheDocument();
  },
};

export const SizeVariants: Story = {
  name: "Sizes — small vs medium (default)",
  render: () => {
    const [a, setA] = useState("apple");
    const [b, setB] = useState("orange");
    return (
      <Stack spacing={2}>
        <FabricSelect
          label="Small"
          size="small"
          value={a}
          onValueChange={setA}
          options={fruitOptions}
        />
        <FabricSelect
          label="Medium (default)"
          size="medium"
          value={b}
          onValueChange={setB}
          options={fruitOptions}
        />
      </Stack>
    );
  },
};

// ─── Feature showcases ───────────────────────────────────────────────────────

export const ChildrenSlot: Story = {
  name: "Children slot lookup",
  parameters: {
    docs: {
      description: {
        story:
          "Mix `options` with `<MenuItem>` children for extras like \"None\" or \"Custom…\". " +
          "The selected value is looked up in both, so the input always shows the right label.",
      },
    },
  },
  render: () => {
    const [value, setValue] = useState("apple");
    return (
      <Stack spacing={2}>
        <FabricSelect
          label="Fruit + custom"
          value={value}
          onValueChange={setValue}
          options={fruitOptions}
        >
          <MenuItem value="custom">Custom fruit...</MenuItem>
          <MenuItem value="none">None</MenuItem>
        </FabricSelect>
        <Typography variant="caption" color="text.secondary">
          Selected value: <code>{value}</code>. Try "Custom fruit..." or "None" — the input still
          shows the label.
        </Typography>
      </Stack>
    );
  },
};

export const WithIcons_ReactNode: Story = {
  name: "ReactNode icons",
  parameters: {
    docs: {
      description: {
        story:
          "`icon` accepts any `ReactNode`: Fabric icons, MUI icons or your own SVGs.",
      },
    },
  },
  render: () => {
    const [value, setValue] = useState("starred");
    return (
      <FabricSelect label="Sort by" value={value} onValueChange={setValue} options={iconOptions} />
    );
  },
};

export const WithIcons_URL: Story = {
  name: "Image URL icons",
  parameters: {
    docs: {
      description: {
        story:
          "Pass a URL string as `icon` and it renders as a 24px image, handy for flags, " +
          "avatars or logos that come from your API.",
      },
    },
  },
  render: () => {
    const [value, setValue] = useState("a");
    return (
      <FabricSelect
        label="Country"
        value={value}
        onValueChange={setValue}
        options={[
          { value: "a", label: "Canada", icon: "https://flagcdn.com/w40/ca.png" },
          { value: "b", label: "Japan", icon: "https://flagcdn.com/w40/jp.png" },
          { value: "c", label: "Kenya", icon: "https://flagcdn.com/w40/ke.png" },
        ]}
      />
    );
  },
};

export const ShowValue: Story = {
  name: "Show value next to label",
  parameters: {
    docs: {
      description: {
        story:
          "`showValue` prefixes each menu item with its value, useful for codes like SKUs.",
      },
    },
  },
  render: () => {
    const [value, setValue] = useState("sku-1");
    return (
      <FabricSelect
        label="SKU"
        value={value}
        onValueChange={setValue}
        showValue
        options={[
          { value: "sku-1", label: "Product A" },
          { value: "sku-2", label: "Product B" },
          { value: "sku-3", label: "Product C" },
        ]}
      />
    );
  },
};

export const CustomRenderValue: Story = {
  name: "Custom renderValue",
  parameters: {
    docs: {
      description: {
        story:
          "`renderValue` prop lets consumers fully own the selected-value rendering. Useful " +
          "for chip-style selection displays or multi-select composites.",
      },
    },
  },
  render: () => {
    const [value, setValue] = useState("orange");
    return (
      <FabricSelect
        label="Fruit"
        value={value}
        onValueChange={setValue}
        options={fruitOptions}
        renderValue={(v) => <Chip label={v.toUpperCase()} size="small" color="primary" />}
      />
    );
  },
};

// ─── Form-control features ──────────────────────────────────────────────────

export const RequiredAndError: Story = {
  name: "Required + Error + Helper text",
  render: () => {
    const [value, setValue] = useState("");
    const showError = value === "";
    return (
      <FabricSelect
        label="Country"
        value={value}
        onValueChange={setValue}
        required
        error={showError}
        helperText={showError ? "Please select a country" : `You picked: ${value}`}
        options={[
          { value: "us", label: "United States" },
          { value: "ca", label: "Canada" },
          { value: "mx", label: "Mexico" },
        ]}
      />
    );
  },
};

export const DisabledOption: Story = {
  render: () => {
    const [value, setValue] = useState("read");
    return (
      <FabricSelect
        label="Access"
        value={value}
        onValueChange={setValue}
        options={[
          { value: "read", label: "Read" },
          { value: "write", label: "Write", disabled: true },
          { value: "admin", label: "Admin", disabled: true },
        ]}
      />
    );
  },
};

// ─── Handler patterns ──────────────────────────────────────────────────────

export const OnChangeAndOnValueChange: Story = {
  name: "onChange (event) + onValueChange (shorthand)",
  parameters: {
    docs: {
      description: {
        story:
          "Both handlers fire on every change — `onChange` receives the full MUI event, " +
          "`onValueChange` receives just the value. Use both, either, or neither.",
      },
    },
  },
  render: () => {
    const [value, setValue] = useState("apple");
    const [changes, setChanges] = useState(0);

    return (
      <Stack spacing={2}>
        <FabricSelect
          label="Fruit"
          value={value}
          options={fruitOptions}
          onChange={() => setChanges((n) => n + 1)}
          onValueChange={setValue}
        />
        <Stack direction="row" spacing={2}>
          <Chip label={`onValueChange: ${value}`} />
          <Chip label={`onChange fires: ${changes}`} />
        </Stack>
      </Stack>
    );
  },
};

// ─── Kitchen sink ───────────────────────────────────────────────────────────

export const KitchenSink: Story = {
  render: () => {
    const [values, setValues] = useState({ fruit: "apple", country: "", sort: "starred" });
    return (
      <Stack spacing={3}>
        <FabricSelect
          label="Fruit"
          value={values.fruit}
          onValueChange={(v) => setValues({ ...values, fruit: v })}
          options={fruitOptions}
        />
        <FabricSelect
          label="Country (required, empty error)"
          value={values.country}
          onValueChange={(v) => setValues({ ...values, country: v })}
          required
          error={values.country === ""}
          helperText={values.country === "" ? "Required" : ""}
          options={[
            { value: "us", label: "United States" },
            { value: "ca", label: "Canada" },
          ]}
        />
        <FabricSelect
          label="Sort (icons)"
          value={values.sort}
          onValueChange={(v) => setValues({ ...values, sort: v })}
          options={iconOptions}
        />
      </Stack>
    );
  },
};
