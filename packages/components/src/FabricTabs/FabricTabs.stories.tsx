import NotificationsIcon from "@fabric-kit/icons/Notifications";
import SecurityIcon from "@fabric-kit/icons/Security";
import SettingsIcon from "@fabric-kit/icons/Settings";
import { Box, Typography } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";

import { FabricTabs, type FabricTabsAppearance } from ".";

const APPEARANCES: FabricTabsAppearance[] = [
  "underline",
  "underlineAlt",
  "fill",
  "fillAlt",
  "fillAlt2",
  "border",
];

const meta = {
  title: "Components/FabricTabs",
  component: FabricTabs,
  tags: ["test"],
  parameters: {
    docs: {
      description: {
        component:
          'Tab strip. Extends MUI `Tabs` with a declarative `tabs` array and six `appearance` styles. It renders only the strip; you render the active panel. Give it an `aria-label` that names the strip.',
      },
    },
  },
  argTypes: {
    appearance: { control: "select", options: APPEARANCES },
    borderBottom: { control: "boolean" },
    value: { control: "text" },
  },
  args: { appearance: "underline" },
} satisfies Meta<typeof FabricTabs>;

export default meta;
type Story = StoryObj;

const BASIC_TABS = [
  { value: "general", label: "General" },
  { value: "advanced", label: "Advanced" },
  { value: "permissions", label: "Permissions" },
];

// -- Basics --

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState("general");
    return (
      <FabricTabs
        appearance={(args as { appearance?: FabricTabsAppearance }).appearance}
        tabs={BASIC_TABS}
        value={value}
        onChange={(_, v) => setValue(v)}
        aria-label="Settings tabs"
      />
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const general = canvas.getByRole("tab", { name: /general/i });
    const advanced = canvas.getByRole("tab", { name: /advanced/i });
    await expect(general).toHaveAttribute("aria-selected", "true");
    await userEvent.click(advanced);
    await expect(advanced).toHaveAttribute("aria-selected", "true");
  },
};

export const WithBorderBottom: Story = {
  name: "With border bottom",
  render: () => {
    const [value, setValue] = useState("general");
    return (
      <FabricTabs
        tabs={BASIC_TABS}
        value={value}
        onChange={(_, v) => setValue(v)}
        borderBottom
        aria-label="Settings tabs"
      />
    );
  },
};

// -- Appearances --

export const Appearances: Story = {
  name: "Appearances",
  parameters: {
    docs: {
      description: {
        story:
          "Each `appearance` with a selected tab, two default tabs and a disabled tab.",
      },
    },
  },
  render: () => {
    const [values, setValues] = useState<Record<string, string>>({});
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {APPEARANCES.map((appearance) => (
          <Box key={appearance}>
            <Typography variant="caption" color="text.secondary">
              {appearance}
            </Typography>
            <FabricTabs
              appearance={appearance}
              tabs={[...BASIC_TABS, { value: "disabled", label: "Disabled", disabled: true }]}
              value={values[appearance] ?? "general"}
              onChange={(_, v) => setValues((prev) => ({ ...prev, [appearance]: v }))}
              aria-label={`${appearance} tabs`}
            />
          </Box>
        ))}
      </Box>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole("tablist")).toHaveLength(APPEARANCES.length);

    // Selection and keyboard behavior are unchanged by the appearance.
    const fill = within(canvas.getByRole("tablist", { name: "fill tabs" }));
    const advanced = fill.getByRole("tab", { name: /advanced/i });
    await userEvent.click(advanced);
    await expect(advanced).toHaveAttribute("aria-selected", "true");
    await userEvent.keyboard("{ArrowRight}");
    await expect(fill.getByRole("tab", { name: /permissions/i })).toHaveFocus();
    await expect(fill.getByRole("tab", { name: /disabled/i })).toBeDisabled();
  },
};

export const LongLabels: Story = {
  name: "Long labels",
  render: () => {
    const tabs = [
      { value: "summary", label: "Supplier onboarding summary" },
      { value: "documents", label: "Compliance documents and certificates (12)" },
      { value: "history", label: "Change history" },
    ];
    const [value, setValue] = useState("summary");
    return (
      <Box sx={{ maxWidth: 480 }}>
        <FabricTabs
          tabs={tabs}
          value={value}
          onChange={(_, v) => setValue(v)}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="Supplier tabs"
        />
      </Box>
    );
  },
};

// -- Variants --

