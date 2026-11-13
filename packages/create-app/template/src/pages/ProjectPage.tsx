import {
  FabricButton,
  FabricEmptyState,
  FabricMeter,
  FabricStatus,
  useConfirm,
  useToast,
} from "@fabric-kit/components";
import Edit from "@fabric-kit/icons/Edit";
import { FabricDetailPage } from "@fabric-kit/patterns";
import Box from "@mui/material/Box";
import { STATUS_LABELS, useProjects } from "../data";
import { useRouter } from "../router";
import { href, routePath } from "../routes";
import { formatDay, formatMoney, STATUS_COLORS } from "./format";
import { NotFoundPage } from "./NotFoundPage";

/** A detail page: summary, tabbed sections and actions for one record. */
export function ProjectPage({ id }: { id: string }) {
  const { projects, deleteProjects } = useProjects();
  const { navigate } = useRouter();
  const confirm = useConfirm();
  const toast = useToast();
  const project = projects.find((p) => p.id === id);
  if (!project) return <NotFoundPage title="We couldn't find that project" />;

  return (
    <FabricDetailPage
      title={project.name}
      status={
        <FabricStatus
          status={STATUS_COLORS[project.status]}
          label={STATUS_LABELS[project.status]}
        />
      }
      meta={`${project.client} · due ${formatDay(project.due)}`}
      breadcrumbs={[
        { label: "Projects", href: href(routePath({ name: "projects" })) },
        { label: project.name },
      ]}
      actions={
        <FabricButton
          variant="outlined"
          startIcon={<Edit />}
          href={href(routePath({ name: "project-edit", id }))}
        >
          Edit
        </FabricButton>
      }
      moreActions={[
        {
          label: "Delete project",
          onClick: async () => {
            if (
              !(await confirm({
                title: `Delete ${project.name}?`,
                confirmLabel: "Delete",
                danger: true,
              }))
            )
              return;
            await deleteProjects([id]);
            toast({ title: `Deleted ${project.name}` });
            navigate(routePath({ name: "projects" }), { replace: true });
          },
        },
      ]}
      summary={[
        { label: "Client", value: project.client },
        { label: "Owner", value: project.owner },
        { label: "Budget", value: formatMoney(project.budget) },
        { label: "Due", value: formatDay(project.due) },
        { label: "Project ID", value: project.id, copyable: true },
      ]}
      sections={[
        {
          value: "overview",
          label: "Overview",
          content: (
            <Box sx={{ display: "grid", gap: 3, maxWidth: 560 }}>
              <FabricMeter
                label="Budget used"
                value={project.spent}
                max={project.budget}
                format="percent"
              />
              {project.description ? (
                <Box component="p" sx={{ m: 0 }}>
                  {project.description}
                </Box>
              ) : null}
            </Box>
          ),
        },
        {
          value: "files",
          label: "Files",
          content: (
            <FabricEmptyState
              size="sm"
              title="No files yet"
              description="Briefs, contracts and designs go here."
            />
          ),
        },
      ]}
    />
  );
}
