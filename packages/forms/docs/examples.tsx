import { FabricButton, FabricTextField } from "@fabric-kit/components";
import { FabricInline, FabricStack, FabricText } from "@fabric-kit/primitives";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import {
  FabricFormAutocomplete,
  FabricFormCheckbox,
  FabricFormCheckboxGroup,
  FabricFormDatePicker,
  FabricFormDateRangePicker,
  FabricFormDateTimePicker,
  FabricFormField,
  FabricFormRadio,
  FabricFormRadioGroup,
  FabricFormSection,
  FabricFormSelect,
  FabricFormSwitch,
  FabricFormTextField,
  FabricFormTimePicker,
  FabricFormToggleButtonGroup,
  zodResolver,
} from "../src";

export const inputKinds = [
  "TextField",
  "Select",
  "Checkbox",
  "Switch",
  "Radio",
  "RadioGroup",
  "ToggleButtonGroup",
  "Autocomplete",
  "CheckboxGroup",
  "DatePicker",
  "TimePicker",
  "DateTimePicker",
  "DateRangePicker",
  "Field",
] as const;
export type InputKind = (typeof inputKinds)[number];
const options = [
  { value: "standard", label: "Standard" },
  { value: "express", label: "Express" },
];
const teams = [
  { id: "acme", name: "Acme" },
  { id: "northwind", name: "Northwind" },
];
const defaults = {
  text: "",
  selection: "",
  checked: false,
  switched: false,
  radio: "",
  radioGroup: "",
  toggle: null as string | null,
  team: null as (typeof teams)[number] | null,
  channels: [] as string[],
  date: null as Date | null,
  time: null as Date | null,
  dateTime: null as Date | null,
  range: { start: null as Date | null, end: null as Date | null },
  custom: "",
};
const sampleValues: typeof defaults = {
  text: "Northwind delivery",
  selection: "express",
  checked: true,
  switched: true,
  radio: "express",
  radioGroup: "express",
  toggle: "express",
  team: teams[1],
  channels: ["express"],
  date: new Date(2026, 10, 15, 9, 30),
  time: new Date(2026, 10, 15, 9, 30),
  dateTime: new Date(2026, 10, 15, 9, 30),
  range: { start: new Date(2026, 10, 15), end: new Date(2026, 10, 18) },
  custom: "Custom delivery",
};
const fieldNames = {
  TextField: "text",
  Select: "selection",
  Checkbox: "checked",
  Switch: "switched",
  Radio: "radio",
  RadioGroup: "radioGroup",
  ToggleButtonGroup: "toggle",
  Autocomplete: "team",
  CheckboxGroup: "channels",
  DatePicker: "date",
  TimePicker: "time",
  DateTimePicker: "dateTime",
  DateRangePicker: "range",
  Field: "custom",
} as const;

