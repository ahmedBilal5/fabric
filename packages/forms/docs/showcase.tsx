import {
  FabricToastProvider,
  type FabricUploadContext,
  type FabricUploadFile,
  isE164,
  useToast,
} from "@fabric-kit/components";
import { FabricText } from "@fabric-kit/primitives";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  FabricForm,
  FabricFormActions,
  FabricFormCheckbox,
  FabricFormDateRangePicker,
  FabricFormFileUpload,
  FabricFormNumberField,
  FabricFormPhoneField,
  FabricFormRadioGroup,
  FabricFormRow,
  FabricFormSection,
  FabricFormSelect,
  FabricFormSwitch,
  FabricFormTagInput,
  FabricFormTextField,
  zodResolver,
} from "../src";

export const industries = [
  { value: "retail", label: "Retail" },
  { value: "logistics", label: "Logistics" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "software", label: "Software" },
];

export const plans = [
  { value: "starter", label: "Starter · $12 per seat" },
  { value: "growth", label: "Growth · $24 per seat" },
  { value: "enterprise", label: "Enterprise · custom pricing" },
];

/** Pretend upload: reports progress, and fails files with "fail" in the name. */
export function fakeUpload(file: File, { onProgress, signal }: FabricUploadContext) {
  return new Promise<{ id: string }>((resolve, reject) => {
    let p = 0;
    const timer = setInterval(() => {
      p += 0.2;
      onProgress(p);
      if (p >= 1) {
        clearInterval(timer);
        if (file.name.includes("fail")) reject(new Error("The server rejected this file."));
        else resolve({ id: `file_${file.name}` });
      }
    }, 120);
    signal.addEventListener("abort", () => clearInterval(timer));
  });
}

const fileSchema = z.custom<FabricUploadFile>();

export const customerSchema = z.object({
  company: z.object({
    name: z.string().trim().min(1, "Enter the company name."),
    website: z
      .string()
      .trim()
      .refine(
        (v) => v === "" || /^https?:\/\/\S+\.\S+/.test(v),
        "Enter a full web address, like https://example.com.",
      ),
    industry: z.string().min(1, "Choose an industry."),
    tags: z.array(z.string()).max(5, "Use 5 tags or fewer."),
  }),
  contact: z.object({
    firstName: z.string().trim().min(1, "Enter a first name."),
    lastName: z.string().trim().min(1, "Enter a last name."),
    email: z.email("Enter an email address like name@example.com."),
    phone: z.string().refine((v) => v === "" || isE164(v), "Enter a full phone number."),
  }),
  billing: z.object({
    plan: z.string().min(1, "Choose a plan."),
    seats: z
      .number({ error: "Enter the number of seats." })
      .int("Use a whole number of seats.")
      .min(1, "Add at least 1 seat.")
      .nullable()
      .refine((v) => v !== null, "Enter the number of seats."),
    budget: z.number().nullable(),
    contract: z
      .object({ start: z.date().nullable(), end: z.date().nullable() })
      .refine(
        (r) => r.start !== null && r.end !== null,
        "Choose the contract start and end dates.",
      ),
  }),
  documents: z
    .array(fileSchema)
    .refine(
      (files) => files.every((f) => f.status === "done"),
      "Wait for uploads to finish, or remove failed files.",
    ),
  usageReport: z.boolean(),
  terms: z.boolean().refine((v) => v, "Confirm the customer has accepted the terms."),
});

export type CustomerInput = z.input<typeof customerSchema>;
export type Customer = z.output<typeof customerSchema>;

export const emptyCustomer: CustomerInput = {
  company: { name: "", website: "", industry: "", tags: [] },
  contact: { firstName: "", lastName: "", email: "", phone: "" },
  billing: { plan: "growth", seats: 10, budget: null, contract: { start: null, end: null } },
  documents: [],
  usageReport: true,
  terms: false,
};

export const northwind: CustomerInput = {
  company: {
    name: "Northwind Traders",
    website: "https://northwind.example.com",
    industry: "logistics",
    tags: ["Priority", "EMEA"],
  },
  contact: {
    firstName: "Priya",
    lastName: "Patel",
    email: "priya@northwind.example.com",
    phone: "+442071234567",
  },
  billing: {
    plan: "growth",
    seats: 48,
    budget: 12480,
    contract: { start: new Date(2026, 0, 1), end: new Date(2026, 11, 31) },
  },
  documents: [],
  usageReport: true,
  terms: true,
};

