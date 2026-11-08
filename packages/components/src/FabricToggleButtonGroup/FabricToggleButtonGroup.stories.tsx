import EditIcon from "@fabric-kit/icons/Edit";
import PreviewIcon from "@fabric-kit/icons/Preview";
import type { Meta, StoryObj } from "@storybook/react-vite";
import GridView from "@fabric-kit/icons/GridView";
import Lists from "@fabric-kit/icons/Lists";
import { type MouseEvent, useState } from "react";
import { expect, userEvent, within } from "storybook/test";

import { FabricToggleButtonGroup } from ".";

const meta = {
  title: "Components/FabricToggleButtonGroup",
  component: FabricToggleButtonGroup,
  tags: [],
  parameters: {
    docs: {
      description: {
        component:
          "Exclusive (or multi-select) toggle-button strip. Wraps MUI `ToggleButtonGroup` with an `items` array " +
          "where each item can have an icon, a label or both, plus per-item `disabled` and `aria-label`. " +
          "`onChange` receives `null` when the selection is cleared.",
      },
    },
  },
} satisfies Meta<typeof FabricToggleButtonGroup>;

export default meta;
type Story = StoryObj;

// -- Basics --

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState("grid");
    return (
      <FabricToggleButtonGroup
        value={value}
        onChange={(_: MouseEvent<HTMLElement>, v: string | null) => {
          if (v !== null) setValue(v);
        }}
        aria-label="View mode"
        items={[
          { value: "grid", icon: <GridView />, "aria-label": "Grid view" },
          { value: "list", icon: <Lists />, "aria-label": "List view" },
        ]}
      />
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const grid = canvas.getByRole("button", { name: /grid view/i });
    const list = canvas.getByRole("button", { name: /list view/i });
    await expect(grid).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(list);
    await expect(list).toHaveAttribute("aria-pressed", "true");
    await expect(grid).toHaveAttribute("aria-pressed", "false");
  },
};

export const TextLabels: Story = {
  render: () => {
    const [value, setValue] = useState("include");
    return (
      <FabricToggleButtonGroup
        value={value}
        onChange={(_: MouseEvent<HTMLElement>, v: string | null) => {
          if (v !== null) setValue(v);
        }}
        aria-label="Filter mode"
        items={[
          { value: "include", label: "Include" },
          { value: "exclude", label: "Exclude" },
        ]}
      />
    );
  },
};

export const IconsWithLabels: Story = {
  render: () => {
    const [value, setValue] = useState("preview");
    return (
      <FabricToggleButtonGroup
        value={value}
        onChange={(_: MouseEvent<HTMLElement>, v: string | null) => {
          if (v !== null) setValue(v);
        }}
        aria-label="Editor mode"
        items={[
          { value: "preview", icon: <PreviewIcon />, label: "Preview" },
          { value: "edit", icon: <EditIcon />, label: "Edit" },
        ]}
      />
    );
  },
};

// -- Orientation --

export const Vertical: Story = {
  render: () => {
    const [value, setValue] = useState("grid");
    return (
      <FabricToggleButtonGroup
        value={value}
        onChange={(_: MouseEvent<HTMLElement>, v: string | null) => {
          if (v !== null) setValue(v);
        }}
        orientation="vertical"
        aria-label="View mode"
        items={[
          { value: "grid", icon: <GridView />, "aria-label": "Grid view" },
          { value: "list", icon: <Lists />, "aria-label": "List view" },
        ]}
      />
    );
  },
};

// -- Disabled --

export const DisabledGroup: Story = {
  render: () => (
    <FabricToggleButtonGroup
      value="grid"
      disabled
      aria-label="View mode"
      items={[
        { value: "grid", icon: <GridView />, "aria-label": "Grid view" },
        { value: "list", icon: <Lists />, "aria-label": "List view" },
      ]}
    />
  ),
};

export const DisabledItem: Story = {
  render: () => {
    const [value, setValue] = useState("grid");
    return (
      <FabricToggleButtonGroup
        value={value}
        onChange={(_: MouseEvent<HTMLElement>, v: string | null) => {
          if (v !== null) setValue(v);
        }}
        aria-label="View mode"
        items={[
          { value: "grid", icon: <GridView />, "aria-label": "Grid view" },
          {
            value: "list",
            icon: <Lists />,
            "aria-label": "List view",
            disabled: true,
          },
        ]}
      />
    );
  },
};

// -- Multi-select (non-exclusive) --

export const MultiSelect: Story = {
  render: () => {
    const [values, setValues] = useState<string[]>(["bold"]);
    return (
      <FabricToggleButtonGroup
        value={values}
        exclusive={false}
        onChange={(_: MouseEvent<HTMLElement>, v: string[]) => setValues(v)}
        aria-label="Text formatting"
        items={[
          { value: "bold", label: "B" },
          { value: "italic", label: "I" },
          { value: "underline", label: "U" },
        ]}
      />
    );
  },
};
