import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { expect, userEvent, within } from "storybook/test";
import {
  FabricForm,
  FabricFormActions,
  FabricFormAutocomplete,
  FabricFormCheckboxGroup,
  FabricFormDatePicker,
  FabricFormDateRangePicker,
  FabricFormNumberField,
  FabricFormOtpField,
  FabricFormPasswordField,
  FabricFormPhoneField,
  FabricFormRadioGroup,
  FabricFormRow,
  FabricFormSection,
  FabricFormSelect,
  FabricFormSwitch,
  FabricFormTagInput,
  FabricFormTextField,
  FabricFormTimePicker,
  FabricFormToggleButtonGroup,
} from "../src";
import { BindingExample, type InputKind } from "./examples";
import { exerciseBinding } from "./interactions";
import { industries } from "./showcase";

const meta = {
  title: "Forms/Bindings",
  tags: ["test"],
  parameters: { a11y: { test: "error" }, layout: "padded" },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

const teams = [
  { id: "ops", name: "Operations" },
  { id: "fin", name: "Finance" },
  { id: "eng", name: "Engineering" },
];

function Gallery({ state }: { state?: "error" | "disabled" }) {
  const form = useForm({
    disabled: state === "disabled",
    defaultValues: {
      name: state ? "Northwind Traders" : "",
      industry: "",
      seats: 12 as number | null,
      phone: "",
      password: "",
      code: "",
      tags: ["Priority"],
      team: null as (typeof teams)[number] | null,
      channels: ["email"] as string[],
      plan: "growth",
      frequency: "weekly" as string | null,
      start: null as Date | null,
      time: null as Date | null,
      range: { start: null as Date | null, end: null as Date | null },
      alerts: true,
    },
  });
  // Show server-style messages on a few fields.
  useEffect(() => {
    if (state !== "error") return;
    for (const [name, message] of [
      ["name", "This name is already taken."],
      ["industry", "Choose an industry."],
      ["seats", "Add at least 1 seat."],
      ["phone", "Enter a full phone number."],
      ["code", "That code has expired. We've sent a new one."],
    ] as const)
      form.setError(name, { type: "server", message });
  }, [state, form.setError]);
  return (
    <FabricForm form={form} onSubmit={() => undefined} errorSummary={false} sx={{ maxWidth: 760 }}>
      <FabricFormSection title="Text">
        <FabricFormRow>
          <FabricFormTextField name="name" label="Company name" helperText="As it appears on invoices." />
          <FabricFormSelect name="industry" label="Industry" options={industries} />
        </FabricFormRow>
        <FabricFormRow>
          <FabricFormPhoneField name="phone" label="Phone" defaultCountry="GB" />
          <FabricFormPasswordField name="password" label="Password" strength />
        </FabricFormRow>
        <FabricFormTagInput name="tags" label="Tags" suggestions={["Priority", "EMEA", "Reseller"]} />
        <FabricFormOtpField name="code" label="Verification code" helperText="We sent it to +44 •••• 4567." groupSize={3} />
      </FabricFormSection>
      <FabricFormSection title="Numbers and dates">
        <FabricFormRow columns={3}>
          <FabricFormNumberField name="seats" label="Seats" min={1} maximumFractionDigits={0} />
          <FabricFormDatePicker name="start" label="Start date" />
          <FabricFormTimePicker name="time" label="Daily send time" />
        </FabricFormRow>
        <FabricFormDateRangePicker name="range" startLabel="From" endLabel="To" />
      </FabricFormSection>
      <FabricFormSection title="Choices">
        <FabricFormAutocomplete
          name="team"
          label="Owning team"
          options={teams}
          getOptionLabel={(o) => o.name}
          isOptionEqualToValue={(a, b) => a.id === b.id}
        />
        <FabricFormRadioGroup
          name="plan"
          label="Plan"
          options={[
            { value: "starter", label: "Starter" },
            { value: "growth", label: "Growth" },
            { value: "enterprise", label: "Enterprise" },
          ]}
        />
        <FabricFormCheckboxGroup
          name="channels"
          label="Send updates by"
          options={[
            { value: "email", label: "Email" },
            { value: "sms", label: "Text message" },
            { value: "slack", label: "Chat" },
          ]}
        />
        <FabricFormToggleButtonGroup
          name="frequency"
          aria-label="Report frequency"
          items={[
            { value: "daily", label: "Daily" },
            { value: "weekly", label: "Weekly" },
            { value: "monthly", label: "Monthly" },
          ]}
        />
        <FabricFormSwitch name="alerts" label="Alert me when usage passes 80%" />
      </FabricFormSection>
      {!state && <FabricFormActions />}
    </FabricForm>
  );
}

/** Every binding in one form. */
export const AllInputs: Story = { render: () => <Gallery /> };

/** Validation and server messages replace each field's hint. */
export const Errors: Story = {
  render: () => <Gallery state="error" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText("This name is already taken.")).toBeVisible();
    await expect(canvas.getByText("That code has expired. We've sent a new one.")).toBeVisible();
  },
};

/** `useForm({ disabled: true })` disables every binding. */
export const Disabled: Story = {
  render: () => <Gallery state="disabled" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("textbox", { name: "Company name" })).toBeDisabled();
    await expect(canvas.getByRole("checkbox", { name: "Email" })).toBeDisabled();
  },
};

// One behaviour test per binding: focus, edit, submit, reset.
const kind = (k: InputKind, extra?: Partial<Story>): Story => ({
  render: () => <BindingExample kind={k} />,
  play: async ({ canvasElement }) => exerciseBinding(canvasElement, k),
  ...extra,
});

export const TextField = kind("TextField");
export const Select = kind("Select");
export const Checkbox = kind("Checkbox");
export const Switch = kind("Switch");
export const Radio = kind("Radio");
export const RadioGroup = kind("RadioGroup");
export const ToggleButtonGroup = kind("ToggleButtonGroup");
export const Autocomplete = kind("Autocomplete");
export const CheckboxGroup = kind("CheckboxGroup");
export const DatePicker = kind("DatePicker");
export const TimePicker = kind("TimePicker");
export const DateTimePicker = kind("DateTimePicker");
export const DateRangePicker = kind("DateRangePicker");
export const CustomField = kind("Field", { name: "Custom field (FabricFormField)" });

/** Long labels and hints wrap instead of overflowing. */
export const LongContent: Story = {
  render: () => <BindingExample kind="TextField" long />,
};

/** The number binding stores a number, not text. */
export const NumberField: Story = {
  render: function Render() {
    const form = useForm({ defaultValues: { seats: null as number | null } });
    return (
      <FabricForm form={form} onSubmit={() => undefined} sx={{ maxWidth: 360 }}>
        <FabricFormNumberField name="seats" label="Seats" min={1} max={50} maximumFractionDigits={0} />
        <output aria-label="Value">{JSON.stringify(form.watch("seats"))}</output>
      </FabricForm>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("spinbutton", { name: "Seats" });
    await userEvent.type(input, "120");
    await userEvent.tab();
    // Clamped to max on blur, and stored as a number.
    await expect(canvas.getByLabelText("Value")).toHaveTextContent("50");
    await userEvent.click(input);
    await userEvent.keyboard("{ArrowDown}");
    await expect(canvas.getByLabelText("Value")).toHaveTextContent("49");
  },
};
