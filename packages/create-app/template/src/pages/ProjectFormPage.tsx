import { useToast } from "@fabric-kit/components";
import {
  FabricFormDatePicker,
  FabricFormNumberField,
  FabricFormRow,
  FabricFormSection,
  FabricFormSelect,
  FabricFormTextField,
  zodResolver,
} from "@fabric-kit/forms";
import { FabricFormPage } from "@fabric-kit/patterns";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { OWNERS, type Project, type ProjectStatus, STATUS_LABELS, useProjects } from "../data";
import { useRouter } from "../router";
import { href, routePath } from "../routes";
import { NotFoundPage } from "./NotFoundPage";

const toDay = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const fromDay = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};

const schema = z.object({
  name: z.string().trim().min(1, "Enter a project name."),
  client: z.string().trim().min(1, "Enter the client."),
  status: z.enum(Object.keys(STATUS_LABELS) as [ProjectStatus, ...ProjectStatus[]]),
  owner: z.string().min(1, "Choose an owner."),
  budget: z
    .number({ error: "Enter a budget." })
    .min(0, "The budget can't be negative.")
    .nullable()
    .refine((v) => v !== null, "Enter a budget."),
  due: z
    .date({ error: "Choose a due date." })
    .nullable()
    .refine((v) => v !== null, "Choose a due date."),
  description: z.string().max(500, "Keep it to 500 characters."),
});
type Input = z.input<typeof schema>;
type Values = z.output<typeof schema>;

const toInput = (p?: Project): Input => ({
  name: p?.name ?? "",
  client: p?.client ?? "",
  status: p?.status ?? "planned",
  owner: p?.owner ?? OWNERS[0],
  budget: p?.budget ?? null,
  due: p ? fromDay(p.due) : null,
  description: p?.description ?? "",
});

/** A form page for creating a project, or editing one when `id` is set. */
export function ProjectFormPage({ id }: { id?: string }) {
  const { projects } = useProjects();
  const project = projects.find((p) => p.id === id);
  if (id && !project) return <NotFoundPage title="We couldn't find that project" />;
  return <ProjectForm key={id ?? "new"} project={project} />;
}

function ProjectForm({ project }: { project?: Project }) {
  const { saveProject } = useProjects();
  const { navigate } = useRouter();
  const toast = useToast();
  const saved = useRef<string | null>(null);
  const form = useForm<Input, unknown, Values>({
    resolver: zodResolver(schema),
    defaultValues: toInput(project),
    mode: "onTouched",
  });
  const list = { label: "Projects", href: href(routePath({ name: "projects" })) };

  return (
    <FabricFormPage<Input, unknown, Values>
      title={project ? `Edit ${project.name}` : "New project"}
      breadcrumbs={project ? [list, { label: project.name }] : [list, { label: "New project" }]}
      form={form}
      submitLabel={project ? "Save changes" : "Create project"}
      onSubmit={async (v) => {
        const result = await saveProject(
          { ...v, budget: v.budget as number, due: toDay(v.due as Date) },
          project?.id,
        );
        saved.current = result.id;
      }}
      onSaved={(v) => {
        toast({ title: `${v.name} saved`, severity: "success" });
        if (saved.current)
          navigate(routePath({ name: "project", id: saved.current }), { replace: !project });
      }}
      onCancel={() =>
        navigate(
          project
            ? routePath({ name: "project", id: project.id })
            : routePath({ name: "projects" }),
        )
      }
    >
      <FabricFormSection title="Project">
        <FabricFormRow>
          <FabricFormTextField<Input> name="name" label="Project name" />
          <FabricFormTextField<Input> name="client" label="Client" />
        </FabricFormRow>
        <FabricFormRow>
          <FabricFormSelect<Input>
            name="status"
            label="Status"
            options={(Object.keys(STATUS_LABELS) as ProjectStatus[]).map((value) => ({
              value,
              label: STATUS_LABELS[value],
            }))}
          />
          <FabricFormSelect<Input>
            name="owner"
            label="Owner"
            options={OWNERS.map((o) => ({ value: o, label: o }))}
          />
        </FabricFormRow>
      </FabricFormSection>
      <FabricFormSection title="Budget and timing">
        <FabricFormRow>
          <FabricFormNumberField<Input>
            name="budget"
            label="Budget"
            format={{ style: "currency", currency: "USD" }}
            min={0}
            step={1000}
            stepper={false}
          />
          <FabricFormDatePicker<Input> name="due" label="Due date" />
        </FabricFormRow>
        <FabricFormTextField<Input>
          name="description"
          label="Description"
          multiline
          minRows={3}
          helperText="Optional"
        />
      </FabricFormSection>
    </FabricFormPage>
  );
}
