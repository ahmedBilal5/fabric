import { FabricButton } from "@fabric-kit/components";
import { FabricText } from "@fabric-kit/primitives";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useForm } from "react-hook-form";
import { expect, userEvent, within } from "storybook/test";
import { z } from "zod";
import {
  FabricForm,
  FabricFormActions,
  FabricFormRow,
  FabricFormSection,
  FabricFormSelect,
  FabricFormTextField,
  zodResolver,
} from "../src";

const meta = {
  title: "Forms/Layout",
  tags: ["test"],
  parameters: { layout: "padded" },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

const countries = [
  { value: "GB", label: "United Kingdom" },
  { value: "US", label: "United States" },
  { value: "DE", label: "Germany" },
];

const schema = z.object({
  line1: z.string().min(1, "Enter the street address."),
  line2: z.string(),
  city: z.string().min(1, "Enter a town or city."),
  postcode: z.string().min(1, "Enter a postcode."),
  country: z.string().min(1, "Choose a country."),
});
type Address = z.infer<typeof schema>;

function AddressForm({
  layout = "stacked",
  variant = "card",
  sticky = false,
  defaults,
}: {
  layout?: "stacked" | "split";
  variant?: "card" | "plain";
  sticky?: boolean;
  defaults?: Partial<Address>;
}) {
  const form = useForm<Address>({
    resolver: zodResolver(schema),
    defaultValues: { line1: "", line2: "", city: "", postcode: "", country: "GB", ...defaults },
    mode: "onTouched",
  });
  return (
    <FabricForm form={form} onSubmit={() => new Promise((r) => setTimeout(r, 500))} sx={{ maxWidth: layout === "split" ? 900 : 640 }}>
      <FabricFormSection
        title="Billing address"
        description="Shown on invoices. It must match the address on the customer's tax registration."
        layout={layout}
        variant={variant}
      >
        <FabricFormTextField<Address> name="line1" label="Street address" autoComplete="address-line1" />
        <FabricFormTextField<Address>
          name="line2"
          label="Apartment, suite or floor"
          autoComplete="address-line2"
          helperText="Optional"
        />
        <FabricFormRow columns={[2, 1]}>
          <FabricFormTextField<Address> name="city" label="Town or city" autoComplete="address-level2" />
          <FabricFormTextField<Address> name="postcode" label="Postcode" autoComplete="postal-code" />
        </FabricFormRow>
        <FabricFormSelect<Address> name="country" label="Country" options={countries} />
      </FabricFormSection>
      <FabricFormActions sticky={sticky} onCancel={() => form.reset()} submitLabel="Save address" />
    </FabricForm>
  );
}

/** A card section with a heading, a description and a row of short fields. */
export const Section: Story = { render: () => <AddressForm /> };

/** `layout="split"`: heading on the left from the `md` breakpoint. */
export const SplitSection: Story = { render: () => <AddressForm layout="split" /> };

/** `variant="plain"`: no card, for forms inside dialogs and drawers. */
export const PlainSection: Story = { render: () => <AddressForm variant="plain" /> };

/** Rows of 2, 3 and 4 columns, and `[2, 1]` for uneven widths. They stack on phones. */
export const Rows: Story = {
  render: function Render() {
    const form = useForm({ defaultValues: { a: "", b: "", c: "", d: "", e: "", f: "", g: "", h: "", i: "" } });
    return (
      <FabricForm form={form} onSubmit={() => undefined} sx={{ maxWidth: 760 }}>
        <FabricFormSection title="Rows">
          <FabricFormRow>
            <FabricFormTextField name="a" label="First name" />
            <FabricFormTextField name="b" label="Last name" />
          </FabricFormRow>
          <FabricFormRow columns={3}>
            <FabricFormTextField name="c" label="Day" />
            <FabricFormTextField name="d" label="Month" />
            <FabricFormTextField name="e" label="Year" />
          </FabricFormRow>
          <FabricFormRow columns={[3, 1]}>
            <FabricFormTextField name="f" label="Street" />
            <FabricFormTextField name="g" label="Number" />
          </FabricFormRow>
          <FabricFormRow columns={4}>
            <FabricFormTextField name="h" label="Width (cm)" />
            <FabricFormTextField name="i" label="Height (cm)" />
          </FabricFormRow>
        </FabricFormSection>
      </FabricForm>
    );
  },
};

/** `sticky` keeps Save in reach on long forms and says when there are unsaved changes. */
export const StickyActions: Story = {
  render: () => (
    <div style={{ height: 420, overflow: "auto", padding: 2 }}>
      <AddressForm sticky defaults={{ line1: "12 Harbour Street", city: "Bristol", postcode: "BS1 4RN" }} />
      <div style={{ height: 120 }} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole("textbox", { name: "Apartment, suite or floor" }), "Floor 3");
    await expect(await canvas.findByText("Unsaved changes")).toBeVisible();
  },
};

/** Something on the other side of the bar, such as a destructive action. */
export const ActionsWithStart: Story = {
  render: function Render() {
    const form = useForm({ defaultValues: { name: "Northwind Traders" } });
    return (
      <FabricForm form={form} onSubmit={() => undefined} sx={{ maxWidth: 640 }}>
        <FabricFormSection title="Workspace">
          <FabricFormTextField name="name" label="Workspace name" />
        </FabricFormSection>
        <FabricFormActions
          onCancel={() => form.reset()}
          start={
            <FabricButton variant="text" color="error">
              Delete workspace
            </FabricButton>
          }
        />
      </FabricForm>
    );
  },
};

/** Submitting with problems shows the summary; each item focuses its field. */
export const ErrorSummary: Story = {
  render: () => <AddressForm defaults={{ country: "" }} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Save address" }));
    const summary = await canvas.findByRole("alert");
    await expect(summary).toHaveTextContent("Fix 4 problems to continue");
    await userEvent.click(within(summary).getByRole("button", { name: "Enter a postcode." }));
    await expect(canvas.getByRole("textbox", { name: "Postcode" })).toHaveFocus();
  },
};

/** A thrown save error appears at the top; the person's input stays. */
export const SaveError: Story = {
  render: function Render() {
    const form = useForm({ defaultValues: { name: "Northwind Traders" } });
    return (
      <FabricForm
        form={form}
        onSubmit={async () => {
          await new Promise((r) => setTimeout(r, 300));
          throw new Error("You don't have permission to rename this workspace. Ask an admin.");
        }}
        sx={{ maxWidth: 640 }}
      >
        <FabricFormSection title="Workspace">
          <FabricFormTextField name="name" label="Workspace name" />
        </FabricFormSection>
        <FabricFormActions />
        <FabricText variant="caption" color="text.secondary">
          Press Save to see the error.
        </FabricText>
      </FabricForm>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Save" }));
    await expect(await canvas.findByRole("alert")).toHaveTextContent("permission to rename");
  },
};
