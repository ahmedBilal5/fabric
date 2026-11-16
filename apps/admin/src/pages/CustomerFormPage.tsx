import { useToast } from "@fabric-kit/components";
import { radii, spacing } from "@fabric-kit/design-tokens";
import {
  FabricFormNumberField,
  FabricFormPhoneField,
  FabricFormRadioGroup,
  FabricFormRow,
  FabricFormSection,
  FabricFormSelect,
  FabricFormTextField,
  zodResolver,
} from "@fabric-kit/forms";
import { FabricFormPage } from "@fabric-kit/patterns";
import Box from "@mui/material/Box";
import { useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
  type CustomerFormInput,
  type CustomerFormValues,
  customerFormSchema,
  emptyCustomerForm,
  toFormInput,
} from "../data/customerForm";
import {
  type Customer,
  customerMrr,
  INDUSTRIES,
  OWNERS,
  options,
  PLANS,
  type Plan,
  REGIONS,
  STATUSES,
} from "../data/customers";
import { useData } from "../data/store";
import { useRouter } from "../router";
import { href, routePath } from "../routes";
import { NotFoundPage } from "./NotFoundPage";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const PLAN_OPTIONS = (Object.keys(PLANS) as Plan[]).map((value) => ({
  value,
  label: `${PLANS[value].label} · $${PLANS[value].price} per seat`,
}));

const ERROR_LABELS = {
  name: "Company name",
  website: "Website",
  industry: "Industry",
  region: "Region",
  owner: "Account owner",
  seats: "Seats",
  "contact.name": "Contact name",
  "contact.email": "Email",
  "contact.phone": "Phone",
  notes: "Notes",
};

/** Creates a customer, or edits one when `id` is set. */
export function CustomerFormPage({ id }: { id?: string }) {
  const { customers, ready } = useData();
  if (!id) return <CustomerForm />;
  const customer = customers.find((c) => c.id === id);
  if (customer) return <CustomerForm key={customer.id} customer={customer} />;
  if (!ready) return <LoadingForm id={id} />;
  return (
    <NotFoundPage
      title="We couldn't find that customer"
      description="It may have been deleted, or the link has a typo."
      backTo={{ label: "Back to customers", path: routePath({ name: "customers" }) }}
    />
  );
}

function crumbsFor(customer?: Customer) {
  const list = { label: "Customers", href: href(routePath({ name: "customers" })) };
  if (!customer) return [list, { label: "New customer" }];
  return [
    list,
    { label: customer.name, href: href(routePath({ name: "customer", id: customer.id })) },
    { label: "Edit" },
  ];
}

function CustomerForm({ customer }: { customer?: Customer }) {
  const { createCustomer, updateCustomer } = useData();
  const { navigate } = useRouter();
  const toast = useToast();
  const savedId = useRef<string | null>(null);
  const form = useForm<CustomerFormInput, unknown, CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: customer ? toFormInput(customer) : emptyCustomerForm,
    mode: "onTouched",
  });
  const detail = (id: string) => routePath({ name: "customer", id });

  return (
    <FabricFormPage<CustomerFormInput, unknown, CustomerFormValues>
      title={customer ? `Edit ${customer.name}` : "New customer"}
      description={
        customer
          ? undefined
          : "Add the company and the person you deal with. New customers start on a trial."
      }
      breadcrumbs={crumbsFor(customer)}
      form={form}
      submitLabel={customer ? "Save changes" : "Add customer"}
      errorLabels={ERROR_LABELS}
      onSubmit={async (values) => {
        const saved = customer
          ? await updateCustomer(customer.id, values)
          : await createCustomer(values);
        savedId.current = saved.id;
      }}
      onSaved={(values) => {
        toast({
          title: customer ? `${values.name} saved` : `${values.name} added`,
          severity: "success",
        });
        if (savedId.current) navigate(detail(savedId.current), { replace: !customer });
      }}
      onCancel={() => navigate(customer ? detail(customer.id) : routePath({ name: "customers" }))}
      aside={<PriceSummary form={form} />}
    >
      <CustomerFields />
    </FabricFormPage>
  );
}

function LoadingForm({ id }: { id: string }) {
  const form = useForm<CustomerFormInput>({ defaultValues: emptyCustomerForm });
  return (
    <FabricFormPage
      title="Edit customer"
      breadcrumbs={[
        { label: "Customers", href: href(routePath({ name: "customers" })) },
        { label: id },
      ]}
      form={form}
      onSubmit={() => undefined}
      loading
    >
      <CustomerFields />
    </FabricFormPage>
  );
}

