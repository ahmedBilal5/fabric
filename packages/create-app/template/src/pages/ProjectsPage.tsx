import { FabricButton, FabricStatus, useConfirm, useToast } from "@fabric-kit/components";
import type { GridColDef } from "@fabric-kit/datagrid";
import Add from "@fabric-kit/icons/Add";
import { type FabricFilterDef, FabricListPage, useFilterParams } from "@fabric-kit/patterns";
import { useMemo } from "react";
import { OWNERS, type Project, type ProjectStatus, STATUS_LABELS, useProjects } from "../data";
import { useRouter } from "../router";
import { href, routePath } from "../routes";
import { formatDay, formatMoney, STATUS_COLORS } from "./format";

const FILTERS: FabricFilterDef[] = [
  {
    id: "status",
    label: "Status",
    multiple: true,
    options: (Object.keys(STATUS_LABELS) as ProjectStatus[]).map((value) => ({
      value,
      label: STATUS_LABELS[value],
    })),
  },
  { id: "owner", label: "Owner", options: OWNERS.map((o) => ({ value: o, label: o })) },
];

const COLUMNS: GridColDef<Project>[] = [
  {
    field: "name",
    headerName: "Project",
    flex: 1,
    minWidth: 180,
    renderCell: ({ row }) => (
      <a
        href={href(routePath({ name: "project", id: row.id }))}
        style={{ color: "inherit", fontWeight: 500 }}
      >
        {row.name}
      </a>
    ),
  },
  { field: "client", headerName: "Client", flex: 1, minWidth: 160 },
  {
    field: "status",
    headerName: "Status",
    width: 140,
    renderCell: ({ row }) => (
      <FabricStatus status={STATUS_COLORS[row.status]} label={STATUS_LABELS[row.status]} />
    ),
  },
  { field: "owner", headerName: "Owner", width: 130 },
  {
    field: "budget",
    headerName: "Budget",
    type: "number",
    width: 120,
    valueFormatter: (v: number) => formatMoney(v),
  },
  { field: "due", headerName: "Due", width: 130, valueFormatter: (v: string) => formatDay(v) },
];

/** A list page: search, filters, a grid and bulk actions. */
export function ProjectsPage() {
  const { projects, deleteProjects } = useProjects();
  const { search: params, setSearch: setParams } = useRouter();
  const confirm = useConfirm();
  const toast = useToast();
  // Keep search and filters in the URL, so a filtered list can be shared.
  const adapter = useMemo(() => ({ params, setParams }), [params, setParams]);
  const filters = useFilterParams(FILTERS, { adapter });

  const rows = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    const statuses = (filters.values.status as string[] | undefined) ?? [];
    const owner = filters.values.owner as string | undefined;
    return projects.filter(
      (p) =>
        (!q || `${p.name} ${p.client}`.toLowerCase().includes(q)) &&
        (statuses.length === 0 || statuses.includes(p.status)) &&
        (!owner || p.owner === owner),
    );
  }, [projects, filters.search, filters.values]);

  return (
    <FabricListPage<Project>
      title="Projects"
      primaryAction={
        <FabricButton
          variant="contained"
          startIcon={<Add />}
          href={href(routePath({ name: "project-new" }))}
        >
          New project
        </FabricButton>
      }
      filterBar={{
        filters: FILTERS,
        values: filters.values,
        onValuesChange: filters.setValues,
        search: filters.search,
        onSearchChange: filters.setSearch,
        onClearAll: filters.clear,
        searchPlaceholder: "Search projects",
      }}
      rows={rows}
      columns={COLUMNS}
      noun={["project", "projects"]}
      exportable
      bulkActions={(ids, clear) => (
        <FabricButton
          variant="outlined"
          size="small"
          color="error"
          onClick={async () => {
            const noun = ids.length === 1 ? "project" : "projects";
            if (
              !(await confirm({
                title: `Delete ${ids.length} ${noun}?`,
                confirmLabel: "Delete",
                danger: true,
              }))
            )
              return;
            await deleteProjects(ids.map(String));
            clear();
            toast({ title: `Deleted ${ids.length} ${noun}` });
          }}
        >
          Delete
        </FabricButton>
      )}
    />
  );
}
