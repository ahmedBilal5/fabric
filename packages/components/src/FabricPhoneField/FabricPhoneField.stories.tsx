import { Box } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { FabricPhoneField, type FabricPhoneFieldProps, isE164 } from ".";

const meta = {
  title: "Components/FabricPhoneField",
  component: FabricPhoneField,
  tags: ["test"],
  parameters: { layout: "padded" },
} satisfies Meta<typeof FabricPhoneField>;
export default meta;
type Story = StoryObj;

function Controlled({ initial = "", ...props }: Partial<FabricPhoneFieldProps> & { initial?: string }) {
  const [value, setValue] = useState(initial);
  return (
    <Box sx={{ width: 340, display: "grid", gap: 1 }}>
      <FabricPhoneField label="Phone number" fullWidth {...props} value={value} onChange={setValue} />
      <Box component="output" aria-label="Value" sx={{ fontSize: 12, color: "text.secondary", fontFamily: "monospace" }}>
        {value || " "}
      </Box>
    </Box>
  );
}

/** Pick a country and type the number as you know it. The value is E.164. */
export const Default: Story = { render: () => <Controlled defaultCountry="GB" /> };

/** Show the countries your customers use first. */
export const PreferredCountries: Story = {
  render: () => <Controlled defaultCountry="US" preferredCountries={["US", "CA", "GB", "DE"]} />,
};

/** Limit the picker to the countries you operate in. */
export const LimitedCountries: Story = {
  render: () => <Controlled defaultCountry="DE" countries={["DE", "AT", "CH"]} locale="de-DE" label="Telefon" />,
};

/** A saved number shows its country. */
export const WithValue: Story = { render: () => <Controlled initial="+14155550123" /> };

/** Error and disabled. */
export const States: Story = {
  render: () => (
    <Box sx={{ display: "grid", gap: 1 }}>
      <Controlled initial="+44207" error helperText="Enter a full phone number." />
      <Controlled initial="+442071234567" disabled />
    </Box>
  ),
};

/** The leading 0 is dropped, and a pasted +number switches the country. */
export const TypingAndPaste: Story = {
  render: () => <Controlled defaultCountry="GB" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: "Phone number" });
    await userEvent.type(input, "020 7123 4567");
    await expect(canvas.getByLabelText("Value")).toHaveTextContent("+442071234567");
    await expect(isE164("+442071234567")).toBe(true);
    await userEvent.clear(input);
    await userEvent.click(input);
    await userEvent.paste("+49 30 1234567");
    await expect(canvas.getByLabelText("Value")).toHaveTextContent("+49301234567");
  },
};
