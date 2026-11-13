/** The customer form's schema, and conversions between a customer and the form's values. */

import { z } from "zod";
import { type Customer, INDUSTRIES, OWNERS, PLANS, REGIONS, STATUSES } from "./customers";

const keys = <K extends string>(record: Record<K, unknown>) => Object.keys(record) as [K, ...K[]];

/** E.164: a plus, the country code and up to 15 digits in all. */
const E164 = /^\+[1-9]\d{6,14}$/;

export const customerFormSchema = z.object({
  name: z.string().trim().min(1, "Enter the company name.").max(80, "Use 80 characters or fewer."),
  website: z
    .string()
    .trim()
    .refine(
      (v) => v === "" || /^https?:\/\/[^\s.]+\.\S+$/.test(v),
      "Enter a full address, like https://acme.example.com.",
    ),
  // Selects start empty (""), so check for a choice first, then narrow to the options.
  industry: z
    .string()
    .min(1, "Choose an industry.")
    .pipe(z.enum(keys(INDUSTRIES))),
  region: z
    .string()
    .min(1, "Choose a region.")
    .pipe(z.enum(keys(REGIONS))),
  owner: z.string().min(1, "Choose an account owner.").pipe(z.enum(OWNERS)),
  status: z.enum(keys(STATUSES)),
  plan: z.enum(keys(PLANS)),
  seats: z
    .number({ error: "Enter the number of seats." })
    .int("Use a whole number.")
    .min(1, "A customer needs at least 1 seat.")
    .max(1000, "For more than 1,000 seats, talk to sales.")
    // The number field is empty (null) until the user types.
    .nullable()
    .refine((v) => v !== null, "Enter the number of seats.")
    .transform((v) => v as number),
  contact: z.object({
    name: z.string().trim().min(1, "Enter the contact's name."),
    email: z.email("Enter an email address like name@example.com."),
    phone: z
      .string()
      .refine(
        (v) => v === "" || E164.test(v),
        "Enter a full phone number, including the country code.",
      ),
  }),
  notes: z.string().max(1000, "Keep notes to 1,000 characters."),
});

/** What the form holds while editing. */
export type CustomerFormInput = z.input<typeof customerFormSchema>;

/** Valid form values. */
export type CustomerFormValues = z.output<typeof customerFormSchema>;

/** A blank form for a new customer. New customers start on a trial. */
export const emptyCustomerForm: CustomerFormInput = {
  name: "",
  website: "",
  industry: "",
  region: "",
  owner: OWNERS[0],
  status: "trial",
  plan: "starter",
  seats: 5,
  contact: { name: "", email: "", phone: "" },
  notes: "",
};

/** The form values for an existing customer. */
export function toFormInput(c: Customer): CustomerFormInput {
  return {
    name: c.name,
    website: c.website,
    industry: c.industry,
    region: c.region,
    owner: c.owner,
    status: c.status,
    plan: c.plan,
    seats: c.seats,
    contact: { ...c.contact },
    notes: c.notes,
  };
}

/** Applies saved form values to a customer. Records the cancel date when it churns. */
export function applyFormValues(c: Customer, v: CustomerFormValues, today: string): Customer {
  const churnedAt = v.status === "churned" ? (c.churnedAt ?? today) : undefined;
  return { ...c, ...v, contact: { ...v.contact }, churnedAt };
}
