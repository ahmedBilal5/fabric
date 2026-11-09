import ArticleIcon from "@fabric-kit/icons/Article";
import ChevronRightIcon from "@fabric-kit/icons/ChevronRight";
import ExpandMoreIcon from "@fabric-kit/icons/ExpandMore";
import FolderIcon from "@fabric-kit/icons/Folder";
import FolderRoundedIcon from "@fabric-kit/icons/FolderRounded";
import StorageIcon from "@fabric-kit/icons/Storage";
import TableChartIcon from "@fabric-kit/icons/TableChart";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import type { FabricTreeViewColumn, FabricTreeViewNode } from "../src";
import { buildTreeViewNodes, FabricTreeView, fabricTreeViewStyles, TreeItem } from "../src";

// ─── Sample data ───────────────────────────────────────────────────────────────

const fileSystemNodes: FabricTreeViewNode[] = [
  {
    id: "docs",
    label: "Documents",
    children: [
      {
        id: "docs-reports",
        label: "Reports",
        children: [
          { id: "docs-reports-q1", label: "Q1-2026.pdf" },
          { id: "docs-reports-q2", label: "Q2-2026.pdf" },
        ],
      },
      {
        id: "docs-invoices",
        label: "Invoices",
        children: [{ id: "docs-invoices-001", label: "INV-001.pdf" }],
      },
    ],
  },
  {
    id: "images",
    label: "Images",
    children: [
      { id: "images-logos", label: "Logos" },
      { id: "images-banners", label: "Banners" },
    ],
  },
  { id: "archive", label: "Archive", disabled: true },
];

const dataModelNodes: FabricTreeViewNode[] = [
  {
    id: "model-crm",
    label: (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <StorageIcon sx={{ fontSize: 16 }} />
        <span>CRM</span>
      </Box>
    ),
    children: [
      {
        id: "obj-customer",
        label: "Customer",
        children: [
          { id: "tbl-customer-main", label: "customer_main" },
          { id: "tbl-customer-address", label: "customer_address" },
        ],
      },
      {
        id: "obj-opportunity",
        label: "Opportunity",
        children: [{ id: "tbl-opportunity-main", label: "opportunity_main" }],
      },
    ],
  },
  {
    id: "model-erp",
    label: (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <StorageIcon sx={{ fontSize: 16 }} />
        <span>ERP</span>
      </Box>
    ),
    children: [
      {
        id: "obj-product",
        label: "Product",
        children: [{ id: "tbl-product-main", label: "product_main" }],
      },
    ],
  },
];

// ─── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
  title: "Advanced Components/FabricTreeView",
  component: FabricTreeView,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    // Storybook 10's dynamic source serializer recurses through the rendered
    // React element tree; TreeItem's recursive children explode Array.join
    // into "RangeError: Invalid string length" on any non-trivial tree.
    // Force static source pulled from the story file itself instead.
    docs: {
      source: { type: "code" },
      description: {
        component:
          "A tree for nested data such as folders, categories or org charts. `FabricTreeView` " +
          "wraps the free MUI X `SimpleTreeView` with Fabric's styling. Pass `nodes` to render " +
          "a tree from data, or `TreeItem` children for full control. Add `columns` for a " +
          "file-browser layout with extra cells beside each name. Arrow keys move through the " +
          "tree, Right and Left expand and collapse, and Enter selects.",
      },
    },
  },
} satisfies Meta<typeof FabricTreeView>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Basics ────────────────────────────────────────────────────────────────────

export const Default: Story = {
  args: { nodes: fileSystemNodes },
};

export const DefaultExpanded: Story = {
  args: {
    nodes: fileSystemNodes,
    defaultExpandedItems: ["docs", "docs-reports"],
  },
};

// ─── Variants (style presets) ─────────────────────────────────────────────────

export const RowListPreset: Story = {
  args: {
    nodes: dataModelNodes,
    defaultExpandedItems: ["model-crm", "obj-customer"],
    sx: fabricTreeViewStyles.rowList,
  },
};

export const CompactPreset: Story = {
  args: {
    nodes: fileSystemNodes,
    defaultExpandedItems: ["docs"],
    sx: fabricTreeViewStyles.compact,
  },
};

export const UnstyledPreset: Story = {
  args: {
    nodes: fileSystemNodes,
    defaultExpandedItems: ["docs"],
    sx: fabricTreeViewStyles.unstyled,
  },
};

// ─── Consumer overrides ───────────────────────────────────────────────────────

export const CustomIcons: Story = {
  args: {
    nodes: fileSystemNodes,
    defaultExpandedItems: ["docs"],
    slots: { expandIcon: ChevronRightIcon, collapseIcon: ExpandMoreIcon },
    sx: fabricTreeViewStyles.compact,
  },
};

export const PerNodeStyling: Story = {
  args: {
    nodes: [
      {
        id: "published",
        label: "Published",
        itemProps: { sx: { "& > .MuiTreeItem-content": { color: "success.main" } } },
        children: [
          { id: "pub-1", label: "Article A" },
          { id: "pub-2", label: "Article B" },
        ],
      },
      {
        id: "draft",
        label: "Draft",
        itemProps: { sx: { "& > .MuiTreeItem-content": { color: "warning.main" } } },
        children: [{ id: "dft-1", label: "Article C" }],
      },
      { id: "archived", label: "Archived (disabled)", disabled: true },
    ] satisfies FabricTreeViewNode[],
    defaultExpandedItems: ["published", "draft"],
    sx: fabricTreeViewStyles.compact,
  },
};

