import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { NewCustomerForm, northwind } from "./showcase";

const meta = {
  title: "Forms/Introduction",
  tags: ["test"],
  parameters: { layout: "padded" },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

/** A complete create form: sections, rows, every common input, validation and a sticky Save bar. */
export const NewCustomer: Story = {
  render: () => <NewCustomerForm />,
};

/** Submitting empty lists every problem at the top and focuses the first field. */
export const SubmitWithErrors: Story = {
  render: () => <NewCustomerForm />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Add customer" }));
    const summary = await canvas.findByRole("alert");
    await expect(summary).toHaveTextContent(/Fix \d+ problems to continue/);
    await waitFor(() => expect(canvas.getByRole("textbox", { name: "Company name" })).toHaveFocus());
    // Each message links to its field.
    await userEvent.click(within(summary).getByRole("button", { name: "Enter an email address like name@example.com." }));
    await expect(canvas.getByRole("textbox", { name: "Email" })).toHaveFocus();
  },
};

/** A failed save keeps what the person typed and explains what happened. */
export const SaveFails: Story = {
  render: () => <NewCustomerForm failSave defaultValues={northwind} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Add customer" }));
    await expect(
      await canvas.findByText(/We couldn't reach the server/, {}, { timeout: 3000 }),
    ).toBeVisible();
    await expect(canvas.getByRole("textbox", { name: "Company name" })).toHaveValue("Northwind Traders");
  },
};

/** Split layout: headings on the left, fields on the right, for wide screens. */
export const SplitLayout: Story = {
  render: () => <NewCustomerForm split defaultValues={northwind} />,
};
