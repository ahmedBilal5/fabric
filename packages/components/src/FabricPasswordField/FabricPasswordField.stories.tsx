import { Box } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { FabricPasswordField, type FabricPasswordFieldProps } from ".";

const meta = {
  title: "Components/FabricPasswordField",
  component: FabricPasswordField,
  tags: ["test"],
  parameters: { layout: "padded" },
} satisfies Meta<typeof FabricPasswordField>;
export default meta;
type Story = StoryObj<typeof meta>;

function Controlled({ initial = "", ...props }: Partial<FabricPasswordFieldProps> & { initial?: string }) {
  const [value, setValue] = useState(initial);
  return (
    <Box sx={{ width: 340 }}>
      <FabricPasswordField
        label="Password"
        fullWidth
        {...props}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </Box>
  );
}

/** Sign-in: a show/hide button and nothing else. */
export const Default: Story = { render: () => <Controlled /> };

/** Sign-up and change-password: a strength meter with one tip at a time. */
export const WithStrength: Story = {
  render: () => <Controlled label="New password" strength />,
};

/** The meter at each level. */
export const StrengthLevels: Story = {
  render: () => (
    <Box sx={{ display: "grid", gap: 3 }}>
      <Controlled label="Very weak" strength initial="password" />
      <Controlled label="Weak" strength initial="tulip7" />
      <Controlled label="Fair" strength initial="Summer2026" />
      <Controlled label="Good" strength initial="harbourlights26" />
      <Controlled label="Strong" strength initial="Harbour-Lights-2026!" />
    </Box>
  ),
};

/** Your own estimate, e.g. from zxcvbn or a breach check. */
export const CustomStrength: Story = {
  render: () => (
    <Controlled
      label="New password"
      strength
      initial="correct horse"
      getStrength={(p) =>
        p.length >= 20
          ? { score: 4, label: "Strong" }
          : { score: 2, label: "Fair", hint: "Use 20 or more characters, such as a short sentence." }
      }
    />
  ),
};

/** Error and disabled. */
export const States: Story = {
  render: () => (
    <Box sx={{ display: "grid", gap: 2 }}>
      <Controlled initial="hunter2" error helperText="That password is incorrect." />
      <Controlled initial="hunter2" disabled />
    </Box>
  ),
};

/** The toggle shows the password and says so. */
export const ShowHide: Story = {
  render: () => <Controlled initial="Harbour-Lights-2026!" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvasElement.querySelector("input") as HTMLInputElement;
    await expect(input).toHaveAttribute("type", "password");
    await userEvent.click(canvas.getByRole("button", { name: "Show password" }));
    await expect(input).toHaveAttribute("type", "text");
    await expect(canvas.getByRole("button", { name: "Hide password" })).toHaveAttribute("aria-pressed", "true");
  },
};