export const ControlledExpansion: Story = {
  render: (args) => {
    const [expandedItems, setExpandedItems] = useState<string[]>(["docs"]);
    return (
      <Box>
        <Box sx={{ mb: 1, display: "flex", gap: 1 }}>
          <Chip
            label="Expand all"
            size="small"
            onClick={() => setExpandedItems(["docs", "docs-reports", "docs-invoices", "images"])}
          />
          <Chip label="Collapse all" size="small" onClick={() => setExpandedItems([])} />
        </Box>
        <FabricTreeView
          {...args}
          expandedItems={expandedItems}
          onExpandedItemsChange={(_, items) => setExpandedItems(items)}
          sx={fabricTreeViewStyles.compact}
        />
      </Box>
    );
  },
  args: { nodes: fileSystemNodes },
};

export const ControlledSelection: Story = {
  render: (args) => {
    const [selected, setSelected] = useState<string | null>("docs-reports-q1");
    return (
      <Box>
        <Typography variant="caption" sx={{ mb: 1, display: "block", color: "text.secondary" }}>
          Selected: <strong>{selected ?? "none"}</strong>
        </Typography>
        <FabricTreeView
          {...args}
          selectedItems={selected}
          onSelectedItemsChange={(_, id) => setSelected(id as string | null)}
          defaultExpandedItems={["docs", "docs-reports"]}
          sx={fabricTreeViewStyles.rowList}
        />
      </Box>
    );
  },
  args: { nodes: fileSystemNodes },
};

export const MultiSelect: Story = {
  render: (args) => {
    const [selected, setSelected] = useState<string[]>([]);
    return (
      <Box>
        <Typography variant="caption" sx={{ mb: 1, display: "block", color: "text.secondary" }}>
          Selected: <strong>{selected.join(", ") || "none"}</strong>
        </Typography>
        <FabricTreeView
          {...args}
          multiSelect
          selectedItems={selected}
          onSelectedItemsChange={(_, ids) => setSelected(ids as string[])}
          defaultExpandedItems={["docs", "docs-reports"]}
          sx={fabricTreeViewStyles.compact}
        />
      </Box>
    );
  },
  args: { nodes: fileSystemNodes },
};

// ─── Kitchen sink ─────────────────────────────────────────────────────────────

export const ManualChildren: Story = {
  render: (args) => (
    <FabricTreeView {...args} defaultExpandedItems={["media"]} sx={fabricTreeViewStyles.compact}>
      <TreeItem
        itemId="media"
        label={
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <FolderIcon fontSize="small" />
            <span>Media</span>
          </Box>
        }
      >
        <TreeItem
          itemId="media-images"
          label={
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <ArticleIcon fontSize="small" />
              <span>Images</span>
            </Box>
          }
        />
        <TreeItem
          itemId="media-videos"
          label={
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <ArticleIcon fontSize="small" />
              <span>Videos</span>
            </Box>
          }
        />
      </TreeItem>
      <TreeItem itemId="uploads" label="Uploads" />
    </FabricTreeView>
  ),
  args: {},
};

const flatRows = [
  { path: "finance", name: "Finance" },
  { path: "finance/gl", name: "General Ledger" },
  { path: "finance/gl/accounts", name: "Accounts" },
  { path: "finance/gl/journals", name: "Journals" },
  { path: "finance/ap", name: "Accounts Payable" },
  { path: "finance/ap/invoices", name: "Invoices" },
  { path: "hr", name: "HR" },
  { path: "hr/employees", name: "Employees" },
];

export const FromFlatData: Story = {
  render: (args) => {
    const nodes = buildTreeViewNodes(
      flatRows,
      (row) => row.path.split("/"),
      (row) => row.path,
      (row) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <TableChartIcon sx={{ fontSize: 14, color: "text.secondary" }} />
          <span>{row.name}</span>
        </Box>
      ),
    );
    return (
      <FabricTreeView
        {...args}
        nodes={nodes}
        defaultExpandedItems={["finance", "finance/gl"]}
        sx={fabricTreeViewStyles.rowList}
      />
    );
  },
  args: {},
};

// ─── File-browser layout (Name + data columns) ────────────────────────────────

const folderColumns: FabricTreeViewColumn[] = [
  { field: "createdDate", headerName: "CreatedDate" },
  { field: "lastUpdate", headerName: "LastUpdate" },
];

const folderIcon = <FolderRoundedIcon fontSize="small" />;

const folderNodes: FabricTreeViewNode[] = [
  {
    id: "edi",
    label: "Edi",
    icon: folderIcon,
    cells: { createdDate: "—", lastUpdate: "—" },
    children: [
      {
        id: "edi-folder-1",
        label: "Folder 1",
        icon: folderIcon,
        cells: { createdDate: "—", lastUpdate: "—" },
        children: [
          {
            id: "edi-folder-1-2",
            label: "Folder 2",
            icon: folderIcon,
            cells: { createdDate: "12 June 2026", lastUpdate: "12 June 2026" },
          },
        ],
      },
    ],
  },
  {
    id: "promotions",
    label: "Promotions",
    icon: folderIcon,
    cells: { createdDate: "12 June 2026", lastUpdate: "12 June 2026" },
    children: [
      {
        id: "promotions-folder-1",
        label: "Folder 1",
        icon: folderIcon,
        cells: { createdDate: "12 June 2026", lastUpdate: "12 June 2026" },
      },
      {
        id: "promotions-folder-2",
        label: "Folder 2",
        icon: folderIcon,
        cells: { createdDate: "12 June 2026", lastUpdate: "12 June 2026" },
      },
    ],
  },
];

export const FileBrowserColumns: Story = {
  args: {
    nodes: folderNodes,
    columns: folderColumns,
    defaultExpandedItems: ["edi", "edi-folder-1", "promotions"],
    sx: fabricTreeViewStyles.rowList,
  },
};