/** Standalone binding examples share data so their docs show the same value conventions. */
export function BindingExample({
  kind,
  disabled = false,
  error = false,
  long = false,
}: {
  kind: InputKind;
  disabled?: boolean;
  error?: boolean;
  long?: boolean;
}) {
  const form = useForm({ defaultValues: defaults });
  const [result, setResult] = useState("No submission yet");
  const label = long
    ? "Delivery preference for all future orders placed by the Northwind operations team"
    : "Delivery preference";
  const common = {
    control: form.control,
    disabled,
    helperText: long
      ? "Choose the delivery preference that best fits your team. This preference applies to future orders and can be changed at any time."
      : "You can change this later.",
  };
  useEffect(() => {
    if (error)
      form.setError(fieldNames[kind], { type: "server", message: "Please review this value." });
  }, [error, kind, form.setError]);
  let input: ReactNode;
  switch (kind) {
    case "TextField":
      input = <FabricFormTextField {...common} name="text" label={label} />;
      break;
    case "Select":
      input = <FabricFormSelect {...common} name="selection" label={label} options={options} />;
      break;
    case "Checkbox":
      input = (
        <FabricFormCheckbox
          {...common}
          name="checked"
          label="Send order updates"
          slotProps={{ input: { title: "Consumer input slot" } }}
        />
      );
      break;
    case "Switch":
      input = (
        <FabricFormSwitch
          {...common}
          name="switched"
          label="Enable notifications"
          slotProps={{ input: () => ({ title: "Consumer input slot" }) }}
        />
      );
      break;
    case "Radio":
      input = (
        <FabricStack role="radiogroup" aria-label={label} gap="sm">
          <FabricFormRadio {...common} name="radio" value="standard" label="Standard" />
          <FabricFormRadio
            {...common}
            helperText={undefined}
            name="radio"
            value="express"
            label="Express"
          />
        </FabricStack>
      );
      break;
    case "RadioGroup":
      input = (
        <FabricFormRadioGroup {...common} name="radioGroup" label={label} options={options} />
      );
      break;
    case "ToggleButtonGroup":
      input = (
        <FabricFormToggleButtonGroup {...common} name="toggle" aria-label={label} items={options} />
      );
      break;
    case "Autocomplete":
      input = (
        <FabricFormAutocomplete
          {...common}
          name="team"
          label="Team"
          options={teams}
          getOptionLabel={(option) => option.name}
          isOptionEqualToValue={(a, b) => a.id === b.id}
        />
      );
      break;
    case "CheckboxGroup":
      input = (
        <FabricFormCheckboxGroup
          {...common}
          name="channels"
          label="Order channels"
          options={options}
        />
      );
      break;
    case "DatePicker":
      input = <FabricFormDatePicker {...common} name="date" label="Delivery date" />;
      break;
    case "TimePicker":
      input = <FabricFormTimePicker {...common} name="time" label="Delivery time" />;
      break;
    case "DateTimePicker":
      input = <FabricFormDateTimePicker {...common} name="dateTime" label="Delivery appointment" />;
      break;
    case "DateRangePicker":
      input = (
        <FabricFormDateRangePicker
          {...common}
          name="range"
          startLabel="Available from"
          endLabel="Available until"
        />
      );
      break;
    case "Field":
      input = (
        <FabricFormField {...common} name="custom">
          {({ field, error, helperText }) => (
            <FabricTextField
              name={field.name}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              disabled={field.disabled}
              error={error}
              helperText={helperText}
              label="Custom input"
            />
          )}
        </FabricFormField>
      );
      break;
  }
  return (
    <form
      noValidate
      onSubmit={form.handleSubmit((values) => setResult(JSON.stringify(values[fieldNames[kind]])))}
    >
      <FabricFormSection
        title="Delivery"
        description="Each binding keeps the form's value, touched state and validation message in sync."
        sx={{ maxWidth: "40rem" }}
      >
        {input}
        <FabricInline gap="sm" sx={{ flexWrap: "wrap" }}>
          <FabricButton type="submit" variant="contained">
            Save
          </FabricButton>
          <FabricButton
            type="button"
            variant="outlined"
            onClick={() => {
              form.reset();
              setResult("No submission yet");
            }}
          >
            Reset
          </FabricButton>
          <FabricButton
            type="button"
            variant="text"
            onClick={() => form.setValue(fieldNames[kind], sampleValues[fieldNames[kind]])}
          >
            Load sample
          </FabricButton>
          <FabricButton
            type="button"
            variant="text"
            onClick={() => form.setFocus(fieldNames[kind])}
          >
            Focus field
          </FabricButton>
        </FabricInline>
        <FabricText
          role="status"
          sx={{
            fontFamily: "var(--fabric-font-mono, monospace)",
            fontSize: "0.75rem",
            color: "text.secondary",
          }}
        >
          {result ?? "Omitted from submission"}
        </FabricText>
      </FabricFormSection>
    </form>
  );
}

