import { Box } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, within } from "storybook/test";
import { FabricOtpField, type FabricOtpFieldProps } from ".";

const meta = {
  title: "Components/FabricOtpField",
  component: FabricOtpField,
  tags: ["test"],
  parameters: { layout: "padded" },
  args: { value: "", onChange: fn(), onComplete: fn() },
} satisfies Meta<typeof FabricOtpField>;
export default meta;
type Story = StoryObj<typeof meta>;

function Controlled({ initial = "", ...props }: Partial<FabricOtpFieldProps> & { initial?: string }) {
  const [value, setValue] = useState(initial);
  return <FabricOtpField label="Verification code" {...props} value={value} onChange={setValue} />;
}

/** Six digits, as most sign-in codes are. */
export const Default: Story = {
  render: (args) => (
    <Controlled helperText="We sent a code to +44 •••• •••• 4567." onComplete={args.onComplete} />
  ),
};

/** `groupSize={3}` splits the boxes like "123 456". */
export const Grouped: Story = { render: () => <Controlled groupSize={3} /> };

/** Letters and digits, for backup codes. */
export const Alphanumeric: Story = {
  render: () => <Controlled label="Backup code" type="alphanumeric" length={8} groupSize={4} />,
};

/** A masked PIN. */
export const Masked: Story = { render: () => <Controlled label="PIN" length={4} mask /> };

/** Error and disabled. */
export const States: Story = {
  render: () => (
    <Box sx={{ display: "grid", gap: 3 }}>
      <Controlled initial="482913" error helperText="That code has expired. We've sent a new one." />
      <Controlled initial="48" disabled />
    </Box>
  ),
};

/** Typing moves forward, Backspace moves back, and pasting fills every box. */
export const TypingAndPaste: Story = {
  render: (args) => <Controlled onComplete={args.onComplete} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const boxes = canvas.getAllByRole("textbox");
    await userEvent.click(boxes[0]);
    await userEvent.keyboard("12");
    await expect(boxes[2]).toHaveFocus();
    await userEvent.keyboard("{Backspace}");
    await expect(boxes[1]).toHaveFocus();
    await expect(boxes[1]).toHaveValue("");
    await userEvent.click(boxes[0]);
    await userEvent.paste("482913");
    await expect(boxes.map((b) => (b as HTMLInputElement).value).join("")).toBe("482913");
    await expect(args.onComplete).toHaveBeenCalledWith("482913");
  },
};
