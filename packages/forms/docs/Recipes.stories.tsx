import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, screen, userEvent, waitFor, within } from "storybook/test";
import {
  BindingExample,
  MultipleSelections,
  ProfileForm,
  RangeValidationForm,
  RepeatedFields,
  TransformedForm,
} from "./examples";

const meta = {
  title: "Forms/Recipes",
  tags: ["test"],
  parameters: { a11y: { test: "error" }, layout: "padded" },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

async function fillProfile(canvasElement: HTMLElement) {
  const canvas = within(canvasElement);
  await userEvent.type(
    canvas.getByRole("textbox", { name: "Full name" }),
    "Sam Lee"
  );
  await userEvent.type(
    canvas.getByRole("textbox", { name: "Email address" }),
    "sam@example.com"
  );
  await userEvent.click(
    canvas.getByRole("combobox", { name: "Delivery method" })
  );
  await userEvent.click(await screen.findByRole("option", { name: "Express" }));
  await userEvent.click(
    canvas.getByRole("checkbox", { name: "I accept the delivery terms" })
  );
}

export const ValidationAndReset: Story = {
  render: () => <ProfileForm />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const name = canvas.getByRole("textbox", { name: "Full name" });
    await userEvent.click(name);
    await userEvent.tab();
    await expect(await canvas.findByText("Enter your name.")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Save profile" }));
    await waitFor(() => expect(name).toHaveFocus());
    await expect(
      await canvas.findByText("Accept the terms to continue.")
    ).toBeVisible();
    const terms = canvas.getByRole("checkbox", {
      name: "I accept the delivery terms",
    });
    await expect(terms).toHaveAttribute("aria-invalid", "true");
    await expect(terms).toHaveAccessibleDescription(
      "Accept the terms to continue."
    );
    await fillProfile(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Save profile" }));
    await expect(await canvas.findByText("Profile saved")).toBeVisible();
    await expect(
      canvas.queryByText("Enter your name.")
    ).not.toBeInTheDocument();
    await userEvent.click(
      canvas.getByRole("button", { name: "Reset profile" })
    );
    await expect(name).toHaveValue("");
    await expect(terms).not.toBeChecked();
    await expect(
      canvas.getByText("Use the name on your orders.")
    ).toBeVisible();
  },
};
export const ServerError: Story = {
  render: () => <ProfileForm serverError />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await fillProfile(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Save profile" }));
    await expect(
      await canvas.findByText("This email is already in use.")
    ).toBeVisible();
    await waitFor(() =>
      expect(
        canvas.getByRole("textbox", { name: "Email address" })
      ).toHaveFocus()
    );
  },
};
export const DisabledForm: Story = {
  render: () => <ProfileForm disabled />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("textbox", { name: "Full name" })
    ).toBeDisabled();
    await expect(
      canvas.getByRole("checkbox", { name: "I accept the delivery terms" })
    ).toBeDisabled();
  },
};
export const DisabledFieldSubmission: Story = {
  render: () => <BindingExample kind="Checkbox" disabled />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Save" }));
    await expect(
      await canvas.findByText("Omitted from submission")
    ).toBeVisible();
  },
};
export const SchemaTransform: Story = {
  render: () => <TransformedForm />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole("textbox", { name: "Seats" }), "12");
    await userEvent.click(canvas.getByRole("button", { name: "Save seats" }));
    await expect(await canvas.findByText("12 seats (number)")).toBeVisible();
  },
};
export const MultipleAndFreeSolo: Story = {
  render: () => <MultipleSelections />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("combobox", { name: "Teams" }));
    await userEvent.click(await screen.findByRole("option", { name: "Acme" }));
    await userEvent.type(
      canvas.getByRole("combobox", { name: "Tags" }),
      "Fragile{Enter}"
    );
    await userEvent.click(canvas.getByRole("button", { name: "Express" }));
    await userEvent.click(
      canvas.getByRole("button", { name: "Save selections" })
    );
    await waitFor(() =>
      expect(canvas.getByRole("status")).toHaveTextContent('"tags":["Fragile"]')
    );
    await expect(canvas.getByRole("status")).toHaveTextContent(
      '"channels":["express"]'
    );
    await expect(canvas.getByRole("status")).toHaveTextContent('"id":"acme"');
  },
};

export const FieldArrays: Story = {
  render: () => <RepeatedFields />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(
      canvas.getByRole("textbox", { name: "Member 1" }),
      "Sam Lee"
    );
    await userEvent.click(canvas.getByRole("button", { name: "Add member" }));
    await userEvent.type(
      canvas.getByRole("textbox", { name: "Member 2" }),
      "Priya Patel"
    );
    await userEvent.click(canvas.getByRole("button", { name: "Swap members" }));
    await expect(canvas.getByRole("textbox", { name: "Member 1" })).toHaveValue(
      "Priya Patel"
    );
    await userEvent.click(
      canvas.getByRole("button", { name: "Remove member 2" })
    );
    await userEvent.click(canvas.getByRole("button", { name: "Save members" }));
    await waitFor(() =>
      expect(canvas.getByRole("status")).toHaveTextContent(
        '[{"name":"Priya Patel"}]'
      )
    );
  },
};

export const NestedRangeErrors: Story = {
  render: () => <RangeValidationForm />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole("button", { name: "Validate range" })
    );
    await expect(await canvas.findByText("Choose a start date.")).toBeVisible();
    await expect(
      canvas.getByRole("group", { name: "Date range" })
    ).toHaveAccessibleDescription("Choose a start date.");
    await waitFor(() =>
      expect(canvas.getAllByRole("spinbutton")[0]).toHaveFocus()
    );
    await userEvent.click(canvas.getByRole("button", { name: "Set endpoint error" }));
    await expect(await canvas.findByText("Start date is unavailable.")).toBeVisible();
  },
};