const profileSchema = z.object({
  profile: z.object({
    name: z.string().min(1, "Enter your name."),
    email: z.email("Enter a valid email address."),
  }),
  delivery: z.string().min(1, "Choose a delivery method."),
  terms: z.boolean().refine((value) => value, "Accept the terms to continue."),
});
type Profile = z.infer<typeof profileSchema>;
const profileDefaults: Profile = { profile: { name: "", email: "" }, delivery: "", terms: false };

/** A realistic nested form, including schema errors, a server error and async submission. */
export function ProfileForm({
  disabled = false,
  serverError = false,
}: {
  disabled?: boolean;
  serverError?: boolean;
}) {
  const form = useForm<Profile>({
    defaultValues: profileDefaults,
    resolver: zodResolver(profileSchema),
    mode: "onBlur",
    disabled,
  });
  const [saved, setSaved] = useState(false);
  return (
    <FormProvider {...form}>
      <form
        noValidate
        onSubmit={form.handleSubmit(async () => {
          setSaved(false);
          await new Promise((resolve) => setTimeout(resolve, 150));
          if (serverError) {
            form.setError(
              "profile.email",
              { type: "server", message: "This email is already in use." },
              { shouldFocus: true },
            );
            return;
          }
          setSaved(true);
        })}
      >
        <FabricFormSection
          title="Delivery profile"
          description="Where Northwind sends order updates."
          sx={{ maxWidth: "36rem" }}
        >
          <FabricFormTextField<Profile>
            fullWidth
            name="profile.name"
            label="Full name"
            autoComplete="name"
            helperText="Use the name on your orders."
          />
          <FabricFormTextField<Profile>
            fullWidth
            name="profile.email"
            label="Email address"
            type="email"
            autoComplete="email"
            helperText="We will send delivery updates here."
          />
          <FabricFormSelect<Profile> name="delivery" label="Delivery method" options={options} />
          <FabricFormCheckbox<Profile> name="terms" label="I accept the delivery terms" />
          <FabricInline gap="sm">
            <FabricButton
              type="submit"
              variant="contained"
              loading={form.formState.isSubmitting}
              disabled={disabled}
            >
              Save profile
            </FabricButton>
            <FabricButton
              type="button"
              variant="outlined"
              onClick={() => {
                form.reset();
                setSaved(false);
              }}
            >
              Reset profile
            </FabricButton>
          </FabricInline>
          <FabricText role="status">
            {saved
              ? "Profile saved"
              : form.formState.isSubmitting
                ? "Saving profile"
                : "Ready to save"}
          </FabricText>
        </FabricFormSection>
      </form>
    </FormProvider>
  );
}

const transformSchema = z.object({
  seats: z
    .string()
    .min(1, "Enter a seat count.")
    .regex(/^\d+$/, "Use a whole number.")
    .transform(Number)
    .pipe(z.number().min(1, "Choose at least one seat.")),
});
/** Distinct schema input and output types remain inferred through control. */
export function TransformedForm() {
  const form = useForm<z.input<typeof transformSchema>, unknown, z.output<typeof transformSchema>>({
    defaultValues: { seats: "" },
    resolver: zodResolver(transformSchema),
  });
  const [result, setResult] = useState("No submission yet");
  return (
    <form
      noValidate
      onSubmit={form.handleSubmit((value) =>
        setResult(`${value.seats} seats (${typeof value.seats})`),
      )}
    >
      <FabricStack gap="md">
        <FabricFormTextField
          control={form.control}
          name="seats"
          label="Seats"
          inputMode="numeric"
          helperText="Stored as text while editing; submitted as a number."
        />
        <FabricButton type="submit" variant="contained">
          Save seats
        </FabricButton>
        <FabricText role="status">{result}</FabricText>
      </FabricStack>
    </form>
  );
}