function CustomerFields() {
  return (
    <>
      <FabricFormSection
        title="Company"
        description="How the customer appears across the app and on invoices."
      >
        <FabricFormTextField<CustomerFormInput>
          name="name"
          label="Company name"
          autoComplete="organization"
        />
        <FabricFormRow>
          <FabricFormTextField<CustomerFormInput>
            name="website"
            label="Website"
            type="url"
            placeholder="https://"
            helperText="Optional"
          />
          <FabricFormSelect<CustomerFormInput>
            name="industry"
            label="Industry"
            options={options(INDUSTRIES)}
          />
        </FabricFormRow>
        <FabricFormRow>
          <FabricFormSelect<CustomerFormInput>
            name="region"
            label="Region"
            options={options(REGIONS)}
          />
          <FabricFormSelect<CustomerFormInput>
            name="owner"
            label="Account owner"
            options={OWNERS.map((o) => ({ value: o, label: o }))}
          />
        </FabricFormRow>
      </FabricFormSection>

      <FabricFormSection
        title="Plan"
        description="What they pay for. Changes apply from the next invoice."
      >
        <FabricFormRadioGroup<CustomerFormInput> name="plan" label="Plan" options={PLAN_OPTIONS} />
        <FabricFormRow>
          <FabricFormNumberField<CustomerFormInput>
            name="seats"
            label="Seats"
            min={1}
            max={1000}
            maximumFractionDigits={0}
          />
          <FabricFormSelect<CustomerFormInput>
            name="status"
            label="Status"
            options={options(STATUSES)}
          />
        </FabricFormRow>
      </FabricFormSection>

      <FabricFormSection
        title="Primary contact"
        description="We send invoices and renewal reminders to this person."
      >
        <FabricFormTextField<CustomerFormInput>
          name="contact.name"
          label="Contact name"
          autoComplete="name"
        />
        <FabricFormRow>
          <FabricFormTextField<CustomerFormInput>
            name="contact.email"
            label="Email"
            type="email"
            autoComplete="email"
          />
          <FabricFormPhoneField<CustomerFormInput>
            name="contact.phone"
            label="Phone"
            defaultCountry="US"
            preferredCountries={["US", "GB", "AU"]}
            helperText="Optional"
          />
        </FabricFormRow>
      </FabricFormSection>

      <FabricFormSection title="Notes" description="Only your team sees these.">
        <FabricFormTextField<CustomerFormInput>
          name="notes"
          label="Notes"
          multiline
          minRows={3}
          helperText="Optional. Renewal plans, who to call, anything worth knowing."
        />
      </FabricFormSection>
    </>
  );
}

/** The monthly price as the plan and seats change. */
function PriceSummary({
  form,
}: {
  form: ReturnType<typeof useForm<CustomerFormInput, unknown, CustomerFormValues>>;
}) {
  const [plan, seats, status] = useWatch({
    control: form.control,
    name: ["plan", "seats", "status"],
  });
  const price = customerMrr({ plan, seats: seats ?? 0, status });
  return (
    <Box
      aria-live="polite"
      sx={{
        p: `${spacing.xlsm}px`,
        borderRadius: `${radii.xl}px`,
        backgroundColor: "rgba(var(--mui-palette-primary-mainChannel) / 0.06)",
        fontSize: "0.875rem",
        lineHeight: 1.6,
      }}
    >
      <Box component="h2" sx={{ m: 0, fontSize: "inherit", fontWeight: 600 }}>
        Monthly price
      </Box>
      <Box
        sx={{
          fontSize: "1.5rem",
          fontWeight: 600,
          fontVariantNumeric: "tabular-nums",
          my: `${spacing.xs}px`,
        }}
      >
        {money.format(price)}
      </Box>
      <Box component="p" sx={{ m: 0, color: "var(--mui-palette-text-secondary)" }}>
        {status === "trial"
          ? "Free during the trial. Billing starts when it converts."
          : status === "churned"
            ? "Cancelled accounts aren't billed."
            : `${seats ?? 0} seats on ${PLANS[plan].label} at $${PLANS[plan].price} each.`}
      </Box>
    </Box>
  );
}
