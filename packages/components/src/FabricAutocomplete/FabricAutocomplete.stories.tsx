import PersonIcon from "@fabric-kit/icons/Person";
import { Box, Chip, ListSubheader } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { Key } from "react";
import { useState } from "react";
import { expect, screen, userEvent, within } from "storybook/test";
import { FabricAutocomplete } from ".";

interface Person {
  id: string;
  name: string;
  email: string;
}

const PEOPLE: Person[] = [
  { id: "1", name: "Alice Smith", email: "alice.smith@example.com" },
  { id: "2", name: "Bob Johnson", email: "bob.johnson@example.com" },
  { id: "3", name: "Charlie Davis", email: "charlie.davis@example.com" },
  { id: "4", name: "Diana Wilson", email: "diana.wilson@example.com" },
  { id: "5", name: "Ethan Brown", email: "ethan.brown@example.com" },
  { id: "6", name: "Fiona Miller", email: "fiona.miller@example.com" },
];

const FRUITS = [
  "Apple",
  "Apricot",
  "Banana",
  "Blueberry",
  "Cherry",
  "Coconut",
  "Date",
  "Elderberry",
  "Fig",
  "Grape",
  "Kiwi",
  "Lemon",
  "Mango",
  "Nectarine",
  "Orange",
  "Papaya",
  "Peach",
  "Pear",
  "Pineapple",
  "Plum",
  "Raspberry",
  "Strawberry",
  "Watermelon",
];

const GROUPED_OPTIONS = FRUITS.map((f) => ({
  label: f,
  group: /^[A-D]/.test(f) ? "A–D" : /^[E-M]/.test(f) ? "E–M" : "N–Z",
}));

