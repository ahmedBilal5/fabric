import { Box } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { FabricTagInput, type FabricTagInputProps } from ".";

const meta = {
  title: "Components/FabricTagInput",
  component: FabricTagInput,
  tags: ["test"],
  parameters: { layout: "padded" },
} satisfies Meta<typeof FabricTagInput>;
export default meta;
type Story = StoryObj;

function Controlled({ initial = [], ...props }: Partial<FabricTagInputProps> & { initial?: string[] }) {
  const [value, setValue] = useState<string[]>(initial);
  return (
    <Box sx={{ width: 420 }}>
      <FabricTagInput label="Labels" {...props} value={value} onChange={setValue} />
    </Box>
  );
}

/** Type and press Enter or comma. */
export const Default: Story = {
  render: () => <Controlled initial={["Priority", "EMEA"]} helperText="Press Enter or comma after each label." />,
};

/** Known tags are offered as people type; anything else still works. */
export const WithSuggestions: Story = {
  render: () => (
    <Controlled suggestions={["Priority", "EMEA", "Americas", "APAC", "Reseller", "Partner", "Churn risk"]} />
  ),
};

/** `validate` refuses bad tags with a message; `maxTags` caps the list. */
export const EmailList: Story = {
  render: () => (
    <Controlled
      label="Invite people"
      placeholder="name@example.com"
      helperText="Separate addresses with commas. Up to 5."
      maxTags={5}
      separators={[",", ";", " "]}
      validate={(t) => (/^\S+@\S+\.\S+$/.test(t) ? null : `${t} isn't an email address.`)}
      initial={["priya@northwind.example.com"]}
    />
  ),
};

/** Long tags and many of them wrap. */
export const LongContent: Story = {
  render: () => (
    <Controlled
      initial={[
        "Quarterly business review",
        "Enterprise renewal 2027",
        "EMEA",
        "Needs security questionnaire",
        "Priority",
        "Reseller: Contoso Distribution GmbH",
      ]}
    />
  ),
};

/** Error and disabled. */
export const States: Story = {
  render: () => (
    <Box sx={{ display: "grid", gap: 2 }}>
      <Controlled error helperText="Add at least one label." />
      <Controlled initial={["Priority", "EMEA"]} disabled />
    </Box>
  ),
};

/** Enter, comma and paste add tags; duplicates are ignored; Backspace removes the last. */
export const Keyboard: Story = {
  render: () => <Controlled />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("combobox", { name: "Labels" });
    await userEvent.type(input, "Priority{Enter}EMEA,");
    await expect(canvas.getByRole("button", { name: "Priority" })).toBeVisible();
    await expect(canvas.getByRole("button", { name: "EMEA" })).toBeVisible();
    await userEvent.paste("priority, APAC, Reseller,");
    await expect(canvas.getAllByRole("button", { name: /Priority/i })).toHaveLength(1);
    await expect(canvas.getByRole("button", { name: "Reseller" })).toBeVisible();
    await userEvent.keyboard("{Backspace}");
    await expect(canvas.queryByRole("button", { name: "Reseller" })).not.toBeInTheDocument();
  },
};
