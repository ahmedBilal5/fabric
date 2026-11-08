import EditNoteIcon from "@fabric-kit/icons/EditNote";
import PersonOutlinedIcon from "@fabric-kit/icons/PersonOutlined";
import VisibilityIcon from "@fabric-kit/icons/Visibility";
import VisibilityOffIcon from "@fabric-kit/icons/VisibilityOff";
import { IconButton, InputAdornment, Stack } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";

import { FabricChip } from "../FabricChip";
import { FabricTextField } from "./FabricTextField";

const meta = {
  title: "Components/FabricTextField",
  component: FabricTextField,
  tags: ["test"],
  parameters: {
    docs: {
      description: {
        component:
          "Design-system text field. Styling comes from the theme, " +
          "so MUI `TextField`, `Select`, `Autocomplete` and the pickers look the same.",
      },
    },
  },
  argTypes: {
    label: { control: "text" },
    placeholder: { control: "text" },
    helperText: { control: "text" },
    disabled: { control: "boolean" },
    required: { control: "boolean" },
    error: { control: "boolean" },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

const fieldWidth = { width: 240 };

/** Label rests inside the box and floats on focus or when filled. */
export const Default: Story = {
  args: { label: "Label", placeholder: "Enter", sx: fieldWidth },
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByLabelText(/label/i);
    await userEvent.type(input, "Ada");
    await expect(input).toHaveValue("Ada");
  },
};

/** States: default, filled, required, help text, disabled and error. */
export const States: Story = {
  render: () => (
    <Stack direction="row" sx={{ gap: 3, flexWrap: "wrap", alignItems: "flex-start" }}>
      <FabricTextField label="Default" sx={fieldWidth} />
      <FabricTextField label="Filled" defaultValue="Value" sx={fieldWidth} />
      <FabricTextField label="Required" required sx={fieldWidth} />
      <FabricTextField label="Help text" helperText="Help text" sx={fieldWidth} />
      <FabricTextField label="Disabled" defaultValue="Value" disabled sx={fieldWidth} />
      <FabricTextField
        label="Error"
        defaultValue="Value"
        error
        helperText="Error message"
        sx={fieldWidth}
      />
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText("Disabled")).toBeDisabled();
    await expect(canvas.getByLabelText("Error")).toHaveAttribute("aria-invalid", "true");
  },
};

/** `variant="standard"`: 36px, bottom stroke only. */
export const Underline: Story = {
  render: () => (
    <Stack direction="row" sx={{ gap: 3, flexWrap: "wrap", alignItems: "flex-start" }}>
      <FabricTextField variant="standard" label="Default" helperText="Help text" sx={fieldWidth} />
      <FabricTextField variant="standard" label="Filled" defaultValue="Value" sx={fieldWidth} />
      <FabricTextField variant="standard" label="Disabled" disabled sx={fieldWidth} />
      <FabricTextField
        variant="standard"
        label="Error"
        error
        helperText="Error message"
        sx={fieldWidth}
      />
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText("Default"), "Ada");
    await expect(canvas.getByLabelText("Default")).toHaveValue("Ada");
    await expect(canvas.getByLabelText("Error")).toHaveAttribute("aria-invalid", "true");
  },
};

/** Pass a start adornment; the resting label moves after the icon. */
export const LeadingIcon: Story = {
  render: () => {
    const icon = {
      input: {
        startAdornment: (
          <InputAdornment position="start">
            <PersonOutlinedIcon style={{width: '20px', height: '20px'}}/>
          </InputAdornment>
        ),
      },
    };
    return (
      <Stack direction="row" sx={{ gap: 3 }}>
        <FabricTextField label="Label" slotProps={icon} sx={fieldWidth} />
        <FabricTextField label="Label" defaultValue="Value" slotProps={icon} sx={fieldWidth} />
        <FabricTextField
          label="Label"
          defaultValue="Value"
          disabled
          slotProps={icon}
          sx={fieldWidth}
        />
      </Stack>
    );
  },
  play: async ({ canvasElement }) => {
    const label = canvasElement.querySelector("label");
    await expect(label).toHaveAttribute("data-shrink", "false");
    await userEvent.click(within(canvasElement).getAllByLabelText("Label")[0]);
    await expect(label).toHaveAttribute("data-shrink", "true");
  },
};

/** A round icon button at the end, e.g. a password toggle. */
export const TrailingIcon: Story = {
  render: () => {
    const [visible, setVisible] = useState(false);
    return (
      <FabricTextField
        label="Password"
        type={visible ? "text" : "password"}
        defaultValue="secret"
        sx={fieldWidth}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label={visible ? "hide password" : "show password"}
                  onClick={() => setVisible((v) => !v)}
                  sx={{ p: "4px" }}
                >
                  {visible ? (
                    <VisibilityOffIcon sx={{ fontSize: 18 }} />
                  ) : (
                    <VisibilityIcon sx={{ fontSize: 18 }} />
                  )}
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText("Password");
    await expect(input).toHaveAttribute("type", "password");
    await userEvent.click(canvas.getByRole("button", { name: "show password" }));
    await expect(input).toHaveAttribute("type", "text");
  },
};

/** `search`: a compact box with no label. Enter does not submit the page; × clears the value. */
export const Search: Story = {
  render: () => {
    const [query, setQuery] = useState("");
    return (
      <FabricTextField
        search
        placeholder="Search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        searchPaperProps={{ sx: fieldWidth }}
      />
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText("Search");
    await expect(canvas.queryByRole("button", { name: "clear search" })).toBeNull();
    await userEvent.type(input, "orders{Enter}");
    await expect(input).toHaveValue("orders");
    await userEvent.click(await canvas.findByRole("button", { name: "clear search" }));
    await expect(input).toHaveValue("");
  },
};

/** `type="number"` gets an up/down stepper that respects `min` / `max` / `step`. */
export const Numeric: Story = {
  render: () => {
    const [count, setCount] = useState("0");
    return (
      <FabricTextField
        type="number"
        value={count}
        onChange={(e) => setCount(e.target.value)}
        slotProps={{ htmlInput: { min: 0, max: 59, "aria-label": "Minutes" } }}
        sx={{ width: 88 }}
      />
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText("Minutes");
    await userEvent.click(canvas.getByRole("button", { name: "increment" }));
    await userEvent.click(canvas.getByRole("button", { name: "increment" }));
    await expect(input).toHaveValue(2);
    await userEvent.click(canvas.getByRole("button", { name: "decrement" }));
    await expect(input).toHaveValue(1);
  },
};

/**
 * `multiline` with 3 rows; drag the corner to resize. An end icon sits at the
 * top right, and chips go in a start adornment (they wrap, and the label stays floated).
 */
export const TextArea: Story = {
  render: () => (
    <Stack direction="row" sx={{ gap: 3, alignItems: "flex-start" }}>
      <FabricTextField label="Label" multiline rows={3} sx={fieldWidth} />
      <FabricTextField
        label="Label"
        multiline
        rows={3}
        defaultValue="Value"
        sx={fieldWidth}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <EditNoteIcon />
              </InputAdornment>
            ),
          },
        }}
      />
      <FabricTextField
        label="Label"
        multiline
        rows={3}
        sx={{ width: 300 }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <FabricChip label="enter" size="small" onDelete={() => {}} />
                <FabricChip label="review" size="small" onDelete={() => {}} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <EditNoteIcon />
              </InputAdornment>
            ),
          },
        }}
      />
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("enter")).toBeVisible();
  },
};
