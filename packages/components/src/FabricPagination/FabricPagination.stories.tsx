import { Box } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, within } from "storybook/test";

import { FabricPagination } from ".";

const meta = {
  title: "Components/FabricPagination",
  component: FabricPagination,
  tags: ["test"],
  parameters: {
    docs: {
      description: {
        component:
          'Grid pagination toolbar with sliding-window page numbers and a "from - to of count" label. Wraps MUI `TablePagination` with custom actions and label display.',
      },
    },
  },
} satisfies Meta<typeof FabricPagination>;

export default meta;
type Story = StoryObj;

// -- Basics --

export const Default: Story = {
  render: () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);
    return (
      <FabricPagination
        count={5000}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
      />
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Counts use locale formatting: "1 - 25 of 5,000".
    await expect(canvas.getByText(/of\s+5,000/i)).toBeInTheDocument();
  },
};

export const FewRecords: Story = {
  name: "Few records (single page)",
  render: () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);
    return (
      <FabricPagination
        count={42}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
      />
    );
  },
};

export const SingleRecord: Story = {
  name: "Single record",
  parameters: {
    docs: {
      description: {
        story:
          'With a single record the label reads "1 of 1" and the page buttons are disabled.',
      },
    },
  },
  render: () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);
    return (
      <FabricPagination
        count={1}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
      />
    );
  },
};

// -- Custom options --

export const CustomRowsPerPageOptions: Story = {
  name: "Custom rowsPerPageOptions",
  parameters: {
    docs: {
      description: {
        story:
          "Large datasets can offer bigger pages. The default is `[10, 25, 50, 100]`.",
      },
    },
  },
  render: () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(100);
    return (
      <FabricPagination
        count={2500}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
        rowsPerPageOptions={[50, 100, 500, 1000]}
      />
    );
  },
};

// -- Hide page numbers --

export const HiddenPageNumbers: Story = {
  name: "Hidden page numbers",
  parameters: {
    docs: {
      description: {
        story:
          "`hidePageNumbers` shows only a current-page indicator (plain text rather than buttons). Used for compact pagination in tight layouts.",
      },
    },
  },
  render: () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);
    return (
      <FabricPagination
        count={5000}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
        hidePageNumbers
      />
    );
  },
};

// -- Many pages (sliding window) --

export const ManyPages: Story = {
  name: "Many pages (sliding window)",
  parameters: {
    docs: {
      description: {
        story:
          "With 50 pages, the sliding window shows 3 page buttons centered on the current page. Navigate to see the window slide.",
      },
    },
  },
  render: () => {
    const [page, setPage] = useState(24);
    const [rowsPerPage, setRowsPerPage] = useState(25);
    return (
      <FabricPagination
        count={5000}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
      />
    );
  },
};

// -- Sx override --

export const WithSxOverride: Story = {
  name: "With sx override",
  render: () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);
    return (
      <Box sx={{ border: "1px dashed #ccc", p: 2 }}>
        <FabricPagination
          count={500}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={setPage}
          onRowsPerPageChange={setRowsPerPage}
          sx={{ ".MuiTablePagination-toolbar": { minHeight: 48 } }}
        />
      </Box>
    );
  },
};
