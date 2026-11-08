import type { GridColDef } from "@fabric-kit/datagrid";
import { FabricCenter, FabricText } from "@fabric-kit/primitives";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { type SampleRow, sampleFetchPage } from "../../docs/sampleData";
import type { FabricViewAllSearchResultsConfig } from "../types";
import { FabricViewAllSearchResults } from "./FabricViewAllSearchResults";

const columns: GridColDef<SampleRow>[] = [
  { field: "title", headerName: "Name", flex: 1.5 },
  { field: "subtitle", headerName: "Details", flex: 1 },
  { field: "owner", headerName: "Owner", flex: 1 },
];

const config: FabricViewAllSearchResultsConfig<SampleRow> = {
  customer: { tabLabel: "Customers", columns },
  order: { tabLabel: "Orders", columns },
  product: { tabLabel: "Products", columns },
};

const meta = {
  title: "Kits/Global Search/FabricViewAllSearchResults",
  component: FabricViewAllSearchResults<SampleRow>,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "The full results page behind \"View all results\": one tab per type, each a " +
          "server-paged data grid. You supply `onFetchPage`, which receives the type, page, " +
          "sort and filter and returns `{ rows, totalCount }`.",
      },
    },
  },
  args: {
    query: "north",
    config,
    onFetchPage: sampleFetchPage,
    counts: { customer: 3, order: 8, product: 2 },
    onError: fn(),
  },
} satisfies Meta<typeof FabricViewAllSearchResults<SampleRow>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Smaller pages to show server-side paging (Orders has 8 matches). */
export const SmallPages: Story = {
  args: { pageSize: 5 },
};

/** A tab can render any component instead of the grid, e.g. a card list or a map. */
export const CustomTab: Story = {
  args: {
    config: {
      ...config,
      product: {
        tabLabel: "Products",
        component: ({ query }) => (
          <FabricCenter sx={{ minHeight: 240 }}>
            <FabricText textVariant="bodyMd" color="text.secondary">
              Your product gallery for "{query}" goes here.
            </FabricText>
          </FabricCenter>
        ),
      },
    },
  },
};
