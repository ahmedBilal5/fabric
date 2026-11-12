import { FabricKeyValueList } from "@fabric-kit/components";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { z } from "zod";
import {
  FabricFormCheckbox,
  FabricFormNumberField,
  FabricFormRadioGroup,
  FabricFormRow,
  FabricFormSelect,
  FabricFormTextField,
  FabricWizard,
  zodResolver,
} from "../src";

const meta = {
  title: "Forms/Wizard",
  tags: ["test"],
  parameters: { layout: "padded" },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

const schema = z.object({
  workspace: z.string().trim().min(2, "Enter a workspace name of at least 2 characters."),
  url: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]{3,}$/, "Use 3 or more lowercase letters, numbers or dashes."),
  size: z.string().min(1, "Choose your team size."),
  plan: z.string(),
  seats: z.number({ error: "Enter the number of seats." }).min(1, "Add at least 1 seat.").nullable(),
  billingEmail: z.email("Enter an email address like name@example.com."),
  terms: z.boolean().refine((v) => v, "Accept the terms to create the workspace."),
});
type Values = z.input<typeof schema>;

const planLabel: Record<string, string> = { starter: "Starter", growth: "Growth", enterprise: "Enterprise" };

function CreateWorkspace({ failSubmit = false }: { failSubmit?: boolean }) {
  const [done, setDone] = useState<string | null>(null);
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      workspace: "",
      url: "",
      size: "",
      plan: "growth",
      seats: 10,
      billingEmail: "",
      terms: false,
    },
    mode: "onTouched",
  });
  if (done) return <p role="status">Created {done}.</p>;
  return (
    <FabricWizard
      form={form}
      sx={{ maxWidth: 720 }}
      onCancel={() => form.reset()}
      submitLabel="Create workspace"
      onSubmit={async (values) => {
        await new Promise((r) => setTimeout(r, 500));
        if (failSubmit) throw new Error("That workspace URL was taken a moment ago. Go back and pick another.");
        setDone(values.workspace);
      }}
      steps={[
        {
          id: "workspace",
          label: "Workspace",
          description: "Name it after your company or team.",
          fields: ["workspace", "url", "size"],
          content: (
            <>
              <FabricFormTextField<Values> name="workspace" label="Workspace name" />
              <FabricFormTextField<Values>
                name="url"
                label="Workspace URL"
                helperText="app.example.com/your-url"
                slotProps={{ htmlInput: { autoCapitalize: "none", spellCheck: false } }}
              />
              <FabricFormSelect<Values>
                name="size"
                label="Team size"
                options={[
                  { value: "1-10", label: "1–10 people" },
                  { value: "11-50", label: "11–50 people" },
                  { value: "51+", label: "51 or more" },
                ]}
              />
            </>
          ),
        },
        {
          id: "plan",
          label: "Plan",
          description: "You can change plans at any time.",
          fields: ["plan", "seats"],
          content: (
            <>
              <FabricFormRadioGroup<Values>
                name="plan"
                label="Plan"
                options={[
                  { value: "starter", label: "Starter · $12 per seat" },
                  { value: "growth", label: "Growth · $24 per seat" },
                  { value: "enterprise", label: "Enterprise · custom pricing" },
                ]}
              />
              <FabricFormRow>
                <FabricFormNumberField<Values> name="seats" label="Seats" min={1} maximumFractionDigits={0} />
              </FabricFormRow>
            </>
          ),
        },
        {
          id: "billing",
          label: "Billing",
          description: "Invoices and receipts go here.",
          fields: ["billingEmail"],
          content: <FabricFormTextField<Values> name="billingEmail" label="Billing email" type="email" />,
        },
      ]}
      review={(v) => (
        <>
          <FabricKeyValueList
            columns={2}
            items={[
              { label: "Workspace", value: v.workspace },
              { label: "URL", value: v.url ? `app.example.com/${v.url}` : null },
              { label: "Team size", value: v.size },
              { label: "Plan", value: planLabel[v.plan] },
              { label: "Seats", value: v.seats },
              { label: "Billing email", value: v.billingEmail },
            ]}
          />
          <FabricFormCheckbox<Values> name="terms" label="I accept the terms of service" />
        </>
      )}
    />
  );
}

/** Three steps and a review. Continue checks only the current step. */
export const Default: Story = { render: () => <CreateWorkspace /> };

/** Continue stops on the first step's problems and focuses them. */
export const StepValidation: Story = {
  render: () => <CreateWorkspace />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Continue" }));
    await expect(await canvas.findByText("Enter a workspace name of at least 2 characters.")).toBeVisible();
    await waitFor(() => expect(canvas.getByRole("textbox", { name: "Workspace name" })).toHaveFocus());
    await expect(canvas.getByRole("heading", { name: /Step 1 of 4/ })).toBeInTheDocument();
  },
};

/** Fill each step, review, and submit. */
export const CompleteFlow: Story = {
  render: () => <CreateWorkspace />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole("textbox", { name: "Workspace name" }), "Northwind");
    await userEvent.type(canvas.getByRole("textbox", { name: "Workspace URL" }), "northwind");
    await userEvent.click(canvas.getByRole("combobox", { name: "Team size" }));
    await userEvent.click(await within(document.body).findByRole("option", { name: "11–50 people" }));
    await userEvent.click(canvas.getByRole("button", { name: "Continue" }));
    await waitFor(() => expect(canvas.getByRole("heading", { name: /Step 2 of 4/ })).toHaveFocus());
    await userEvent.click(canvas.getByRole("button", { name: "Continue" }));
    // Enter moves on rather than submitting early.
    await userEvent.type(await canvas.findByRole("textbox", { name: "Billing email" }), "billing@example.com{Enter}");
    await waitFor(() => expect(canvas.getByRole("heading", { name: /Step 4 of 4/ })).toBeInTheDocument());
    await expect(canvas.getByText("app.example.com/northwind")).toBeVisible();
    await userEvent.click(canvas.getByRole("checkbox", { name: "I accept the terms of service" }));
    await userEvent.click(canvas.getByRole("button", { name: "Create workspace" }));
    await expect(await canvas.findByRole("status", {}, { timeout: 3000 })).toHaveTextContent("Created Northwind.");
  },
};

/** A thrown error on submit shows above the review. */
export const SubmitError: Story = {
  render: () => <CreateWorkspace failSubmit />,
};
