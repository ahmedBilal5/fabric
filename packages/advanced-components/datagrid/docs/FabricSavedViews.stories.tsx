import type {
  GridColumnVisibilityModel,
  GridFilterModel,
  GridSortModel,
} from "@mui/x-data-grid";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { type FabricSavedView, FabricDatagrid, FabricSavedViews, useSavedViews } from "../src";
import { baseColumns, sampleRows } from "./sampleData";

/** What a view remembers in these stories. Store whatever your grid needs. */
interface GridView {
  filterModel: GridFilterModel;
  sortModel: GridSortModel;
  columnVisibilityModel: GridColumnVisibilityModel;
}

const ALL: GridView = { filterModel: { items: [] }, sortModel: [], columnVisibilityModel: {} };

const defaultViews: FabricSavedView<GridView>[] = [
  { id: "all", name: "All products", state: ALL },
  {
    id: "electronics",
    name: "Electronics",
    state: {
      ...ALL,
      filterModel: { items: [{ field: "category", operator: "equals", value: "Electronics" }] },
    },
  },
  { id: "cheapest", name: "Cheapest first", state: { ...ALL, sortModel: [{ field: "price", sort: "asc" }] } },
];

const meta = {
  title: "Advanced Components/FabricSavedViews",
  component: FabricSavedViews,
  tags: ["test"],
  parameters: { layout: "padded" },
  args: {
    views: [
      ...defaultViews.map((v) => ({ ...v, builtIn: true })),
      { id: "mine", name: "Furniture under $300", state: ALL },
    ],
    activeId: "mine",
    modified: false,
    onSelect: fn(),
    onSave: fn(),
    onSaveAs: fn(),
    onRename: fn(),
    onDelete: fn(),
    onDiscard: fn(),
  },
  argTypes: { views: { control: false } },
} satisfies Meta<typeof FabricSavedViews>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Views: Furniture under $300" }));
    const menu = await within(document.body).findByRole("menu");
    await userEvent.click(within(menu).getByRole("menuitem", { name: "Cheapest first" }));
    await expect(args.onSelect).toHaveBeenCalledWith("cheapest");
  },
};

/** Changed settings show "Edited", with Save and Discard in the menu. */
export const Edited: Story = {
  args: { modified: true },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Views: Furniture under $300, edited" }));
    const menu = await within(document.body).findByRole("menu");
    await userEvent.click(within(menu).getByRole("menuitem", { name: "Save changes" }));
    await expect(args.onSave).toHaveBeenCalled();
  },
};

/** Built-in views can't be renamed, overwritten or deleted, only copied with "Save as new view". */
export const BuiltInActive: Story = {
  args: { activeId: "all", modified: true },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: /Views: All products/ }));
    const menu = await within(document.body).findByRole("menu");
    await expect(within(menu).queryByRole("menuitem", { name: "Save changes" })).toBeNull();
    await expect(within(menu).queryByRole("menuitem", { name: "Rename view…" })).toBeNull();
    await waitFor(() =>
      expect(within(menu).getByRole("menuitem", { name: "Save as new view…" })).toBeVisible(),
    );
    await userEvent.keyboard("{Escape}");
  },
};

export const SaveAsChecksNames: Story = {
  play: async ({ canvasElement, args }) => {
    const body = within(document.body);
    await userEvent.click(within(canvasElement).getByRole("button", { name: /^Views:/ }));
    await userEvent.click(await body.findByRole("menuitem", { name: "Save as new view…" }));
    const field = await body.findByLabelText("View name");
    await userEvent.type(field, "electronics");
    await expect(body.getByText("A view with this name already exists.")).toBeVisible();
    await expect(body.getByRole("button", { name: "Save view" })).toBeDisabled();
    await userEvent.clear(field);
    await userEvent.type(field, "Clearance{Enter}");
    await expect(args.onSaveAs).toHaveBeenCalledWith("Clearance");
    await waitFor(() => expect(body.queryByRole("dialog")).toBeNull());
  },
};

/** The whole loop with `useSavedViews` and a grid: switch, change, save, rename, delete. */
export const WithGrid: Story = {
  render: function Render() {
    const views = useSavedViews<GridView>({ defaultViews });
    const [grid, setGrid] = useState<GridView>(views.activeView.state);
    const apply = (id: string) => {
      views.select(id);
      const v = views.views.find((x) => x.id === id);
      if (v) setGrid(v.state);
    };
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <FabricSavedViews
            views={views.views}
            activeId={views.activeView.id}
            modified={views.isModified(grid)}
            onSelect={apply}
            onSave={() => views.update(grid)}
            onSaveAs={(name) => views.create(name, grid)}
            onRename={views.rename}
            onDelete={(id) => {
              views.remove(id);
              setGrid(defaultViews[0].state);
            }}
            onDiscard={() => setGrid(views.activeView.state)}
          />
        </div>
        <FabricDatagrid
          rows={sampleRows}
          columns={baseColumns}
          hideFooter
          autoHeight
          filterModel={grid.filterModel}
          onFilterModelChange={(filterModel) => setGrid((g) => ({ ...g, filterModel }))}
          sortModel={grid.sortModel}
          onSortModelChange={(sortModel) => setGrid((g) => ({ ...g, sortModel }))}
          columnVisibilityModel={grid.columnVisibilityModel}
          onColumnVisibilityModelChange={(columnVisibilityModel) =>
            setGrid((g) => ({ ...g, columnVisibilityModel }))
          }
        />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    const trigger = () => canvas.getByRole("button", { name: /^Views:/ });

    // Switch to a built-in view: the grid follows.
    await userEvent.click(trigger());
    await userEvent.click(await body.findByRole("menuitem", { name: "Cheapest first" }));
    await waitFor(() => expect(canvas.getAllByRole("row")[1]).toHaveTextContent("Dark chocolate bar"));

    // Save it as the user's own view, then rename it.
    await userEvent.click(trigger());
    await userEvent.click(await body.findByRole("menuitem", { name: "Save as new view…" }));
    await userEvent.type(await body.findByLabelText("View name"), "Bargains{Enter}");
    await waitFor(() => expect(trigger()).toHaveAccessibleName("Views: Bargains"));

    await userEvent.click(trigger());
    await userEvent.click(await body.findByRole("menuitem", { name: "Rename view…" }));
    const field = await body.findByLabelText("View name");
    await userEvent.clear(field);
    await userEvent.type(field, "Best prices{Enter}");
    await waitFor(() => expect(trigger()).toHaveAccessibleName("Views: Best prices"));

    // Delete it: back to the first view.
    await waitFor(() => expect(body.queryByRole("dialog")).toBeNull());
    await userEvent.click(trigger());
    await userEvent.click(await body.findByRole("menuitem", { name: "Delete view" }));
    await waitFor(() => expect(trigger()).toHaveAccessibleName("Views: All products"));
  },
};
