import ChevronRightIcon from "@fabric-kit/icons/ChevronRight";
import DescriptionIcon from "@fabric-kit/icons/Description";
import FolderIcon from "@fabric-kit/icons/Folder";
import HomeIcon from "@fabric-kit/icons/Home";
import { Box } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { expect, within } from "storybook/test";
import { FabricBreadcrumbs, type FabricBreadcrumbsProps } from ".";

const meta: Meta<FabricBreadcrumbsProps> = {
  title: "Components/FabricBreadcrumbs",
  component: FabricBreadcrumbs,
  tags: ["test"],
  parameters: {
    docs: {
      description: {
        component:
          "Breadcrumb trail — extends MUI Breadcrumbs with a data-driven `items` array. Last item auto-renders as the current-page indicator (bold, non-link).",
      },
    },
  },
};
export default meta;
type Story = StoryObj<FabricBreadcrumbsProps>;

export const Default: Story = {
  render: () => (
    <Box sx={{ p: 2 }}>
      <FabricBreadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Projects", href: "/projects" },
          { label: "Apollo", href: "/projects/apollo" },
          { label: "Settings" },
        ]}
      />
    </Box>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // First items render as links; last item (no href) as the current-page marker.
    await expect(canvas.getByRole("link", { name: "Home" })).toBeInTheDocument();
    await expect(canvas.getByText("Settings")).toBeInTheDocument();
  },
};

export const WithClickHandlers: Story = {
  name: "With onClick (SPA nav)",
  render: () => (
    <Box sx={{ p: 2 }}>
      <FabricBreadcrumbs
        items={[
          { label: "Home", onClick: () => alert("go home") },
          { label: "Projects", onClick: () => alert("go to projects") },
          { label: "Apollo", onClick: () => alert("go to Apollo") },
          { label: "Settings" },
        ]}
      />
    </Box>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <Box sx={{ p: 2 }}>
      <FabricBreadcrumbs
        items={[
          { label: "Home", href: "/", icon: <HomeIcon fontSize="small" /> },
          {
            label: "Projects",
            href: "/projects",
            icon: <FolderIcon fontSize="small" />,
          },
          {
            label: "Product",
            icon: <DescriptionIcon fontSize="small" />,
          },
        ]}
      />
    </Box>
  ),
};

export const CustomSeparator: Story = {
  render: () => (
    <Box sx={{ p: 2 }}>
      <FabricBreadcrumbs
        separator={<ChevronRightIcon fontSize="small" />}
        items={[
          { label: "Home", href: "/" },
          { label: "Catalog", href: "/catalog" },
          { label: "Settings" },
        ]}
      />
    </Box>
  ),
};

export const TextSeparator: Story = {
  render: () => (
    <Box sx={{ p: 2 }}>
      <FabricBreadcrumbs
        separator="›"
        items={[
          { label: "Home", href: "/" },
          { label: "Catalog", href: "/catalog" },
          { label: "Settings" },
        ]}
      />
    </Box>
  ),
};

export const Collapsed: Story = {
  name: "Collapsed with ellipsis",
  render: () => (
    <Box sx={{ p: 2 }}>
      <FabricBreadcrumbs
        maxItems={3}
        itemsBeforeCollapse={1}
        itemsAfterCollapse={1}
        items={[
          { label: "Home", href: "/" },
          { label: "Organization", href: "/org" },
          { label: "Teams", href: "/org/teams" },
          { label: "Design", href: "/org/teams/design" },
          { label: "Members", href: "/org/teams/design/members" },
          { label: "Jane Doe", href: "/org/teams/design/members/jane" },
          { label: "Permissions" },
        ]}
      />
    </Box>
  ),
};

export const CustomLinkComponent: Story = {
  name: "Per-item LinkComponent (react-router)",
  render: () => {
    // Mock RouterLink for the story — real consumers pass `Link` from react-router.
    const MockRouterLink = React.forwardRef<
      HTMLAnchorElement,
      React.AnchorHTMLAttributes<HTMLAnchorElement> & { to?: string }
    >(function MockRouterLink({ to, children, ...rest }, ref) {
      return (
        <a ref={ref} href={to} {...rest}>
          {children}
        </a>
      );
    });
    return (
      <Box sx={{ p: 2 }}>
        <FabricBreadcrumbs
          items={[
            {
              label: "Home",
              LinkComponent: MockRouterLink,
              linkProps: { to: "/" },
            },
            {
              label: "Projects",
              LinkComponent: MockRouterLink,
              linkProps: { to: "/projects" },
            },
            { label: "Settings" },
          ]}
        />
      </Box>
    );
  },
};

export const LongLabels: Story = {
  render: () => (
    <Box sx={{ p: 2, maxWidth: 600 }}>
      <FabricBreadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Knowledge base", href: "/kb" },
          {
            label: "Getting started with workspace administration",
            href: "/kb/admin",
          },
          { label: "Configuring single sign-on for your organization" },
        ]}
      />
    </Box>
  ),
};