const meta: Meta<typeof FabricAutocomplete> = {
  title: "Components/FabricAutocomplete",
  component: FabricAutocomplete,
  tags: ["test"],
  parameters: {
    docs: {
      description: {
        component:
          "Autocomplete / combobox — extends MUI Autocomplete with a FabricTextField-based default renderInput. Top-level `label`/`placeholder`/`error`/`helperText` handle the 90% case; pass `renderInput` for full control.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof FabricAutocomplete>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState<string | null>(null);
    return (
      <Box sx={{ width: 320 }}>
        <FabricAutocomplete<string>
          options={FRUITS}
          value={value}
          onChange={(_, v) => setValue(v)}
          label="Fruit"
          placeholder="Pick a fruit"
        />
      </Box>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("combobox", { name: /fruit/i });
    await userEvent.type(input, "appl");
    // Autocomplete listbox is portaled outside the canvas.
    await expect(await screen.findByRole("option", { name: "Apple" })).toBeInTheDocument();
  },
};

export const Multiple: Story = {
  render: () => {
    const [value, setValue] = useState<string[]>(["Apple", "Banana"]);
    return (
      <Box sx={{ width: 400 }}>
        <FabricAutocomplete<string, true>
          multiple
          options={FRUITS}
          value={value}
          onChange={(_, v) => setValue(v)}
          label="Fruits"
          placeholder="Pick one or more"
        />
      </Box>
    );
  },
};

export const FreeSolo: Story = {
  name: "Free solo (create-new)",
  render: () => {
    const [value, setValue] = useState<string | null>("");
    return (
      <Box sx={{ width: 320 }}>
        <FabricAutocomplete<string, false, false, true>
          freeSolo
          options={FRUITS}
          value={value}
          onChange={(_, v) => setValue(v as string)}
          label="Fruit"
          placeholder="Pick or type a new one"
          helperText="Type any value — not restricted to the option list."
        />
      </Box>
    );
  },
};

export const DisableClearable: Story = {
  name: "Disable clearable",
  render: () => {
    const [value, setValue] = useState<string>("Apple");
    return (
      <Box sx={{ width: 320 }}>
        <FabricAutocomplete<string, false, true>
          disableClearable
          options={FRUITS}
          value={value}
          onChange={(_, v) => setValue(v)}
          label="Fruit (required)"
          helperText="The clear button is hidden — a value is always set."
        />
      </Box>
    );
  },
};

export const Grouped: Story = {
  render: () => {
    const [value, setValue] = useState<(typeof GROUPED_OPTIONS)[number] | null>(null);
    return (
      <Box sx={{ width: 320 }}>
        <FabricAutocomplete<(typeof GROUPED_OPTIONS)[number]>
          options={[...GROUPED_OPTIONS].sort((a, b) => a.group.localeCompare(b.group))}
          groupBy={(option) => option.group}
          getOptionLabel={(option) => option.label}
          value={value}
          onChange={(_, v) => setValue(v)}
          label="Fruit"
          placeholder="Grouped by letter range"
        />
      </Box>
    );
  },
};

export const CustomOptionRender: Story = {
  name: "Custom renderOption (people picker)",
  render: () => {
    const [value, setValue] = useState<Person | null>(null);
    return (
      <Box sx={{ width: 400 }}>
        <FabricAutocomplete<Person>
          options={PEOPLE}
          value={value}
          onChange={(_, v) => setValue(v)}
          getOptionLabel={(option) => option.name}
          isOptionEqualToValue={(a, b) => a.id === b.id}
          label="Assignee"
          placeholder="Search people"
          renderOption={(props, option) => (
            <li {...props} key={option.id}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  py: 0.5,
                }}
              >
                <PersonIcon color="action" />
                <Box>
                  <Box sx={{ fontWeight: 500 }}>{option.name}</Box>
                  <Box sx={{ fontSize: 12, color: "text.secondary" }}>{option.email}</Box>
                </Box>
              </Box>
            </li>
          )}
        />
      </Box>
    );
  },
};

export const WithChips: Story = {
  name: "Multi + custom chips",
  render: () => {
    const [value, setValue] = useState<Person[]>([PEOPLE[0], PEOPLE[2]]);
    return (
      <Box sx={{ width: 500 }}>
        <FabricAutocomplete<Person, true>
          multiple
          options={PEOPLE}
          value={value}
          onChange={(_, v) => setValue(v)}
          getOptionLabel={(option) => option.name}
          isOptionEqualToValue={(a, b) => a.id === b.id}
          label="Assignees"
          placeholder="Add people"
          {...({
            renderTags: (
              tags: Person[],
              getTagProps: (params: { index: number }) => { key?: Key },
            ) =>
            tags.map((option, index: number) => {
              const { key, ...rest } = getTagProps({ index });
              return (
                <Chip
                  key={option.id}
                  {...rest}
                  label={option.name}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              );
            }),
          } as any)}
        />
      </Box>
    );
  },
};

export const Error: Story = {
  name: "Error state",
  render: () => {
    const [value, setValue] = useState<string | null>(null);
    return (
      <Box sx={{ width: 320 }}>
        <FabricAutocomplete<string>
          options={FRUITS}
          value={value}
          onChange={(_, v) => setValue(v)}
          label="Fruit"
          placeholder="Pick a fruit"
          error
          helperText="Please select a fruit."
        />
      </Box>
    );
  },
};

export const Disabled: Story = {
  render: () => (
    <Box sx={{ width: 320 }}>
      <FabricAutocomplete<string> disabled options={FRUITS} value="Apple" label="Fruit" />
    </Box>
  ),
};

export const Loading: Story = {
  render: () => (
    <Box sx={{ width: 320 }}>
      <FabricAutocomplete<string> options={[]} loading label="Fruit" placeholder="Loading…" />
    </Box>
  ),
};

export const CustomRenderInput: Story = {
  name: "Full renderInput override",
  render: () => {
    const [value, setValue] = useState<string | null>(null);
    return (
      <Box sx={{ width: 320 }}>
        <FabricAutocomplete<string>
          options={FRUITS}
          value={value}
          onChange={(_, v) => setValue(v)}
          renderInput={(params) => (
            <div>
              <ListSubheader disableSticky sx={{ px: 0, lineHeight: "32px" }}>
                Custom Input
              </ListSubheader>
              <div
                ref={params.slotProps.input.ref}
                style={{
                  display: "flex",
                  alignItems: "center",
                  border: "1px solid #cbd5e1",
                  borderRadius: 8,
                  padding: "2px 8px",
                }}
              >
                {params.slotProps.input.startAdornment}
                <input
                  {...params.slotProps.htmlInput}
                  placeholder="Type a fruit"
                  style={{
                    flex: 1,
                    border: "none",
                    outline: "none",
                    padding: "8px 4px",
                    fontSize: 14,
                    background: "transparent",
                  }}
                />
                {params.slotProps.input.endAdornment}
              </div>
            </div>
          )}
        />
      </Box>
    );
  },
};
