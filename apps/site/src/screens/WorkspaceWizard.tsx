import { FabricButton } from "@fabric-kit/components";
import {
  FabricFormCheckbox,
  FabricFormNumberField,
  FabricFormRadioGroup,
  FabricFormRow,
  FabricFormSelect,
  FabricFormTextField,
  FabricWizard,
  zodResolver,
} from "@fabric-kit/forms";
import { FabricStack, FabricText } from "@fabric-kit/primitives";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  workspace: z.string().trim().min(2, "Enter a workspace name of at least 2 characters."),
  url: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]{3,}$/, "Use 3 or more lowercase letters, numbers or dashes."),
  size: z.string().min(1, "Choose your team size."),
  plan: z.string(),
  seats: z
    .number({ error: "Enter the number of seats." })
    .min(1, "Add at least 1 seat.")
    .nullable(),
  terms: z.boolean().refine((v) => v, "Accept the terms to create the workspace."),
});
type Values = z.input<typeof schema>;

const PLANS: Record<string, string> = {
  starter: "Starter",
  growth: "Growth",
  enterprise: "Enterprise",
};

const EMPTY: Values = {
  workspace: "",
  url: "",
  size: "",
  plan: "growth",
  seats: 10,
  terms: false,
};

/** A sign-up flow: FabricWizard with Zod validation, an error summary and a review step. */
export function WorkspaceWizard() {
  const [created, setCreated] = useState<string | null>(null);
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: EMPTY,
    mode: "onTouched",
  });

  return (
    <FabricStack
      gap="lg"
      sx={{ p: 3, height: "100%", overflowY: "auto", bgcolor: "background.default" }}
    >
      <FabricStack gap="xs">
        <FabricText component="h3" textVariant="headingMd" sx={{ m: 0 }}>
          Create a workspace
        </FabricText>
        <FabricText textVariant="bodyMd" color="text.secondary">
          Three steps. Try continuing with a field empty.
        </FabricText>
      </FabricStack>
      {created ? (
        <FabricStack gap="md" role="status" sx={{ alignItems: "flex-start" }}>
          <FabricText textVariant="bodyLg">Created {created}.</FabricText>
          <FabricButton
            variant="outlined"
            onClick={() => {
              form.reset(EMPTY);
              setCreated(null);
            }}
          >
            Start again
          </FabricButton>
        </FabricStack>
      ) : (
        <FabricWizard
          form={form}
          sx={{ maxWidth: 640 }}
          submitLabel="Create workspace"
          onSubmit={async (values) => {
            await new Promise((r) => setTimeout(r, 500));
            setCreated(values.workspace);
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
              fields: ["plan", "seats", "terms"],
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
                    <FabricFormNumberField<Values>
                      name="seats"
                      label="Seats"
                      min={1}
                      maximumFractionDigits={0}
                    />
                  </FabricFormRow>
                  <FabricFormCheckbox<Values> name="terms" label="I accept the terms of service" />
                </>
              ),
            },
          ]}
          review={(values) => (
            <FabricStack gap="xs">
              <FabricText textVariant="bodyMd">
                {values.workspace} at app.example.com/{values.url}
              </FabricText>
              <FabricText textVariant="bodyMd" color="text.secondary">
                {PLANS[values.plan]} plan, {values.seats ?? 0} seats, {values.size} people
              </FabricText>
            </FabricStack>
          )}
        />
      )}
    </FabricStack>
  );
}