export const Scrollable: Story = {
  name: "Scrollable variant",
  parameters: {
    docs: {
      description: {
        story:
          'FabricTabs inherits the full MUI `Tabs` surface, so `variant="scrollable"` works for long tab strips.',
      },
    },
  },
  render: () => {
    const tabs = Array.from({ length: 12 }, (_, i) => ({
      value: `tab-${i}`,
      label: `Tab ${i + 1}`,
    }));
    const [value, setValue] = useState("tab-0");
    return (
      <Box sx={{ maxWidth: 500 }}>
        <FabricTabs
          tabs={tabs}
          value={value}
          onChange={(_, v) => setValue(v)}
          variant="scrollable"
          scrollButtons="auto"
          borderBottom
          aria-label="Scrollable demo"
        />
      </Box>
    );
  },
};

export const Centered: Story = {
  render: () => {
    const [value, setValue] = useState("general");
    return (
      <FabricTabs
        tabs={BASIC_TABS}
        value={value}
        onChange={(_, v) => setValue(v)}
        centered
        borderBottom
        aria-label="Centered tabs"
      />
    );
  },
};

// -- Disabled tab --

export const WithDisabledTab: Story = {
  name: "With disabled tab",
  render: () => {
    const tabs = [
      { value: "active", label: "Active" },
      { value: "draft", label: "Draft", disabled: true },
      { value: "archived", label: "Archived" },
    ];
    const [value, setValue] = useState("active");
    return (
      <FabricTabs
        tabs={tabs}
        value={value}
        onChange={(_, v) => setValue(v)}
        borderBottom
        aria-label="Status tabs"
      />
    );
  },
};

// -- Icon tabs --

export const WithIcons: Story = {
  name: "With icons",
  parameters: {
    docs: {
      description: {
        story:
          "Each tab item extends MUI `TabProps` -- `icon` and `iconPosition` are first-class fields. The raw MUI bypasses in TagManager used this pattern; FabricTabs types it natively.",
      },
    },
  },
  render: () => {
    const tabs = [
      {
        value: "settings",
        label: "Settings",
        icon: <SettingsIcon />,
        iconPosition: "start" as const,
      },
      {
        value: "security",
        label: "Security",
        icon: <SecurityIcon />,
        iconPosition: "start" as const,
      },
      {
        value: "notifications",
        label: "Notifications",
        icon: <NotificationsIcon />,
        iconPosition: "start" as const,
      },
    ];
    const [value, setValue] = useState("settings");
    return (
      <FabricTabs
        tabs={tabs}
        value={value}
        onChange={(_, v) => setValue(v)}
        borderBottom
        aria-label="Settings categories"
      />
    );
  },
};

// -- With panel content (consumer pattern) --

export const WithPanelContent: Story = {
  name: "With panel content (consumer pattern)",
  parameters: {
    docs: {
      description: {
        story:
          "FabricTabs is a pure tab strip. Render the active panel below it with conditional rendering.",
      },
    },
  },
  render: () => {
    const [value, setValue] = useState("general");
    return (
      <Box>
        <FabricTabs
          tabs={BASIC_TABS}
          value={value}
          onChange={(_, v) => setValue(v)}
          borderBottom
          aria-label="Settings tabs"
        />
        <Box sx={{ p: 2 }}>
          {value === "general" && <Typography>General settings panel content.</Typography>}
          {value === "advanced" && <Typography>Advanced configuration options.</Typography>}
          {value === "permissions" && <Typography>Role-based access controls.</Typography>}
        </Box>
      </Box>
    );
  },
};

// -- Container styling --

export const WithContainerSx: Story = {
  name: "With containerSx",
  parameters: {
    docs: {
      description: {
        story:
          "`containerSx` styles the outer container, for layout tweaks like `flexGrow: 1` or a fixed height.",
      },
    },
  },
  render: () => {
    const [value, setValue] = useState("general");
    return (
      <FabricTabs
        tabs={BASIC_TABS}
        value={value}
        onChange={(_, v) => setValue(v)}
        borderBottom
        containerSx={{ flexGrow: 1, border: "1px dashed #ccc", p: 1 }}
        aria-label="Styled container"
      />
    );
  },
};

// -- Tab-level sx override --

export const TabLevelSx: Story = {
  name: "Per-tab sx overrides",
  render: () => {
    const tabs = [
      { value: "normal", label: "Normal" },
      {
        value: "highlighted",
        label: "Highlighted",
        sx: { color: "success.main", fontWeight: 700 },
      },
      { value: "compact", label: "Compact", sx: { minWidth: 60 } },
    ];
    const [value, setValue] = useState("normal");
    return (
      <FabricTabs
        tabs={tabs}
        value={value}
        onChange={(_, v) => setValue(v)}
        borderBottom
        aria-label="Custom styled tabs"
      />
    );
  },
};