/** The fields of the customer form, shared by the overview, layout and form page stories. */
export function CustomerFields({ split = false }: { split?: boolean }) {
  const layout = split ? "split" : "stacked";
  return (
    <>
      <FabricFormSection
        title="Company"
        description="How the customer appears across invoices and reports."
        layout={layout}
      >
        <FabricFormTextField<CustomerInput>
          name="company.name"
          label="Company name"
          autoComplete="organization"
        />
        <FabricFormRow>
          <FabricFormTextField<CustomerInput>
            name="company.website"
            label="Website"
            type="url"
            placeholder="https://"
            helperText="Optional"
          />
          <FabricFormSelect<CustomerInput>
            name="company.industry"
            label="Industry"
            options={industries}
          />
        </FabricFormRow>
        <FabricFormTagInput<CustomerInput>
          name="company.tags"
          label="Tags"
          suggestions={["Priority", "EMEA", "Americas", "APAC", "Reseller"]}
          helperText="Press Enter or comma after each tag."
          maxTags={5}
        />
      </FabricFormSection>

      <FabricFormSection
        title="Primary contact"
        description="We send invoices and renewal reminders to this person."
        layout={layout}
      >
        <FabricFormRow>
          <FabricFormTextField<CustomerInput>
            name="contact.firstName"
            label="First name"
            autoComplete="given-name"
          />
          <FabricFormTextField<CustomerInput>
            name="contact.lastName"
            label="Last name"
            autoComplete="family-name"
          />
        </FabricFormRow>
        <FabricFormRow>
          <FabricFormTextField<CustomerInput>
            name="contact.email"
            label="Email"
            type="email"
            autoComplete="email"
          />
          <FabricFormPhoneField<CustomerInput>
            name="contact.phone"
            label="Phone"
            defaultCountry="GB"
            preferredCountries={["GB", "US", "DE"]}
            helperText="Optional"
          />
        </FabricFormRow>
      </FabricFormSection>

      <FabricFormSection
        title="Billing"
        description="Plan, seats and contract dates."
        layout={layout}
      >
        <FabricFormRadioGroup<CustomerInput> name="billing.plan" label="Plan" options={plans} />
        <FabricFormRow>
          <FabricFormNumberField<CustomerInput>
            name="billing.seats"
            label="Seats"
            min={1}
            max={500}
            maximumFractionDigits={0}
          />
          <FabricFormNumberField<CustomerInput>
            name="billing.budget"
            label="Monthly budget"
            format={{ style: "currency", currency: "USD" }}
            min={0}
            step={100}
            stepper={false}
            helperText="Optional. We warn you before going over."
          />
        </FabricFormRow>
        <FabricFormDateRangePicker<CustomerInput>
          name="billing.contract"
          startLabel="Contract starts"
          endLabel="Contract ends"
        />
      </FabricFormSection>

      <FabricFormSection
        title="Documents"
        description="Signed order forms and tax certificates. Files with “fail” in the name fail, to show errors."
        layout={layout}
      >
        <FabricFormFileUpload<CustomerInput>
          name="documents"
          upload={fakeUpload}
          accept=".pdf,image/*"
          maxSize={10_000_000}
          maxFiles={5}
        />
      </FabricFormSection>

      <FabricFormSection title="Preferences" layout={layout}>
        <FabricFormSwitch<CustomerInput>
          name="usageReport"
          label="Email a usage report on the first of each month"
        />
        <FabricFormCheckbox<CustomerInput>
          name="terms"
          label="The customer has accepted the terms of service"
        />
      </FabricFormSection>
    </>
  );
}

function NewCustomerFormInner({
  split = false,
  failSave = false,
  defaultValues = emptyCustomer,
}: {
  split?: boolean;
  failSave?: boolean;
  defaultValues?: CustomerInput;
}) {
  const toast = useToast();
  const [saved, setSaved] = useState<Customer | null>(null);
  const form = useForm<CustomerInput, unknown, Customer>({
    resolver: zodResolver(customerSchema),
    defaultValues,
    mode: "onTouched",
  });
  return (
    <FabricForm
      form={form}
      aria-label="New customer"
      onSubmit={async (values) => {
        await new Promise((r) => setTimeout(r, 600));
        if (failSave)
          throw new Error("We couldn't reach the server, so the customer wasn't saved. Try again.");
        setSaved(values);
        toast({ title: `${values.company.name} added`, severity: "success" });
      }}
      sx={{ maxWidth: split ? 960 : 720 }}
    >
      <CustomerFields split={split} />
      <FabricFormActions sticky submitLabel="Add customer" onCancel={() => form.reset()} />
      {saved && (
        <FabricText role="status" sx={{ display: "none" }}>
          Saved {saved.company.name}
        </FabricText>
      )}
    </FabricForm>
  );
}

/** A complete create form: sections, rows, every common input, validation and a sticky Save bar. */
export function NewCustomerForm(props: {
  split?: boolean;
  failSave?: boolean;
  defaultValues?: CustomerInput;
}) {
  return (
    <FabricToastProvider>
      <NewCustomerFormInner {...props} />
    </FabricToastProvider>
  );
}
