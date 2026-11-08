import { Box, Stack } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { FabricSkeleton } from ".";

const meta = {
  title: "Components/FabricSkeleton",
  component: FabricSkeleton,
  tags: ["test"],
  parameters: {
    docs: {
      description: {
        component:
          "Design-system loading placeholder. Extends MUI `Skeleton` with six " +
          'ready-made layouts. `variant` defaults to `"card"`, so ' +
          "`<FabricSkeleton count={6} />` renders a full card-grid placeholder. " +
          '`animation` defaults to `"wave"`. `count` repeats the variant inside a ' +
          '`<FabricStack gap="md">`. ' +
          "Composed variants use `@fabric-kit/primitives` (Stack / " +
          "Inline) and `@fabric-kit/design-tokens` (radii). All four MUI " +
          "variants pass through untouched.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: [
        "card",
        "row",
        "listItem",
        "tableRow",
        "field",
        "editor",
        "text",
        "rectangular",
        "rounded",
        "circular",
      ],
    },
    count: { control: { type: "number", min: 1, max: 12, step: 1 } },
    animation: {
      control: "inline-radio",
      options: ["pulse", "wave", false],
    },
    width: { control: "text" },
    height: { control: "text" },
  },
} as Meta<typeof FabricSkeleton>;

export default meta;
type Story = StoryObj<typeof FabricSkeleton>;

// ─── Basics ─────────────────────────────────────────────────────────────────

export const Default: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          'No props: a single `card` layout with `animation="wave"`.',
      },
    },
  },
};

export const WithCount: Story = {
  args: { count: 3 },
  parameters: {
    docs: {
      description: {
        story:
          "`count={3}` wraps three `card` compositions in a " +
          '`<FabricStack gap="md">`. Kills the ' +
          "`Array.from({length}).map()` pattern.",
      },
    },
  },
};

// ─── Composed variants ─────────────────────────────────────────────────────

export const CardVariant: Story = {
  name: "variant: card (default)",
  args: { variant: "card" },
  parameters: {
    docs: {
      description: {
        story:
          "Rectangular image + title + subtitle + chip row + full-width " +
          "action button. For product, project or template cards.",
      },
    },
  },
};

export const RowVariant: Story = {
  name: "variant: row",
  args: { variant: "row" },
  parameters: {
    docs: {
      description: {
        story:
          "Thumbnail + 2-line text stack + trailing text + trailing action. " +
          "For cart lines, order items or file lists.",
      },
    },
  },
};

export const ListItemVariant: Story = {
  name: "variant: listItem",
  args: { variant: "listItem" },
  parameters: {
    docs: {
      description: {
        story:
          "Circle + single text line. For trees, menus and option lists.",
      },
    },
  },
};

export const TableRowVariant: Story = {
  name: "variant: tableRow",
  args: { variant: "tableRow" },
  parameters: {
    docs: {
      description: {
        story:
          "Four horizontal text cells. Matches infinite-scroll " +
          "`__skeleton` sentinel rows and generic grid loading.",
      },
    },
  },
};

export const FieldVariant: Story = {
  name: "variant: field",
  args: { variant: "field" },
  parameters: {
    docs: {
      description: {
        story:
          "Rounded rect at input height (40px), for form fields.",
      },
    },
  },
};

export const EditorVariant: Story = {
  name: "variant: editor",
  args: { variant: "editor" },
  parameters: {
    docs: {
      description: {
        story:
          "Tall rounded rect (400px): a Suspense fallback for code or " +
          "rich-text editors.",
      },
    },
  },
};

// ─── MUI passthrough variants ───────────────────────────────────────────────

export const TextVariant: Story = {
  name: "variant: text",
  args: { variant: "text", width: "60%", height: 16 },
};

export const RectangularVariant: Story = {
  name: "variant: rectangular",
  args: { variant: "rectangular", width: 200, height: 100 },
};

export const RoundedVariant: Story = {
  name: "variant: rounded",
  args: { variant: "rounded", width: 200, height: 100 },
};

export const CircularVariant: Story = {
  name: "variant: circular",
  args: { variant: "circular", width: 40, height: 40 },
};

// ─── Composition patterns ─────────────────────────────

export const ProductGrid: Story = {
  name: "Product grid (card × 6)",
  render: () => (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 3,
        maxWidth: 900,
      }}
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <FabricSkeleton key={i} variant="card" />
      ))}
    </Box>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Replaces the entire `CardGridSkeleton` wrapper — six " +
          '`variant="card"` instances in a CSS grid.',
      },
    },
  },
};

export const CartTable: Story = {
  name: "Cart table (row × 4)",
  render: () => <FabricSkeleton variant="row" count={4} />,
};

export const CheckoutForm: Story = {
  name: "Checkout form (field × 5)",
  render: () => <FabricSkeleton variant="field" count={5} />,
};

// ─── More examples ─────────────────────────────────────────────────────

export const TreeLoading: Story = {
  name: "Tree list (listItem × 8)",
  render: () => <FabricSkeleton variant="listItem" count={8} />,
};

export const EditorLoading: Story = {
  name: "Editor fallback",
  render: () => <FabricSkeleton variant="editor" />,
};

export const DataGrid: Story = {
  name: "Data table (tableRow × 6)",
  render: () => <FabricSkeleton variant="tableRow" count={6} />,
};

// ─── Customization ─────────────────────────────────────────────────────

export const NoAnimation: Story = {
  args: { variant: "card", animation: false },
  parameters: {
    docs: {
      description: {
        story:
          "Static skeleton — no `pulse` or `wave` animation. Use for print " +
          "previews or reduced-motion environments (also respected " +
          "automatically via `prefers-reduced-motion`).",
      },
    },
  },
};

export const PulseAnimation: Story = {
  args: { variant: "card", animation: "pulse" },
  parameters: {
    docs: {
      description: {
        story:
          "MUI's `pulse` animation. Fabric defaults to `wave`; pass " +
          "`animation='pulse'` for this look.",
      },
    },
  },
};

export const CustomSx: Story = {
  args: {
    variant: "card",
    sx: { maxWidth: 240, p: 2, border: "1px dashed grey", borderRadius: 2 },
  },
  parameters: {
    docs: {
      description: {
        story:
          "Your `sx` merges onto the outer wrapper. Composed variants " +
          "have opinionated inner dimensions — use `sx` to constrain the " +
          "wrapper only.",
      },
    },
  },
};

// ─── Kitchen sink ───────────────────────────────────────────────────────────

export const KitchenSink: Story = {
  render: () => (
    <Stack spacing={3}>
      <Box>
        <strong>Composed variants:</strong>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <FabricSkeleton variant="listItem" />
          <FabricSkeleton variant="tableRow" />
          <FabricSkeleton variant="field" />
          <FabricSkeleton variant="row" />
        </Stack>
      </Box>
      <Box>
        <strong>MUI passthrough:</strong>
        <Stack direction="row" spacing={2} sx={{ mt: 1, alignItems: "center" }}>
          <FabricSkeleton variant="text" width={100} height={16} />
          <FabricSkeleton variant="rectangular" width={100} height={40} />
          <FabricSkeleton variant="rounded" width={100} height={40} />
          <FabricSkeleton variant="circular" width={40} height={40} />
        </Stack>
      </Box>
      <Box>
        <strong>Card (default):</strong>
        <Box sx={{ mt: 1, maxWidth: 300 }}>
          <FabricSkeleton variant="card" />
        </Box>
      </Box>
    </Stack>
  ),
};
