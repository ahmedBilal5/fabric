import { FabricStatus } from "@fabric-kit/components";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import {
  type FabricFilterDef,
  FabricFilterBar,
  type FabricFilterValues,
  useFilterParams,
} from "../src";

const FILTERS: FabricFilterDef[] = [
  {
    id: "status",
    label: "Status",
    multiple: true,
    options: [
      { value: "draft", label: "Draft", icon: <FabricStatus status="unknown" aria-label="" /> },
      { value: "sent", label: "Sent", icon: <FabricStatus status="running" aria-label="" /> },
      { value: "paid", label: "Paid", icon: <FabricStatus status="success" aria-label="" /> },
      { value: "overdue", label: "Overdue", icon: <FabricStatus status="error" aria-label="" /> },
    ],
  },
  {
    id: "owner",
    label: "Owner",
    options: [
      { value: "jane", label: "Jane Doe" },
      { value: "sam", label: "Sam Lee" },
      { value: "priya", label: "Priya Patel" },
    ],
  },
  {
    id: "region",
    label: "Region",
    multiple: true,
    options: [
      { value: "na", label: "North America" },
      { value: "eu", label: "Europe" },
      { value: "apac", label: "Asia Pacific" },
    ],
  },
];

const meta = {
  title: "Patterns/Filter bar",
  component: FabricFilterBar,
  tags: ["test"],
  parameters: { layout: "padded" },
  args: {
    filters: FILTERS,
    values: {},
    onValuesChange: fn(),
    search: "",
    onSearchChange: fn(),
    resultCount: 24,
  },
  argTypes: { filters: { control: false }, values: { control: false }, endSlot: { control: false } },
} satisfies Meta<typeof FabricFilterBar>;

export default meta;
type Story = StoryObj<typeof meta>;

function Controlled(props: React.ComponentProps<typeof FabricFilterBar>) {
  const [values, setValues] = useState<FabricFilterValues>(props.values);
  const [search, setSearch] = useState(props.search ?? "");
  return (
    <FabricFilterBar
      {...props}
      values={values}
      onValuesChange={(v) => {
        props.onValuesChange(v);
        setValues(v);
      }}
      search={search}
      onSearchChange={(s) => {
        props.onSearchChange?.(s);
        setSearch(s);
      }}
    />
  );
}

export const Default: Story = {
  render: (args) => <Controlled {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    await expect(canvas.getByRole("search", { name: "Filters" })).toBeInTheDocument();
    await expect(canvas.queryByRole("button", { name: "Clear all" })).toBeNull();

    // Multiple choice: the menu stays open.
    await userEvent.click(canvas.getByRole("button", { name: "Status" }));
    await userEvent.click(await body.findByRole("menuitemcheckbox", { name: "Paid" }));
    await userEvent.click(body.getByRole("menuitemcheckbox", { name: "Draft" }));
    await expect(args.onValuesChange).toHaveBeenLastCalledWith({ status: ["draft", "paid"] });
    await userEvent.keyboard("{Escape}");
    await expect(canvas.getByRole("button", { name: "Status: 2 selected" })).toBeVisible();

    // Single choice: picking closes the menu.
    await userEvent.click(canvas.getByRole("button", { name: "Owner" }));
    await userEvent.click(await body.findByRole("menuitemradio", { name: "Sam Lee" }));
    await waitFor(() => expect(body.queryByRole("menu")).toBeNull());
    await expect(canvas.getByRole("button", { name: "Owner: Sam Lee" })).toBeVisible();

    await userEvent.click(canvas.getByRole("button", { name: "Clear all" }));
    await expect(canvas.getByRole("button", { name: "Status" })).toBeVisible();
    await expect(canvas.queryByRole("button", { name: "Clear all" })).toBeNull();
  },
};

export const WithActiveFilters: Story = {
  args: { values: { status: ["sent", "overdue"], owner: "jane" }, search: "Northwind", resultCount: 3 },
  render: (args) => <Controlled {...args} />,
};

export const WithoutSearch: Story = {
  args: { search: undefined, onSearchChange: undefined },
  render: (args) => <Controlled {...args} />,
};

/** Filters wrap on narrow screens; the search box takes the full width on phones. */
export const Narrow: Story = {
  render: (args) => <Controlled {...args} />,
  decorators: [(Story) => <div style={{ maxWidth: 360 }}>{Story()}</div>],
};

/** `useFilterParams` keeps search and filters in the URL. The query string is shown below. */
export const SyncedToUrl: Story = {
  render: function Render(args) {
    const filters = useFilterParams(FILTERS);
    return (
      <div>
        <FabricFilterBar
          {...args}
          values={filters.values}
          onValuesChange={filters.setValues}
          search={filters.search}
          onSearchChange={filters.setSearch}
          onClearAll={filters.clear}
        />
        <pre
          data-testid="query"
          style={{ marginTop: 16, fontSize: 12, color: "var(--mui-palette-text-secondary)" }}
        >
          {decodeURIComponent(
            new URLSearchParams(
              [...new URLSearchParams(window.location.search)].filter(([k]) =>
                ["q", ...FILTERS.map((f) => f.id)].includes(k),
              ),
            ).toString(),
          ) || "(no filters in the URL)"}
        </pre>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    await userEvent.click(canvas.getByRole("button", { name: "Owner" }));
    await userEvent.click(await body.findByRole("menuitemradio", { name: "Priya Patel" }));
    await waitFor(() => expect(window.location.search).toContain("owner=priya"));
    await userEvent.click(canvas.getByRole("button", { name: "Clear all" }));
    await waitFor(() => expect(window.location.search).not.toContain("owner="));
  },
};
