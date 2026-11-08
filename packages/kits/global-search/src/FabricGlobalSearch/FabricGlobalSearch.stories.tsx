import Inventory2Outlined from "@fabric-kit/icons/Inventory2Outlined";
import PersonOutline from "@fabric-kit/icons/PersonOutlined";
import ReceiptLongOutlined from "@fabric-kit/icons/ReceiptLongOutlined";
import { FabricCenter, FabricStack, FabricText } from "@fabric-kit/primitives";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { type ReactNode, useState } from "react";
import { fn } from "storybook/test";
import { type SampleRow, sampleSearch } from "../../docs/sampleData";
import type { FabricGlobalSearchConfig } from "../types";
import { FabricGlobalSearch } from "./FabricGlobalSearch";

function TypeIcon({ children }: { children: ReactNode }) {
  return (
    <FabricCenter sx={{ width: 32, height: 32, borderRadius: "50%", bgcolor: "action.hover" }}>
      {children}
    </FabricCenter>
  );
}

const config: FabricGlobalSearchConfig<SampleRow> = {
  customer: {
    displayLabel: "Customers",
    icon: (
      <TypeIcon>
        <PersonOutline fontSize="small" />
      </TypeIcon>
    ),
    labelKey: "title",
    descriptionKey: "subtitle",
    onClickResult: fn(),
  },
  order: {
    displayLabel: "Orders",
    icon: (
      <TypeIcon>
        <ReceiptLongOutlined fontSize="small" />
      </TypeIcon>
    ),
    labelKey: "title",
    descriptionKey: "subtitle",
    onClickResult: fn(),
  },
  product: {
    displayLabel: "Products",
    icon: (
      <TypeIcon>
        <Inventory2Outlined fontSize="small" />
      </TypeIcon>
    ),
    labelKey: "title",
    descriptionKey: "subtitle",
    onClickResult: fn(),
  },
};

const meta = {
  title: "Kits/Global Search/FabricGlobalSearch",
  component: FabricGlobalSearch<SampleRow>,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A grouped autocomplete for searching across record types. You supply `onSearch`, " +
          "an async function that calls your API, and a `config` describing how each type " +
          'looks. Type "north" or "harbor" to try it.',
      },
    },
  },
  decorators: [
    (Story) => (
      <FabricStack sx={{ maxWidth: 560, minHeight: 480 }}>
        <Story />
      </FabricStack>
    ),
  ],
  args: {
    config,
    onSearch: sampleSearch,
    onClickViewAll: fn(),
  },
} satisfies Meta<typeof FabricGlobalSearch<SampleRow>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** `context` moves the current page's type to the top, here Orders. */
export const WithContext: Story = {
  args: { context: { label: "Orders", type: "order" } },
};

/** Omit `onClickViewAll` to hide the "View all results" button. */
export const WithoutViewAll: Story = {
  args: { onClickViewAll: undefined, placeholder: "Search customers, orders, products" },
};

/** Errors from `onSearch` go to `onError`. The list shows "No results". */
export const SearchError: Story = {
  args: {
    onSearch: () => Promise.reject(new Error("Network error")),
    onError: fn(),
  },
};

export const Disabled: Story = {
  args: { disabled: true },
};

/** A typical flow: pick "View all" and show the query on a results page. */
export const ViewAllFlow: Story = {
  render: (args) => {
    const [viewAll, setViewAll] = useState<string>();
    return (
      <FabricStack gap="md">
        <FabricGlobalSearch {...args} onClickViewAll={setViewAll} />
        {viewAll && (
          <FabricText textVariant="bodyMd" color="text.secondary">
            Navigate to /search?q={viewAll}
          </FabricText>
        )}
      </FabricStack>
    );
  },
};