/** Multiple and free-solo modes retain their option/value types. */
export function MultipleSelections() {
  const form = useForm({
    defaultValues: { teams: [] as typeof teams, tags: [] as string[], channels: [] as string[] },
  });
  const [result, setResult] = useState("No submission yet");
  return (
    <form noValidate onSubmit={form.handleSubmit((value) => setResult(JSON.stringify(value)))}>
      <FabricStack gap="lg">
        <FabricFormAutocomplete
          control={form.control}
          name="teams"
          label="Teams"
          multiple
          options={teams}
          getOptionLabel={(option) => option.name}
          isOptionEqualToValue={(a, b) => a.id === b.id}
        />
        <FabricFormAutocomplete
          control={form.control}
          name="tags"
          label="Tags"
          multiple
          freeSolo
          options={["Priority", "Recurring"]}
        />
        <FabricFormToggleButtonGroup
          control={form.control}
          name="channels"
          aria-label="Delivery channels"
          exclusive={false}
          items={options}
        />
        <FabricButton type="submit" variant="contained">
          Save selections
        </FabricButton>
        <FabricText role="status">{result}</FabricText>
      </FabricStack>
    </form>
  );
}

/** Field-array operations preserve values and registration when rows move. */
export function RepeatedFields() {
  const form = useForm({ defaultValues: { members: [{ name: "" }] } });
  const { fields, append, move, remove } = useFieldArray({
    control: form.control,
    name: "members",
  });
  const [result, setResult] = useState("No submission yet");
  return (
    <form
      noValidate
      onSubmit={form.handleSubmit((values) => setResult(JSON.stringify(values.members)))}
    >
      <FabricStack gap="md">
        {fields.map((member, index) => (
          <FabricInline key={member.id} gap="sm">
            <FabricFormTextField
              control={form.control}
              name={`members.${index}.name`}
              label={`Member ${index + 1}`}
              rules={{ required: "Enter a member name." }}
            />
            <FabricButton
              type="button"
              variant="outlined"
              aria-label={`Remove member ${index + 1}`}
              onClick={() => remove(index)}
            >
              Remove
            </FabricButton>
          </FabricInline>
        ))}
        <FabricInline gap="sm">
          <FabricButton type="button" variant="outlined" onClick={() => append({ name: "" })}>
            Add member
          </FabricButton>
          <FabricButton
            type="button"
            variant="outlined"
            disabled={fields.length < 2}
            onClick={() => move(0, 1)}
          >
            Swap members
          </FabricButton>
          <FabricButton type="submit" variant="contained">
            Save members
          </FabricButton>
        </FabricInline>
        <FabricText role="status">{result}</FabricText>
      </FabricStack>
    </form>
  );
}

const rangeSchema = z.object({
  availability: z.object({
    start: z
      .date()
      .nullable()
      .refine((value) => value !== null, "Choose a start date."),
    end: z
      .date()
      .nullable()
      .refine((value) => value !== null, "Choose an end date."),
  }),
});
/** Composite bindings surface nested schema messages as well as range-wide messages. */
export function RangeValidationForm() {
  const form = useForm<z.input<typeof rangeSchema>, unknown, z.output<typeof rangeSchema>>({
    defaultValues: { availability: { start: null, end: null } },
    resolver: zodResolver(rangeSchema),
  });
  return (
    <form noValidate onSubmit={form.handleSubmit(() => undefined)}>
      <FabricStack gap="md">
        <FabricFormDateRangePicker
          control={form.control}
          name="availability"
          startLabel="Available from"
          endLabel="Available until"
          helperText="Choose an availability window."
        />
        <FabricButton type="submit" variant="contained">
          Validate range
        </FabricButton>
        <FabricButton
          type="button"
          variant="outlined"
          onClick={() =>
            form.setError("availability.start", {
              type: "server",
              message: "Start date is unavailable.",
            })
          }
        >
          Set endpoint error
        </FabricButton>
      </FabricStack>
    </form>
  );
}
